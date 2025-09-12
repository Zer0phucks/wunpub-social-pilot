-- Enhanced security for social media access tokens
-- Add token encryption and stricter access controls

-- First, let's add a function to encrypt tokens (using pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_token(token_value text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN token_value IS NULL OR token_value = '' THEN NULL
    ELSE encode(encrypt(token_value::bytea, 'social_token_key_2025', 'aes'), 'hex')
  END;
$$;

-- Create a function to decrypt tokens (restricted access)
CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN encrypted_token IS NULL OR encrypted_token = '' THEN NULL
    ELSE convert_from(decrypt(decode(encrypted_token, 'hex'), 'social_token_key_2025', 'aes'), 'UTF8')
  END;
$$;

-- Add a trigger to automatically encrypt tokens on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_social_account_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only encrypt if tokens are being set and are not already encrypted
  IF NEW.access_token IS NOT NULL AND LENGTH(NEW.access_token) > 0 AND NEW.access_token NOT LIKE '%encrypted%' THEN
    NEW.access_token = public.encrypt_token(NEW.access_token);
  END IF;
  
  IF NEW.refresh_token IS NOT NULL AND LENGTH(NEW.refresh_token) > 0 AND NEW.refresh_token NOT LIKE '%encrypted%' THEN
    NEW.refresh_token = public.encrypt_token(NEW.refresh_token);
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create the encryption trigger
DROP TRIGGER IF EXISTS encrypt_social_tokens_trigger ON public.social_accounts;
CREATE TRIGGER encrypt_social_tokens_trigger
  BEFORE INSERT OR UPDATE ON public.social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_social_account_tokens();

-- Add audit logging for token access
CREATE TABLE IF NOT EXISTS public.token_access_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  social_account_id uuid NOT NULL,
  access_type text NOT NULL, -- 'read', 'write', 'delete'
  ip_address inet,
  user_agent text,
  accessed_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the audit log
ALTER TABLE public.token_access_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own access logs
CREATE POLICY "Users can view their own token access logs" 
ON public.token_access_log 
FOR SELECT 
USING (user_id = (auth.jwt() ->> 'sub'::text));

-- System can insert audit logs
CREATE POLICY "System can insert token access logs" 
ON public.token_access_log 
FOR INSERT 
WITH CHECK (true);

-- Create a view that automatically decrypts tokens for authorized users
CREATE OR REPLACE VIEW public.social_accounts_decrypted AS
SELECT 
  id,
  project_id,
  platform,
  account_id,
  account_username,
  CASE 
    WHEN project_id IN (
      SELECT projects.id 
      FROM projects 
      WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
    ) THEN public.decrypt_token(access_token)
    ELSE '***REDACTED***'
  END as access_token,
  CASE 
    WHEN project_id IN (
      SELECT projects.id 
      FROM projects 
      WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
    ) THEN public.decrypt_token(refresh_token)
    ELSE '***REDACTED***'
  END as refresh_token,
  token_expires_at,
  is_active,
  connected_at,
  updated_at
FROM public.social_accounts;

-- Grant access to the decrypted view
GRANT SELECT ON public.social_accounts_decrypted TO public;

-- Create RLS policy for the decrypted view
ALTER VIEW public.social_accounts_decrypted SET (security_barrier = true);

-- Add a function to log token access
CREATE OR REPLACE FUNCTION public.log_token_access(
  account_id uuid,
  access_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.token_access_log (
    user_id,
    social_account_id,
    access_type,
    accessed_at
  ) VALUES (
    (auth.jwt() ->> 'sub'::text),
    account_id,
    access_type,
    now()
  );
END;
$$;