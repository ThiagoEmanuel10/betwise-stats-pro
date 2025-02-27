
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Percent, Brain, TrendingUp, Sparkles } from "lucide-react";
import { StatisticsTab } from "@/components/StatisticsTab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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

type InsightType = "strength" | "improvement" | "pattern" | "recommendation";

type Insight = {
  type: InsightType;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
};

export const UserRankings = () => {
  const [selectedLeague, setSelectedLeague] = useState<keyof typeof LEAGUES>('39');
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const { data: userPredictions, isLoading: isLoadingPredictions } = useQuery({
    queryKey: ['user-predictions', selectedLeague],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('match_predictions')
        .select('*')
        .eq('user_id', user.id)
        .eq('league_id', selectedLeague)
        .order('created_at', { ascending: false })
        .limit(50);

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
      return data as unknown as UserRanking[];
    },
  });

  // Generate AI insights based on user's prediction history
  const generateInsights = (): Insight[] => {
    if (!userPredictions || userPredictions.length === 0 || !userRanking) {
      return [{
        type: "recommendation",
        title: "Start Making Predictions",
        description: "Make your first predictions to receive personalized insights.",
        icon: <Sparkles className="h-6 w-6 text-accent" />,
        action: "Predict Now"
      }];
    }

    const insights: Insight[] = [];
    
    // Calculate various metrics from prediction history
    const correctPredictions = userPredictions.filter(p => p.is_correct).length;
    const totalPredictions = userPredictions.length;
    const accuracy = (correctPredictions / totalPredictions) * 100;
    
    // Get recent predictions (last 10)
    const recentPredictions = userPredictions.slice(0, 10);
    const recentCorrect = recentPredictions.filter(p => p.is_correct).length;
    const recentAccuracy = (recentCorrect / recentPredictions.length) * 100;
    
    // Calculate home vs away prediction success
    const homePredictions = userPredictions.filter(p => p.home_score > p.away_score);
    const awayPredictions = userPredictions.filter(p => p.home_score < p.away_score);
    const drawPredictions = userPredictions.filter(p => p.home_score === p.away_score);
    
    const homeCorrect = homePredictions.filter(p => p.is_correct).length;
    const awayCorrect = awayPredictions.filter(p => p.is_correct).length;
    const drawCorrect = drawPredictions.filter(p => p.is_correct).length;
    
    const homeAccuracy = homePredictions.length > 0 ? (homeCorrect / homePredictions.length) * 100 : 0;
    const awayAccuracy = awayPredictions.length > 0 ? (awayCorrect / awayPredictions.length) * 100 : 0;
    const drawAccuracy = drawPredictions.length > 0 ? (drawCorrect / drawPredictions.length) * 100 : 0;
    
    // Identify user's strengths
    if (homeAccuracy > awayAccuracy && homeAccuracy > drawAccuracy && homePredictions.length >= 3) {
      insights.push({
        type: "strength",
        title: "Home Win Prediction Expert",
        description: `You're particularly good at predicting home team wins with ${homeAccuracy.toFixed(1)}% accuracy.`,
        icon: <Trophy className="h-6 w-6 text-primary" />
      });
    } else if (awayAccuracy > homeAccuracy && awayAccuracy > drawAccuracy && awayPredictions.length >= 3) {
      insights.push({
        type: "strength",
        title: "Away Win Prediction Expert",
        description: `You excel at predicting away team wins with ${awayAccuracy.toFixed(1)}% accuracy.`,
        icon: <Trophy className="h-6 w-6 text-primary" />
      });
    } else if (drawAccuracy > homeAccuracy && drawAccuracy > awayAccuracy && drawPredictions.length >= 3) {
      insights.push({
        type: "strength",
        title: "Draw Prediction Expert",
        description: `You have a talent for predicting draws with ${drawAccuracy.toFixed(1)}% accuracy.`,
        icon: <Trophy className="h-6 w-6 text-primary" />
      });
    }
    
    // Recent performance insights
    if (recentAccuracy > accuracy + 10) {
      insights.push({
        type: "pattern",
        title: "Improving Prediction Accuracy",
        description: `Your recent predictions have been ${(recentAccuracy - accuracy).toFixed(1)}% more accurate than your overall average.`,
        icon: <TrendingUp className="h-6 w-6 text-green-500" />
      });
    } else if (accuracy > recentAccuracy + 10) {
      insights.push({
        type: "improvement",
        title: "Recent Accuracy Declining",
        description: `Your recent predictions have been ${(accuracy - recentAccuracy).toFixed(1)}% less accurate than your overall average.`,
        icon: <TrendingUp className="h-6 w-6 text-red-500" />
      });
    }
    
    // Add personalized recommendations
    if (totalPredictions < 20) {
      insights.push({
        type: "recommendation",
        title: "Make More Predictions",
        description: "Increase your prediction volume to improve AI insights accuracy.",
        icon: <Brain className="h-6 w-6 text-accent" />,
        action: "Predict Now"
      });
    } else if (accuracy < 45) {
      insights.push({
        type: "recommendation",
        title: "Review Statistics",
        description: "Analyze team statistics more carefully before making predictions.",
        icon: <Brain className="h-6 w-6 text-accent" />,
        action: "View Stats"
      });
    } else if (leaderboard && leaderboard.length > 0 && accuracy < (leaderboard[0].accuracy_rate || 0) - 15) {
      insights.push({
        type: "recommendation",
        title: "Study Top Predictors",
        description: "Your accuracy is significantly below the leaderboard. Check high probability matches.",
        icon: <Brain className="h-6 w-6 text-accent" />,
        action: "View High Probability"
      });
    }
    
    // If we don't have enough insights, add a generic one
    if (insights.length < 2) {
      insights.push({
        type: "pattern",
        title: "Pattern Analysis",
        description: `Based on your history, you have a ${accuracy.toFixed(1)}% overall prediction accuracy.`,
        icon: <Brain className="h-6 w-6 text-accent" />
      });
    }
    
    return insights;
  };

  const handleInsightAction = (action?: string) => {
    if (action === "Predict Now") {
      navigate('/predictions');
    } else if (action === "View Stats") {
      // Scroll to statistics section
      document.getElementById('statistics-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === "View High Probability") {
      navigate('/high-probability');
    }
  };

  if (isLoadingUserRanking || isLoadingLeaderboard || isLoadingPredictions) {
    return (
      <div className="space-y-4">
        <div className="h-32 glass animate-pulse rounded-lg"></div>
        <div className="h-64 glass animate-pulse rounded-lg"></div>
      </div>
    );
  }

  const insights = generateInsights();

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

      {/* AI Insights Section */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" /> AI Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className={`bg-secondary/30 border-l-4 ${
                insight.type === "strength" ? "border-l-primary" :
                insight.type === "improvement" ? "border-l-red-500" :
                insight.type === "pattern" ? "border-l-blue-500" :
                "border-l-accent"
              }`}>
                <CardHeader className="flex flex-row items-start gap-3 pb-2">
                  <div className="mt-1">
                    {insight.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </CardHeader>
                {insight.action && (
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleInsightAction(insight.action)}
                    >
                      {insight.action}
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass" id="statistics-section">
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
