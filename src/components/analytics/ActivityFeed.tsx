import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Heart, 
  Share, 
  Calendar,
  Send,
  UserPlus,
  TrendingUp,
  Clock
} from 'lucide-react';

const activityItems = [
  {
    id: 1,
    type: 'post_published',
    title: 'Post published on LinkedIn',
    description: '"5 AI Tools Every Marketer Should Know"',
    timestamp: '2 hours ago',
    icon: Send,
    color: 'brand',
    metrics: { likes: 23, comments: 5, shares: 2 }
  },
  {
    id: 2,
    type: 'engagement',
    title: 'High engagement on Twitter post',
    description: 'Your thread about productivity got 45 retweets',
    timestamp: '4 hours ago',
    icon: TrendingUp,
    color: 'success',
    metrics: { likes: 89, comments: 12, shares: 45 }
  },
  {
    id: 3,
    type: 'follower',
    title: 'New followers gained',
    description: '12 new followers on LinkedIn today',
    timestamp: '6 hours ago',
    icon: UserPlus,
    color: 'info',
    metrics: { count: 12 }
  },
  {
    id: 4,
    type: 'scheduled',
    title: 'Post scheduled',
    description: 'Reddit post scheduled for tomorrow 2 PM',
    timestamp: '8 hours ago',
    icon: Calendar,
    color: 'warning'
  },
  {
    id: 5,
    type: 'message',
    title: 'New message received',
    description: 'Someone replied to your Facebook post',
    timestamp: '12 hours ago',
    icon: MessageCircle,
    color: 'info',
    badge: 'New'
  },
  {
    id: 6,
    type: 'milestone',
    title: 'Milestone reached!',
    description: 'You hit 2K followers across all platforms',
    timestamp: '1 day ago',
    icon: TrendingUp,
    color: 'success',
    badge: 'Achievement'
  }
];

const getActivityIcon = (item: typeof activityItems[0]) => {
  const IconComponent = item.icon;
  return <IconComponent className={`w-4 h-4 text-${item.color}`} />;
};

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <div className="text-sm text-muted-foreground">Last 24 hours</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityItems.map((item, index) => (
          <div 
            key={item.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-surface-2 transition-colors duration-200 cursor-pointer group"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className={`bg-${item.color}/10`}>
                {getActivityIcon(item)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge variant="outline" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.timestamp}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              
              {item.metrics && (
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {item.metrics.likes && (
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{item.metrics.likes}</span>
                    </div>
                  )}
                  {item.metrics.comments && (
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{item.metrics.comments}</span>
                    </div>
                  )}
                  {item.metrics.shares && (
                    <div className="flex items-center space-x-1">
                      <Share className="w-3 h-3" />
                      <span>{item.metrics.shares}</span>
                    </div>
                  )}
                  {item.metrics.count && (
                    <div className="flex items-center space-x-1">
                      <UserPlus className="w-3 h-3" />
                      <span>+{item.metrics.count}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="text-center pt-4 border-t border-border">
          <button className="text-sm text-brand hover:text-brand/80 transition-colors">
            View all activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
}