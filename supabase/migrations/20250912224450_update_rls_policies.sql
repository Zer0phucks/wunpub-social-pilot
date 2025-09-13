-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to create projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to view their projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to update their projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their projects" ON public.projects;

DROP POLICY IF EXISTS "Allow profile creation with valid ID" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile viewing for valid users" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile updates for valid users" ON public.profiles;

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can select their own profile" ON public.profiles
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid()::text = id);

-- Projects policies
CREATE POLICY "Users can select their own projects" ON public.projects
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert projects for themselves" ON public.projects
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid()::text = user_id);
