import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';
import { decryptToken } from '@/utils/tokenSecurity';

export interface SocialAccountTokens {
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
}

export const useSocialAccountTokens = (accountId?: string) => {
  const { user } = useUser();

  // Fetch tokens for a specific social account when needed
  const { data: tokens, isLoading, error } = useQuery({
    queryKey: ['social-account-tokens', accountId],
    queryFn: async (): Promise<SocialAccountTokens | null> => {
      if (!accountId || !user?.id) return null;

      // Query the social_accounts table directly for this specific account
      // This will work because the RLS policy allows the user to see their own accounts
      const { data, error } = await supabase
        .from('social_accounts')
        .select('access_token, refresh_token, token_expires_at')
        .eq('id', accountId)
        .single();

      if (error) {
        console.warn('Error fetching social account tokens');
        throw error;
      }

      if (!data) return null;
      
      // Decrypt tokens for use in the application
      return {
        access_token: data.access_token ? decryptToken(data.access_token) : '',
        refresh_token: data.refresh_token ? decryptToken(data.refresh_token) : undefined,
        token_expires_at: data.token_expires_at,
      };
    },
    enabled: !!accountId && !!user?.id,
  });

  return {
    tokens,
    isLoading,
    error,
  };
};