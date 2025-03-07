
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useCallback } from "react";

export const LEAGUES = {
  '39': 'Premier League',
  '71': 'Brasileirão Série A',
  '140': 'La Liga',
  '78': 'Bundesliga',
  '135': 'Serie A',
  '61': 'Ligue 1',
  '2': 'Champions League'
} as const;

export type LeagueId = keyof typeof LEAGUES;

export const useMatches = (filters: {
  search: string;
  onlyLive: boolean;
  sortBy: string;
  league?: string;
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Otimização: Definindo parâmetros da consulta fora da função useQuery
  const queryParams = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      league: filters.league || '39',
      season: '2023',
      from: now.toISOString().split('T')[0],
      to: nextWeek.toISOString().split('T')[0],
      live: filters.onlyLive ? 'all' : undefined,
    };
  }, [filters.league, filters.onlyLive]);

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches-predictions', queryParams],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'fixtures',
          params: queryParams,
        },
      });

      if (error) throw error;
      return data.response;
    },
    // Otimizações de cache
    staleTime: 5 * 60 * 1000, // 5 minutos
    // Primeiro carregamento pode ser mais lento, então mostraremos placeholders
    placeholderData: [],
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
    staleTime: 60 * 1000, // 1 minuto
  });

  // Otimização: usando useCallback para evitar recriações desnecessárias da função
  const toggleFavorite = useCallback(async (match: any) => {
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
    const leagueId = match.league.id.toString();
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
          league: LEAGUES[leagueId as LeagueId] || 'Unknown League',
          league_id: leagueId,
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
  }, [favoriteMatches, navigate, toast]);

  // Otimização: filtragem e ordenação memoizada para evitar recálculos desnecessários
  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    
    return matches
      .filter((match) => {
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
      })
      .sort((a, b) => {
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
  }, [matches, filters.search, filters.league, filters.sortBy]);

  return {
    matches: filteredMatches,
    isLoading,
    favoriteMatches,
    toggleFavorite,
    leagues: LEAGUES
  };
};
