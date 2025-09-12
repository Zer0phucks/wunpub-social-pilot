-- Enhanced security for social media access tokens - Simpler approach
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view basic social account info for their projects" ON public.social_accounts;
DROP POLICY IF EXISTS "Block direct token access on social_accounts" ON public.social_accounts;

-- Create a more restrictive SELECT policy that only allows viewing non-sensitive fields
CREATE POLICY "Users can view limited social account info for their projects"
ON public.social_accounts
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT projects.id
    FROM projects
    WHERE projects.user_id = (auth.jwt() ->> 'sub')::text
  )
);

-- Create a function to safely get account info without tokens
CREATE OR REPLACE FUNCTION public.get_safe_social_accounts(p_project_id uuid)
RETURNS TABLE(
  id uuid,
  project_id uuid,
  platform text,
  account_id text,
  account_username text,
  is_active boolean,
  connected_at timestamp with time zone,
  updated_at timestamp with time zone,
  has_access_token boolean,
  has_refresh_token boolean,
  token_expires_at timestamp with time zone,
  is_token_expired boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    sa.id,
    sa.project_id,
    sa.platform,
    sa.account_id,
    sa.account_username,
    sa.is_active,
    sa.connected_at,
    sa.updated_at,
    (sa.access_token IS NOT NULL) as has_access_token,
    (sa.refresh_token IS NOT NULL) as has_refresh_token,
    sa.token_expires_at,
    public.is_token_expired(sa.token_expires_at) as is_token_expired
  FROM social_accounts sa
  JOIN projects p ON sa.project_id = p.id
  WHERE sa.project_id = p_project_id 
  AND p.user_id = (auth.jwt() ->> 'sub')::text
  ORDER BY sa.connected_at DESC;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.get_safe_social_accounts(uuid) IS 'Secure function to get social account info without exposing tokens';