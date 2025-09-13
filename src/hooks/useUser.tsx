import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import type { User } from '@supabase/supabase-js';

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
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setAuthUser(data.user ?? null);
      setAuthLoaded(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user-profile', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!authUser?.id && authLoaded,
  });

  const createProfile = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      if (!authUser?.id) throw new Error('No user ID');

      const profilePayload = {
        id: authUser.id,
        email: authUser.email ?? '',
        display_name: profileData.display_name || (authUser.user_metadata?.full_name as string) || '',
        avatar_url: profileData.avatar_url || (authUser.user_metadata?.avatar_url as string) || '',
        ...profileData,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profilePayload, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!authUser?.id) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authUser.id)
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
  });

  useEffect(() => {
    if (
      authUser &&
      authLoaded &&
      !isProfileLoading &&
      !profile &&
      !createProfile.isPending &&
      !createProfile.isError
    ) {
      autoCreateProfile({});
    }
  }, [authUser?.id, authLoaded, isProfileLoading, profile, createProfile.isPending, createProfile.isError, autoCreateProfile]);

  return {
    user: authUser,
    profile,
    isLoading: !authLoaded || isProfileLoading || createProfile.isPending,
    createProfile: createProfile.mutate,
    updateProfile: updateProfile.mutate,
    isCreatingProfile: createProfile.isPending,
    isUpdatingProfile: updateProfile.isPending,
  };
};
