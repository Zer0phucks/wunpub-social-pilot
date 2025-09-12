-- Update profiles table to use TEXT for id instead of UUID
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;

-- Update all foreign key references to use TEXT as well
ALTER TABLE public.projects ALTER COLUMN user_id TYPE TEXT;

-- Update the foreign key constraint
ALTER TABLE public.projects 
DROP CONSTRAINT projects_user_id_fkey,
ADD CONSTRAINT projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update RLS policies to work with TEXT ids
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Recreate policies with proper TEXT id handling
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create their own projects" 
ON public.projects FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE USING (user_id = auth.jwt() ->> 'sub');