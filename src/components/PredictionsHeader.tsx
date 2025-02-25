
import { ChevronLeft, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import type { Filters } from "@/components/AdvancedFilters";

interface PredictionsHeaderProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  leagues: Record<string, string>;
}

export function PredictionsHeader({ filters, onFiltersChange, leagues }: PredictionsHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="glass sticky top-0 z-50 p-4 mb-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Previsões de Jogos
            </h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/chat')}
            className="shrink-0"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            leagues={leagues}
          />
        </div>
      </div>
    </header>
  );
}
