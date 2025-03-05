
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Trophy, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

type FavoriteMatch = {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  league: string;
};

type FavoriteTeam = {
  id: string;
  team_id: string;
  team_name: string;
  league: string;
};

export function FavoritesTab() {
  const [favoriteMatches, setFavoriteMatches] = useState<FavoriteMatch[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<FavoriteTeam[]>([]);
  const [activeTab, setActiveTab] = useState("matches");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      
      // Fetch favorite matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('favorite_matches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (matchesError) throw matchesError;
      setFavoriteMatches(matchesData || []);
      
      // Fetch favorite teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('favorite_teams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (teamsError) throw teamsError;
      setFavoriteTeams(teamsData || []);
      
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavoriteMatch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorite_matches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setFavoriteMatches(prev => prev.filter(match => match.id !== id));
      toast({
        description: "Partida removida dos favoritos"
      });
    } catch (error) {
      console.error('Error removing favorite match:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover esta partida dos favoritos.",
        variant: "destructive"
      });
    }
  };

  const removeFavoriteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorite_teams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setFavoriteTeams(prev => prev.filter(team => team.id !== id));
      toast({
        description: "Time removido dos favoritos"
      });
    } catch (error) {
      console.error('Error removing favorite team:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover este time dos favoritos.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 glass animate-pulse rounded-lg"></div>
        <div className="h-32 glass animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="matches" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Partidas Favoritas
        </TabsTrigger>
        <TabsTrigger value="teams" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Times Favoritos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="matches" className="space-y-4">
        {favoriteMatches.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Você ainda não tem partidas favoritas.
              </p>
            </CardContent>
          </Card>
        ) : (
          favoriteMatches.map(match => (
            <Card key={match.id} className="glass overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        {match.league} • {formatDate(new Date(match.match_date))}
                      </span>
                    </div>
                    <p className="font-medium">{match.home_team}</p>
                    <p className="font-medium">{match.away_team}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeFavoriteMatch(match.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
      
      <TabsContent value="teams" className="space-y-4">
        {favoriteTeams.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Você ainda não tem times favoritos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favoriteTeams.map(team => (
              <Card key={team.id} className="glass overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {team.league}
                        </span>
                      </div>
                      <p className="font-medium">{team.team_name}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeFavoriteTeam(team.id)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
