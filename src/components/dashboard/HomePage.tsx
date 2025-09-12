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

// Platform logo components
const RedditLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const TwitterLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const FacebookLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

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

  const contentSuggestions = [
    {
      title: 'Trending Topic: Tools for Marketing',
      description: 'High engagement potential based on community activity',
      platform: 'Reddit',
      confidence: 92,
      logo: RedditLogo
    },
    {
      title: 'Share Your Success Story',
      description: 'Personal stories perform 3x better on LinkedIn',
      platform: 'LinkedIn',
      confidence: 88,
      logo: LinkedInLogo
    },
    {
      title: 'Quick Tips Thread',
      description: 'Twitter threads about productivity are trending',
      platform: 'Twitter',
      confidence: 85,
      logo: TwitterLogo
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
          <h1 className="text-3xl font-bold text-foreground">Good morning!</h1>
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
        {/* Content Suggestions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-brand" />
              Content Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentSuggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg border border-border hover:bg-surface-2 transition-colors duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <suggestion.logo />
                      <h4 className="font-medium text-foreground group-hover:text-brand transition-colors">
                        {suggestion.title}
                      </h4>
                      <Badge variant="outline" className="text-xs flex items-center space-x-1">
                        <suggestion.logo />
                        <span>{suggestion.platform}</span>
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