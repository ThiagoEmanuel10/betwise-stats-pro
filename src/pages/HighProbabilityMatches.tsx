
import { useQuery } from "@tanstack/react-query";
import { Trophy, ChevronLeft, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const HighProbabilityMatches = () => {
  const navigate = useNavigate();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches-probabilities'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'predictions',
          params: {
            date: new Date().toISOString().split('T')[0],
          },
        },
      });

      if (error) throw error;

      // Filtra e ordena os jogos por probabilidade de vitória
      const matchesWithProbabilities = data.response.filter((match) => {
        return match.predictions && match.predictions.winner && 
               match.predictions.winner.probability > 60; // Mostra apenas jogos com mais de 60% de chance
      }).sort((a, b) => {
        return b.predictions.winner.probability - a.predictions.winner.probability;
      });

      return matchesWithProbabilities;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="glass sticky top-0 z-50 p-4 mb-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Melhores Chances do Dia
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-lg p-4 animate-pulse">
                <div className="h-20 bg-secondary/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {matches?.map((match) => (
              <div key={match.fixture.id} className="glass rounded-lg p-4 card-hover slide-up">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {match.league.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-bold text-green-500">
                      {match.predictions.winner.probability}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex-1 flex items-center gap-2">
                    <img 
                      src={match.teams.home.logo} 
                      alt={match.teams.home.name} 
                      className="w-6 h-6 object-contain" 
                    />
                    <h3 className="font-semibold truncate">
                      {match.teams.home.name}
                    </h3>
                  </div>
                  <div className="px-4 py-2 bg-secondary rounded-lg mx-4">
                    <span className="text-sm font-bold text-green-500">
                      {match.predictions.winner.name === match.teams.home.name ? "Favorito" : ""}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 justify-end">
                    <h3 className="font-semibold truncate">
                      {match.teams.away.name}
                    </h3>
                    <img 
                      src={match.teams.away.logo} 
                      alt={match.teams.away.name} 
                      className="w-6 h-6 object-contain" 
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Previsão: <span className="font-semibold text-primary">
                      {match.predictions.winner.name}
                    </span> tem maior probabilidade de vitória
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HighProbabilityMatches;
