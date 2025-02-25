
import { useState } from "react";
import { useMatches } from "@/hooks/useMatches";
import { PredictionsHeader } from "@/components/PredictionsHeader";
import { MatchesList } from "@/components/MatchesList";
import type { Filters } from "@/components/AdvancedFilters";

const Predictions = () => {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    onlyLive: false,
    sortBy: "date"
  });

  const { matches, isLoading, favoriteMatches, toggleFavorite } = useMatches(filters);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <PredictionsHeader
        filters={filters}
        onFiltersChange={setFilters}
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
