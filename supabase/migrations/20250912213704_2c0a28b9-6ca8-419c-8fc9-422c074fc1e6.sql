-- Enhanced security for social media access tokens
-- Create a secure function to access tokens only when explicitly needed
CREATE OR REPLACE FUNCTION public.get_social_account_tokens(account_id uuid)
RETURNS TABLE(access_token text, refresh_token text, token_expires_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sa.access_token, sa.refresh_token, sa.token_expires_at
  FROM social_accounts sa
  JOIN projects p ON sa.project_id = p.id
  WHERE sa.id = account_id 
  AND p.user_id = (auth.jwt() ->> 'sub')::text;
$$;

-- Create a view that excludes sensitive token fields for general use
CREATE OR REPLACE VIEW public.social_accounts_safe AS
SELECT 
  id,
  project_id,
  platform,
  account_id,
  account_username,
  is_active,
  connected_at,
  updated_at,
  -- Indicate if tokens exist without exposing them
  (access_token IS NOT NULL) as has_access_token,
  (refresh_token IS NOT NULL) as has_refresh_token,
  token_expires_at,
  -- Check if token is expired using existing function
  public.is_token_expired(token_expires_at) as is_token_expired
FROM social_accounts;

-- Drop the existing broad SELECT policy on social_accounts
DROP POLICY IF EXISTS "Users can view basic social account info for their projects" ON public.social_accounts;

-- Create a more restrictive policy that blocks direct access to token fields
CREATE POLICY "Block direct token access on social_accounts"
ON public.social_accounts
FOR SELECT
TO authenticated
USING (false);

-- Create separate policies for each operation  
CREATE POLICY "Users can insert social accounts for their projects"
ON public.social_accounts
FOR INSERT
TO authenticated
WITH CHECK (project_id IN (
  SELECT projects.id
  FROM projects
  WHERE projects.user_id = (auth.jwt() ->> 'sub')::text
));

CREATE POLICY "Users can update social accounts for their projects"
ON public.social_accounts
FOR UPDATE
TO authenticated
USING (project_id IN (
  SELECT projects.id
  FROM projects
  WHERE projects.user_id = (auth.jwt() ->> 'sub')::text
))
WITH CHECK (project_id IN (
  SELECT projects.id
  FROM projects
  WHERE projects.user_id = (auth.jwt() ->> 'sub')::text
));

CREATE POLICY "Users can delete social accounts for their projects"
ON public.social_accounts
FOR DELETE
TO authenticated
USING (project_id IN (
  SELECT projects.id
  FROM projects
  WHERE projects.user_id = (auth.jwt() ->> 'sub')::text
));

-- Add comment for documentation
COMMENT ON FUNCTION public.get_social_account_tokens(uuid) IS 'Secure function to access social media tokens only when explicitly needed';
COMMENT ON VIEW public.social_accounts_safe IS 'Safe view of social accounts without exposing sensitive token data';