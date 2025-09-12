-- Drop foreign key constraints that reference user_id
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

-- Now alter the column types
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.projects ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key constraint
ALTER TABLE public.projects 
ADD CONSTRAINT projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Only recreate the core policies that were dropped
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