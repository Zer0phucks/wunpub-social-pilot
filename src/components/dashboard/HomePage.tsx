import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  PenTool,
  Inbox,
  Clock
} from 'lucide-react';

export function HomePage() {
  const metrics = [
    {
      title: 'Engagement Rate',
      value: '4.2%',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'success'
    },
    {
      title: 'Followers Growth',
      value: '+1.2K',
      change: '+18.2%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'info'
    },
    {
      title: 'Posts This Week',
      value: '12',
      change: '+3',
      changeType: 'positive' as const,
      icon: MessageCircle,
      color: 'warning'
    },
    {
      title: 'Scheduled Posts',
      value: '24',
      change: 'Next: 2h',
      changeType: 'neutral' as const,
      icon: Calendar,
      color: 'brand'
    }
  ];

  const aiSuggestions = [
    {
      title: 'Trending Topic: AI Tools for Marketing',
      description: 'High engagement potential based on community activity',
      platform: 'Reddit',
      confidence: 92,
      emoji: '🤖'
    },
    {
      title: 'Share Your Success Story',
      description: 'Personal stories perform 3x better on LinkedIn',
      platform: 'LinkedIn',
      confidence: 88,
      emoji: '💼'
    },
    {
      title: 'Quick Tips Thread',
      description: 'Twitter threads about productivity are trending',
      platform: 'Twitter',
      confidence: 85,
      emoji: '🧵'
    }
  ];

  const quickActions = [
    { name: 'Create Post', icon: PenTool, action: 'post', color: 'brand' },
    { name: 'Check Inbox', icon: Inbox, action: 'inbox', color: 'info' },
    { name: 'View Calendar', icon: Calendar, action: 'calendar', color: 'warning' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good morning! 👋</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your social media presence.</p>
        </div>
        
        <Button className="bg-brand-gradient hover:shadow-wun-brand transition-all duration-300">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Content
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hover:shadow-wun-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`w-4 h-4 text-${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center mt-1">
                <Badge 
                  variant={metric.changeType === 'positive' ? 'default' : 'secondary'}
                  className={`
                    text-xs
                    ${metric.changeType === 'positive' 
                      ? 'bg-success/10 text-success hover:bg-success/20' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {metric.changeType === 'positive' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Suggestions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-brand" />
              AI Content Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg border border-border hover:bg-surface-2 transition-colors duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{suggestion.emoji}</span>
                      <h4 className="font-medium text-foreground group-hover:text-brand transition-colors">
                        {suggestion.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.platform}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-muted-foreground">
                      {suggestion.confidence}% match
                    </div>
                    <div className={`w-2 h-2 rounded-full ${suggestion.confidence > 90 ? 'bg-success' : 'bg-warning'}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.name}
                variant="ghost"
                className="w-full justify-start h-12 hover:bg-surface-2 transition-colors duration-200"
              >
                <action.icon className={`w-5 h-5 mr-3 text-${action.color}`} />
                {action.name}
              </Button>
            ))}
            
            <div className="pt-4 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground mb-2">RECENT ACTIVITY</div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="w-3 h-3 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Posted to LinkedIn</span>
                  <span className="ml-auto text-xs text-muted-foreground">2h ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-3 h-3 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">New message from Twitter</span>
                  <span className="ml-auto text-xs text-muted-foreground">4h ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand mb-2">Best Time</div>
              <div className="text-sm text-muted-foreground">Tuesday 2-4 PM</div>
              <div className="text-xs text-muted-foreground mt-1">+23% engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-2">Top Platform</div>
              <div className="text-sm text-muted-foreground">LinkedIn</div>
              <div className="text-xs text-muted-foreground mt-1">4.8% avg rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-2">Trending</div>
              <div className="text-sm text-muted-foreground">#AITools</div>
              <div className="text-xs text-muted-foreground mt-1">Convert 2 posts to templates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}