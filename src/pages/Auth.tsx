
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowLeft, Google } from "lucide-react";

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
              {mode !== "forgotPassword" && mode === "signup" && (
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
                    className="w-full flex items-center justify-center"
                    onClick={handleGoogleLogin}
                  >
                    <Google className="h-4 w-4 mr-2" />
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

export default Auth;
