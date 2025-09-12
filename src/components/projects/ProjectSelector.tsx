import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjects } from '@/hooks/useProjects';
import { Plus, Settings, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectSelectorProps {
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  onCreateNew: () => void;
}

export function ProjectSelector({ selectedProjectId, onProjectSelect, onCreateNew }: ProjectSelectorProps) {
  const { projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <p className="text-muted-foreground">Select a project to manage or create a new one</p>
        </div>
        <Button onClick={onCreateNew} className="bg-brand hover:bg-brand/90 text-brand-foreground">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card 
            key={project.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-wun-brand/20 hover:border-brand/50 ${
              selectedProjectId === project.id 
                ? 'border-brand shadow-wun-brand bg-brand/5' 
                : 'bg-card hover:bg-surface-1'
            }`}
            onClick={() => onProjectSelect(project.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || 'No description provided'}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open project settings
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {project.marketing_goal && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    <strong>Goal:</strong> {project.marketing_goal}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize">
                    {project.ai_tone}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card className="col-span-full border-dashed border-2 border-border">
            <CardContent className="text-center py-12">
              <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No projects yet</CardTitle>
              <CardDescription className="mb-4">
                Create your first project to start managing your social media presence
              </CardDescription>
              <Button onClick={onCreateNew} className="bg-brand hover:bg-brand/90 text-brand-foreground">
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}