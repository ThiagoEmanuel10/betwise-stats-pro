
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultTrend, TimeFilter } from "./types";
import { formatDate, sortByDate } from "./utils";

interface ResultTrendsTabProps {
  leagueId: string;
  timeFilter: TimeFilter;
}

export const ResultTrendsTab = ({ leagueId, timeFilter }: ResultTrendsTabProps) => {
  const { data: trends, isLoading } = useQuery({
    queryKey: ["result-trends", leagueId, timeFilter],
    queryFn: async () => {
      // Simulate fetching result trends data through the Football API edge function
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'fixtures',
          params: {
            league: leagueId,
            season: '2023',
            // Additional parameters would be used in a real implementation
          },
        },
      });

      if (error) throw error;
      
      // Sample data for demonstration purposes
      const now = new Date();
      const sampleTrends: ResultTrend[] = [];
      
      // Generate sample data for the last 30 days
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        // Random values for demonstration
        const homeWins = Math.floor(Math.random() * 5) + 2;
        const awayWins = Math.floor(Math.random() * 4) + 1;
        const draws = Math.floor(Math.random() * 3) + 1;
        
        sampleTrends.push({
          date: date.toISOString().split('T')[0],
          homeWins,
          awayWins,
          draws,
          totalMatches: homeWins + awayWins + draws
        });
      }
      
      return sortByDate(sampleTrends);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="h-full w-full animate-pulse bg-secondary/20 rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No result trend data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentage data for visualization
  const percentageData = trends.map(day => {
    const total = day.totalMatches;
    return {
      ...day,
      homeWinsPct: Math.round((day.homeWins / total) * 100),
      awayWinsPct: Math.round((day.awayWins / total) * 100),
      drawsPct: Math.round((day.draws / total) * 100)
    };
  });

  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="text-sm font-medium mb-4">Result Trends Over Time</h4>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={percentageData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis unit="%" />
              <Tooltip 
                formatter={(value) => [`${value}%`, '']}
                labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="homeWinsPct" 
                name="Home Wins %" 
                stackId="1"
                stroke="#4ade80" 
                fill="#4ade80" 
              />
              <Area 
                type="monotone" 
                dataKey="drawsPct" 
                name="Draws %" 
                stackId="1"
                stroke="#94a3b8" 
                fill="#94a3b8" 
              />
              <Area 
                type="monotone" 
                dataKey="awayWinsPct" 
                name="Away Wins %" 
                stackId="1"
                stroke="#f87171" 
                fill="#f87171" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
