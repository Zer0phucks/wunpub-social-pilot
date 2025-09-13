import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { useUser } from './useUser';

export interface Message {
  id: string;
  project_id: string;
  platform: string;
  message_type: string;
  content: string;
  sender_id: string;
  sender_username: string;
  recipient_username?: string;
  platform_message_id: string;
  thread_id?: string;
  message_url?: string;
  is_read: boolean;
  is_replied: boolean;
  received_at: string;
  replied_at?: string;
}

export const useMessages = (projectId?: string) => {
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('received_at', { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!projectId,
  });

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const markAsReplied = useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          is_replied: true,
          replied_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const bulkMarkAsRead = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const unreadCount = messages.filter(message => !message.is_read).length;
  const unrepliedCount = messages.filter(message => !message.is_replied && message.message_type === 'direct_message').length;

  return {
    messages,
    isLoading,
    unreadCount,
    unrepliedCount,
    markAsRead: markAsRead.mutate,
    markAsReplied: markAsReplied.mutate,
    bulkMarkAsRead: bulkMarkAsRead.mutate,
    isMarkingRead: markAsRead.isPending,
    isMarkingReplied: markAsReplied.isPending,
  };
};