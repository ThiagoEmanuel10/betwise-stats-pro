
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, User, Shield, Star, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  notification_preferences: {
    goals: boolean;
    matchStart: boolean;
    favorites: boolean;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
        setProfile(data);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="glass sticky top-0 z-50 p-4 mb-6">
        <div className="container mx-auto">
          <h1 className="text-xl font-semibold">Perfil</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="glass rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{profile?.full_name}</h2>
              <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center gap-2 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-medium">Times Favoritos</span>
            </button>
            <button className="flex items-center gap-2 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-medium">Minhas Apostas</span>
            </button>
          </div>
        </div>

        <div className="glass rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Configurações</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <span>Notificações</span>
              </div>
              <button className="text-sm text-primary">Configurar</button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-primary" />
                <span>Preferências</span>
              </div>
              <button className="text-sm text-primary">Editar</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
