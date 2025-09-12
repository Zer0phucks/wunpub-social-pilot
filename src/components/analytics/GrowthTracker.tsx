import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, TrendingUp, Target } from 'lucide-react';

const growthData = [
  { month: 'Sep', followers: 1200, newFollowers: 45 },
  { month: 'Oct', followers: 1280, newFollowers: 80 },
  { month: 'Nov', followers: 1420, newFollowers: 140 },
  { month: 'Dec', followers: 1580, newFollowers: 160 },
  { month: 'Jan', followers: 1750, newFollowers: 170 },
  { month: 'Feb', followers: 1920, newFollowers: 170 },
  { month: 'Mar', followers: 2100, newFollowers: 180 },
];

const chartConfig = {
  followers: {
    label: "Total Followers",
    color: "hsl(var(--brand))",
  },
  newFollowers: {
    label: "New Followers",
    color: "hsl(var(--success))",
  },
}

const growthStats = [
  {
    label: 'Total Followers',
    value: '2.1K',
    change: '+180 this month',
    icon: Users,
    color: 'brand'
  },
  {
    label: 'Growth Rate',
    value: '9.4%',
    change: '+2.1% vs last month',
    icon: TrendingUp,
    color: 'success'
  },
  {
    label: 'New Followers',
    value: '180',
    change: 'This month',
    icon: UserPlus,
    color: 'info'
  },
  {
    label: 'Goal Progress',
    value: '70%',
    change: '2.5K target',
    icon: Target,
    color: 'warning'
  }
];

export function GrowthTracker() {
  return (
    <div className="space-y-6">
      {/* Growth Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {growthStats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-wun-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-4 h-4 text-${stat.color}`} />
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
              <Badge variant="outline" className="text-xs">
                {stat.change}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Follower Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-followers)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-followers)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
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
                <Area 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="var(--color-followers)" 
                  fillOpacity={1} 
                  fill="url(#colorFollowers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}