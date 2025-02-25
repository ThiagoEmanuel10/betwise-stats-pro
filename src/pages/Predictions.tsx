
import { useQuery } from "@tanstack/react-query";
import { Search, Trophy, ChevronLeft, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MatchCard } from "@/components/MatchCard";
import { AdvancedFilters, type Filters } from "@/components/AdvancedFilters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Predictions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>({
    search: "",
    onlyLive: false,
    sortBy: "date"
  });

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches-predictions', filters],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'fixtures',
          params: {
            league: '39',
            season: '2023',
            from: new Date().toISOString().split('T')[0],
            to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            live: filters.onlyLive ? 'all' : undefined,
          },
        },
      });

      if (error) throw error;
      return data.response;
    },
  });

  const { data: favoriteMatches } = useQuery({
    queryKey: ['favorite-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorite_matches')
        .select('match_id');
      
      if (error) throw error;
      return data.map(match => match.match_id);
    },
  });

  const toggleFavorite = async (match: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para favoritar partidas.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    const matchId = match.fixture.id.toString();
    const isFavorite = favoriteMatches?.includes(matchId);

    if (isFavorite) {
      const { error } = await supabase
        .from('favorite_matches')
        .delete()
        .eq('match_id', matchId);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao remover partida dos favoritos",
          variant: "destructive"
        });
        return;
      }

      toast({
        description: "Partida removida dos favoritos"
      });
    } else {
      const { error } = await supabase
        .from('favorite_matches')
        .insert({
          match_id: matchId,
          home_team: match.teams.home.name,
          away_team: match.teams.away.name,
          match_date: match.fixture.date,
          league: 'Premier League',
          user_id: session.user.id
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao adicionar partida aos favoritos",
          variant: "destructive"
        });
        return;
      }

      toast({
        description: "Partida adicionada aos favoritos"
      });
    }
  };

  const filteredMatches = matches?.filter((match) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!match.teams.home.name.toLowerCase().includes(searchLower) &&
          !match.teams.away.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    if (filters.league && match.league.id.toString() !== filters.league) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case "date":
        return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
      case "probability":
        return (b.predictions?.winning_percent || 0) - (a.predictions?.winning_percent || 0);
      case "popularity":
        return (b.statistics?.favorites || 0) - (a.statistics?.favorites || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="glass sticky top-0 z-50 p-4 mb-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
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
                Previsões de Jogos
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/chat')}
              className="shrink-0"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-4">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
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
            {filteredMatches?.map((match) => (
              <MatchCard
                key={match.fixture.id}
                fixture={match}
                isFavorite={favoriteMatches?.includes(match.fixture.id.toString())}
                onToggleFavorite={() => toggleFavorite(match)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Predictions;
