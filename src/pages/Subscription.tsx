import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  X, 
  Zap, 
  Shield, 
  BarChart3, 
  Trophy, 
  Bell, 
  PanelTop,
  PieChart,
  DatabaseBackup,
  Clock,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<string>("Básico");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        setUser(data.session.user);
        
        // Fetch user's subscription status
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_plan")
          .eq("id", data.session.user.id)
          .single();
          
        if (profile && profile.subscription_plan) {
          setUserSubscription(profile.subscription_plan);
        }
      }
    };
    
    checkUser();
  }, []);

  const handleSubscription = async (planName: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para assinar um plano",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (userSubscription === planName) {
      toast({
        title: "Plano atual",
        description: `Você já está inscrito no plano ${planName}`,
      });
      return;
    }
    
    if (planName === "Básico") {
      toast({
        title: "Plano gratuito",
        description: "O plano Básico é gratuito e já está ativo.",
      });
      return;
    }
    
    try {
      setLoading(true);
      setProcessingPlan(planName);
      
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: {
          plan: planName,
          userId: user.id,
          returnUrl: window.location.origin + '/subscription'
        }
      });
      
      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Falha ao criar sessão de pagamento");
      }
    } catch (error: any) {
      console.error("Error initiating subscription:", error);
      toast({
        title: "Erro ao processar",
        description: error.message || "Não foi possível processar o pagamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setProcessingPlan(null);
    }
  };

  const plans = [
    {
      name: "Básico",
      price: "Grátis",
      description: "Para usuários casuais que querem acesso às funcionalidades essenciais.",
      features: [
        { name: "Histórico de partidas recentes", included: true },
        { name: "Previsões básicas", included: true },
        { name: "Estatísticas limitadas", included: true },
        { name: "Notificações de jogos favoritos", included: true },
        { name: "Análise de tendências", included: false },
        { name: "Histórico completo de confrontos", included: false },
        { name: "Análise avançada por liga", included: false },
        { name: "Previsões de alta probabilidade", included: false },
        { name: "Tema personalizado", included: false },
        { name: "Painéis personalizáveis", included: false },
      ],
      highlightColor: "border-gray-200",
      buttonVariant: "outline" as const
    },
    {
      name: "Premium",
      price: "R$19,90/mês",
      description: "Para entusiastas que querem aproveitar ao máximo as análises.",
      features: [
        { name: "Histórico de partidas recentes", included: true },
        { name: "Previsões básicas", included: true },
        { name: "Estatísticas completas", included: true },
        { name: "Notificações de jogos favoritos", included: true },
        { name: "Análise de tendências", included: true },
        { name: "Histórico completo de confrontos", included: true },
        { name: "Análise avançada por liga", included: true },
        { name: "Previsões de alta probabilidade", included: true },
        { name: "Tema personalizado", included: false },
        { name: "Painéis personalizáveis", included: false },
      ],
      highlightColor: "border-primary",
      buttonVariant: "default" as const
    },
    {
      name: "Ultra",
      price: "R$39,90/mês",
      description: "Para profissionais que buscam todas as vantagens e personalizações.",
      features: [
        { name: "Histórico de partidas recentes", included: true },
        { name: "Previsões básicas", included: true },
        { name: "Estatísticas completas", included: true },
        { name: "Notificações de jogos favoritos", included: true },
        { name: "Análise de tendências", included: true },
        { name: "Histórico completo de confrontos", included: true },
        { name: "Análise avançada por liga", included: true },
        { name: "Previsões de alta probabilidade", included: true },
        { name: "Tema personalizado", included: true },
        { name: "Painéis personalizáveis", included: true },
      ],
      highlightColor: "border-accent",
      buttonVariant: "secondary" as const
    }
  ];

  // Check for URL params indicating payment result
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get('success');
    const sessionId = queryParams.get('session_id');
    const canceled = queryParams.get('canceled');
    
    if (success === 'true' && sessionId) {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: "Assinatura realizada com sucesso!",
        description: "Seu plano foi ativado. Aproveite os novos recursos!",
      });
    } else if (canceled === 'true') {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: "Assinatura cancelada",
        description: "Você cancelou o processo de assinatura.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-12">
      <header className="glass sticky top-0 z-50 p-4 mb-6">
        <div className="container mx-auto">
          <h1 className="text-xl font-semibold">Planos de Assinatura</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Escolha o plano ideal para você</h2>
          <p className="text-muted-foreground">
            Desbloqueie todo o potencial das suas previsões e análises com nossos planos de assinatura
          </p>
          {userSubscription !== "Básico" && (
            <div className="mt-4 p-2 bg-primary/10 rounded-md inline-block">
              <p className="text-primary font-medium">
                Plano atual: {userSubscription}
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`slide-up glass transition-all duration-300 hover:shadow-lg ${
                plan.name === "Premium" ? "md:scale-105 border-2 " + plan.highlightColor : "border " + plan.highlightColor
              } ${userSubscription === plan.name ? "ring-2 ring-primary" : ""}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name === "Básico" && <Clock className="w-5 h-5 text-gray-500" />}
                  {plan.name === "Premium" && <BarChart3 className="w-5 h-5 text-primary" />}
                  {plan.name === "Ultra" && <Zap className="w-5 h-5 text-accent" />}
                  {plan.name}
                  {userSubscription === plan.name && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full" 
                  size="lg"
                  disabled={loading || userSubscription === plan.name}
                  onClick={() => handleSubscription(plan.name)}
                >
                  {loading && processingPlan === plan.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : userSubscription === plan.name ? (
                    "Plano Atual"
                  ) : (
                    plan.name === "Básico" ? "Plano Gratuito" : "Assinar Agora"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-6">Por que assinar?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="glass p-6 rounded-lg border border-border">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-medium mb-2">Análises Avançadas</h4>
              <p className="text-muted-foreground text-sm">
                Acesse análises detalhadas de desempenho e tendências para tomar decisões mais informadas.
              </p>
            </div>
            
            <div className="glass p-6 rounded-lg border border-border">
              <div className="rounded-full bg-accent/10 w-12 h-12 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <h4 className="text-lg font-medium mb-2">Previsões Precisas</h4>
              <p className="text-muted-foreground text-sm">
                Previsões de alta probabilidade baseadas em algoritmos avançados e análise de dados históricos.
              </p>
            </div>
            
            <div className="glass p-6 rounded-lg border border-border">
              <div className="rounded-full bg-secondary/20 w-12 h-12 flex items-center justify-center mb-4">
                <PanelTop className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h4 className="text-lg font-medium mb-2">Personalização</h4>
              <p className="text-muted-foreground text-sm">
                Personalize sua experiência com temas, painéis e configurações de notificação específicas.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPlans;
