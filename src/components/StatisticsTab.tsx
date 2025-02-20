
import { BarChart3, TrendingUp, Activity } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const StatisticsTab = () => {
  return (
    <Tabs defaultValue="geral" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="geral" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span>Geral</span>
        </TabsTrigger>
        <TabsTrigger value="tendencias" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>Tendências</span>
        </TabsTrigger>
        <TabsTrigger value="apostas" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <span>Apostas</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="geral" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Gols/Jogo" value="2.8" trend="up" />
          <StatCard title="Clean Sheets" value="40%" trend="down" />
          <StatCard title="Vitórias em Casa" value="65%" trend="up" />
          <StatCard title="Ambas Marcam" value="75%" trend="neutral" />
        </div>
      </TabsContent>
      <TabsContent value="tendencias">
        <div className="text-center py-8 text-muted-foreground">
          Análise de tendências em breve
        </div>
      </TabsContent>
      <TabsContent value="apostas">
        <div className="text-center py-8 text-muted-foreground">
          Estatísticas de apostas em breve
        </div>
      </TabsContent>
    </Tabs>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
}

const StatCard = ({ title, value, trend }: StatCardProps) => {
  const trendColor = {
    up: "text-accent",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <div className="glass p-4 rounded-lg">
      <h4 className="text-sm text-muted-foreground mb-2">{title}</h4>
      <p className={`text-2xl font-semibold ${trendColor[trend]}`}>{value}</p>
    </div>
  );
};
