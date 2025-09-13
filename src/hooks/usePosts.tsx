import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { useUser } from './useUser';

export interface Post {
  id: string;
  user_id: string;
  project_id: string;
  social_account_id: string;
  title: string;
  content: string;
  status: string;
  platforms: string[];
  media_urls: string[];
  scheduled_at: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  ai_generated: boolean;
}

export const usePosts = (projectId?: string) => {
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', projectId],
    queryFn: async () => {
      if (!user?.id || !projectId) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!user?.id && !!projectId,
  });

  const createPost = useMutation({
    mutationFn: async (postData: Omit<Post, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({ ...postData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Post> & { id: string }) => {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    posts,
    isLoading,
    createPost: createPost.mutate,
    updatePost: updatePost.mutate,
    deletePost: deletePost.mutate,
  };
};