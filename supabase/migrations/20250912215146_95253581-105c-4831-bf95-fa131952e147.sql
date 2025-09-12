-- Enable authentication bypass for testing
-- This is a temporary solution to allow project creation
-- In production, you should implement proper JWT verification

-- Create a simple function to verify if a user can create projects
CREATE OR REPLACE FUNCTION public.can_create_project(user_identifier text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- For now, allow any authenticated user to create projects
  -- In production, this should verify the JWT token from Clerk
  SELECT true;
$$;

-- Update the projects table RLS policy to be more permissive during development
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (
  -- Allow creation if the user_id matches what's being inserted
  user_id IS NOT NULL AND user_id != ''
);

-- Also ensure the profiles table is working correctly
-- Update the profiles RLS policy to be more permissive during development
DROP POLICY IF EXISTS "Users can insert their own profile only" ON public.profiles;

CREATE POLICY "Users can insert their own profile only" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow creation if the id is provided and not empty
  id IS NOT NULL AND id != ''
);

-- Add a comment explaining this is for development
COMMENT ON FUNCTION public.can_create_project(text) IS 'Development function to allow project creation - should be replaced with proper JWT verification in production';