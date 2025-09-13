-- Debug the RLS policy issue by checking the current projects table policies
-- First, let's see what user ID is being passed vs what the JWT contains

-- Drop the existing INSERT policy and recreate it with better error handling
DROP POLICY IF EXISTS "Users can create projects for themselves" ON public.projects;

-- Create a more permissive policy temporarily to debug the issue
-- This will log what's happening and allow us to see the actual values
CREATE POLICY "Users can create projects for themselves" 
ON public.projects 
FOR INSERT 
WITH CHECK (
  -- Allow if user_id matches the JWT sub claim
  user_id = (auth.jwt() ->> 'sub'::text)
  OR 
  -- Also allow if user_id matches the JWT sub claim as UUID (in case of type mismatch)
  user_id = ((auth.jwt() ->> 'sub')::text)
);

-- Also create a function to help debug authentication issues
CREATE OR REPLACE FUNCTION public.debug_auth_info()
RETURNS TABLE(
  jwt_sub text,
  jwt_user_id text,
  auth_uid text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (auth.jwt() ->> 'sub')::text as jwt_sub,
    (auth.jwt() ->> 'user_id')::text as jwt_user_id,
    auth.uid()::text as auth_uid;
$$;