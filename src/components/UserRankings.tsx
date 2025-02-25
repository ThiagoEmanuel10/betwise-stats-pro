
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Percent } from "lucide-react";
import { StatisticsTab } from "@/components/StatisticsTab";

export const UserRankings = () => {
  const { data: userRanking, isLoading: isLoadingUserRanking } = useQuery({
    queryKey: ['user-ranking'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_rankings')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('accuracy_rate', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingUserRanking || isLoadingLeaderboard) {
    return (
      <div className="space-y-4">
        <div className="h-32 glass animate-pulse rounded-lg"></div>
        <div className="h-64 glass animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predictions
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRanking?.total_predictions || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Correct Predictions
            </CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {userRanking?.correct_predictions || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Accuracy Rate
            </CardTitle>
            <Percent className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {userRanking?.accuracy_rate?.toFixed(1) || "0.0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <StatisticsTab />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Global Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard?.map((rank, index) => (
              <div
                key={rank.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold ${index < 3 ? "text-primary" : "text-muted-foreground"}`}>
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium">
                      {rank.profiles?.username || "Anonymous"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {rank.correct_predictions} / {rank.total_predictions} correct
                    </p>
                  </div>
                </div>
                <div className="text-lg font-bold text-accent">
                  {rank.accuracy_rate?.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
