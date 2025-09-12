import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';

const performanceData = [
  { date: 'Jan 1', engagement: 3.2, impressions: 1200, clicks: 45 },
  { date: 'Jan 2', engagement: 3.8, impressions: 1450, clicks: 58 },
  { date: 'Jan 3', engagement: 4.1, impressions: 1380, clicks: 62 },
  { date: 'Jan 4', engagement: 3.9, impressions: 1520, clicks: 55 },
  { date: 'Jan 5', engagement: 4.5, impressions: 1680, clicks: 72 },
  { date: 'Jan 6', engagement: 4.2, impressions: 1590, clicks: 68 },
  { date: 'Jan 7', engagement: 4.8, impressions: 1720, clicks: 78 },
];

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

export function PerformanceChart() {
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
            <LineChart data={performanceData}>
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