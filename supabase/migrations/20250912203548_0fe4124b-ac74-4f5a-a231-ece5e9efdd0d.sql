-- Enhance security for social_accounts table
-- Add more granular RLS policies and improve token security

-- Drop the existing broad policy
DROP POLICY IF EXISTS "Users can manage social accounts for their projects" ON public.social_accounts;

-- Create more specific policies for better security
CREATE POLICY "Users can view social accounts for their projects" 
ON public.social_accounts 
FOR SELECT 
USING (project_id IN (
  SELECT projects.id 
  FROM projects 
  WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
));

CREATE POLICY "Users can create social accounts for their projects" 
ON public.social_accounts 
FOR INSERT 
WITH CHECK (project_id IN (
  SELECT projects.id 
  FROM projects 
  WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
));

CREATE POLICY "Users can update social accounts for their projects" 
ON public.social_accounts 
FOR UPDATE 
USING (project_id IN (
  SELECT projects.id 
  FROM projects 
  WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
));

CREATE POLICY "Users can delete social accounts for their projects" 
ON public.social_accounts 
FOR DELETE 
USING (project_id IN (
  SELECT projects.id 
  FROM projects 
  WHERE projects.user_id = (auth.jwt() ->> 'sub'::text)
));

-- Add a function to help with token validation and security
CREATE OR REPLACE FUNCTION public.is_token_expired(expires_at timestamp with time zone)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT expires_at IS NOT NULL AND expires_at < now();
$$;

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_social_account_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON public.social_accounts;
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_social_account_updated_at();