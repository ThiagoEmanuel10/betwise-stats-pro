import { Trophy, Calendar, ChevronRight, Percent } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MatchCardProps {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
    };
    league: {
      name: string;
      country: string;
    };
    teams: {
      home: {
        name: string;
        logo?: string;
      };
      away: {
        name: string;
        logo?: string;
      };
    };
  };
}

export const MatchCard = ({ fixture }: MatchCardProps) => {
  const matchDate = new Date(fixture.date);
  const navigate = useNavigate();
  
  return (
    <div className="glass rounded-lg p-4 card-hover slide-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{fixture.league.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(matchDate, "dd/MM")}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex-1 flex items-center gap-2">
          {fixture.teams.home.logo && (
            <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="w-6 h-6 object-contain" />
          )}
          <h3 className="font-semibold truncate">{fixture.teams.home.name}</h3>
        </div>
        <div className="px-4 py-2 bg-secondary rounded-lg mx-4">
          <span className="text-sm font-medium">{format(matchDate, "HH:mm")}</span>
        </div>
        <div className="flex-1 flex items-center gap-2 justify-end">
          <h3 className="font-semibold truncate">{fixture.teams.away.name}</h3>
          {fixture.teams.away.logo && (
            <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="w-6 h-6 object-contain" />
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button 
          className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors"
          onClick={() => navigate(`/predictions`)}
        >
          Ver estatísticas
          <ChevronRight className="w-4 h-4" />
        </button>

        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-green-500 hover:text-green-600"
          onClick={() => navigate('/high-probability')}
        >
          <Percent className="w-4 h-4 mr-2" />
          Melhores Chances
        </Button>
      </div>
    </div>
  );
};
