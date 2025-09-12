import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Info } from 'lucide-react';
import { useTemplates, Template } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';

interface TemplateCreatorProps {
  projectId?: string;
  template?: Template;
  onSuccess?: () => void;
}

const AVAILABLE_PLATFORMS = [
  { id: 'REDDIT', name: 'Reddit' },
  { id: 'TWITTER', name: 'Twitter' },
  { id: 'LINKEDIN', name: 'LinkedIn' },
  { id: 'FACEBOOK', name: 'Facebook' },
  { id: 'INSTAGRAM', name: 'Instagram' },
  { id: 'TIKTOK', name: 'TikTok' },
];

export const TemplateCreator = ({ projectId, template, onSuccess }: TemplateCreatorProps) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    content: template?.content || '',
    platforms: template?.platforms || [],
    tags: template?.tags || [],
    variables: template?.variables || [],
    is_public: template?.is_public || false,
  });

  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState('');

  const { createTemplate, updateTemplate, isCreating, isUpdating } = useTemplates(projectId);
  const { toast } = useToast();

  const isEditing = !!template;
  const isLoading = isCreating || isUpdating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.platforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    const templateData = {
      ...formData,
      project_id: projectId,
    };

    if (isEditing && template) {
      updateTemplate({ id: template.id, ...templateData });
    } else {
      createTemplate(templateData);
    }

    toast({
      title: isEditing ? "Template updated" : "Template created",
      description: `"${formData.name}" has been ${isEditing ? 'updated' : 'created'} successfully.`,
    });

    onSuccess?.();
  };

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        platforms: [...prev.platforms, platformId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        platforms: prev.platforms.filter(p => p !== platformId)
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable.trim()]
      }));
      setNewVariable('');
    }
  };

  const removeVariable = (variableToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(variable => variable !== variableToRemove)
    }));
  };

  // Extract variables from content automatically
  const extractVariables = () => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = [...formData.content.matchAll(variableRegex)];
    const extractedVars = matches.map(match => match[1]);
    const uniqueVars = [...new Set(extractedVars)];
    
    const newVariables = uniqueVars.filter(v => !formData.variables.includes(v));
    if (newVariables.length > 0) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, ...newVariables]
      }));
      toast({
        title: "Variables detected",
        description: `Added ${newVariables.length} variable(s): ${newVariables.join(', ')}`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter template name..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this template..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Platforms *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {AVAILABLE_PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox
                  id={platform.id}
                  checked={formData.platforms.includes(platform.id)}
                  onCheckedChange={(checked) => handlePlatformChange(platform.id, !!checked)}
                />
                <Label htmlFor={platform.id}>{platform.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content *</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={extractVariables}>
              <Plus className="h-4 w-4 mr-2" />
              Extract Variables
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your template content here... Use {{variableName}} for dynamic content."
              className="min-h-32"
              required
            />
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              Use <code className="bg-muted px-1 rounded">{"{{variableName}}"}</code> for dynamic content
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              placeholder="Add variable name..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
            />
            <Button type="button" onClick={addVariable}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.variables.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.variables.map((variable) => (
                <Badge key={variable} variant="secondary" className="flex items-center gap-1">
                  {variable}
                  <button
                    type="button"
                    onClick={() => removeVariable(variable)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: !!checked }))}
            />
            <Label htmlFor="is_public">Make this template public</Label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Public templates can be used by other users in the community.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : (isEditing ? 'Update Template' : 'Create Template')}
        </Button>
      </div>
    </form>
  );
};