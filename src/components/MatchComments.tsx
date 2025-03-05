
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

// Basic profanity filter with common bad words
const PROFANITY_LIST = [
  'palavrão1', 'palavrão2', 'xingamento1', 'xingamento2', 
  // Add more bad words as needed in Portuguese and other languages
];

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

  // Check if text contains profanity
  const containsProfanity = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return PROFANITY_LIST.some(word => 
      lowerText.includes(word.toLowerCase()) || 
      // Also check for variations with spaces in between letters
      lowerText.match(new RegExp(word.split('').join('\\s*'), 'i'))
    );
  };

  // Check if text has excessive capitalization (shouting)
  const hasExcessiveCaps = (text: string): boolean => {
    const caps = text.replace(/[^A-Z]/g, '').length;
    const chars = text.length;
    return chars > 5 && (caps / chars) > 0.7; // If >70% of chars are caps
  };

  // Content moderation function
  const moderateContent = (text: string): { isValid: boolean; moderatedText?: string; reason?: string } => {
    // Check for profanity
    if (containsProfanity(text)) {
      return { isValid: false, reason: "Comentário contém linguagem imprópria." };
    }
    
    // Check for excessive capitalization
    if (hasExcessiveCaps(text)) {
      const moderatedText = text.toLowerCase();
      return { 
        isValid: true, 
        moderatedText, 
        reason: "Comentário modificado para remover capitalização excessiva." 
      };
    }
    
    // Check for repeated characters (like "hellooooooo")
    const repeatedCharsRegex = /(.)\1{4,}/g;
    if (repeatedCharsRegex.test(text)) {
      const moderatedText = text.replace(repeatedCharsRegex, '$1$1$1');
      return { 
        isValid: true, 
        moderatedText, 
        reason: "Comentário modificado para remover caracteres repetidos." 
      };
    }
    
    return { isValid: true, moderatedText: text };
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        variant: "destructive",
        description: "Você precisa estar logado para comentar.",
      });
      return;
    }

    // Apply content moderation
    const moderationResult = moderateContent(newComment);
    
    // If content is invalid, show error and don't submit
    if (!moderationResult.isValid) {
      toast({
        variant: "destructive",
        description: moderationResult.reason,
      });
      return;
    }

    // Use moderated text if available
    const contentToSubmit = moderationResult.moderatedText || newComment;

    // If moderation changed the content, notify the user
    if (contentToSubmit !== newComment && moderationResult.reason) {
      toast({
        description: moderationResult.reason,
      });
    }

    try {
      const { error } = await supabase
        .from('match_comments')
        .insert({
          match_id: matchId,
          content: contentToSubmit,
          user_id: session.user.id
        });

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
