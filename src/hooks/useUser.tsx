import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export const useUser = () => {
  const { user: clerkUser, isLoaded } = useClerkUser();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user-profile', clerkUser?.id],
    queryFn: async () => {
      if (!clerkUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clerkUser.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!clerkUser?.id && isLoaded,
  });

  const createProfile = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      if (!clerkUser?.id) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          display_name: profileData.display_name || clerkUser.fullName || '',
          avatar_url: profileData.avatar_url || clerkUser.imageUrl || '',
          ...profileData,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!clerkUser?.id) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', clerkUser.id)
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  // Auto-create profile if user exists but no profile
  const { mutate: autoCreateProfile } = useMutation({
    mutationFn: createProfile.mutateAsync,
    onError: (error) => {
      console.warn('Failed to auto-create profile:', error);
    },
  });

  // Effect to create profile when needed
  if (clerkUser && isLoaded && !isProfileLoading && !profile && !createProfile.isPending) {
    autoCreateProfile({});
  }

  return {
    user: clerkUser,
    profile,
    isLoading: !isLoaded || isProfileLoading || createProfile.isPending,
    createProfile: createProfile.mutate,
    updateProfile: updateProfile.mutate,
    isCreatingProfile: createProfile.isPending,
    isUpdatingProfile: updateProfile.isPending,
  };
};