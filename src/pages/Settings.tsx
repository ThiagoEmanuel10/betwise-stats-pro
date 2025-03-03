
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, User, PaintBucket, Bell, BarChart } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useTheme } from "@/hooks/use-theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Profile = Database['public']['Tables']['profiles']['Row'];
type NotificationPreferences = {
  goals: boolean;
  matchStart: boolean;
  favorites: boolean;
};

type DataVisualizationPreferences = {
  chartType: "line" | "bar" | "area";
  colorScheme: "default" | "blue" | "green" | "purple";
  showLegend: boolean;
  showGrid: boolean;
};

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    notifications: {
      goals: true,
      matchStart: true,
      favorites: true,
    } as NotificationPreferences,
    dataVisualization: {
      chartType: "line" as const,
      colorScheme: "default" as const,
      showLegend: true,
      showGrid: true,
    } as DataVisualizationPreferences,
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setFormData({
          username: data.username || "",
          fullName: data.full_name || "",
          notifications: (data.notification_preferences as NotificationPreferences) || {
            goals: true,
            matchStart: true,
            favorites: true,
          },
          dataVisualization: (data.data_visualization_preferences as DataVisualizationPreferences) || {
            chartType: "line",
            colorScheme: "default",
            showLegend: true,
            showGrid: true,
          },
        });
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    getProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          full_name: formData.fullName,
          notification_preferences: formData.notifications,
          data_visualization_preferences: formData.dataVisualization,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Configurações atualizadas com sucesso!");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const updateDataVisualization = (
    key: keyof DataVisualizationPreferences,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      dataVisualization: {
        ...prev.dataVisualization,
        [key]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="glass sticky top-0 z-50 p-4 mb-6">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary/50 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Configurações</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="profile" className="flex gap-2 items-center">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex gap-2 items-center">
              <PaintBucket className="h-4 w-4" />
              <span>Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex gap-2 items-center">
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex gap-2 items-center">
              <BarChart className="h-4 w-4" />
              <span>Visualização</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="profile" className="space-y-6">
              <div className="glass rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Perfil</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="@username"
                        className="pl-9"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Seu nome"
                        className="pl-9"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div className="glass rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Aparência</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Tema</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                      <Switch
                        id="theme"
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="glass rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Notificações</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="goals">Gols</Label>
                    <Switch
                      id="goals"
                      checked={formData.notifications.goals}
                      onCheckedChange={() => toggleNotification("goals")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="matchStart">Início das partidas</Label>
                    <Switch
                      id="matchStart"
                      checked={formData.notifications.matchStart}
                      onCheckedChange={() => toggleNotification("matchStart")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="favorites">Times favoritos</Label>
                    <Switch
                      id="favorites"
                      checked={formData.notifications.favorites}
                      onCheckedChange={() => toggleNotification("favorites")}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-6">
              <div className="glass rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Visualização de Dados</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chartType">Tipo de Gráfico</Label>
                    <Select
                      value={formData.dataVisualization.chartType}
                      onValueChange={(value) => updateDataVisualization("chartType", value as "line" | "bar" | "area")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de gráfico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Linha</SelectItem>
                        <SelectItem value="bar">Barra</SelectItem>
                        <SelectItem value="area">Área</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colorScheme">Esquema de Cores</Label>
                    <Select
                      value={formData.dataVisualization.colorScheme}
                      onValueChange={(value) => updateDataVisualization("colorScheme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o esquema de cores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="blue">Azul</SelectItem>
                        <SelectItem value="green">Verde</SelectItem>
                        <SelectItem value="purple">Roxo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLegend">Mostrar Legenda</Label>
                    <Switch
                      id="showLegend"
                      checked={formData.dataVisualization.showLegend}
                      onCheckedChange={(value) => updateDataVisualization("showLegend", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showGrid">Mostrar Grade</Label>
                    <Switch
                      id="showGrid"
                      checked={formData.dataVisualization.showGrid}
                      onCheckedChange={(value) => updateDataVisualization("showGrid", value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </form>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
