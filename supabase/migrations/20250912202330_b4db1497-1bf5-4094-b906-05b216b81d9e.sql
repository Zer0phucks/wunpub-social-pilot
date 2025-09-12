-- Fix critical security issue: Enable RLS on profiles and projects tables
-- This prevents unauthorized access to user email addresses and project data

-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on projects table  
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Update profiles table policies to use Clerk authentication
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create secure RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = (auth.jwt() ->> 'sub'::text));

-- Update projects table policies to use Clerk authentication
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Create secure RLS policies for projects table
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (user_id = (auth.jwt() ->> 'sub'::text));