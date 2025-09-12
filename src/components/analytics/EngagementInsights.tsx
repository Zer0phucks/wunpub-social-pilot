import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Heart, MessageCircle, Share, Eye } from 'lucide-react';

const engagementData = [
  { platform: 'LinkedIn', likes: 245, comments: 32, shares: 18, views: 1520 },
  { platform: 'Twitter', likes: 180, comments: 45, shares: 28, views: 890 },
  { platform: 'Reddit', likes: 156, comments: 67, shares: 12, views: 1200 },
  { platform: 'Facebook', likes: 98, comments: 23, shares: 15, views: 650 },
];

const chartConfig = {
  likes: {
    label: "Likes",
    color: "hsl(var(--success))",
  },
  comments: {
    label: "Comments", 
    color: "hsl(var(--brand))",
  },
  shares: {
    label: "Shares",
    color: "hsl(var(--warning))",
  },
  views: {
    label: "Views",
    color: "hsl(var(--info))",
  },
}

const engagementMetrics = [
  {
    label: 'Total Likes',
    value: '679',
    change: '+12.5%',
    icon: Heart,
    color: 'success'
  },
  {
    label: 'Comments',
    value: '167',
    change: '+8.3%',
    icon: MessageCircle,
    color: 'brand'
  },
  {
    label: 'Shares',
    value: '73',
    change: '+15.2%',
    icon: Share,
    color: 'warning'
  },
  {
    label: 'Total Views',
    value: '4.26K',
    change: '+9.7%',
    icon: Eye,
    color: 'info'
  }
];

export function EngagementInsights() {
  return (
    <div className="space-y-6">
      {/* Engagement Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {engagementMetrics.map((metric) => (
          <Card key={metric.label} className="hover:shadow-wun-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-4 h-4 text-${metric.color}`} />
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {metric.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="platform" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="likes" fill="var(--color-likes)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="comments" fill="var(--color-comments)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="shares" fill="var(--color-shares)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}