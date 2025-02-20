
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, User } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    notifications: {
      goals: true,
      matchStart: true,
      favorites: true,
    },
  });

  useState(() => {
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

        setProfile(data);
        setFormData({
          username: data.username || "",
          fullName: data.full_name || "",
          notifications: data.notification_preferences || {
            goals: true,
            matchStart: true,
            favorites: true,
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

  const toggleNotification = (key: keyof typeof formData.notifications) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
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
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Settings;
