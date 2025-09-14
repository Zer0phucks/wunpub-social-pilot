-- Drop the existing view and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.safe_social_accounts;

-- Create a regular view that excludes sensitive token data
CREATE VIEW public.safe_social_accounts AS
SELECT 
  id,
  project_id,
  platform,
  account_username,
  account_id,
  connected_at,
  updated_at,
  is_active,
  token_expires_at,
  CASE 
    WHEN access_token IS NOT NULL AND length(access_token) > 0 THEN true
    ELSE false
  END as has_access_token,
  CASE 
    WHEN refresh_token IS NOT NULL AND length(refresh_token) > 0 THEN true
    ELSE false
  END as has_refresh_token
FROM social_accounts;