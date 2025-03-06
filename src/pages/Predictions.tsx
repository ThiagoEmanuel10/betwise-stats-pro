
import { useState, useEffect } from "react";
import { useMatches } from "@/hooks/useMatches";
import { PredictionsHeader } from "@/components/PredictionsHeader";
import { MatchesList } from "@/components/MatchesList";
import type { Filters } from "@/components/AdvancedFilters";
import { trackPageView } from "@/lib/analytics";
import { toast } from "@/hooks/use-toast";

const Predictions = () => {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    onlyLive: false,
    sortBy: "date"
  });

  // Track page view
  useEffect(() => {
    trackPageView("/predictions", "BetWise Stats Pro - Predictions");
  }, []);

  const { matches, isLoading, favoriteMatches, toggleFavorite, leagues } = useMatches(filters);

  // Provide feedback when favorites change
  useEffect(() => {
    if (favoriteMatches?.length) {
      // Only show this on initial load, not on every render
      const hasShownWelcome = sessionStorage.getItem('hasShownWelcomeMessage');
      if (!hasShownWelcome) {
        toast({
          title: "Bem-vindo de volta!",
          description: `Você tem ${favoriteMatches.length} partidas favoritas sendo monitoradas.`,
          duration: 4000,
        });
        sessionStorage.setItem('hasShownWelcomeMessage', 'true');
      }
    }
  }, [favoriteMatches]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <PredictionsHeader
        filters={filters}
        onFiltersChange={setFilters}
        leagues={leagues}
      />

      <main className="container mx-auto px-4 pb-8">
        <div className="fade-in slide-up">
          <MatchesList
            matches={matches || []}
            favoriteMatches={favoriteMatches}
            onToggleFavorite={(match) => {
              toggleFavorite(match);
              const team = match.teams.home.name + " vs " + match.teams.away.name;
              const isFavorite = favoriteMatches?.includes(match.fixture.id.toString());
              toast({
                description: isFavorite 
                  ? `"${team}" removido dos favoritos` 
                  : `"${team}" adicionado aos favoritos`,
                duration: 3000,
              });
            }}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default Predictions;
