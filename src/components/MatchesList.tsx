
import { MatchCard } from "@/components/MatchCard";

interface MatchesListProps {
  matches: any[];
  favoriteMatches?: string[];
  onToggleFavorite: (match: any) => void;
  isLoading: boolean;
}

export function MatchesList({ matches, favoriteMatches, onToggleFavorite, isLoading }: MatchesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass rounded-lg p-4 animate-pulse">
            <div className="h-20 bg-secondary/50 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches?.map((match) => (
        <MatchCard
          key={match.fixture.id}
          fixture={match}
          isFavorite={favoriteMatches?.includes(match.fixture.id.toString())}
          onToggleFavorite={() => onToggleFavorite(match)}
        />
      ))}
    </div>
  );
}
