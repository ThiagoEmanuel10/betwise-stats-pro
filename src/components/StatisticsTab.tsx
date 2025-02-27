
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface StatisticsTabProps {
  league: string;
}

type TimeFilter = "7days" | "30days" | "90days" | "all";

type PredictionData = {
  date: string;
  correct: number;
  incorrect: number;
  total: number;
  rate: number;
};

export const StatisticsTab = ({ league }: StatisticsTabProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30days");

  const { data: predictionStats, isLoading } = useQuery({
    queryKey: ["prediction-stats", league, timeFilter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Calculate date range based on filter
      const now = new Date();
      let startDate = new Date();
      
      if (timeFilter === "7days") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeFilter === "30days") {
        startDate.setDate(now.getDate() - 30);
      } else if (timeFilter === "90days") {
        startDate.setDate(now.getDate() - 90);
      } else {
        // For "all", set to a date far in the past
        startDate = new Date(2020, 0, 1);
      }

      // Get all predictions for this user and league within the date range
      const { data, error } = await supabase
        .from("match_predictions")
        .select("*")
        .eq("user_id", user.id)
        .eq("league_id", league)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Process data to get statistics by day
      const statsByDay = data.reduce((acc: Record<string, PredictionData>, prediction) => {
        const date = new Date(prediction.created_at).toISOString().split("T")[0];
        
        if (!acc[date]) {
          acc[date] = {
            date,
            correct: 0,
            incorrect: 0,
            total: 0,
            rate: 0
          };
        }
        
        acc[date].total += 1;
        if (prediction.is_correct) {
          acc[date].correct += 1;
        } else {
          acc[date].incorrect += 1;
        }
        
        acc[date].rate = (acc[date].correct / acc[date].total) * 100;
        
        return acc;
      }, {});

      // Convert to array and sort by date
      return Object.values(statsByDay).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  if (isLoading) {
    return <div className="h-48 w-full animate-pulse bg-secondary/50 rounded-lg"></div>;
  }

  const emptyStats = !predictionStats || predictionStats.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Prediction History</h3>
        <div className="flex space-x-2">
          <Button 
            variant={timeFilter === "7days" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setTimeFilter("7days")}
          >
            7 Days
          </Button>
          <Button 
            variant={timeFilter === "30days" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setTimeFilter("30days")}
          >
            30 Days
          </Button>
          <Button 
            variant={timeFilter === "90days" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setTimeFilter("90days")}
          >
            3 Months
          </Button>
          <Button 
            variant={timeFilter === "all" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setTimeFilter("all")}
          >
            All Time
          </Button>
        </div>
      </div>

      <Tabs defaultValue="accuracy">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="accuracy">Accuracy Rate</TabsTrigger>
          <TabsTrigger value="predictions">Predictions Count</TabsTrigger>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
        </TabsList>

        <TabsContent value="accuracy" className="h-[400px]">
          {emptyStats ? (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">No prediction data available for this period</p>
              </CardContent>
            </Card>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={predictionStats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(0)}%`, 'Accuracy Rate']}
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  name="Accuracy Rate (%)" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="h-[400px]">
          {emptyStats ? (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">No prediction data available for this period</p>
              </CardContent>
            </Card>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={predictionStats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                />
                <Legend />
                <Bar dataKey="correct" name="Correct" fill="#4ade80" />
                <Bar dataKey="incorrect" name="Incorrect" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </TabsContent>

        <TabsContent value="combined" className="h-[400px]">
          {emptyStats ? (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">No prediction data available for this period</p>
              </CardContent>
            </Card>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={predictionStats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "Accuracy Rate (%)") {
                      return [`${Number(value).toFixed(0)}%`, name];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                />
                <Legend />
                <Bar dataKey="total" name="Total Predictions" fill="#94a3b8" yAxisId="left" />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  name="Accuracy Rate (%)" 
                  stroke="#8884d8" 
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
