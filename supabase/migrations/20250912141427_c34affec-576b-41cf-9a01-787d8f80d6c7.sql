-- Disable RLS on profiles table since we're using Clerk auth
-- and handling authorization in the application layer
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on projects table for consistency
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;