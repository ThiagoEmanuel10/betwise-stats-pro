
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/hooks/use-theme";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Predictions from "./pages/Predictions";
import HighProbabilityMatches from "./pages/HighProbabilityMatches";
import Chat from "./pages/Chat";
import SubscriptionPlans from "./pages/Subscription";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen" aria-live="polite" aria-busy="true">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" role="status">
          <span className="sr-only">Carregando...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <a href="#main-content" className="skip-to-content">
          Pular para o conteúdo
        </a>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <PWAInstallButton />
            <ThemeToggle />
          </div>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <main id="main-content" tabIndex={-1} className="outline-none">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/high-probability" element={<HighProbabilityMatches />} />
                <Route path="/subscription" element={<SubscriptionPlans />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/chat"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
