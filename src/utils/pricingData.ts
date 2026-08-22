/**
 * Resumora Regional Pricing & Currency Localization
 * Optimized for India-First (INR / UPI / RuPay / NetBanking) with Global USD fallback.
 */

export type CurrencyCode = 'INR' | 'USD';
export type BillingInterval = 'pass' | 'monthly' | 'annual';

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  interval: BillingInterval;
  intervalLabel: string;
  currency: CurrencyCode;
  amount: number;
  originalAmount?: number;
  description: string;
  features: string[];
  stripePriceId?: string;
  paymentLink?: string;
}

export interface RegionalPricingConfig {
  currency: CurrencyCode;
  currencySymbol: string;
  plans: {
    pass: PricingPlan;
    monthly: PricingPlan;
    annual: PricingPlan;
  };
  acceptedMethods: string[];
}

/**
 * Auto-detect whether user is likely in India based on timezone, language, or system locale.
 */
export function detectUserCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'INR';

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (
      timeZone.includes('Kolkata') ||
      timeZone.includes('Calcutta') ||
      timeZone.includes('India') ||
      timeZone.startsWith('Asia/Kolkata')
    ) {
      return 'INR';
    }

    const languages = navigator.languages || [navigator.language || ''];
    if (languages.some((l) => l.includes('-IN') || l.toLowerCase() === 'hi')) {
      return 'INR';
    }
  } catch {
    // Default fallback
  }

  return 'INR'; // India-First default
}

export const PRICING_CONFIGS: Record<CurrencyCode, RegionalPricingConfig> = {
  INR: {
    currency: 'INR',
    currencySymbol: '₹',
    acceptedMethods: ['UPI (GPay / PhonePe / Paytm)', 'RuPay & Cards', 'NetBanking', 'EMI'],
    plans: {
      pass: {
        id: 'inr_job_seeker_pass',
        name: 'Job Seeker Pass',
        badge: 'Best for Job Hunters',
        interval: 'pass',
        intervalLabel: '14 Days Access',
        currency: 'INR',
        amount: 149,
        originalAmount: 299,
        description: 'Single payment. Unlimited exports for two weeks while you apply.',
        features: [
          'Unlimited PDF & DOCX Downloads',
          '50 High-Speed Resumora AI Rewrites',
          'Full ATS Scorecard & Keyword Matcher',
          'All 7 Premium & Photo Templates',
          '100% Ad-Free & Watermark-Free',
        ],
        paymentLink: 'https://buy.stripe.com/test_inr_pass',
      },
      monthly: {
        id: 'inr_pro_monthly',
        name: 'Pro Monthly',
        popular: true,
        badge: 'Most Popular',
        interval: 'monthly',
        intervalLabel: 'per month',
        currency: 'INR',
        amount: 249,
        originalAmount: 499,
        description: 'Full creative freedom with monthly AI credits & multi-device sync.',
        features: [
          'Unlimited PDF & DOCX Downloads',
          '500 Resumora AI Credits / month',
          'Multi-Device Google Cloud Sync',
          'Priority ATS Keyword Recommendations',
          'Executive & Modern Photo Templates',
          'Cancel Anytime in 1-Click',
        ],
        paymentLink: 'https://buy.stripe.com/test_inr_monthly',
      },
      annual: {
        id: 'inr_pro_annual',
        name: 'Pro Annual',
        badge: 'Save 50%',
        interval: 'annual',
        intervalLabel: 'per year (₹125/mo)',
        currency: 'INR',
        amount: 1499,
        originalAmount: 2999,
        description: 'Best long-term value for career growth and resume versioning.',
        features: [
          'Everything in Pro Monthly',
          '6,000 Annual AI Credits',
          'Unlimited Resumes & Versions',
          'Priority 24/7 Career Support',
          'Highest Savings (50% Off)',
        ],
        paymentLink: 'https://buy.stripe.com/test_inr_annual',
      },
    },
  },
  USD: {
    currency: 'USD',
    currencySymbol: '$',
    acceptedMethods: ['Credit / Debit Cards', 'Apple Pay', 'Google Pay', 'Link'],
    plans: {
      pass: {
        id: 'usd_job_seeker_pass',
        name: 'Job Seeker Pass',
        badge: 'Single Payment',
        interval: 'pass',
        intervalLabel: '14 Days Access',
        currency: 'USD',
        amount: 9,
        originalAmount: 19,
        description: 'Unlimited exports for 14 days while actively applying.',
        features: [
          'Unlimited PDF & DOCX Downloads',
          '50 Resumora AI Rewrites',
          'Full ATS Scorecard & Keyword Matcher',
          'All 7 Premium Templates',
          'Watermark-Free Export',
        ],
        paymentLink: 'https://buy.stripe.com/test_usd_pass',
      },
      monthly: {
        id: 'usd_pro_monthly',
        name: 'Pro Monthly',
        popular: true,
        badge: 'Most Popular',
        interval: 'monthly',
        intervalLabel: 'per month',
        currency: 'USD',
        amount: 9,
        originalAmount: 18,
        description: 'Complete suite with recurring AI credits and cloud sync.',
        features: [
          'Unlimited PDF & DOCX Downloads',
          '500 AI Credits / month',
          'Multi-Device Cloud Backup',
          'Full ATS Resume Audit',
          'Executive & Photo Templates',
          'Cancel Anytime',
        ],
        paymentLink: 'https://buy.stripe.com/test_usd_monthly',
      },
      annual: {
        id: 'usd_pro_annual',
        name: 'Pro Annual',
        badge: 'Save 55%',
        interval: 'annual',
        intervalLabel: 'per year ($4.08/mo)',
        currency: 'USD',
        amount: 49,
        originalAmount: 108,
        description: 'Best value for continuous career development.',
        features: [
          'Everything in Pro Monthly',
          '6,000 Annual AI Credits',
          'Unlimited Resume Portfolios',
          'Priority Customer Support',
          '55% Annual Savings',
        ],
        paymentLink: 'https://buy.stripe.com/test_usd_annual',
      },
    },
  },
};
