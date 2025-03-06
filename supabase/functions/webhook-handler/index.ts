
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.8.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(supabaseUrl || "", supabaseServiceKey || "");

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  if (req.method === "POST") {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    try {
      let event;

      if (endpointSecret && signature) {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      } else {
        event = JSON.parse(body);
      }

      console.log(`Received Stripe event: ${event.type}`);

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.client_reference_id;
          const subscriptionId = session.subscription;
          const plan = session.metadata.plan;

          console.log(`Processing completed checkout for user ${userId}, subscription ${subscriptionId}, plan ${plan}`);

          // Update user's subscription status in the database
          const { error } = await supabase
            .from("profiles")
            .update({ 
              subscription_plan: plan,
              subscription_id: subscriptionId,
              subscription_status: "active",
            })
            .eq("id", userId);

          if (error) {
            console.error("Error updating user subscription:", error);
            throw error;
          }

          // Send notification to user
          await supabase.functions.invoke("webhook-notifications", {
            body: { 
              eventType: "subscription_change", 
              userId: userId,
              data: { plan: plan }
            }
          });

          console.log(`Successfully updated subscription for user ${userId}`);
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const subscriptionId = subscription.id;
          const status = subscription.status;

          console.log(`Subscription ${subscriptionId} updated to status: ${status}`);

          // Find user with this subscription ID
          const { data: users, error: findError } = await supabase
            .from("profiles")
            .select("id")
            .eq("subscription_id", subscriptionId);

          if (findError) {
            console.error("Error finding user for subscription:", findError);
            throw findError;
          }

          if (users && users.length > 0) {
            const userId = users[0].id;
            
            // Update subscription status
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ subscription_status: status })
              .eq("id", userId);

            if (updateError) {
              console.error("Error updating subscription status:", updateError);
              throw updateError;
            }

            // Send notification to user
            await supabase.functions.invoke("webhook-notifications", {
              body: { 
                eventType: "subscription_status", 
                userId: userId,
                data: { status: status }
              }
            });

            console.log(`Updated subscription status for user ${userId} to ${status}`);
          } else {
            console.log(`No user found for subscription ${subscriptionId}`);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const subscriptionId = subscription.id;

          console.log(`Subscription ${subscriptionId} was deleted/canceled`);

          // Find user with this subscription ID
          const { data: users, error: findError } = await supabase
            .from("profiles")
            .select("id")
            .eq("subscription_id", subscriptionId);

          if (findError) {
            console.error("Error finding user for deleted subscription:", findError);
            throw findError;
          }

          if (users && users.length > 0) {
            const userId = users[0].id;
            
            // Reset subscription to Basic plan
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ 
                subscription_plan: "Básico",
                subscription_id: null,
                subscription_status: null 
              })
              .eq("id", userId);

            if (updateError) {
              console.error("Error resetting subscription:", updateError);
              throw updateError;
            }

            // Send notification to user
            await supabase.functions.invoke("webhook-notifications", {
              body: { 
                eventType: "subscription_change", 
                userId: userId,
                data: { plan: "Básico" }
              }
            });

            console.log(`Reset subscription for user ${userId} to Basic plan`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
});
