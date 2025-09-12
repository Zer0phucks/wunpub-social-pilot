-- Enhanced security for social media access tokens - Fixed version
-- Drop existing problematic policies first
DROP POLICY IF EXISTS "Users can view basic social account info for their projects" ON public.social_accounts;
DROP POLICY IF EXISTS "Block direct token access on social_accounts" ON public.social_accounts;

-- Block direct SELECT access to the main table
CREATE POLICY "Block direct token access on social_accounts"
ON public.social_accounts
FOR SELECT
TO authenticated
USING (false);

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

-- Enable RLS on the view
ALTER VIEW public.social_accounts_safe SET (security_barrier = true);

-- Create RLS policy for the safe view
CREATE POLICY "Users can view safe social account info for their projects"
ON public.social_accounts_safe
FOR SELECT
TO authenticated
USING (project_id IN (
  SELECT projects.id
  FROM projects
  WHERE projects.user_id = (auth.jwt() ->> 'sub')::text
));

-- Add comment for documentation
COMMENT ON VIEW public.social_accounts_safe IS 'Safe view of social accounts without exposing sensitive token data';