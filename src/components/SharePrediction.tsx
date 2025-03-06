
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Share,
  Copy,
  Twitter,
  Facebook,
  MessageSquare
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { trackPredictionShare } from "@/lib/analytics";

interface SharePredictionProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
}

export function SharePrediction({ 
  matchId, 
  homeTeam, 
  awayTeam,
  league,
  date 
}: SharePredictionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const shareText = `Check out my prediction for ${homeTeam} vs ${awayTeam} (${league}) on ${new Date(date).toLocaleDateString()}`;
  const shareUrl = `${window.location.origin}/predictions?match=${matchId}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      description: "Link copied to clipboard!",
    });
    trackPredictionShare(matchId, "copy_link");
    setIsOpen(false);
  };
  
  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank");
    trackPredictionShare(matchId, "twitter");
    setIsOpen(false);
  };
  
  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, "_blank");
    trackPredictionShare(matchId, "facebook");
    setIsOpen(false);
  };
  
  const handleShareWhatsapp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(whatsappUrl, "_blank");
    trackPredictionShare(matchId, "whatsapp");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Share className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="grid gap-2">
          <h4 className="font-medium text-sm">Share Prediction</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-xs"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-xs"
              onClick={handleShareTwitter}
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-xs"
              onClick={handleShareFacebook}
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-xs"
              onClick={handleShareWhatsapp}
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
