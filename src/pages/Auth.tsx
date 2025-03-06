import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, User, Shield } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Update the type to include all possible mode values
  const [mode, setMode] = useState<"login" | "signup" | "forgotPassword" | "resetSuccess">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a)!`,
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Erro ao realizar login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: email.split('@')[0],
            full_name: email.split('@')[0],
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Enviamos um email de confirmação para ${email}`,
      });

      setMode("login");
    } catch (error: any) {
      toast({
        title: "Erro ao realizar cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=resetPassword`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email de recuperação enviado!",
        description: `Verifique sua caixa de entrada em ${email}`,
      });

      setMode("resetSuccess");
    } catch (error: any) {
      toast({
        title: "Erro ao solicitar recuperação de senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha alterada com sucesso!",
        description: "Você já pode fazer login com sua nova senha",
      });

      setMode("login");
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center py-12">
      <div className="container mx-auto">
        <div className="max-w-md mx-auto glass rounded-lg p-8">
          <div className="text-center">
            {mode === "login" && <h2 className="text-2xl font-semibold">Entrar</h2>}
            {mode === "signup" && <h2 className="text-2xl font-semibold">Criar conta</h2>}
            {mode === "forgotPassword" && <h2 className="text-2xl font-semibold">Recuperar senha</h2>}
            {mode === "resetSuccess" && <h2 className="text-2xl font-semibold">Senha enviada!</h2>}
          </div>

          <form
            onSubmit={(e) => {
              if (mode === "login") {
                handleLogin(e);
              } else if (mode === "signup") {
                handleSignup(e);
              } else if (mode === "forgotPassword") {
                handleForgotPassword(e);
              } else if (mode === "resetPassword") {
                handleResetPassword(e);
              }
            }}
            className="space-y-6 mt-6"
          >
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="@username"
                    type="text"
                    className="pl-9"
                    value={email.split('@')[0]}
                    disabled
                  />
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Seu nome"
                    type="text"
                    className="pl-9"
                    value={email.split('@')[0]}
                    disabled
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="seu@email.com"
                  type="email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode !== "forgotPassword" && mode !== "resetSuccess" && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {mode === "resetSuccess" ? (
              <p className="text-sm text-muted-foreground">
                Enviamos um link para seu email. Clique no link para redefinir
                sua senha.
              </p>
            ) : (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                ) : (
                  <>
                    {mode === "login" && "Entrar"}
                    {mode === "signup" && "Criar conta"}
                    {mode === "forgotPassword" && "Enviar email de recuperação"}
                    {mode === "resetPassword" && "Salvar nova senha"}
                  </>
                )}
              </Button>
            )}

            {mode === "login" && (
              <div className="text-sm">
                <Link
                  onClick={() => setMode("forgotPassword")}
                  className="hover:text-primary text-muted-foreground"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            )}
          </form>

          {mode !== "forgotPassword" && mode !== "resetSuccess" && (
            <>
              <div className="relative flex items-center justify-center mt-4">
                <div className="border-t border-border flex-grow"></div>
                <span className="mx-4 text-xs text-muted-foreground">OU</span>
                <div className="border-t border-border flex-grow"></div>
              </div>
                        
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full flex items-center gap-2"
                disabled={loading}
              >
                <Shield className="h-4 w-4" />
                Continuar com o Google
              </Button>
            </>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" && (
              <>
                Não tem uma conta?{" "}
                <Link
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline underline-offset-2"
                >
                  Cadastre-se
                </Link>
              </>
            )}

            {mode === "signup" && (
              <>
                Já tem uma conta?{" "}
                <Link
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline underline-offset-2"
                >
                  Entrar
                </Link>
              </>
            )}

            {mode === "forgotPassword" && (
              <>
                Lembrou?{" "}
                <Link
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline underline-offset-2"
                >
                  Entrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
