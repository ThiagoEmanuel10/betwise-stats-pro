
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Football } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LiveMatchDisplay } from "@/components/LiveMatchDisplay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const { data: messages, refetch } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
  });

  const { data: liveMatches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['live-matches'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'fixtures',
          params: {
            live: 'all'
          },
        },
      });

      if (error) throw error;
      return data.response || [];
    },
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{ content: newMessage, user_id: userId }]);

      if (error) throw error;

      setNewMessage("");
      refetch();
      toast({
        description: "Mensagem enviada com sucesso!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Erro ao enviar mensagem. Tente novamente.",
      });
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="glass sticky top-0 z-50 p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chat de Apostadores
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-24">
        <div className="mt-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Football className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium">Jogo em destaque</h2>
          </div>
          
          {isLoadingMatches ? (
            <div className="h-24 animate-pulse rounded-lg bg-secondary/30"></div>
          ) : (
            <>
              <div className="mb-2">
                <Select
                  value={selectedMatchId}
                  onValueChange={(value) => setSelectedMatchId(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um jogo para acompanhar" />
                  </SelectTrigger>
                  <SelectContent>
                    {liveMatches?.map((match: any) => (
                      <SelectItem key={match.fixture.id} value={match.fixture.id.toString()}>
                        {match.teams.home.name} vs {match.teams.away.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <LiveMatchDisplay matchId={selectedMatchId} />
            </>
          )}
        </div>

        <div className="space-y-4">
          {messages?.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              isCurrentUser={message.user_id === userId}
              timestamp={message.created_at}
            />
          ))}
        </div>
      </main>

      <div className="glass fixed bottom-0 left-0 right-0 p-4">
        <div className="container mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Enviar</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
