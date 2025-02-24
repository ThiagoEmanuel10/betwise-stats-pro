
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MatchCardProps {
  fixture: any;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function MatchCard({ fixture, isFavorite = false, onToggleFavorite }: MatchCardProps) {
  const matchDate = new Date(fixture.fixture.date);
  const formattedDate = formatDate(matchDate);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className={`shrink-0 ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
            >
              <Star className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium">{fixture.teams.home.name}</p>
              <p className="font-medium">{fixture.teams.away.name}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
