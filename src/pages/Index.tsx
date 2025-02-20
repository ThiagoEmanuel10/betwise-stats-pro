
import { Bell, User } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import { StatisticsTab } from "@/components/StatisticsTab";

const Index = () => {
  const matches = [
    {
      homeTeam: "Liverpool",
      awayTeam: "Manchester City",
      league: "Premier League",
      date: "27/03",
      time: "16:30",
    },
    {
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      league: "La Liga",
      date: "28/03",
      time: "17:00",
    },
    {
      homeTeam: "Flamengo",
      awayTeam: "Palmeiras",
      league: "Brasileirão",
      date: "29/03",
      time: "19:00",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="glass sticky top-0 z-50 p-4 mb-6">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            BetWise Stats Pro
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <section className="mb-8 fade-in">
          <h2 className="text-2xl font-semibold mb-6">Jogos em Destaque</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard key={`${match.homeTeam}-${match.awayTeam}`} {...match} />
            ))}
          </div>
        </section>

        <section className="fade-in">
          <h2 className="text-2xl font-semibold mb-6">Estatísticas</h2>
          <StatisticsTab />
        </section>
      </main>
    </div>
  );
};

export default Index;
