
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Percent } from "lucide-react";
import { StatisticsTab } from "@/components/StatisticsTab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const LEAGUES = {
  '39': 'Premier League',
  '71': 'Brasileirão Série A',
  '140': 'La Liga',
  '78': 'Bundesliga',
  '135': 'Serie A',
  '61': 'Ligue 1',
  '2': 'Champions League'
} as const;

type Profile = {
  username: string | null;
  avatar_url: string | null;
}

type UserRanking = {
  id: string;
  user_id: string;
  correct_predictions: number | null;
  total_predictions: number | null;
  accuracy_rate: number | null;
  league_id: string;
  updated_at: string;
  profiles: Profile | null;
};

export const UserRankings = () => {
  const [selectedLeague, setSelectedLeague] = useState<keyof typeof LEAGUES>('39');

  const { data: userRanking, isLoading: isLoadingUserRanking } = useQuery({
    queryKey: ['user-ranking', selectedLeague],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .eq('user_id', user.id)
        .eq('league_id', selectedLeague)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery<UserRanking[]>({
    queryKey: ['leaderboard', selectedLeague],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_rankings')
        .select(`
          *,
          profiles:user_id(username, avatar_url)
        `)
        .eq('league_id', selectedLeague)
        .order('accuracy_rate', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as UserRanking[];
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
      <div className="flex justify-end">
        <Select
          value={selectedLeague}
          onValueChange={(value) => setSelectedLeague(value as keyof typeof LEAGUES)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select League" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LEAGUES).map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
          <StatisticsTab league={selectedLeague} />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Global Leaderboard</CardTitle>
          <span className="text-sm text-muted-foreground">
            {LEAGUES[selectedLeague]}
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard && leaderboard.map((rank, index) => (
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
                      {rank.correct_predictions || 0} / {rank.total_predictions || 0} correct
                    </p>
                  </div>
                </div>
                <div className="text-lg font-bold text-accent">
                  {rank.accuracy_rate?.toFixed(1) || "0.0"}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
