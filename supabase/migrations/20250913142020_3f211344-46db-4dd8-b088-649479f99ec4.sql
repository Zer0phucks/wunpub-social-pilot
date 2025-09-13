-- Critical Security Fix: Restrict profile access to owners only
-- Remove existing overly permissive policies
DROP POLICY IF EXISTS "Allow profile viewing for valid users" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile updates for valid users" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation with valid ID" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

-- Create secure profile policies that only allow access to profile owners
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can update only their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can insert only their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = (auth.jwt() ->> 'sub'::text));

-- Critical Security Fix: Restrict project access to owners only  
-- Remove existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to view their projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to create projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to update their projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their projects" ON public.projects;

-- Create secure project policies that only allow access to project owners
CREATE POLICY "Users can view only their own projects" 
ON public.projects 
FOR SELECT 
USING (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can create projects for themselves" 
ON public.projects 
FOR INSERT 
WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can update only their own projects" 
ON public.projects 
FOR UPDATE 
USING (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can delete only their own projects" 
ON public.projects 
FOR DELETE 
USING (user_id = (auth.jwt() ->> 'sub'::text));