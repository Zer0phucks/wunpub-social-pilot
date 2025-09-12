-- Fix search_path security warnings for functions
-- Update all functions to include secure search_path settings

-- Fix the is_token_expired function
CREATE OR REPLACE FUNCTION public.is_token_expired(expires_at timestamp with time zone)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT expires_at IS NOT NULL AND expires_at < now();
$$;

-- Fix the update_social_account_updated_at function  
CREATE OR REPLACE FUNCTION public.update_social_account_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;