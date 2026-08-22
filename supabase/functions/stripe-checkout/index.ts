// Supabase Edge Function: stripe-checkout
// Creates a secure Stripe Checkout session supporting INR (UPI/Cards) & USD
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planId, currency, interval, amount, userId, userEmail, returnUrl } = await req.json();

    const isRecurring = interval === 'monthly' || interval === 'annual';
    const currLower = (currency || 'inr').toLowerCase();

    const lineItems = [
      {
        price_data: {
          currency: currLower,
          product_data: {
            name: `Resumora ${interval === 'pass' ? 'Job Seeker Pass (14 Days)' : interval === 'annual' ? 'Pro Annual Plan' : 'Pro Monthly Plan'}`,
            description: 'Unlimited PDF & DOCX exports, AI credits, all premium templates, and ATS keyword matching.',
          },
          unit_amount: amount * 100, // in smallest currency unit (paise/cents)
          ...(isRecurring
            ? {
                recurring: {
                  interval: interval === 'annual' ? 'year' : 'month',
                },
              }
            : {}),
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: currLower === 'inr' ? ['card'] : ['card'],
      line_items: lineItems,
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: `${returnUrl || 'https://resumora.app/builder'}?payment=success&session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}&interval=${interval}`,
      cancel_url: `${returnUrl || 'https://resumora.app/builder'}?payment=cancelled`,
      client_reference_id: userId || 'anonymous',
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId || 'anonymous',
        planId,
        interval,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
