
import { useState, useEffect } from "react";
import { useMatches } from "@/hooks/useMatches";
import { PredictionsHeader } from "@/components/PredictionsHeader";
import { MatchesList } from "@/components/MatchesList";
import type { Filters } from "@/components/AdvancedFilters";
import { trackPageView } from "@/lib/analytics";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <PredictionsHeader
        filters={filters}
        onFiltersChange={setFilters}
        leagues={leagues}
      />

      <main className="container mx-auto px-4 pb-8">
        <MatchesList
          matches={matches || []}
          favoriteMatches={favoriteMatches}
          onToggleFavorite={toggleFavorite}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Predictions;
