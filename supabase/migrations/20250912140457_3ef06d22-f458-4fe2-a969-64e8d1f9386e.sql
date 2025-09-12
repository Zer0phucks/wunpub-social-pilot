-- Only create policies that don't exist yet
CREATE POLICY IF NOT EXISTS "Users can manage post versions for their posts" 
ON public.post_versions FOR ALL 
USING (post_id IN (
  SELECT p.id FROM public.posts p 
  JOIN public.projects pr ON p.project_id = pr.id 
  WHERE pr.user_id = auth.jwt() ->> 'sub'
));

CREATE POLICY IF NOT EXISTS "Users can view templates for their projects" 
ON public.templates FOR SELECT 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub') OR is_public = true);

CREATE POLICY IF NOT EXISTS "Users can create templates for their projects" 
ON public.templates FOR INSERT 
WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "Users can update their own templates" 
ON public.templates FOR UPDATE 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "Users can delete their own templates" 
ON public.templates FOR DELETE 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "Users can manage messages for their projects" 
ON public.messages FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.jwt() ->> 'sub'));