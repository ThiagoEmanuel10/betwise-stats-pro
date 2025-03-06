
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl || "", supabaseServiceKey || "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventType, userId, data } = await req.json();
    console.log(`Processing ${eventType} event for user ${userId}`);

    switch (eventType) {
      case "match_update": {
        // Get user's notification preferences
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("notification_preferences")
          .eq("id", userId)
          .single();

        if (profileError) {
          throw profileError;
        }

        const notificationPrefs = profile.notification_preferences;
        
        // Check if user has enabled this notification type
        const shouldNotify = 
          (data.type === "goal" && notificationPrefs?.goals) ||
          (data.type === "matchStart" && notificationPrefs?.matchStart) ||
          (data.type === "favoriteTeam" && notificationPrefs?.favorites);

        if (shouldNotify) {
          // Store notification in database
          const { error: notifError } = await supabase
            .from("user_notifications")
            .insert({
              user_id: userId,
              title: data.title,
              message: data.message,
              type: data.type,
              data: data.payload || {},
              is_read: false
            });

          if (notifError) throw notifError;
          console.log(`Created notification for user ${userId}: ${data.title}`);
        }
        break;
      }

      case "subscription_change": {
        // Store notification about subscription change
        const { error: notifError } = await supabase
          .from("user_notifications")
          .insert({
            user_id: userId,
            title: "Atualização de assinatura",
            message: `Seu plano foi alterado para ${data.plan}`,
            type: "subscription",
            data: { plan: data.plan },
            is_read: false
          });

        if (notifError) throw notifError;
        console.log(`Created subscription notification for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in webhook-notifications function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
