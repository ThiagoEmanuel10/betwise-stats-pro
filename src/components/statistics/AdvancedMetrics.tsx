
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { PredictionData, TimeFilter } from "./types";
import { calculateWinRate } from "./utils";
import { useToast } from "@/components/ui/use-toast";

interface AdvancedMetricsProps {
  league: string;
  timeFilter: TimeFilter;
}

export const AdvancedMetrics = ({ league, timeFilter }: AdvancedMetricsProps) => {
  const [metrics, setMetrics] = useState<any>({
    accuracy: {
      overall: 0,
      home: 0,
      away: 0,
      favorites: 0,
      underdogs: 0
    },
    counts: {
      total: 0,
      correct: 0,
      incorrect: 0
    },
    trends: {
      improving: false,
      percentage: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAdvancedMetrics = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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
          // Para "all", definir para uma data muito anterior
          startDate = new Date(2020, 0, 1);
        }

        // Buscar todas as previsões para este usuário e liga dentro do intervalo de datas
        const { data, error } = await supabase
          .from("match_predictions")
          .select("*")
          .eq("user_id", user.id)
          .eq("league_id", league)
          .gte("created_at", startDate.toISOString());

        if (error) throw error;

        // Calcular métricas avançadas
        if (data && data.length > 0) {
          const total = data.length;
          const correct = data.filter(pred => pred.is_correct).length;
          const incorrect = total - correct;

          // Simulando dados para categorias específicas
          // Em um app real, você teria mais colunas na tabela para analisar estes dados
          const homePredictions = data.filter((_, i) => i % 2 === 0); // Simulação - metade das previsões são para times da casa
          const awayPredictions = data.filter((_, i) => i % 2 !== 0); // Simulação - metade das previsões são para times visitantes
          const favoritePredictions = data.filter((_, i) => i % 3 === 0); // Simulação - um terço são favoritos
          const underdogPredictions = data.filter((_, i) => i % 3 !== 0); // Simulação - dois terços são "underdogs"

          // Cálculo de tendências
          // Dividir os dados em duas metades para ver se a precisão está melhorando
          const halfIndex = Math.floor(data.length / 2);
          const firstHalf = data.slice(0, halfIndex);
          const secondHalf = data.slice(halfIndex);
          
          const firstHalfCorrect = firstHalf.filter(pred => pred.is_correct).length;
          const secondHalfCorrect = secondHalf.filter(pred => pred.is_correct).length;
          
          const firstHalfRate = calculateWinRate(firstHalfCorrect, firstHalf.length);
          const secondHalfRate = calculateWinRate(secondHalfCorrect, secondHalf.length);
          
          const improving = secondHalfRate > firstHalfRate;
          const improvementPercentage = Math.abs(secondHalfRate - firstHalfRate);

          setMetrics({
            accuracy: {
              overall: calculateWinRate(correct, total),
              home: calculateWinRate(homePredictions.filter(pred => pred.is_correct).length, homePredictions.length),
              away: calculateWinRate(awayPredictions.filter(pred => pred.is_correct).length, awayPredictions.length),
              favorites: calculateWinRate(favoritePredictions.filter(pred => pred.is_correct).length, favoritePredictions.length),
              underdogs: calculateWinRate(underdogPredictions.filter(pred => pred.is_correct).length, underdogPredictions.length)
            },
            counts: {
              total,
              correct,
              incorrect
            },
            trends: {
              improving,
              percentage: improvementPercentage
            }
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching advanced metrics:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as métricas avançadas"
        });
        setLoading(false);
      }
    };

    fetchAdvancedMetrics();
  }, [league, timeFilter, toast]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 animate-pulse bg-secondary/50 rounded-md"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 animate-pulse bg-secondary/30 rounded-md"></div>
              <div className="h-24 animate-pulse bg-secondary/30 rounded-md"></div>
              <div className="h-24 animate-pulse bg-secondary/30 rounded-md"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas Avançadas</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="comparisons">Comparações</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Total de Predições</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-semibold">{metrics.counts.total}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {metrics.counts.correct} corretas / {metrics.counts.incorrect} incorretas
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Taxa de Acerto Geral</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-semibold">
                    {metrics.accuracy.overall}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {metrics.trends.improving ? "Melhorando" : "Piorando"} ({metrics.trends.percentage.toFixed(1)}%)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Melhor Categoria</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-semibold">
                    {
                      Math.max(
                        metrics.accuracy.home,
                        metrics.accuracy.away,
                        metrics.accuracy.favorites,
                        metrics.accuracy.underdogs
                      ) === metrics.accuracy.home ? "Casa" :
                      Math.max(
                        metrics.accuracy.home,
                        metrics.accuracy.away,
                        metrics.accuracy.favorites,
                        metrics.accuracy.underdogs
                      ) === metrics.accuracy.away ? "Fora" :
                      Math.max(
                        metrics.accuracy.home,
                        metrics.accuracy.away,
                        metrics.accuracy.favorites,
                        metrics.accuracy.underdogs
                      ) === metrics.accuracy.favorites ? "Favoritos" : "Azarões"
                    }
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {Math.max(
                      metrics.accuracy.home,
                      metrics.accuracy.away,
                      metrics.accuracy.favorites,
                      metrics.accuracy.underdogs
                    )}% de acerto
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparisons" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Casa vs Fora</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between items-center mb-2">
                    <span>Casa</span>
                    <span>{metrics.accuracy.home}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${metrics.accuracy.home}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 mb-2">
                    <span>Fora</span>
                    <span>{metrics.accuracy.away}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${metrics.accuracy.away}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Favoritos vs Azarões</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between items-center mb-2">
                    <span>Favoritos</span>
                    <span>{metrics.accuracy.favorites}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${metrics.accuracy.favorites}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 mb-2">
                    <span>Azarões</span>
                    <span>{metrics.accuracy.underdogs}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${metrics.accuracy.underdogs}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">Tendências de Desempenho</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center justify-center h-24">
                  <div className="text-center">
                    <div className="text-xl font-medium mb-2">
                      Seu desempenho está {metrics.trends.improving ? "melhorando" : "piorando"}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-2xl font-bold ${metrics.trends.improving ? 'text-green-500' : 'text-red-500'}`}>
                        {metrics.trends.improving ? '+' : '-'}{metrics.trends.percentage.toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">nas últimas previsões</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {metrics.trends.improving 
                    ? "Continue mantendo essa estratégia! Suas últimas previsões estão mais precisas que as anteriores."
                    : "Considere revisar sua estratégia. Suas previsões anteriores tiveram melhor desempenho."}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
