
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeFilter, PredictionData } from "./types";

export const useStatistics = (league: string, timeFilter: TimeFilter) => {
  return useQuery({
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
};
