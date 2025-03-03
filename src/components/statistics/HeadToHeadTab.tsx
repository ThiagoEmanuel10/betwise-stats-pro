
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { HeadToHeadRecord } from "./types";
import { formatFullDate } from "./utils";

interface HeadToHeadTabProps {
  leagueId: string;
}

export const HeadToHeadTab = ({ leagueId }: HeadToHeadTabProps) => {
  const [team1, setTeam1] = useState<string>("");
  const [team2, setTeam2] = useState<string>("");

  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams", leagueId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'teams',
          params: {
            league: leagueId,
            season: '2023'
          },
        },
      });

      if (error) throw error;
      
      // Sample data for demonstration
      return [
        { id: "1", name: "Arsenal" },
        { id: "2", name: "Manchester City" },
        { id: "3", name: "Liverpool" },
        { id: "4", name: "Manchester United" },
        { id: "5", name: "Chelsea" },
        { id: "6", name: "Tottenham" }
      ];
    }
  });

  const { data: h2hRecord, isLoading: isLoadingH2H } = useQuery({
    queryKey: ["head-to-head", team1, team2],
    queryFn: async () => {
      if (!team1 || !team2) return null;

      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'fixtures/headtohead',
          params: {
            h2h: `${team1}-${team2}`,
            league: leagueId,
            season: '2023'
          },
        },
      });

      if (error) throw error;
      
      // Sample data for demonstration
      const sampleH2H: HeadToHeadRecord = {
        team1Id: team1,
        team1Name: teams?.find(t => t.id === team1)?.name || "Team 1",
        team2Id: team2,
        team2Name: teams?.find(t => t.id === team2)?.name || "Team 2",
        team1Wins: 3,
        team2Wins: 2,
        draws: 1,
        lastMatches: [
          {
            date: "2023-04-15",
            score: "2-1",
            winner: "team1"
          },
          {
            date: "2022-11-20",
            score: "0-0",
            winner: "draw"
          },
          {
            date: "2022-08-14",
            score: "1-3",
            winner: "team2"
          },
          {
            date: "2022-04-10",
            score: "2-0",
            winner: "team1"
          },
          {
            date: "2021-11-07",
            score: "1-2",
            winner: "team2"
          },
          {
            date: "2021-08-22",
            score: "3-1",
            winner: "team1"
          }
        ]
      };

      return sampleH2H;
    },
    enabled: !!(team1 && team2)
  });

  const renderContent = () => {
    if (isLoadingTeams) {
      return <div className="h-[300px] w-full animate-pulse bg-secondary/20 rounded-lg"></div>;
    }

    if (!teams || teams.length === 0) {
      return <p className="text-muted-foreground">No teams available for this league</p>;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Team</label>
            <Select value={team1} onValueChange={setTeam1}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Second Team</label>
            <Select value={team2} onValueChange={setTeam2}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoadingH2H && (
          <div className="h-[200px] w-full animate-pulse bg-secondary/20 rounded-lg"></div>
        )}

        {h2hRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">{h2hRecord.team1Wins}</div>
                <div className="text-sm text-muted-foreground">{h2hRecord.team1Name} Wins</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-2xl font-bold">{h2hRecord.draws}</div>
                <div className="text-sm text-muted-foreground">Draws</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-accent">{h2hRecord.team2Wins}</div>
                <div className="text-sm text-muted-foreground">{h2hRecord.team2Name} Wins</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Recent Head-to-Head Matches</h4>
              <div className="space-y-2">
                {h2hRecord.lastMatches.map((match, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg flex justify-between items-center ${
                      match.winner === "team1" 
                        ? "bg-primary/20 border-l-4 border-primary" 
                        : match.winner === "team2" 
                          ? "bg-accent/20 border-l-4 border-accent"
                          : "bg-secondary/30"
                    }`}
                  >
                    <div className="text-sm">{formatFullDate(match.date)}</div>
                    <div className="font-bold">{match.score}</div>
                    <div className="text-sm text-muted-foreground">
                      {match.winner === "team1" 
                        ? h2hRecord.team1Name + " won" 
                        : match.winner === "team2" 
                          ? h2hRecord.team2Name + " won"
                          : "Draw"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoadingH2H && team1 && team2 && !h2hRecord && (
          <p className="text-muted-foreground">No head-to-head data available for selected teams</p>
        )}

        {(!team1 || !team2) && (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Select two teams to view their head-to-head statistics
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
