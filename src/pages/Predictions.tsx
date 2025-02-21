
import { useQuery } from "@tanstack/react-query";
import { Search, Trophy, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MatchCard } from "@/components/MatchCard";
import { supabase } from "@/integrations/supabase/client";

const Predictions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches-predictions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'fixtures',
          params: {
            league: '39', // Premier League como exemplo
            next: '10',
          },
        },
      });

      if (error) throw error;
      return data.response;
    },
  });

  const filteredMatches = matches?.filter((match) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      match.fixture.teams.home.name.toLowerCase().includes(searchLower) ||
      match.fixture.teams.away.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="glass sticky top-0 z-50 p-4 mb-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
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
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar jogos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-lg p-4 animate-pulse">
                <div className="h-20 bg-secondary/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches?.map((match) => (
              <MatchCard
                key={match.fixture.id}
                fixture={match.fixture}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Predictions;
