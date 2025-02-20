
import { supabase } from "@/integrations/supabase/client";

// Tipos para a API
export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  time: string;
  status: "scheduled" | "live" | "finished";
}

export interface TeamStats {
  id: string;
  name: string;
  league: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

// Funções da API
export const fetchMatches = async (): Promise<Match[]> => {
  // TODO: Integrar com API real
  return [
    {
      id: "1",
      homeTeam: "Liverpool",
      awayTeam: "Manchester City",
      league: "Premier League",
      date: "27/03",
      time: "16:30",
      status: "scheduled",
    },
    // ... mais partidas
  ];
};

export const fetchTeamStats = async (teamId: string): Promise<TeamStats> => {
  // TODO: Integrar com API real
  return {
    id: teamId,
    name: "Liverpool",
    league: "Premier League",
    matches: 30,
    wins: 20,
    draws: 5,
    losses: 5,
    goalsFor: 65,
    goalsAgainst: 25,
  };
};
