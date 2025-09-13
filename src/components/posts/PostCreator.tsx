import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useSocialAccounts } from '@/hooks/useSocialAccounts';
import { 
  Calendar as CalendarIcon,
  Clock,
  Image,
  Link2,
  Sparkles,
  Send,
  Save,
  Eye,
  Twitter,
  Linkedin,
  Facebook,
  Globe,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';

const PLATFORM_LIMITS = {
  TWITTER: 280,
  LINKEDIN: 3000,
  FACEBOOK: 63206,
  REDDIT: 40000
};

const PLATFORM_ICONS = {
  TWITTER: Twitter,
  LINKEDIN: Linkedin,
  FACEBOOK: Facebook,
  REDDIT: Globe
};

const PLATFORM_COLORS = {
  TWITTER: 'text-sky-500',
  LINKEDIN: 'text-blue-600',
  FACEBOOK: 'text-blue-700',
  REDDIT: 'text-orange-500'
};

export function PostCreator() {
  const supabase = useSupabase();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['TWITTER']);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [aiTone, setAiTone] = useState<'professional' | 'casual' | 'humorous'>('professional');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { projects } = useProjects();
  const currentProject = projects[0]; // Assuming first project is selected
  const { socialAccounts } = useSocialAccounts(currentProject?.id);

  const getCharacterCount = (platform: string) => {
    return content.length;
  };

  const getCharacterLimit = (platform: string) => {
    return PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS] || 280;
  };

  const isOverLimit = (platform: string) => {
    return getCharacterCount(platform) > getCharacterLimit(platform);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileName = `${Date.now()}_${file.name}`;

    setUploading(true);

    try {
      const { data, error } = await supabase.storage
        .from('post-media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(data.path);

      setMediaUrls(prev => [...prev, publicUrl]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const generateAIContent = async () => {
    if (!currentProject) {
      toast({
        title: "No project selected",
        description: "Please select a project first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI content generation
    setTimeout(() => {
      const aiContent = `🚀 Exciting developments in ${currentProject.name}! 

${aiTone === 'professional' 
  ? 'We are pleased to announce significant progress in our latest initiative.'
  : aiTone === 'casual' 
    ? "Hey everyone! Just wanted to share some cool updates we've been working on."
    : "Plot twist: We actually figured out how to make this work! 😄"
}

#Innovation #Growth #Technology`;

      setContent(aiContent);
      setIsLoading(false);
      
      toast({
        title: "AI Content Generated",
        description: "Content has been generated based on your project and tone preferences.",
      });
    }, 2000);
  };

  const saveDraft = async () => {
    if (!currentProject) return;

    setIsLoading(true);

    try {
      const postsToInsert = selectedPlatforms.map(platform => {
        const socialAccount = socialAccounts.find(acc => acc.platform.toUpperCase() === platform);
        if (!socialAccount) {
          throw new Error(`No social account found for platform: ${platform}`);
        }
        return {
          project_id: currentProject.id,
          user_id: currentProject.user_id,
          social_account_id: socialAccount.id,
          title: title || 'Untitled Post',
          content,
          platforms: [platform],
          media_urls: mediaUrls,
          status: 'draft',
          scheduled_at: isScheduled && scheduledDate && scheduledTime
            ? new Date(`${format(scheduledDate, 'yyyy-MM-dd')}T${scheduledTime}`).toISOString()
            : null
        };
      });

      const { error } = await supabase
        .from('posts')
        .insert(postsToInsert);

      if (error) throw error;

      toast({
        title: "Draft Saved",
        description: "Your post has been saved as a draft.",
      });

      // Reset form
      setContent('');
      setTitle('');
      setMediaUrls([]);
      setScheduledDate(undefined);
      setScheduledTime('');
      setIsScheduled(false);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const publishPost = async () => {
    if (!currentProject || !content.trim()) return;

    setIsLoading(true);

    try {
      const postsToInsert = selectedPlatforms.map(platform => {
        const socialAccount = socialAccounts.find(acc => acc.platform.toUpperCase() === platform);
        if (!socialAccount) {
          throw new Error(`No social account found for platform: ${platform}`);
        }
        return {
          project_id: currentProject.id,
          user_id: currentProject.user_id,
          social_account_id: socialAccount.id,
          title: title || 'Untitled Post',
          content,
          platforms: [platform],
          media_urls: mediaUrls,
          status: isScheduled ? 'scheduled' : 'published',
          scheduled_at: isScheduled && scheduledDate && scheduledTime
            ? new Date(`${format(scheduledDate, 'yyyy-MM-dd')}T${scheduledTime}`).toISOString()
            : null,
          published_at: !isScheduled ? new Date().toISOString() : null
        };
      });

      const { error } = await supabase
        .from('posts')
        .insert(postsToInsert);

      if (error) throw error;

      toast({
        title: isScheduled ? "Post Scheduled" : "Post Published",
        description: isScheduled
          ? `Your post will be published on ${format(scheduledDate!, 'PPP')} at ${scheduledTime}`
          : "Your post has been published successfully!",
      });

      // Reset form
      setContent('');
      setTitle('');
      setMediaUrls([]);
      setScheduledDate(undefined);
      setScheduledTime('');
      setIsScheduled(false);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Post</h1>
          <p className="text-muted-foreground mt-2">Craft engaging content for your social media platforms</p>
        </div>
        
        <Button 
          onClick={generateAIContent}
          disabled={isLoading}
          className="bg-brand-gradient hover:shadow-wun-brand transition-all duration-300"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? 'Generating...' : 'AI Generate'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              {/* Character Limits for Each Platform */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Character Limits</Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPlatforms.map(platform => {
                    const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
                    const isOver = isOverLimit(platform);
                    return (
                      <div key={platform} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]}`} />
                          <span className="text-sm capitalize">{platform.toLowerCase()}</span>
                        </div>
                        <span className={`text-sm font-mono ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {getCharacterCount(platform)}/{getCharacterLimit(platform)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Media Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="media-upload">Upload Media</Label>
                <Input
                  id="media-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && <p>Uploading...</p>}
                
                {mediaUrls.length > 0 && (
                  <div className="space-y-2">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                        <span className="text-sm text-muted-foreground truncate flex-1">{url}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMediaUrl(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {socialAccounts.map(account => {
                  const platform = account.platform.toUpperCase();
                  const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
                  const isSelected = selectedPlatforms.includes(platform);
                  return (
                    <div
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`
                        flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-brand bg-brand/5' 
                          : 'border-border hover:bg-surface-2'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]}`} />
                        <span className="font-medium capitalize">{platform.toLowerCase()}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand' : 'bg-muted'}`} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle>AI Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Tone</Label>
                <Select value={aiTone} onValueChange={(value: 'professional' | 'casual' | 'humorous') => setAiTone(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="schedule">Schedule post</Label>
                <Switch
                  id="schedule"
                  checked={isScheduled}
                  onCheckedChange={setIsScheduled}
                />
              </div>
              
              {isScheduled && (
                <div className="space-y-3">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={publishPost}
              disabled={!content.trim() || isLoading || selectedPlatforms.some(isOverLimit)}
              className="w-full bg-brand-gradient hover:shadow-wun-brand transition-all duration-300"
            >
              <Send className="w-4 h-4 mr-2" />
              {isScheduled ? 'Schedule Post' : 'Publish Now'}
            </Button>
            
            <Button
              onClick={saveDraft}
              variant="outline"
              disabled={!content.trim() || isLoading}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}