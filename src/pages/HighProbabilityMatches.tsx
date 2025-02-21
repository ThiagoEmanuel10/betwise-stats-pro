
import { useQuery } from "@tanstack/react-query";
import { Trophy, ChevronLeft, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const HighProbabilityMatches = () => {
  const navigate = useNavigate();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches-live'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'fixtures',
          params: {
            live: 'all'  // Busca jogos ao vivo
          },
        },
      });

      if (error) {
        console.error('Error fetching matches:', error);
        throw error;
      }

      console.log('API Response:', data);

      // Filtra os jogos com base em critérios específicos
      const matchesWithProbabilities = data.response
        .filter((match: any) => match.fixture && match.fixture.status.short !== "PST")
        .map((match: any) => ({
          fixture: {
            id: match.fixture.id,
            date: match.fixture.date,
            status: match.fixture.status
          },
          league: {
            name: match.league.name,
            country: match.league.country
          },
          teams: {
            home: {
              name: match.teams.home.name,
              logo: match.teams.home.logo
            },
            away: {
              name: match.teams.away.name,
              logo: match.teams.away.logo
            }
          },
          goals: match.goals,
          probability: Math.random() * 30 + 70 // Simulando probabilidades entre 70-100% para demonstração
        }))
        .sort((a: any, b: any) => b.probability - a.probability);

      return matchesWithProbabilities;
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
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
        ) : matches?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma partida encontrada no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches?.map((match: any) => (
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
                      {Math.round(match.probability)}%
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
                    <span className="text-sm font-medium">
                      {match.goals ? `${match.goals.home} - ${match.goals.away}` : format(new Date(match.fixture.date), "HH:mm")}
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
                    Status: <span className="font-semibold text-primary">
                      {match.fixture.status.short === "1H" ? "1º Tempo" :
                       match.fixture.status.short === "HT" ? "Intervalo" :
                       match.fixture.status.short === "2H" ? "2º Tempo" :
                       match.fixture.status.short === "FT" ? "Finalizado" : "Em breve"}
                    </span>
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
