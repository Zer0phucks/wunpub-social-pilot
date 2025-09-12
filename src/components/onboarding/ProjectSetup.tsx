import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/components/ui/use-toast';
import { Rocket, Target, Brain } from 'lucide-react';

interface ProjectSetupProps {
  onComplete: (projectId: string) => void;
}

export function ProjectSetup({ onComplete }: ProjectSetupProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    marketing_goal: '',
    ai_tone: 'professional' as const,
  });

  const { createProject, isCreating } = useProjects();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Project name required',
        description: 'Please enter a name for your project.',
        variant: 'destructive',
      });
      return;
    }

    createProject(
      {
        ...formData,
        ai_enabled: true,
      },
      {
        onSuccess: (project) => {
          toast({
            title: 'Project created!',
            description: 'Your WunPub project is ready to go.',
          });
          onComplete(project.id);
        },
        onError: (error) => {
          toast({
            title: 'Failed to create project',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border-border/50 shadow-elegant">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center mb-4">
            <Rocket className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create Your First Project</CardTitle>
          <CardDescription>
            Set up your social media marketing project to get started with WunPub
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g., My SaaS Product Launch"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-surface-1 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your project..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-surface-1 border-border min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketing_goal" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Marketing Goal
              </Label>
              <Textarea
                id="marketing_goal"
                placeholder="What do you want to achieve? e.g., increase brand awareness, drive website traffic, generate leads..."
                value={formData.marketing_goal}
                onChange={(e) => setFormData(prev => ({ ...prev, marketing_goal: e.target.value }))}
                className="bg-surface-1 border-border min-h-[80px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Tone Preference
              </Label>
              <RadioGroup
                value={formData.ai_tone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, ai_tone: value as any }))}
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-surface-1">
                  <RadioGroupItem value="professional" id="professional" />
                  <Label htmlFor="professional" className="text-sm font-medium">Professional</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-surface-1">
                  <RadioGroupItem value="casual" id="casual" />
                  <Label htmlFor="casual" className="text-sm font-medium">Casual</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-surface-1">
                  <RadioGroupItem value="humorous" id="humorous" />
                  <Label htmlFor="humorous" className="text-sm font-medium">Humorous</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-brand hover:bg-brand/90 text-brand-foreground shadow-wun-brand"
              disabled={isCreating}
            >
              {isCreating ? 'Creating Project...' : 'Create Project & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}