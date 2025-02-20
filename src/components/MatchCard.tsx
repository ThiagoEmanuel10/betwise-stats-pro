
import { Trophy, Calendar, ChevronRight } from "lucide-react";

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  time: string;
}

export const MatchCard = ({ homeTeam, awayTeam, league, date, time }: MatchCardProps) => {
  return (
    <div className="glass rounded-lg p-4 card-hover slide-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{league}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex-1">
          <h3 className="font-semibold">{homeTeam}</h3>
        </div>
        <div className="px-4 py-2 bg-secondary rounded-lg mx-4">
          <span className="text-sm font-medium">{time}</span>
        </div>
        <div className="flex-1 text-right">
          <h3 className="font-semibold">{awayTeam}</h3>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors">
          Ver estatísticas
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
