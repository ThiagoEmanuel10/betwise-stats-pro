
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";
import { format } from "date-fns";

interface LiveMatchProps {
  matchId?: string;
}

export const LiveMatchDisplay = ({ matchId }: LiveMatchProps) => {
  const { t } = useTranslation();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchMatchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.functions.invoke('football-api', {
          body: {
            endpoint: 'fixtures',
            params: {
              id: matchId,
            },
          },
        });

        if (error) throw error;
        
        if (data.response && data.response.length > 0) {
          setMatch(data.response[0]);
        }
      } catch (err) {
        console.error('Error fetching match:', err);
        setError(t('predictions.errorLoadingMatch', 'Could not load match data'));
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();

    // Setup periodic update
    const interval = setInterval(fetchMatchData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [matchId, t]);

  if (!matchId) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">{t('predictions.selectMatchToWatch', 'Select a match to watch live')}</p>
      </Card>
    );
  }

  if (loading && !match) {
    return (
      <Card className="p-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 text-center">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  if (!match) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">{t('predictions.matchNotFound', 'Match not found')}</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-secondary/30 border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {match.league.name}
          </span>
        </div>
        <div className="px-2 py-1 bg-primary/10 rounded text-xs font-semibold text-primary">
          {match.fixture.status.short === "1H" ? t('predictions.firstHalf', '1st Half') :
           match.fixture.status.short === "HT" ? t('predictions.halfTime', 'Half Time') :
           match.fixture.status.short === "2H" ? t('predictions.secondHalf', '2nd Half') :
           match.fixture.status.short === "FT" ? t('predictions.fullTime', 'Full Time') : t('predictions.upcoming', 'Upcoming')}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2">
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
        <div className="px-4 py-2 bg-background rounded-lg mx-4 flex items-center justify-center min-w-[80px]">
          <span className="text-xl font-bold">
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

      {match.events && match.events.length > 0 && (
        <div className="mt-4 p-2 bg-background/50 rounded-lg max-h-24 overflow-y-auto">
          <h4 className="text-xs font-medium mb-1">{t('predictions.latestEvents', 'Latest Events:')}</h4>
          <div className="space-y-1">
            {match.events.slice(0, 3).map((event: any, index: number) => (
              <div key={index} className="text-xs flex items-center gap-1">
                <span className="font-semibold">{event.time.elapsed}'</span>
                <span>{event.type === "Goal" ? "⚽" : event.type === "Card" ? "🟨" : "•"}</span>
                <span>{event.player.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
