import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { useUser } from './useUser';
import { useToast } from '@/hooks/use-toast';

export interface SocialMediaAction {
  action: 'post_content' | 'get_profile';
  accountId: string;
  platform: string;
  content?: string;
}

export const useSocialMediaProxy = () => {
  const supabase = useSupabase();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const callSocialAPI = useMutation({
    mutationFn: async ({ action, accountId, platform, content }: SocialMediaAction) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('social-media-proxy', {
        body: {
          action,
          accountId,
          platform,
          content,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'API call failed');

      return data.data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: `${variables.action === 'post_content' ? 'Posted content' : 'Retrieved profile'} successfully`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['social-api-usage'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to perform social media action',
        variant: "destructive",
      });
    },
  });

  const postContent = (accountId: string, platform: string, content: string) => {
    return callSocialAPI.mutate({
      action: 'post_content',
      accountId,
      platform,
      content,
    });
  };

  const getProfile = (accountId: string, platform: string) => {
    return callSocialAPI.mutate({
      action: 'get_profile',
      accountId,
      platform,
    });
  };

  return {
    postContent,
    getProfile,
    isLoading: callSocialAPI.isPending,
  };
};