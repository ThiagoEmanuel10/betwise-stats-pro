
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeFilter, PredictionData } from "./types";
import { useMemo } from "react";

// Função auxiliar para calcular intervalo de datas
const getDateRange = (timeFilter: TimeFilter) => {
  const now = new Date();
  let startDate = new Date();
  
  switch (timeFilter) {
    case "7days":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(now.getDate() - 90);
      break;
    case "all":
    default:
      // Para "all", definir para uma data no passado distante
      startDate = new Date(2020, 0, 1);
      break;
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString()
  };
};

export const useStatistics = (league: string, timeFilter: TimeFilter) => {
  // Memoização do intervalo de datas para evitar recálculos
  const dateRange = useMemo(() => getDateRange(timeFilter), [timeFilter]);

  return useQuery({
    queryKey: ["prediction-stats", league, timeFilter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Obter todas as previsões para este usuário e liga dentro do intervalo de datas
      const { data, error } = await supabase
        .from("match_predictions")
        .select("*")
        .eq("user_id", user.id)
        .eq("league_id", league)
        .gte("created_at", dateRange.startDate)
        .lte("created_at", dateRange.endDate)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Processar dados para obter estatísticas por dia
      // Usando reduce para maior eficiência
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
        
        // Incrementar contadores apropriados
        if (prediction.is_correct) {
          acc[date].correct += 1;
        } else {
          acc[date].incorrect += 1;
        }
        
        // Calcular taxa de acerto
        acc[date].rate = (acc[date].correct / acc[date].total) * 100;
        
        return acc;
      }, {});

      // Converter para array e ordenar por data
      return Object.values(statsByDay).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },
    // Otimizações de cache
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos (replacing cacheTime with gcTime)
    // Configuração de revalidação
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
