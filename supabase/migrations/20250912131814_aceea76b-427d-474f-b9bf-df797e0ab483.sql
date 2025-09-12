-- Create user profiles table synced with Clerk
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  marketing_goal TEXT,
  ai_tone TEXT DEFAULT 'professional' CHECK (ai_tone IN ('professional', 'casual', 'humorous')),
  ai_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own projects" 
ON public.projects FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE USING (user_id = auth.uid());

-- Create social accounts table
CREATE TABLE public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'twitter', 'facebook', 'linkedin')),
  account_username TEXT NOT NULL,
  account_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, platform, account_id)
);

-- Enable RLS on social accounts
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- Social accounts policies
CREATE POLICY "Users can manage social accounts for their projects" 
ON public.social_accounts FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'twitter', 'facebook', 'linkedin')),
  community_id TEXT NOT NULL,
  community_name TEXT NOT NULL,
  community_url TEXT,
  relevance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  is_monitoring BOOLEAN DEFAULT true,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, platform, community_id)
);

-- Enable RLS on communities
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Communities policies
CREATE POLICY "Users can manage communities for their projects" 
ON public.communities FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Create monitored posts table
CREATE TABLE public.monitored_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  platform_post_id TEXT NOT NULL,
  title TEXT,
  content TEXT,
  author_username TEXT,
  author_id TEXT,
  post_url TEXT,
  engagement_count INTEGER DEFAULT 0,
  relevance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  posted_at TIMESTAMP WITH TIME ZONE,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  UNIQUE(community_id, platform_post_id)
);

-- Enable RLS on monitored posts
ALTER TABLE public.monitored_posts ENABLE ROW LEVEL SECURITY;

-- Monitored posts policies
CREATE POLICY "Users can view monitored posts for their communities" 
ON public.monitored_posts FOR SELECT 
USING (community_id IN (
  SELECT c.id FROM public.communities c 
  JOIN public.projects p ON c.project_id = p.id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "System can insert monitored posts" 
ON public.monitored_posts FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update monitored posts for their communities" 
ON public.monitored_posts FOR UPDATE 
USING (community_id IN (
  SELECT c.id FROM public.communities c 
  JOIN public.projects p ON c.project_id = p.id 
  WHERE p.user_id = auth.uid()
));

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  media_urls TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  template_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Users can manage posts for their projects" 
ON public.posts FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Create post versions table
CREATE TABLE public.post_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'twitter', 'facebook', 'linkedin')),
  content TEXT NOT NULL,
  media_urls TEXT[],
  character_count INTEGER DEFAULT 0,
  platform_post_id TEXT,
  platform_url TEXT,
  engagement_metrics JSONB DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, platform)
);

-- Enable RLS on post versions
ALTER TABLE public.post_versions ENABLE ROW LEVEL SECURITY;

-- Post versions policies
CREATE POLICY "Users can manage post versions for their posts" 
ON public.post_versions FOR ALL 
USING (post_id IN (
  SELECT p.id FROM public.posts p 
  JOIN public.projects pr ON p.project_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

-- Create templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Templates policies
CREATE POLICY "Users can view templates for their projects" 
ON public.templates FOR SELECT 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()) OR is_public = true);

CREATE POLICY "Users can create templates for their projects" 
ON public.templates FOR INSERT 
WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own templates" 
ON public.templates FOR UPDATE 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own templates" 
ON public.templates FOR DELETE 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'twitter', 'facebook', 'linkedin')),
  message_type TEXT NOT NULL CHECK (message_type IN ('dm', 'comment', 'mention')),
  platform_message_id TEXT NOT NULL,
  thread_id TEXT,
  sender_username TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  recipient_username TEXT,
  content TEXT NOT NULL,
  message_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_replied BOOLEAN DEFAULT false,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  replied_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, platform, platform_message_id)
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can manage messages for their projects" 
ON public.messages FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Create analytics snapshots table
CREATE TABLE public.analytics_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'twitter', 'facebook', 'linkedin')),
  snapshot_date DATE NOT NULL,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, platform, snapshot_date)
);

-- Enable RLS on analytics snapshots
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Analytics snapshots policies
CREATE POLICY "Users can view analytics for their projects" 
ON public.analytics_snapshots FOR SELECT 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "System can insert analytics snapshots" 
ON public.analytics_snapshots FOR INSERT 
WITH CHECK (true);

-- Add foreign key for templates
ALTER TABLE public.posts 
ADD CONSTRAINT fk_posts_template 
FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE SET NULL;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();