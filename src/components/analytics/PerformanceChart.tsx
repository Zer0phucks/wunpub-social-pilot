import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';

const chartConfig = {
  engagement: {
    label: "Engagement Rate",
    color: "hsl(var(--brand))",
  },
  impressions: {
    label: "Impressions",
    color: "hsl(var(--info))",
  },
  clicks: {
    label: "Clicks",
    color: "hsl(var(--success))",
  },
}

export function PerformanceChart({ data }) {
  const chartData = data ? data.analytics.map(analytic => ({
    date: format(new Date(data.posts.find(p => p.id === analytic.post_id)?.published_at || Date.now()), 'MMM d'),
    engagement: (analytic.likes + analytic.comments + analytic.shares) / 100,
    impressions: analytic.views,
    clicks: analytic.shares, // Using shares as clicks for now
  })) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance Overview</span>
          <div className="text-sm text-muted-foreground">Last 7 days</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
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
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="var(--color-engagement)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-engagement)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--color-engagement)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}