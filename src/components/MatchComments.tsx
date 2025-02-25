
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

interface MatchCommentsProps {
  matchId: string;
  isOpen: boolean;
}

export function MatchComments({ matchId, isOpen }: MatchCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const { data: comments, refetch } = useQuery({
    queryKey: ['match-comments', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_comments')
        .select(`
          *,
          profiles:profiles(username)
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('match_comments')
        .insert([{ match_id: matchId, content: newComment }]);

      if (error) throw error;

      setNewComment("");
      refetch();
      toast({
        description: "Comentário adicionado com sucesso!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Erro ao adicionar comentário. Tente novamente.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-4">
        {comments?.map((comment: any) => (
          <div key={comment.id} className="bg-secondary/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {comment.profiles?.username || "Usuário"}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <Input
          type="text"
          placeholder="Adicione um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
