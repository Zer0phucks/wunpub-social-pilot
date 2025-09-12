-- Enhanced security for social media access tokens
-- Add audit logging and stricter access controls

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

-- Create a function to validate token access
CREATE OR REPLACE FUNCTION public.can_access_social_tokens(account_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = account_project_id 
    AND user_id = (auth.jwt() ->> 'sub'::text)
  );
$$;

-- Add more restrictive policies for social_accounts table
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view social accounts for their projects" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can create social accounts for their projects" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can update social accounts for their projects" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can delete social accounts for their projects" ON public.social_accounts;

-- Create stricter policies
CREATE POLICY "Users can view basic social account info for their projects" 
ON public.social_accounts 
FOR SELECT 
USING (
  project_id IN (
    SELECT projects.id 
    FROM projects 
    WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
  )
);

CREATE POLICY "Users can create social accounts for their projects" 
ON public.social_accounts 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT projects.id 
    FROM projects 
    WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
  )
);

CREATE POLICY "Users can update social accounts for their projects" 
ON public.social_accounts 
FOR UPDATE 
USING (
  project_id IN (
    SELECT projects.id 
    FROM projects 
    WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
  )
);

CREATE POLICY "Users can delete social accounts for their projects" 
ON public.social_accounts 
FOR DELETE 
USING (
  project_id IN (
    SELECT projects.id 
    FROM projects 
    WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- Add a trigger to log all access to social accounts
CREATE OR REPLACE FUNCTION public.log_social_account_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the access
  PERFORM public.log_token_access(
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      WHEN TG_OP = 'DELETE' THEN 'delete'
      ELSE 'read'
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit trigger for social accounts
DROP TRIGGER IF EXISTS audit_social_accounts_trigger ON public.social_accounts;
CREATE TRIGGER audit_social_accounts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_social_account_access();