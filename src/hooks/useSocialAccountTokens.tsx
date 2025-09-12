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

      const { data, error } = await supabase.rpc('get_social_account_tokens', {
        account_id: accountId
      });

      if (error) {
        console.warn('Error fetching social account tokens');
        throw error;
      }

      if (!data || !data.length) return null;

      const tokenData = data[0];
      
      // Decrypt tokens for use in the application
      return {
        access_token: tokenData.access_token ? decryptToken(tokenData.access_token) : '',
        refresh_token: tokenData.refresh_token ? decryptToken(tokenData.refresh_token) : undefined,
        token_expires_at: tokenData.token_expires_at,
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