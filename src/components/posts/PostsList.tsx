import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { usePosts, Post } from '@/hooks/usePosts';
import { useToast } from '@/hooks/use-toast';
import { 
  Edit,
  Trash2,
  Calendar,
  Globe,
  Clock,
  Search,
  Twitter,
  Linkedin,
  Facebook,
  Eye,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';

const PLATFORM_ICONS = {
  TWITTER: Twitter,
  LINKEDIN: Linkedin,
  FACEBOOK: Facebook,
  REDDIT: Globe
};

const STATUS_COLORS = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

interface PostsListProps {
  selectedProjectId?: string;
}

export function PostsList({ selectedProjectId }: PostsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { posts, isLoading, deletePost, updatePost } = usePosts(selectedProjectId);
  const { toast } = useToast();

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || post.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost(postId);
      toast({
        title: "Post Deleted",
        description: "The post has been successfully deleted.",
      });
    }
  };

  const handleDuplicate = (post: Post) => {
    // This would typically open the post creator with the post content
    navigator.clipboard.writeText(post.content || '');
    toast({
      title: "Content Copied",
      description: "Post content has been copied to clipboard.",
    });
  };

  const getPostPreview = (content?: string) => {
    if (!content) return 'No content';
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Posts</h1>
          <p className="text-muted-foreground mt-2">Manage your social media posts and campaigns</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms.' : 'Start creating your first post!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {post.title || 'Untitled Post'}
                      </h3>
                      <Badge className={STATUS_COLORS[post.status]}>
                        {post.status}
                      </Badge>
                      {post.ai_generated && (
                        <Badge variant="outline" className="text-brand border-brand">
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      {getPostPreview(post.content)}
                    </p>
                    
                    {/* Platforms */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-muted-foreground">Platforms:</span>
                      {post.platforms.map((platform) => {
                        const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
                        return Icon ? (
                          <Icon key={platform} className="w-4 h-4 text-muted-foreground" />
                        ) : null;
                      })}
                    </div>
                    
                    {/* Timestamps */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Created {format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      
                      {post.scheduled_at && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Scheduled for {format(new Date(post.scheduled_at), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      )}
                      
                      {post.published_at && (
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>Published {format(new Date(post.published_at), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(post)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}