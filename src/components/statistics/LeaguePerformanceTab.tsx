
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { TimeFilter, TeamPerformance } from "./types";
import { calculateWinRate, getWinLossColor } from "./utils";
import { useQuery } from "@tanstack/react-query";

interface LeaguePerformanceTabProps {
  leagueId: string;
  timeFilter: TimeFilter;
}

export const LeaguePerformanceTab = ({ leagueId, timeFilter }: LeaguePerformanceTabProps) => {
  const [sortBy, setSortBy] = useState<string>("total");

  const { data: teams, isLoading } = useQuery({
    queryKey: ["league-performance", leagueId, timeFilter],
    queryFn: async () => {
      // Simulate fetching team performance data through the Football API edge function
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'teams/statistics',
          params: {
            league: leagueId,
            season: '2023'
          },
        },
      });

      if (error) throw error;
      
      // Process the data to get team performance statistics
      // This is a simplified example - in a real application you would use the actual
      // endpoint data to calculate these statistics
      
      // Sample data for demonstration
      const sampleTeams: TeamPerformance[] = [
        {
          teamId: "1",
          teamName: "Arsenal",
          homeWins: 12,
          homeLosses: 2,
          homeDraws: 5,
          awayWins: 10,
          awayLosses: 3,
          awayDraws: 6,
          totalGoalsScored: 68,
          totalGoalsConceded: 32
        },
        {
          teamId: "2",
          teamName: "Manchester City",
          homeWins: 14,
          homeLosses: 1,
          homeDraws: 4,
          awayWins: 11,
          awayLosses: 3,
          awayDraws: 5,
          totalGoalsScored: 72,
          totalGoalsConceded: 28
        },
        {
          teamId: "3",
          teamName: "Liverpool",
          homeWins: 13,
          homeLosses: 2,
          homeDraws: 4,
          awayWins: 10,
          awayLosses: 4,
          awayDraws: 5,
          totalGoalsScored: 70,
          totalGoalsConceded: 30
        }
      ];

      return sampleTeams;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="h-full w-full animate-pulse bg-secondary/20 rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No league performance data available</p>
        </CardContent>
      </Card>
    );
  }

  const sortedTeams = [...teams].sort((a, b) => {
    switch (sortBy) {
      case "home":
        return calculateWinRate(b.homeWins, b.homeWins + b.homeLosses + b.homeDraws) - 
               calculateWinRate(a.homeWins, a.homeWins + a.homeLosses + a.homeDraws);
      case "away":
        return calculateWinRate(b.awayWins, b.awayWins + b.awayLosses + b.awayDraws) - 
               calculateWinRate(a.awayWins, a.awayWins + a.awayLosses + a.awayDraws);
      case "goals":
        return b.totalGoalsScored - a.totalGoalsScored;
      case "conceded":
        return a.totalGoalsConceded - b.totalGoalsConceded;
      case "total":
      default:
        return calculateWinRate(b.homeWins + b.awayWins, 
                                b.homeWins + b.homeLosses + b.homeDraws + 
                                b.awayWins + b.awayLosses + b.awayDraws) - 
               calculateWinRate(a.homeWins + a.awayWins, 
                                a.homeWins + a.homeLosses + a.homeDraws + 
                                a.awayWins + a.awayLosses + a.awayDraws);
    }
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-end mb-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Total Win Rate</SelectItem>
              <SelectItem value="home">Home Win Rate</SelectItem>
              <SelectItem value="away">Away Win Rate</SelectItem>
              <SelectItem value="goals">Goals Scored</SelectItem>
              <SelectItem value="conceded">Goals Conceded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-auto max-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Home W-D-L</TableHead>
                <TableHead className="text-center">Home %</TableHead>
                <TableHead className="text-center">Away W-D-L</TableHead>
                <TableHead className="text-center">Away %</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTeams.map((team) => {
                const homeMatches = team.homeWins + team.homeLosses + team.homeDraws;
                const awayMatches = team.awayWins + team.awayLosses + team.awayDraws;
                const homeWinRate = calculateWinRate(team.homeWins, homeMatches);
                const awayWinRate = calculateWinRate(team.awayWins, awayMatches);
                
                return (
                  <TableRow key={team.teamId}>
                    <TableCell className="font-medium">{team.teamName}</TableCell>
                    <TableCell className="text-center">
                      {team.homeWins}-{team.homeDraws}-{team.homeLosses}
                    </TableCell>
                    <TableCell className="text-center" style={{ color: getWinLossColor(homeWinRate) }}>
                      {homeWinRate}%
                    </TableCell>
                    <TableCell className="text-center">
                      {team.awayWins}-{team.awayDraws}-{team.awayLosses}
                    </TableCell>
                    <TableCell className="text-center" style={{ color: getWinLossColor(awayWinRate) }}>
                      {awayWinRate}%
                    </TableCell>
                    <TableCell className="text-center">{team.totalGoalsScored}</TableCell>
                    <TableCell className="text-center">{team.totalGoalsConceded}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
