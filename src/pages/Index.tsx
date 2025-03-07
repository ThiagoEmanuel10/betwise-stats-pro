
import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { StatisticsTab } from "@/components/StatisticsTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { trackPageView } from "@/lib/analytics";
import { Toaster } from "@/components/ui/sonner";
import { Link } from "react-router-dom";

const Index = () => {
  const [showToaster] = useState(true);

  // Track page view
  useEffect(() => {
    trackPageView("/", "BetWise Stats Pro - Home");
  }, []);

  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'fixtures',
          params: {
            league: '39', // Premier League
            season: '2023',
            next: '5', // Next 5 matches
          },
        },
      });

      if (error) throw error;
      return data.response;
    },
  });

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50 p-4 mb-6 border-b border-white/10" role="banner">
        <div className="container mx-auto flex items-center justify-between">
          <Logo className="hover-shine" aria-label="BetWise Stats Pro" />
          <div className="flex items-center gap-4">
            <button 
              className="p-2 hover:bg-secondary/50 rounded-full transition-colors hover-expand"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
            </button>
            <Link 
              to="/profile" 
              className="p-2 hover:bg-secondary/50 rounded-full transition-colors hover-expand"
              aria-label="Perfil de usuário"
            >
              <User className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <section className="mb-8 fade-in" aria-labelledby="featured-games-heading">
          <h2 
            id="featured-games-heading" 
            className="text-2xl font-semibold mb-6 bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent slide-up"
          >
            Jogos em Destaque
          </h2>
          {isLoading ? (
            <div className="space-y-4" aria-live="polite" aria-busy="true">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="glass rounded-lg p-4 animate-pulse"
                  style={{ 
                    animationDelay: `${i * 150}ms`,
                    opacity: 0,
                    animation: 'fade-in 0.5s ease-out forwards'
                  }}
                >
                  <div className="h-20 bg-secondary/50 rounded-lg" role="status">
                    <span className="sr-only">Carregando jogos...</span>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg" role="alert">
              <p>Erro ao carregar os jogos. Por favor, tente novamente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches?.map((match, index) => (
                <div 
                  key={match.fixture.id} 
                  className="card-transition"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    opacity: 0,
                    animation: 'slide-up 0.5s ease-out forwards'
                  }}
                >
                  <MatchCard fixture={match} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="fade-in" style={{ animationDelay: '300ms' }} aria-labelledby="statistics-heading">
          <h2 
            id="statistics-heading" 
            className="text-2xl font-semibold mb-6 bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent slide-up"
          >
            Estatísticas
          </h2>
          <StatisticsTab league="39" />
        </section>
      </main>
      
      {showToaster && <Toaster />}
    </div>
  );
};

export default Index;
