import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy } from 'lucide-react';
import { Template } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';

interface TemplatePreviewProps {
  template: Template;
}

const platformColors = {
  REDDIT: 'bg-orange-500',
  TWITTER: 'bg-blue-500',
  LINKEDIN: 'bg-blue-700',
  FACEBOOK: 'bg-blue-600',
  INSTAGRAM: 'bg-pink-500',
  TIKTOK: 'bg-black'
};

export const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Replace variables in content with actual values
  const getProcessedContent = () => {
    let content = template.content;
    
    template.variables.forEach(variable => {
      const value = variableValues[variable] || `{{${variable}}}`;
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      content = content.replace(regex, value);
    });
    
    return content;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getProcessedContent());
      toast({
        title: "Copied!",
        description: "Template content copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Info */}
      <div>
        <h3 className="text-lg font-semibold">{template.name}</h3>
        {template.description && (
          <p className="text-muted-foreground mt-1">{template.description}</p>
        )}
      </div>

      {/* Platforms */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Platforms:</span>
        <div className="flex gap-2">
          {template.platforms.map((platform) => (
            <Badge
              key={platform}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <div
                className={`w-2 h-2 rounded-full ${platformColors[platform as keyof typeof platformColors]}`}
              />
              {platform}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tags:</span>
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Variables Input */}
      {template.variables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.variables.map((variable) => (
              <div key={variable}>
                <Label htmlFor={variable}>{variable}</Label>
                <Input
                  id={variable}
                  value={variableValues[variable] || ''}
                  onChange={(e) => setVariableValues(prev => ({
                    ...prev,
                    [variable]: e.target.value
                  }))}
                  placeholder={`Enter value for ${variable}...`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Content Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Preview</CardTitle>
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
            {getProcessedContent()}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="text-xs text-muted-foreground">
        Used {template.usage_count} times • Created {new Date(template.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};