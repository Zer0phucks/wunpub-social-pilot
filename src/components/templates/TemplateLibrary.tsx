import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Copy, Eye, FileText } from 'lucide-react';
import { useTemplates, Template } from '@/hooks/useTemplates';
import { TemplateCreator } from './TemplateCreator';
import { TemplatePreview } from './TemplatePreview';
import { useToast } from '@/hooks/use-toast';

interface TemplateLibraryProps {
  selectedProjectId?: string;
  onUseTemplate?: (template: Template) => void;
}

const platformColors = {
  REDDIT: 'bg-orange-500',
  TWITTER: 'bg-blue-500',
  LINKEDIN: 'bg-blue-700',
  FACEBOOK: 'bg-blue-600',
  INSTAGRAM: 'bg-pink-500',
  TIKTOK: 'bg-black'
};

export const TemplateLibrary = ({ selectedProjectId, onUseTemplate }: TemplateLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const { templates, isLoading, deleteTemplate, incrementUsage } = useTemplates(selectedProjectId);
  const { toast } = useToast();

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPlatform = platformFilter === 'all' || template.platforms.includes(platformFilter);
    
    return matchesSearch && matchesPlatform;
  });

  const handleUseTemplate = (template: Template) => {
    incrementUsage(template.id);
    onUseTemplate?.(template);
    toast({
      title: "Template applied",
      description: `"${template.name}" has been applied to your post.`,
    });
  };

  const handleDeleteTemplate = (template: Template) => {
    if (template.project_id !== selectedProjectId) {
      toast({
        title: "Cannot delete",
        description: "You can only delete your own templates.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteTemplate(template.id);
      toast({
        title: "Template deleted",
        description: `"${template.name}" has been deleted.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Library</h1>
          <p className="text-muted-foreground">Create and manage reusable content templates</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <TemplateCreator
              projectId={selectedProjectId}
              onSuccess={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="REDDIT">Reddit</SelectItem>
            <SelectItem value="TWITTER">Twitter</SelectItem>
            <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
            <SelectItem value="FACEBOOK">Facebook</SelectItem>
            <SelectItem value="INSTAGRAM">Instagram</SelectItem>
            <SelectItem value="TIKTOK">TikTok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || platformFilter !== 'all' 
              ? 'No templates match your current filters.' 
              : 'Create your first template to get started.'}
          </p>
          {!searchQuery && platformFilter === 'all' && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isOwned={template.project_id === selectedProjectId}
              onUse={() => handleUseTemplate(template)}
              onEdit={() => setEditingTemplate(template)}
              onDelete={() => handleDeleteTemplate(template)}
              onPreview={() => setPreviewTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <TemplateCreator
              projectId={selectedProjectId}
              template={editingTemplate}
              onSuccess={() => setEditingTemplate(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <TemplatePreview template={previewTemplate} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TemplateCard = ({ 
  template, 
  isOwned, 
  onUse, 
  onEdit, 
  onDelete, 
  onPreview 
}: { 
  template: Template;
  isOwned: boolean;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{template.name}</CardTitle>
            {template.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {template.description}
              </p>
            )}
          </div>
          
          {template.is_public && (
            <Badge variant="secondary" className="ml-2">Public</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Platforms */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Platforms:</span>
          <div className="flex gap-1">
            {template.platforms.map((platform) => (
              <div
                key={platform}
                className={`w-3 h-3 rounded-full ${platformColors[platform as keyof typeof platformColors]}`}
                title={platform}
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="text-xs text-muted-foreground">
          Used {template.usage_count} times
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" onClick={onUse} className="flex-1">
            <Copy className="h-3 w-3 mr-1" />
            Use
          </Button>
          <Button size="sm" variant="ghost" onClick={onPreview}>
            <Eye className="h-3 w-3" />
          </Button>
          {isOwned && (
            <>
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};