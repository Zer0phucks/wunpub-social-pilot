import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { useUser } from './useUser';

export const useAnalytics = (projectId?: string) => {
  const supabase = useSupabase();
  const { user } = useUser();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', projectId],
    queryFn: async () => {
      if (!user?.id || !projectId) return null;

      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, scheduled_at, published_at, status')
        .eq('project_id', projectId);

      if (postsError) throw postsError;

      const { data: analytics, error: analyticsError } = await supabase
        .from('post_analytics')
        .select('*')
        .in('post_id', posts.map(p => p.id));
      
      if (analyticsError) throw analyticsError;

      // In a real app, you would perform more complex calculations here.
      // For now, we'll just return the raw data.
      return {
        posts,
        analytics,
      };
    },
    enabled: !!user?.id && !!projectId,
  });

  return {
    analytics,
    isLoading,
  };
};