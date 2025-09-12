-- Add additional security layer for email field access
-- Create a function to check if the requesting user owns the profile
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profile_user_id = (auth.jwt() ->> 'sub'::text);
$$;

-- Drop existing policies to recreate them with enhanced security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create enhanced RLS policies with better security
CREATE POLICY "Users can view their own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_profile_owner(id));

CREATE POLICY "Users can update their own profile only"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_profile_owner(id))
WITH CHECK (public.is_profile_owner(id));

CREATE POLICY "Users can insert their own profile only"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_profile_owner(id));

-- Ensure no anonymous access to profiles
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with enhanced RLS protection to prevent email harvesting';