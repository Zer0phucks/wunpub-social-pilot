import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { useUser } from './useUser';

export interface SocialAccount {
  id: string;
  user_id: string;
  project_id: string;
  platform: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export const useSocialAccounts = (projectId: string) => {
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: socialAccounts = [], isLoading } = useQuery({
    queryKey: ['social-accounts', projectId],
    queryFn: async () => {
      if (!user?.id || !projectId) return [];
      
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SocialAccount[];
    },
    enabled: !!user?.id && !!projectId,
  });

  const connectAccount = useMutation({
    mutationFn: async (platform: 'twitter' | 'linkedin') => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: platform,
        options: {
          redirectTo: `${window.location.origin}/settings`,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
    },
  });

  const createAccount = useMutation({
    mutationFn: async (accountData: Omit<SocialAccount, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('social_accounts')
        .insert(accountData)
        .select()
        .single();

      if (error) throw error;
      return data as SocialAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
    },
  });

  return {
    socialAccounts,
    isLoading,
    connectAccount: connectAccount.mutate,
    deleteAccount: deleteAccount.mutate,
    createAccount: createAccount.mutate,
    isConnecting: connectAccount.isPending,
    isDeleting: deleteAccount.isPending,
    isCreating: createAccount.isPending,
  };
};