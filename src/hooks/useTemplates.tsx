import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';

export interface Template {
  id: string;
  project_id: string;
  name: string;
  content: string;
  description?: string;
  platforms: string[];
  variables: string[];
  tags: string[];
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export const useTemplates = (projectId?: string) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .or(`project_id.eq.${projectId},is_public.eq.true`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Template[];
    },
    enabled: !!projectId,
  });

  const createTemplate = useMutation({
    mutationFn: async (templateData: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      const { data, error } = await supabase
        .from('templates')
        .insert({ ...templateData, usage_count: 0 })
        .select()
        .single();

      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Template> & { id: string }) => {
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const incrementUsage = useMutation({
    mutationFn: async (templateId: string) => {
      const { data: template } = await supabase
        .from('templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();

      if (template) {
        const { error } = await supabase
          .from('templates')
          .update({ usage_count: template.usage_count + 1 })
          .eq('id', templateId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    incrementUsage: incrementUsage.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
};