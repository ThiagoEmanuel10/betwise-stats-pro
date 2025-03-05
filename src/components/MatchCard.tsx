
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageCircle, Heart } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MatchComments } from "./MatchComments";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface MatchCardProps {
  fixture: any;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function MatchCard({ fixture, isFavorite = false, onToggleFavorite }: MatchCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const matchDate = new Date(fixture.fixture.date);
  const formattedDate = formatDate(matchDate);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addTeamToFavorites = async (team: any) => {
    try {
      setIsAddingTeam(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para favoritar times.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const teamId = team.id.toString();
      const leagueId = fixture.league.id.toString();
      
      // Check if team is already in favorites
      const { data: existingFavorite, error: checkError } = await supabase
        .from('favorite_teams')
        .select()
        .eq('team_id', teamId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingFavorite) {
        toast({
          description: "Time já está nos favoritos"
        });
        return;
      }

      // Add team to favorites
      const { error } = await supabase
        .from('favorite_teams')
        .insert({
          team_id: teamId,
          team_name: team.name,
          league: fixture.league.name,
          user_id: session.user.id
        });

      if (error) throw error;
      
      toast({
        description: `${team.name} adicionado aos favoritos`
      });
    } catch (error) {
      console.error('Error adding team to favorites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o time aos favoritos",
        variant: "destructive"
      });
    } finally {
      setIsAddingTeam(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComments(!showComments)}
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                className={`shrink-0 ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
              >
                <Star className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{fixture.teams.home.name}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isAddingTeam}
                  onClick={() => addTeamToFavorites(fixture.teams.home)}
                  className="ml-1 h-6 w-6 text-muted-foreground hover:text-red-500"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{fixture.teams.away.name}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isAddingTeam}
                  onClick={() => addTeamToFavorites(fixture.teams.away)}
                  className="ml-1 h-6 w-6 text-muted-foreground hover:text-red-500"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <MatchComments matchId={fixture.fixture.id.toString()} isOpen={showComments} />
        </div>
      </div>
    </Card>
  );
}
