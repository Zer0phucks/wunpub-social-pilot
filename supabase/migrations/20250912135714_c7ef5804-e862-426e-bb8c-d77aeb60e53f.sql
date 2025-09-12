-- Drop foreign key constraints that reference user_id
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

-- Now alter the column types
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.projects ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key constraint
ALTER TABLE public.projects 
ADD CONSTRAINT projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Recreate all policies with proper TEXT id handling for Clerk
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

CREATE POLICY "Users can manage social accounts for their projects" 
ON public.social_accounts FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can manage communities for their projects" 
ON public.communities FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can view monitored posts for their communities" 
ON public.monitored_posts FOR SELECT 
USING (community_id IN (
  SELECT c.id FROM public.communities c 
  JOIN public.projects p ON c.project_id = p.id 
  WHERE p.user_id = auth.jwt() ->> 'sub'
));

CREATE POLICY "System can insert monitored posts" 
ON public.monitored_posts FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update monitored posts for their communities" 
ON public.monitored_posts FOR UPDATE 
USING (community_id IN (
  SELECT c.id FROM public.communities c 
  JOIN public.projects p ON c.project_id = p.id 
  WHERE p.user_id = auth.jwt() ->> 'sub'
));

CREATE POLICY "Users can manage posts for their projects" 
ON public.posts FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can manage post versions for their posts" 
ON public.post_versions FOR ALL 
USING (post_id IN (
  SELECT p.id FROM public.posts p 
  JOIN public.projects pr ON p.project_id = pr.id 
  WHERE pr.user_id = auth.jwt() ->> 'sub'
));

CREATE POLICY "Users can view templates for their projects" 
ON public.templates FOR SELECT 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub') OR is_public = true);

CREATE POLICY "Users can create templates for their projects" 
ON public.templates FOR INSERT 
WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their own templates" 
ON public.templates FOR UPDATE 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete their own templates" 
ON public.templates FOR DELETE 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can manage messages for their projects" 
ON public.messages FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can view analytics for their projects" 
ON public.analytics_snapshots FOR SELECT 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "System can insert analytics snapshots" 
ON public.analytics_snapshots FOR INSERT 
WITH CHECK (true);