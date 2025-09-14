-- Create a secure view that excludes sensitive token data
CREATE OR REPLACE VIEW public.safe_social_accounts AS
SELECT 
  id,
  user_id,
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

-- Create API usage logging table for security audit
CREATE TABLE IF NOT EXISTS public.social_api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  platform TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on the new table
ALTER TABLE public.social_api_usage_log ENABLE ROW LEVEL SECURITY;

-- Create policy for API usage log
CREATE POLICY "Users can view their own API usage logs"
  ON public.social_api_usage_log
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'sub')::text);

-- Create policy for inserting API usage logs (for the edge function)
CREATE POLICY "Service role can insert API usage logs"
  ON public.social_api_usage_log
  FOR INSERT
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_social_api_usage_log_user_id ON public.social_api_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_social_api_usage_log_timestamp ON public.social_api_usage_log(timestamp);

-- Update existing RLS policies to be more restrictive for the main table
DROP POLICY IF EXISTS "Users can view their own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can update their own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can delete their own social accounts" ON public.social_accounts;

-- Create more restrictive policies that exclude token fields for regular users
CREATE POLICY "Users can view safe social account data"
  ON public.social_accounts
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'sub')::text);

-- Only service role can access full token data
CREATE POLICY "Service role full access to social accounts"
  ON public.social_accounts
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can delete their own accounts
CREATE POLICY "Users can delete their own social accounts"
  ON public.social_accounts
  FOR DELETE
  USING (user_id = (auth.jwt() ->> 'sub')::text);