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
  has_access_token: boolean;
  has_refresh_token: boolean;
  token_expires_at?: string;
  is_active: boolean;
  connected_at: string;
  updated_at: string;
  is_token_expired: boolean;
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

  // Fetch social accounts for a project using the secure function
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['social-accounts', projectId],
    queryFn: async () => {
      if (!projectId || !user?.id) return [];

      const { data, error } = await supabase.rpc('get_safe_social_accounts', {
        p_project_id: projectId
      });

      if (error) {
        console.warn('Error fetching social accounts');
        throw error;
      }

      return data || [];
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

      // Return a simplified response that matches our interface
      return {
        id: data.id,
        project_id: data.project_id,
        platform: data.platform,
        account_id: data.account_id,
        account_username: data.account_username,
        has_access_token: !!data.access_token,
        has_refresh_token: !!data.refresh_token,
        token_expires_at: data.token_expires_at,
        is_active: data.is_active,
        connected_at: data.connected_at,
        updated_at: data.updated_at,
        is_token_expired: false, // Newly created tokens are not expired
      } as SocialAccount;
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

      // Return a simplified response that matches our interface
      return {
        id: data.id,
        project_id: data.project_id,
        platform: data.platform,
        account_id: data.account_id,
        account_username: data.account_username,
        has_access_token: !!data.access_token,
        has_refresh_token: !!data.refresh_token,
        token_expires_at: data.token_expires_at,
        is_active: data.is_active,
        connected_at: data.connected_at,
        updated_at: data.updated_at,
        is_token_expired: data.token_expires_at ? new Date(data.token_expires_at) < new Date() : false,
      } as SocialAccount;
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