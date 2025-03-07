
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, SortDesc } from "lucide-react";
import { LeagueId } from "@/hooks/useMatches";

export type Filters = {
  search: string;
  league?: string;
  onlyLive: boolean;
  sortBy: "date" | "probability" | "popularity";
};

interface AdvancedFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  leagues: Record<string, string>;
}

export function AdvancedFilters({ filters, onFiltersChange, leagues }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {t('predictions.advancedFilters', 'Advanced Filters')}
        </span>
        <span className="text-xs text-muted-foreground">
          {filters.onlyLive ? t('predictions.live', 'Live') : t('predictions.all', 'All')}
        </span>
      </Button>

      {isOpen && (
        <div className="glass p-4 rounded-lg space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">{t('predictions.searchTeams', 'Search teams')}</Label>
            <Input
              id="search"
              placeholder={t('predictions.search')}
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="league">{t('statistics.league')}</Label>
            <Select
              value={filters.league}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, league: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('predictions.selectLeague', 'Select a league')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(leagues).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="onlyLive">{t('predictions.onlyLive')}</Label>
            <Switch
              id="onlyLive"
              checked={filters.onlyLive}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, onlyLive: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortBy">{t('predictions.sortBy')}</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value: "date" | "probability" | "popularity") =>
                onFiltersChange({ ...filters, sortBy: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">
                  <span className="flex items-center gap-2">
                    <SortDesc className="w-4 h-4" />
                    {t('predictions.date')}
                  </span>
                </SelectItem>
                <SelectItem value="probability">{t('predictions.probability')}</SelectItem>
                <SelectItem value="popularity">{t('predictions.popularity')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
