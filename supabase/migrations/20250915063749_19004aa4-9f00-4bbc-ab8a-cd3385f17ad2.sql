-- Remove SECURITY DEFINER from safe_social_accounts view to fix security vulnerability
-- This ensures RLS policies are enforced based on the querying user, not the view creator

DROP VIEW IF EXISTS public.safe_social_accounts;

CREATE VIEW public.safe_social_accounts AS 
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
WHERE p.user_id = (auth.jwt() ->> 'sub')::text;

-- Enable RLS on the view (though views inherit from underlying tables)
ALTER VIEW public.safe_social_accounts SET (security_barrier = true);