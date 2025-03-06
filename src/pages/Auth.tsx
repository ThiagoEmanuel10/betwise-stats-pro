import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgotPassword" | "resetSuccess">("login");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              full_name: formData.fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth?verification=success`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso! Por favor, verifique seu email para confirmar.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate("/profile");
      } else if (mode === "forgotPassword") {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });
        if (error) throw error;
        setMode("resetSuccess");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login com Google");
    }
  };

  // Check for URL parameters indicating email verification or password reset
  const searchParams = new URLSearchParams(window.location.search);
  const verification = searchParams.get("verification");
  const reset = searchParams.get("reset");

  if (verification === "success") {
    toast.success("Email verificado com sucesso! Faça login para continuar.");
  }

  if (reset === "true") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
        <div className="w-full max-w-md">
          <div className="glass rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Redefinir sua Senha</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const { error } = await supabase.auth.updateUser({
                  password: formData.password,
                });
                if (error) throw error;
                toast.success("Senha alterada com sucesso!");
                navigate("/auth");
              } catch (error: any) {
                toast.error(error.message || "Erro ao redefinir senha");
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Redefinir Senha
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is a new sign-up and completed registration
  const isNewUser = searchParams.get("newUser") === "true";
  
  if (isNewUser) {
    return <OnboardingScreen navigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-lg p-8">
          {mode === "forgotPassword" && (
            <button
              onClick={() => setMode("login")}
              className="flex items-center text-sm text-primary mb-4 hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para login
            </button>
          )}

          <h2 className="text-2xl font-bold text-center mb-6">
            {mode === "login"
              ? "Entrar"
              : mode === "signup"
              ? "Criar conta"
              : mode === "forgotPassword"
              ? "Recuperar senha"
              : "Email enviado"}
          </h2>

          {mode === "resetSuccess" ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Um email de recuperação foi enviado para {formData.email}. Por favor, verifique sua caixa de entrada.
              </p>
              <Button onClick={() => setMode("login")} className="w-full">
                Voltar para login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="@username"
                        className="pl-9"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required={mode === "signup"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome"
                        className="pl-9"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        required={mode === "signup"}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-9"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {mode !== "forgotPassword" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Senha</Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgotPassword")}
                        className="text-xs text-primary hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={mode !== "forgotPassword"}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                ) : mode === "login" ? (
                  "Entrar"
                ) : mode === "signup" ? (
                  "Criar conta"
                ) : (
                  "Enviar email de recuperação"
                )}
              </Button>

              {mode !== "forgotPassword" && (
                <>
                  <div className="relative flex items-center justify-center mt-4">
                    <div className="border-t border-border flex-grow"></div>
                    <div className="text-xs text-muted-foreground mx-2">OU</div>
                    <div className="border-t border-border flex-grow"></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleLogin}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="16" 
                      height="16"
                    >
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .5 4.1 1.4l3.1-3.1C17.1 1.2 14.7 0 12 0S6.9 1.2 4.8 3.3l3.1 3.1C9 5.5 10.4 5 12 5z"/>
                      <path fill="#4285F4" d="M23.5 12c0-.8-.1-1.7-.2-2.5H12v5h6.5c-.3 1.5-1.2 2.8-2.5 3.7l3.2 2.5c1.9-1.8 3-4.3 3-7.3z"/>
                      <path fill="#FBBC05" d="M5 12c0-1 .2-1.9.5-2.8L2.4 6.2C1.5 7.9 1 9.9 1 12c0 2.1.5 4.1 1.4 5.8l3.1-3.1C5.2 13.9 5 13 5 12z"/>
                      <path fill="#34A853" d="M12 19c-1.6 0-3-.5-4.1-1.4l-3.1 3.1c2.1 2.1 4.5 3.3 7.2 3.3 2.7 0 5-.9 6.7-2.5l-3.2-2.5c-1 .7-2.3 1-3.5 1z"/>
                    </svg>
                    Continuar com Google
                  </Button>
                </>
              )}
            </form>
          )}

          {mode !== "forgotPassword" && mode !== "resetSuccess" && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm text-primary hover:underline"
              >
                {mode === "login"
                  ? "Não tem uma conta? Cadastre-se"
                  : "Já tem uma conta? Entre"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Onboarding screen for new users
const OnboardingScreen = ({ navigate }: { navigate: (path: string) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Bem-vindo ao BetWise Stats Pro!",
      description: "Acompanhe jogos ao vivo, faça previsões e interaja com outros fãs.",
      icon: "🎮"
    },
    {
      title: "Faça previsões inteligentes",
      description: "Use nossas estatísticas e análises para tomar decisões mais informadas.",
      icon: "📊"
    },
    {
      title: "Interaja com a comunidade",
      description: "Discuta jogos em tempo real e compartilhe suas opiniões.",
      icon: "💬"
    },
    {
      title: "Pronto para começar!",
      description: "Personalize seu perfil e comece a acompanhar seus jogos favoritos.",
      icon: "🚀"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <div className="w-full max-w-md slide-up">
        <div className="glass rounded-lg p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
              {steps[currentStep].icon}
            </div>
            <h2 className="text-2xl font-bold mt-4">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
            
            <div className="flex justify-center space-x-2 mt-4">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            
            <div className="flex justify-between w-full mt-8">
              <Button
                variant="outline"
                onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate("/auth")}
                className="px-4"
              >
                {currentStep === 0 ? "Voltar" : "Anterior"}
              </Button>
              
              <Button
                onClick={() => {
                  if (currentStep < steps.length - 1) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    navigate("/profile");
                  }
                }}
                className="px-4"
              >
                {currentStep === steps.length - 1 ? "Começar" : "Próximo"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
