import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useMessages, Message } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
  Globe,
  Search,
  Mail,
  MailOpen,
  Reply,
  ExternalLink,
  CheckCheck,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

const PLATFORM_ICONS = {
  TWITTER: Twitter,
  LINKEDIN: Linkedin,
  FACEBOOK: Facebook,
  REDDIT: Globe
};

const MESSAGE_TYPE_LABELS = {
  direct_message: 'DM',
  mention: 'Mention',
  comment: 'Comment',
  reply: 'Reply'
};

interface InboxProps {
  selectedProjectId?: string;
}

export function Inbox({ selectedProjectId }: InboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  
  const { 
    messages, 
    isLoading, 
    unreadCount, 
    unrepliedCount,
    markAsRead, 
    markAsReplied,
    bulkMarkAsRead 
  } = useMessages(selectedProjectId);
  const { toast } = useToast();

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.sender_username.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = true;
    switch (activeTab) {
      case 'unread':
        matchesTab = !message.is_read;
        break;
      case 'unreplied':
        matchesTab = !message.is_replied && message.message_type === 'direct_message';
        break;
      case 'mentions':
        matchesTab = message.message_type === 'mention';
        break;
      default:
        matchesTab = true;
    }
    
    return matchesSearch && matchesTab;
  });

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    if (checked) {
      setSelectedMessages(prev => [...prev, messageId]);
    } else {
      setSelectedMessages(prev => prev.filter(id => id !== messageId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessages(filteredMessages.map(m => m.id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleBulkMarkAsRead = () => {
    if (selectedMessages.length === 0) return;
    
    bulkMarkAsRead(selectedMessages);
    setSelectedMessages([]);
    toast({
      title: "Messages Updated",
      description: `${selectedMessages.length} messages marked as read.`,
    });
  };

  const handleMessageAction = (message: Message, action: 'read' | 'replied') => {
    if (action === 'read') {
      markAsRead(message.id);
    } else {
      markAsReplied(message.id);
    }
    
    toast({
      title: action === 'read' ? "Marked as Read" : "Marked as Replied",
      description: `Message from @${message.sender_username} updated.`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
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
          <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
          <p className="text-muted-foreground mt-2">Manage messages and notifications from your social platforms</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {unreadCount} unread
          </Badge>
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            {unrepliedCount} need reply
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="unreplied">Need Reply</TabsTrigger>
              <TabsTrigger value="mentions">Mentions</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {selectedMessages.length > 0 && (
          <Button onClick={handleBulkMarkAsRead} variant="outline" size="sm">
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark {selectedMessages.length} as Read
          </Button>
        )}
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No messages found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms.' : 'Your inbox is empty. Messages will appear here when you receive them.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All Header */}
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedMessages.length > 0 
                        ? `${selectedMessages.length} selected` 
                        : `${filteredMessages.length} messages`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filter: {activeTab}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            {filteredMessages.map((message) => {
              const PlatformIcon = PLATFORM_ICONS[message.platform as keyof typeof PLATFORM_ICONS] || Globe;
              
              return (
                <Card 
                  key={message.id} 
                  className={`transition-all hover:shadow-md ${
                    !message.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedMessages.includes(message.id)}
                        onCheckedChange={(checked) => handleSelectMessage(message.id, checked as boolean)}
                      />
                      
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <PlatformIcon className="w-8 h-8 p-1.5 bg-muted rounded-full" />
                          <div className="absolute -bottom-1 -right-1">
                            <Badge 
                              variant="secondary" 
                              className="text-xs px-1.5 py-0.5 h-auto"
                            >
                              {MESSAGE_TYPE_LABELS[message.message_type as keyof typeof MESSAGE_TYPE_LABELS]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-foreground">
                              @{message.sender_username}
                            </span>
                            {message.recipient_username && (
                              <>
                                <span className="text-muted-foreground">→</span>
                                <span className="text-muted-foreground">
                                  @{message.recipient_username}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!message.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(message.received_at), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-foreground mb-3 leading-relaxed">
                          {message.content}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {message.is_read ? (
                              <MailOpen className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Mail className="w-4 h-4 text-primary" />
                            )}
                            {message.is_replied && (
                              <Reply className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {message.message_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={message.message_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            
                            {!message.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMessageAction(message, 'read')}
                              >
                                <MailOpen className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {!message.is_replied && message.message_type === 'direct_message' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMessageAction(message, 'replied')}
                              >
                                <Reply className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}