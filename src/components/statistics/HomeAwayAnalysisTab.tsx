
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeFilter } from "./types";

interface HomeAwayAnalysisTabProps {
  leagueId: string;
  timeFilter: TimeFilter;
}

export const HomeAwayAnalysisTab = ({ leagueId, timeFilter }: HomeAwayAnalysisTabProps) => {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ["home-away-analysis", leagueId, timeFilter],
    queryFn: async () => {
      // Simulate fetching home/away analysis data through the Football API edge function
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'teams/statistics',
          params: {
            league: leagueId,
            season: '2023'
          },
        },
      });

      if (error) throw error;
      
      // Sample data for demonstration
      return {
        overview: {
          homeWins: 235,
          awayWins: 147,
          draws: 118,
          total: 500,
        },
        goals: {
          homeGoals: 687,
          awayGoals: 512,
          avgHomeGoalsPerMatch: 2.75,
          avgAwayGoalsPerMatch: 2.05,
        },
        homeAdvantage: [
          { team: "Arsenal", homeAdvantage: 32 },
          { team: "Liverpool", homeAdvantage: 28 },
          { team: "Manchester City", homeAdvantage: 26 },
          { team: "Tottenham", homeAdvantage: 25 },
          { team: "Chelsea", homeAdvantage: 24 },
          { team: "Newcastle", homeAdvantage: 22 },
          { team: "Aston Villa", homeAdvantage: 21 },
          { team: "Manchester United", homeAdvantage: 20 },
        ],
        awayPerformers: [
          { team: "Manchester City", awayPerformance: 38 },
          { team: "Liverpool", awayPerformance: 35 },
          { team: "Arsenal", awayPerformance: 33 },
          { team: "Newcastle", awayPerformance: 28 },
          { team: "Chelsea", awayPerformance: 27 },
          { team: "Tottenham", awayPerformance: 26 },
          { team: "Aston Villa", awayPerformance: 23 },
          { team: "Brighton", awayPerformance: 22 },
        ],
      };
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

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No home/away analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: "Home Wins", value: analysis.overview.homeWins, color: "#4ade80" },
    { name: "Away Wins", value: analysis.overview.awayWins, color: "#f87171" },
    { name: "Draws", value: analysis.overview.draws, color: "#94a3b8" }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overall</TabsTrigger>
            <TabsTrigger value="home">Home Advantage</TabsTrigger>
            <TabsTrigger value="away">Away Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Result Distribution</h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} matches`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Goals Analysis</h4>
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{analysis.goals.homeGoals}</div>
                      <div className="text-sm text-muted-foreground">Home Goals</div>
                    </div>
                    <div className="bg-secondary/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent">{analysis.goals.awayGoals}</div>
                      <div className="text-sm text-muted-foreground">Away Goals</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{analysis.goals.avgHomeGoalsPerMatch.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Avg Home Goals/Match</div>
                    </div>
                    <div className="bg-secondary/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent">{analysis.goals.avgAwayGoalsPerMatch.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Avg Away Goals/Match</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="home">
            <h4 className="text-sm font-medium mb-2">Teams with Strongest Home Advantage</h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analysis.homeAdvantage}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="homeAdvantage" name="Home Advantage Rating" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="away">
            <h4 className="text-sm font-medium mb-2">Teams with Best Away Performance</h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analysis.awayPerformers}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="awayPerformance" name="Away Performance Rating" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
