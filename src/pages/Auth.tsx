import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { supabase } from "@/integrations/supabase/client";

// Form schema for login
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }),
});

// Form schema for signup with additional fields
const signupSchema = z
  .object({
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(6, {
      message: "A senha deve ter pelo menos 6 caracteres",
    }),
    confirmPassword: z.string().min(6, {
      message: "A senha deve ter pelo menos 6 caracteres",
    }),
    username: z.string().min(3, {
      message: "O nome de usuário deve ter pelo menos 3 caracteres",
    }),
    fullName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não correspondem",
    path: ["confirmPassword"],
  });

// Form schema for password reset
const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<
    "login" | "signup" | "forgotPassword" | "resetPassword" | "resetSuccess"
  >("login");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      fullName: "",
    },
  });

  // Reset password form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Login bem-sucedido",
        description: "Você foi autenticado com sucesso",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Error during login:", error);
      toast({
        title: "Erro no login",
        description:
          error.message || "Falha na autenticação. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            full_name: values.fullName || "",
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Registro bem-sucedido",
        description:
          "Sua conta foi criada. Verifique seu email para confirmar o registro.",
      });

      setMode("login");
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast({
        title: "Erro no registro",
        description:
          error.message || "Falha no registro. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth?mode=resetPassword`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description:
          "Se o endereço estiver registrado, você receberá um email com instruções para redefinir sua senha.",
      });

      setMode("resetSuccess");
    } catch (error: any) {
      console.error("Error during password reset:", error);
      toast({
        title: "Erro no envio",
        description:
          error.message ||
          "Não foi possível enviar o email de redefinição. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check URL parameters for password reset flow
  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const modeParam = queryParams.get("mode");
    
    if (modeParam === "resetPassword") {
      setMode("resetPassword");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-md glass">
        <CardHeader>
          {mode !== "login" && mode !== "signup" && (
            <Button
              variant="ghost"
              className="absolute left-2 top-2 p-0 w-8 h-8"
              onClick={() => setMode("login")}
            >
              <ArrowLeft size={18} />
            </Button>
          )}
          <CardTitle>
            {mode === "login"
              ? "Login"
              : mode === "signup"
              ? "Criar Conta"
              : mode === "forgotPassword"
              ? "Recuperar Senha"
              : mode === "resetPassword"
              ? "Definir Nova Senha"
              : "Email Enviado"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Entre com suas credenciais para acessar sua conta"
              : mode === "signup"
              ? "Preencha as informações abaixo para criar sua conta"
              : mode === "forgotPassword"
              ? "Insira seu email para receber instruções de recuperação"
              : mode === "resetPassword"
              ? "Crie uma nova senha para sua conta"
              : "Verifique sua caixa de entrada e siga as instruções enviadas"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === "login" && (
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="seu@email.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pl-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 top-1 h-8 w-8"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          )}

          {mode === "signup" && (
            <Form {...signupForm}>
              <form
                onSubmit={signupForm.handleSubmit(handleSignup)}
                className="space-y-4"
              >
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="seu@email.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pl-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 top-1 h-8 w-8"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            className="pl-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-1 top-1 h-8 w-8"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="nomeusuario"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo (opcional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Seu nome completo"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </Form>
          )}

          {mode === "forgotPassword" && (
            <Form {...resetPasswordForm}>
              <form
                onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}
                className="space-y-4"
              >
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="seu@email.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Email de Recuperação"}
                </Button>
              </form>
            </Form>
          )}

          {mode === "resetSuccess" && (
            <div className="text-center py-4">
              <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
              <p className="mb-4">
                Se o endereço de email estiver registrado em nosso sistema, você receberá instruções para redefinir sua senha.
              </p>
              <p className="text-sm text-muted-foreground">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {mode === "login" && (
            <>
              <Button
                variant="link"
                className="text-sm"
                onClick={() => setMode("forgotPassword")}
              >
                Esqueceu a senha?
              </Button>
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                </span>
                <Button
                  variant="link"
                  className="text-sm p-0"
                  onClick={() => setMode("signup")}
                >
                  Registre-se
                </Button>
              </div>
            </>
          )}

          {mode === "signup" && (
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
              </span>
              <Button
                variant="link"
                className="text-sm p-0"
                onClick={() => setMode("login")}
              >
                Faça login
              </Button>
            </div>
          )}

          {mode === "forgotPassword" && (
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Lembrou da senha?{" "}
              </span>
              <Button
                variant="link"
                className="text-sm p-0"
                onClick={() => setMode("login")}
              >
                Voltar ao login
              </Button>
            </div>
          )}

          {mode === "resetSuccess" && (
            <Button
              className="w-full"
              onClick={() => setMode("login")}
            >
              Voltar ao Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
