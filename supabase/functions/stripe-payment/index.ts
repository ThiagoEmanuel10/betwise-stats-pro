
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.8.0";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, userId, returnUrl } = await req.json();
    
    const prices = {
      "Premium": "price_1OH5tnCjKpuRQjoxGNDKdqkW", // Replace with actual Stripe price IDs
      "Ultra": "price_1OH5u1CjKpuRQjoxtzJwn4PB"    // Replace with actual Stripe price IDs
    };
    
    const priceId = prices[plan];
    if (!priceId) {
      throw new Error(`Invalid plan: ${plan}`);
    }
    
    console.log(`Creating checkout session for plan: ${plan}, price: ${priceId}, user: ${userId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        plan: plan,
      },
    });

    console.log(`Checkout session created: ${session.id}`);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in stripe-payment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
