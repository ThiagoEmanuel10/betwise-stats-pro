
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/hooks/use-theme";
import { PWAInstallButton } from "@/components/PWAInstallButton";

// Carregamento lazy de componentes não críticos para o primeiro render
const Index = lazy(() => import("./pages/Index"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Predictions = lazy(() => import("./pages/Predictions"));
const HighProbabilityMatches = lazy(() => import("./pages/HighProbabilityMatches"));
const Chat = lazy(() => import("./pages/Chat"));
const SubscriptionPlans = lazy(() => import("./pages/Subscription"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Documentation = lazy(() => import("./pages/Documentation"));

// Componente de loading
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen" aria-live="polite" aria-busy="true">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" role="status">
      <span className="sr-only">Carregando...</span>
    </div>
  </div>
);

// Criação do QueryClient com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      cacheTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <LoadingFallback />;
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
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/predictions" element={<Predictions />} />
                  <Route path="/high-probability" element={<HighProbabilityMatches />} />
                  <Route path="/subscription" element={<SubscriptionPlans />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/documentation" element={<Documentation />} />
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
              </Suspense>
            </main>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
