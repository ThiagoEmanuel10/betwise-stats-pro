
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TimeFilterButtons } from "./statistics/TimeFilterButtons";
import { useStatistics } from "./statistics/useStatistics";
import { AccuracyRateChart } from "./statistics/AccuracyRateChart";
import { PredictionsCountChart } from "./statistics/PredictionsCountChart";
import { CombinedChart } from "./statistics/CombinedChart";
import { LeaguePerformanceTab } from "./statistics/LeaguePerformanceTab";
import { HeadToHeadTab } from "./statistics/HeadToHeadTab";
import { ResultTrendsTab } from "./statistics/ResultTrendsTab";
import { HomeAwayAnalysisTab } from "./statistics/HomeAwayAnalysisTab";
import { VisualizationSettings } from "./statistics/VisualizationSettings";
import { AdvancedMetrics } from "./statistics/AdvancedMetrics";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TimeFilter, DataVisualizationPreferences, ChartType, ColorScheme } from "./statistics/types";
import { supabase } from "@/integrations/supabase/client";

interface StatisticsTabProps {
  league: string;
}

export const StatisticsTab = ({ league }: StatisticsTabProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30days");
  const { data: predictionStats, isLoading } = useStatistics(league, timeFilter);
  const [showSettings, setShowSettings] = useState(false);
  const [visualPreferences, setVisualPreferences] = useState<DataVisualizationPreferences>({
    chartType: "line" as ChartType,
    colorScheme: "default" as ColorScheme,
    showLegend: true,
    showGrid: true
  });

  useEffect(() => {
    const fetchUserPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("data_visualization_preferences")
        .eq("id", user.id)
        .single();

      if (profile?.data_visualization_preferences) {
        setVisualPreferences(profile.data_visualization_preferences as DataVisualizationPreferences);
      }
    };

    fetchUserPreferences();
  }, []);

  if (isLoading) {
    return <div className="h-48 w-full animate-pulse bg-secondary/50 rounded-lg"></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Histórico de Predições</h3>
        <div className="flex items-center gap-2">
          <TimeFilterButtons timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Configurações de visualização">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações de Visualização</DialogTitle>
              </DialogHeader>
              <VisualizationSettings 
                preferences={visualPreferences} 
                onPreferencesChange={setVisualPreferences} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="accuracy">
        <TabsList className="grid grid-cols-9 mb-4">
          <TabsTrigger value="accuracy">Taxa de Acerto</TabsTrigger>
          <TabsTrigger value="predictions">Contagem</TabsTrigger>
          <TabsTrigger value="combined">Visão Combinada</TabsTrigger>
          <TabsTrigger value="league">Estatísticas da Liga</TabsTrigger>
          <TabsTrigger value="h2h">Confrontos Diretos</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="homeaway">Casa/Fora</TabsTrigger>
          <TabsTrigger value="metrics">Métricas Avançadas</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="accuracy" className="h-[400px]">
          <AccuracyRateChart data={predictionStats || []} />
        </TabsContent>

        <TabsContent value="predictions" className="h-[400px]">
          <PredictionsCountChart data={predictionStats || []} />
        </TabsContent>

        <TabsContent value="combined" className="h-[400px]">
          <CombinedChart data={predictionStats || []} />
        </TabsContent>

        <TabsContent value="league" className="h-[400px]">
          <LeaguePerformanceTab leagueId={league} timeFilter={timeFilter} />
        </TabsContent>

        <TabsContent value="h2h" className="h-[400px]">
          <HeadToHeadTab leagueId={league} />
        </TabsContent>

        <TabsContent value="trends" className="h-[400px]">
          <ResultTrendsTab leagueId={league} timeFilter={timeFilter} />
        </TabsContent>

        <TabsContent value="homeaway" className="h-[400px]">
          <HomeAwayAnalysisTab leagueId={league} timeFilter={timeFilter} />
        </TabsContent>

        <TabsContent value="metrics" className="h-[400px] overflow-y-auto">
          <AdvancedMetrics league={league} timeFilter={timeFilter} />
        </TabsContent>

        <TabsContent value="insights" className="h-[400px]">
          <PredictionsInsights league={league} timeFilter={timeFilter} visualPreferences={visualPreferences} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para insights de predições
const PredictionsInsights = ({ 
  league, 
  timeFilter, 
  visualPreferences 
}: { 
  league: string, 
  timeFilter: TimeFilter,
  visualPreferences: DataVisualizationPreferences
}) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        // Em um app real, aqui você buscaria dados da API ou banco de dados
        // Para este exemplo, usaremos dados simulados
        
        // Esperar um pouco para simular a carga de dados
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dados simulados para insights
        const sampleInsights = [
          {
            title: "Times da casa têm vantagem significativa",
            description: "Nas últimas 30 partidas, times da casa venceram 62% das vezes.",
            category: "tendência",
            impact: "alta"
          },
          {
            title: "Clássicos terminam em empate com mais frequência",
            description: "Jogos entre rivais tradicionais têm 40% mais chances de terminar empatados.",
            category: "padrão",
            impact: "média"
          },
          {
            title: "Suas previsões para Arsenal são mais precisas",
            description: "Você tem uma taxa de acerto de 78% ao prever jogos do Arsenal, acima da sua média geral de 65%.",
            category: "pessoal",
            impact: "alta"
          },
          {
            title: "Times que marcam primeiro vencem 70% das partidas",
            description: "O primeiro gol tem se mostrado decisivo na maioria das partidas desta temporada.",
            category: "estatística",
            impact: "alta"
          },
          {
            title: "Jogos com mais de 2.5 gols são mais previsíveis",
            description: "Sua taxa de acerto é 15% maior em jogos com mais de 2.5 gols totais.",
            category: "correlação",
            impact: "média"
          }
        ];
        
        setInsights(sampleInsights);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching insights:", error);
        setLoading(false);
      }
    };

    fetchInsights();
  }, [league, timeFilter]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse bg-secondary/30 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[400px] pr-2">
      {insights.map((insight, index) => (
        <div 
          key={index} 
          className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <h4 className="font-semibold">{insight.title}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${
              insight.impact === 'alta' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              insight.impact === 'média' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {insight.impact === 'alta' ? 'Alto impacto' : 
               insight.impact === 'média' ? 'Médio impacto' : 'Baixo impacto'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{insight.description}</p>
          <div className="mt-3 flex items-center">
            <span className="text-xs bg-secondary px-2 py-1 rounded-full">
              {insight.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
