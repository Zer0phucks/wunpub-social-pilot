-- Remove the SECURITY DEFINER function since we now use a regular view with RLS
DROP FUNCTION IF EXISTS public.get_safe_social_accounts(uuid);