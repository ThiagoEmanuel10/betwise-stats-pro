
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useMatches = (filters: {
  search: string;
  onlyLive: boolean;
  sortBy: string;
  league?: string;
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return {
    matches: filteredMatches,
    isLoading,
    favoriteMatches,
    toggleFavorite
  };
};
