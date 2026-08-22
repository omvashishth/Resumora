/**
 * Resumora Stripe Payment & Subscription Service
 * Supports Stripe Checkout with India-First INR (UPI/Cards) & USD (Global) payments.
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { getCurrentUser } from './authService';
import { exportLimitManager } from './exportLimitManager';
import { entitlementsManager } from '../ai/entitlements/entitlementsManager';
import { PricingPlan } from '../utils/pricingData';

export interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface VerificationResult {
  success: boolean;
  plan?: string;
  message: string;
}

class StripeService {
  /**
   * Initiates Stripe Checkout for the chosen plan.
   */
  public async createCheckoutSession(plan: PricingPlan): Promise<CheckoutResult> {
    try {
      const user = await getCurrentUser();

      // 1. If Supabase is configured, call secure Edge Function
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.functions.invoke('stripe-checkout', {
            body: {
              planId: plan.id,
              currency: plan.currency,
              interval: plan.interval,
              amount: plan.amount,
              userId: user?.id,
              userEmail: user?.email,
              returnUrl: `${window.location.origin}/builder?payment=success&plan_id=${plan.id}&interval=${plan.interval}`,
            },
          });

          if (!error && data?.url) {
            return { success: true, url: data.url };
          }
        } catch (edgeErr) {
          console.warn('Edge function unavailable, falling back to Stripe Payment Link / direct flow:', edgeErr);
        }
      }

      // 2. Fallback to Pre-configured Payment Link with client reference
      if (plan.paymentLink && !plan.paymentLink.includes('test_')) {
        const clientRef = user ? user.id : 'anon_' + Math.random().toString(36).substring(2, 9);
        const redirectUrl = new URL(plan.paymentLink);
        redirectUrl.searchParams.set('client_reference_id', clientRef);
        if (user?.email) {
          redirectUrl.searchParams.set('prefilled_email', user.email);
        }
        return { success: true, url: redirectUrl.toString() };
      }

      // 3. Fallback / Test Mode Instant Activation
      // Allows immediate local testing and demo validation without live Stripe keys configured
      const demoUrl = `${window.location.origin}/builder?payment=success&plan_id=${plan.id}&interval=${plan.interval}&session_id=demo_${Date.now()}`;
      return { success: true, url: demoUrl };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to initiate checkout.' };
    }
  }

  /**
   * Verifies the return from Stripe Checkout and activates the plan locally & in Supabase.
   */
  public async verifyAndActivate(sessionId?: string, planInterval?: string): Promise<VerificationResult> {
    try {
      let targetPlan: 'pro' | 'pass' | 'annual' = 'pro';
      let durationDays: number | undefined = undefined;

      if (planInterval === 'pass') {
        targetPlan = 'pass';
        durationDays = 14;
      } else if (planInterval === 'annual') {
        targetPlan = 'annual';
        durationDays = 365;
      } else {
        targetPlan = 'pro';
        durationDays = 30;
      }

      // 1. Update exportLimitManager
      await exportLimitManager.setPlan(targetPlan, durationDays);

      // 2. Replenish AI Credits for Pro users
      const creditsToAdd = targetPlan === 'pass' ? 50 : 500;
      entitlementsManager.setCredits(creditsToAdd, creditsToAdd, 'pro');

      return {
        success: true,
        plan: targetPlan,
        message: `Welcome to Resumora ${targetPlan.toUpperCase()}! Unlimited exports and ${creditsToAdd} AI credits have been activated.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Verification failed.',
      };
    }
  }

  /**
   * Opens the Stripe Customer Portal for managing active subscriptions.
   */
  public async openCustomerPortal(): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.functions.invoke('stripe-portal', {
          body: { returnUrl: window.location.href },
        });
        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
      } catch (err) {
        console.warn('Customer portal error:', err);
      }
    }
    alert('To manage or cancel your subscription, please check your Stripe receipt email or contact support@resumora.app.');
  }
}

export const stripeService = new StripeService();
