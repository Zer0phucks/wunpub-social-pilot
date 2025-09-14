import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { useUser } from './useUser';
import { decryptToken, sanitizeTokenForLogging } from '@/utils/tokenSecurity';

export interface SocialAccount {
  id: string;
  user_id: string;
  project_id: string;
  platform: string;
  account_username: string;
  account_id: string;
  connected_at: string;
  updated_at: string;
  access_token: string;
  refresh_token: string;
  is_active: boolean;
  token_expires_at: string;
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
        .order('connected_at', { ascending: false });

      if (error) throw error;
      
      // Decrypt tokens for client-side use, but keep them secure in logs
      const decryptedAccounts = await Promise.all(
        (data || []).map(async (account) => {
          try {
            const decryptedAccessToken = account.access_token ? await decryptToken(account.access_token) : '';
            const decryptedRefreshToken = account.refresh_token ? await decryptToken(account.refresh_token) : '';
            
            console.log(`Decrypted tokens for account ${account.id} (${account.platform}):`, {
              access_token: sanitizeTokenForLogging(decryptedAccessToken),
              refresh_token: sanitizeTokenForLogging(decryptedRefreshToken)
            });
            
            return {
              ...account,
              access_token: decryptedAccessToken,
              refresh_token: decryptedRefreshToken,
            };
          } catch (error) {
            console.error(`Failed to decrypt tokens for account ${account.id}:`, error);
            // Return account with empty tokens on decryption failure
            return {
              ...account,
              access_token: '',
              refresh_token: '',
            };
          }
        })
      );
      
      return decryptedAccounts as SocialAccount[];
    },
    enabled: !!user?.id && !!projectId,
  });

  const connectAccount = useMutation({
    mutationFn: async (platform: 'twitter' | 'linkedin') => {
      if (!user?.id || !projectId) throw new Error('User or project not found');

      // Call our edge function to start OAuth flow
      const { data, error } = await supabase.functions.invoke(`oauth-${platform}`, {
        body: { 
          project_id: projectId, 
          user_id: user.id 
        }
      });

      if (error) throw error;

      // Open popup window for OAuth
      const popup = window.open(
        data.authorization_url,
        'oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      return new Promise<void>((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          if (event.data?.type === 'oauth_success' && event.data?.platform === platform) {
            window.removeEventListener('message', messageHandler);
            popup?.close();
            resolve();
          }
        };

        window.addEventListener('message', messageHandler);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('OAuth cancelled'));
          }
        }, 1000);
      });
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
      // Note: This function is kept for compatibility, but tokens should be encrypted 
      // at the edge function level before insertion to ensure end-to-end security
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