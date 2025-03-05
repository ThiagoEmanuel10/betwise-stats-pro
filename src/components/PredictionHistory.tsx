
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Check, X, ChevronRight, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { LEAGUES } from "@/hooks/useMatches";

type Prediction = {
  id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  is_correct: boolean | null;
  created_at: string;
  league_id: string;
  home_team?: string;
  away_team?: string;
  match_date?: string;
  points?: number;
};

export function PredictionHistory() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchPredictions();
  }, [selectedLeague]);

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('match_predictions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (selectedLeague !== "all") {
        query = query.eq('league_id', selectedLeague);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Add calculated points based on correctness
      const predictionsWithPoints = data?.map(pred => ({
        ...pred,
        points: pred.is_correct ? 10 : 0, // Award 10 points for correct predictions
      })) || [];
      
      setPredictions(predictionsWithPoints);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu histórico de previsões.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPoints = predictions.reduce((sum, pred) => sum + (pred.points || 0), 0);
  const correctPredictions = predictions.filter(p => p.is_correct).length;
  const accuracyRate = predictions.length > 0 
    ? ((correctPredictions / predictions.length) * 100).toFixed(1) 
    : "0.0";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 glass animate-pulse rounded-lg"></div>
        <div className="h-64 glass animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Histórico de Previsões</h3>
        <Select 
          value={selectedLeague} 
          onValueChange={setSelectedLeague}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por liga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ligas</SelectItem>
            {Object.entries(LEAGUES).map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previsões Corretas</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{correctPredictions}/{predictions.length}</div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <div className="text-primary">%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accuracyRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {predictions.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Você ainda não fez nenhuma previsão.
              </p>
            </CardContent>
          </Card>
        ) : (
          predictions.map(prediction => (
            <Card key={prediction.id} className="glass overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {prediction.is_correct !== null && (
                        prediction.is_correct ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )
                      )}
                      <span className="text-sm text-muted-foreground">
                        {LEAGUES[prediction.league_id as keyof typeof LEAGUES] || "Liga Desconhecida"} • 
                        {formatDate(new Date(prediction.created_at))}
                      </span>
                    </div>
                    <p className="font-medium">
                      Match ID: {prediction.match_id}
                    </p>
                    <p className="text-primary font-bold">
                      Previsão: {prediction.home_score} x {prediction.away_score}
                    </p>
                    {prediction.is_correct && (
                      <p className="text-green-500 text-sm">+{prediction.points} pontos</p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
