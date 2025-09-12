import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';
import { encryptToken, decryptToken, sanitizeTokenForLogging } from '@/utils/tokenSecurity';
import { toast } from 'sonner';

export interface SocialAccount {
  id: string;
  project_id: string;
  platform: string;
  account_id: string;
  account_username: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  is_active: boolean;
  connected_at: string;
  updated_at: string;
}

export interface CreateSocialAccountData {
  project_id: string;
  platform: string;
  account_id: string;
  account_username: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  is_active?: boolean;
}

export const useSocialAccounts = (projectId?: string) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Fetch social accounts for a project
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['social-accounts', projectId],
    queryFn: async () => {
      if (!projectId || !user?.id) return [];

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('project_id', projectId)
        .order('connected_at', { ascending: false });

      if (error) {
        console.warn('Error fetching social accounts');
        throw error;
      }

      // Decrypt tokens for use in the application
      return (data as SocialAccount[]).map(account => ({
        ...account,
        access_token: account.access_token ? decryptToken(account.access_token) : '',
        refresh_token: account.refresh_token ? decryptToken(account.refresh_token) : undefined,
      }));
    },
    enabled: !!projectId && !!user?.id,
  });

  // Create a new social account
  const createAccount = useMutation({
    mutationFn: async (accountData: CreateSocialAccountData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Encrypt tokens before storing
      const encryptedData = {
        ...accountData,
        access_token: encryptToken(accountData.access_token),
        refresh_token: accountData.refresh_token ? encryptToken(accountData.refresh_token) : undefined,
      };

      const { data, error } = await supabase
        .from('social_accounts')
        .insert(encryptedData)
        .select()
        .single();

      if (error) {
        console.warn('Error creating social account');
        throw error;
      }

      // Log the account creation
      await supabase.rpc('log_token_access', {
        account_id: data.id,
        access_type: 'create'
      });

      return data as SocialAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast.success('Social account connected successfully');
    },
    onError: () => {
      console.warn('Failed to connect social account');
      toast.error('Failed to connect social account');
    },
  });

  // Update a social account
  const updateAccount = useMutation({
    mutationFn: async ({ 
      accountId, 
      updates 
    }: { 
      accountId: string; 
      updates: Partial<CreateSocialAccountData> 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Encrypt any token updates
      const encryptedUpdates = {
        ...updates,
        access_token: updates.access_token ? encryptToken(updates.access_token) : undefined,
        refresh_token: updates.refresh_token ? encryptToken(updates.refresh_token) : undefined,
      };

      // Remove undefined values
      Object.keys(encryptedUpdates).forEach(key => {
        if (encryptedUpdates[key as keyof typeof encryptedUpdates] === undefined) {
          delete encryptedUpdates[key as keyof typeof encryptedUpdates];
        }
      });

      const { data, error } = await supabase
        .from('social_accounts')
        .update(encryptedUpdates)
        .eq('id', accountId)
        .select()
        .single();

      if (error) {
        console.error('Error updating social account:', sanitizeTokenForLogging(error.message));
        throw error;
      }

      // Log the account update
      await supabase.rpc('log_token_access', {
        account_id: accountId,
        access_type: 'update'
      });

      return data as SocialAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast.success('Social account updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update social account:', sanitizeTokenForLogging(error.message));
      toast.error('Failed to update social account');
    },
  });

  // Delete a social account
  const deleteAccount = useMutation({
    mutationFn: async (accountId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Log the deletion before actual deletion
      await supabase.rpc('log_token_access', {
        account_id: accountId,
        access_type: 'delete'
      });

      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        console.error('Error deleting social account:', sanitizeTokenForLogging(error.message));
        throw error;
      }

      return accountId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast.success('Social account disconnected');
    },
    onError: (error) => {
      console.error('Failed to disconnect social account:', sanitizeTokenForLogging(error.message));
      toast.error('Failed to disconnect social account');
    },
  });

  // Toggle account active status
  const toggleAccountStatus = useMutation({
    mutationFn: async ({ accountId, isActive }: { accountId: string; isActive: boolean }) => {
      return updateAccount.mutateAsync({
        accountId,
        updates: { is_active: isActive }
      });
    },
    onSuccess: (_, { isActive }) => {
      toast.success(`Social account ${isActive ? 'activated' : 'deactivated'}`);
    },
  });

  // Refresh account tokens
  const refreshTokens = useMutation({
    mutationFn: async ({ 
      accountId, 
      newAccessToken, 
      newRefreshToken, 
      expiresAt 
    }: { 
      accountId: string; 
      newAccessToken: string; 
      newRefreshToken?: string; 
      expiresAt?: string; 
    }) => {
      return updateAccount.mutateAsync({
        accountId,
        updates: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          token_expires_at: expiresAt,
        }
      });
    },
    onSuccess: () => {
      toast.success('Account tokens refreshed');
    },
  });

  return {
    accounts,
    isLoading,
    createAccount: createAccount.mutate,
    updateAccount: updateAccount.mutate,
    deleteAccount: deleteAccount.mutate,
    toggleAccountStatus: toggleAccountStatus.mutate,
    refreshTokens: refreshTokens.mutate,
    isCreating: createAccount.isPending,
    isUpdating: updateAccount.isPending,
    isDeleting: deleteAccount.isPending,
  };
};