import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Download,
  ShieldCheck,
  Zap,
  Globe,
  CreditCard,
  Key,
  ArrowRight,
  Star,
  Check,
} from 'lucide-react';
import {
  CurrencyCode,
  detectUserCurrency,
  PRICING_CONFIGS,
  PricingPlan,
  BillingInterval,
} from '../../utils/pricingData';
import { stripeService } from '../../services/stripeService';
import { razorpayService } from '../../services/razorpayService';
import { subscribeToAuthChanges, signInWithGoogle, AuthState } from '../../services/authService';
import { exportLimitManager, ExportEntitlementStats } from '../../services/exportLimitManager';
import { PaymentReceiptModal, PaymentReceiptData } from './PaymentReceiptModal';

export type PaywallTriggerReason =
  | 'export_limit'
  | 'ai_limit'
  | 'template_pro'
  | 'general_upgrade';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: PaywallTriggerReason;
  onOpenBYOKSettings?: () => void;
  onPaymentSuccess?: (msg: string) => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  triggerReason = 'general_upgrade',
  onOpenBYOKSettings,
  onPaymentSuccess,
}) => {
  const [currency, setCurrency] = useState<CurrencyCode>(detectUserCurrency());
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('monthly');
  const [paymentGateway, setPaymentGateway] = useState<'razorpay' | 'stripe'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<PaymentReceiptData | null>(null);
  const [exportStats, setExportStats] = useState<ExportEntitlementStats>(exportLimitManager.getStats());
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isConfigured: false,
    loading: false,
  });

  React.useEffect(() => {
    const unsubAuth = subscribeToAuthChanges(setAuthState);
    const unsubExport = exportLimitManager.subscribe(setExportStats);
    return () => {
      unsubAuth();
      unsubExport();
    };
  }, []);

  const config = PRICING_CONFIGS[currency];
  const selectedPlan: PricingPlan = config.plans[selectedInterval];

  // Check if selected plan is already active
  const isSelectedPlanActive = exportStats.isPro && (
    (selectedInterval === 'pass' && exportStats.plan === 'pass') ||
    (selectedInterval === 'monthly' && (exportStats.plan === 'pro' || exportStats.plan === 'monthly' as any)) ||
    (selectedInterval === 'annual' && exportStats.plan === 'annual')
  );

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleCheckout = async () => {
    // If Supabase is configured in production and user is not logged in, require Google login first
    if (!import.meta.env.DEV && authState.isConfigured && !authState.user) {
      setErrorMessage('Please sign in with Google first so your subscription can be linked to your account.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // If INR and Razorpay gateway is selected:
    if (currency === 'INR' && paymentGateway === 'razorpay') {
      try {
        await razorpayService.openCheckout(
          selectedPlan,
          (paymentId) => {
            setLoading(false);
            const receipt: PaymentReceiptData = {
              status: 'success',
              transactionId: paymentId,
              invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
              date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
              customerName: authState.user?.user_metadata?.full_name || 'Valued Candidate',
              customerEmail: authState.user?.email || 'candidate@resumora.app',
              planName: selectedPlan.name,
              planInterval: selectedPlan.intervalLabel,
              amount: selectedPlan.amount,
              currency: currency,
              currencySymbol: config.currencySymbol,
              paymentMethod: 'Razorpay UPI / Cards',
            };
            setReceiptData(receipt);
            setReceiptModalOpen(true);
            if (onPaymentSuccess) {
              onPaymentSuccess(`Payment successful via Razorpay (ID: ${paymentId})! Pro benefits unlocked.`);
            }
          },
          (err) => {
            setLoading(false);
            setErrorMessage(err);
            const receipt: PaymentReceiptData = {
              status: 'failed',
              transactionId: 'TXN_DECLINED_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
              invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
              date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
              customerName: authState.user?.user_metadata?.full_name || 'Valued Candidate',
              customerEmail: authState.user?.email || 'candidate@resumora.app',
              planName: selectedPlan.name,
              planInterval: selectedPlan.intervalLabel,
              amount: selectedPlan.amount,
              currency: currency,
              currencySymbol: config.currencySymbol,
              paymentMethod: 'Razorpay UPI / Cards',
              errorMessage: err || 'Payment was declined or cancelled.',
            };
            setReceiptData(receipt);
            setReceiptModalOpen(true);
          }
        );
        return;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Razorpay checkout error.');
        setLoading(false);
        return;
      }
    }

    // Default to Stripe Checkout (Global USD or International Cards)
    try {
      const res = await stripeService.createCheckoutSession(selectedPlan);
      if (res.success) {
        if (res.url && res.url.startsWith('https://') && !res.url.includes('session_id=demo_')) {
          window.location.href = res.url;
        } else {
          // Instant test-mode activation with state broadcast
          const actRes = await stripeService.verifyAndActivate(undefined, selectedInterval);
          const receipt: PaymentReceiptData = {
            status: 'success',
            transactionId: 'STRIPE_TEST_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
            date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            customerName: authState.user?.user_metadata?.full_name || 'Valued Candidate',
            customerEmail: authState.user?.email || 'candidate@resumora.app',
            planName: selectedPlan.name,
            planInterval: selectedPlan.intervalLabel,
            amount: selectedPlan.amount,
            currency: currency,
            currencySymbol: config.currencySymbol,
            paymentMethod: 'Stripe International',
          };
          setReceiptData(receipt);
          setReceiptModalOpen(true);
          if (onPaymentSuccess) {
            onPaymentSuccess(actRes.message);
          }
        }
      } else {
        setErrorMessage(res.error || 'Unable to connect to payment provider.');
        const receipt: PaymentReceiptData = {
          status: 'failed',
          transactionId: 'STRIPE_FAIL_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
          date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          customerName: authState.user?.user_metadata?.full_name || 'Valued Candidate',
          customerEmail: authState.user?.email || 'candidate@resumora.app',
          planName: selectedPlan.name,
          planInterval: selectedPlan.intervalLabel,
          amount: selectedPlan.amount,
          currency: currency,
          currencySymbol: config.currencySymbol,
          paymentMethod: 'Stripe International',
          errorMessage: res.error || 'Payment initialization declined.',
        };
        setReceiptData(receipt);
        setReceiptModalOpen(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const getHeadline = () => {
    switch (triggerReason) {
      case 'export_limit':
        return {
          title: 'You Have Used Your 1 Free Export',
          subtitle: 'Upgrade to download unlimited PDF & DOCX resumes without watermarks.',
          badge: 'Export Limit Reached',
        };
      case 'ai_limit':
        return {
          title: 'You Have Used All 10 Free AI Credits',
          subtitle: 'Upgrade to Resumora Pro to get 500 AI credits monthly or use your own API key.',
          badge: 'AI Credits Exhausted',
        };
      case 'template_pro':
        return {
          title: 'Unlock Executive & Photo Templates',
          subtitle: 'Gain instant access to all 7 ATS-friendly and photo-supported resume layouts.',
          badge: 'Premium Template',
        };
      default:
        return {
          title: 'Land Your Dream Job Faster with Pro',
          subtitle: 'Unlimited exports, monthly AI credits, ATS keyword optimization, and premium templates.',
          badge: 'Resumora Pro',
        };
    }
  };

  const headline = getHeadline();

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="2xl">
      <div className="space-y-6 pt-1">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border border-[var(--color-brand)]/30 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{headline.badge}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {headline.title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-lg mx-auto leading-relaxed">
            {headline.subtitle}
          </p>
        </div>

        {/* Currency & Region Selector */}
        <div className="flex items-center justify-between bg-[var(--color-surface-raised)] p-2.5 rounded-[var(--radius-subtle)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-primary)]">
            <Globe className="w-4 h-4 text-[var(--color-brand)]" />
            <span>Billing Currency:</span>
          </div>

          <div className="inline-flex rounded-[var(--radius-subtle)] p-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-mono font-medium">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 rounded-[var(--radius-subtle)] transition-all cursor-pointer ${
                currency === 'INR'
                  ? 'bg-[var(--color-brand)] text-[var(--color-text-inverse)] font-bold shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              🇮🇳 INR (₹)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-[var(--radius-subtle)] transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[var(--color-brand)] text-[var(--color-text-inverse)] font-bold shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              🌐 USD ($)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid (3 Options) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Job Seeker Pass (14 Days) */}
          {(() => {
            const isActive = exportStats.isPro && exportStats.plan === 'pass';
            return (
              <div
                onClick={() => setSelectedInterval('pass')}
                className={`p-4 rounded-[var(--radius-subtle)] border transition-all duration-150 cursor-pointer flex flex-col justify-between select-none relative ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500 shadow-sm'
                    : selectedInterval === 'pass'
                    ? 'bg-[var(--color-brand-subtle)] border-[var(--color-brand)] ring-2 ring-[var(--color-brand)] shadow-md'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {config.plans.pass.name}
                    </span>
                    {isActive ? (
                      <Badge variant="success" className="text-[10px]">
                        Current Plan
                      </Badge>
                    ) : config.plans.pass.badge ? (
                      <Badge variant="default" className="text-[10px]">
                        {config.plans.pass.badge}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">
                        {config.currencySymbol}
                        {config.plans.pass.amount}
                      </span>
                      {config.plans.pass.originalAmount && (
                        <span className="text-xs line-through text-[var(--color-text-tertiary)] font-mono">
                          {config.currencySymbol}
                          {config.plans.pass.originalAmount}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Single payment · 14 days</span>
                  </div>

                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mb-3">
                    {config.plans.pass.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--color-brand)]">
                  <span>{isActive ? 'Active Plan' : 'Select Pass'}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : selectedInterval === 'pass'
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-text-inverse)]'
                        : 'border-[var(--color-border)]'
                    }`}
                  >
                    {(isActive || selectedInterval === 'pass') && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. Pro Monthly */}
          {(() => {
            const isActive = exportStats.isPro && (exportStats.plan === 'pro' || (exportStats.plan as string) === 'monthly');
            return (
              <div
                onClick={() => setSelectedInterval('monthly')}
                className={`p-4 rounded-[var(--radius-subtle)] border transition-all duration-150 cursor-pointer flex flex-col justify-between select-none relative ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500 shadow-sm'
                    : selectedInterval === 'monthly'
                    ? 'bg-[var(--color-brand-subtle)] border-[var(--color-brand)] ring-2 ring-[var(--color-brand)] shadow-md'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {config.plans.monthly.name}
                    </span>
                    {isActive ? (
                      <Badge variant="success" className="text-[10px]">
                        Current Plan
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px]">
                        {config.plans.monthly.badge}
                      </Badge>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">
                        {config.currencySymbol}
                        {config.plans.monthly.amount}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)] font-mono">/ mo</span>
                      {config.plans.monthly.originalAmount && (
                        <span className="text-xs line-through text-[var(--color-text-tertiary)] font-mono ml-1">
                          {config.currencySymbol}
                          {config.plans.monthly.originalAmount}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Billed monthly · Cancel anytime</span>
                  </div>

                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mb-3">
                    {config.plans.monthly.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--color-brand)]">
                  <span>{isActive ? 'Active Plan' : 'Select Monthly'}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : selectedInterval === 'monthly'
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-text-inverse)]'
                        : 'border-[var(--color-border)]'
                    }`}
                  >
                    {(isActive || selectedInterval === 'monthly') && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 3. Pro Annual */}
          {(() => {
            const isActive = exportStats.isPro && exportStats.plan === 'annual';
            return (
              <div
                onClick={() => setSelectedInterval('annual')}
                className={`p-4 rounded-[var(--radius-subtle)] border transition-all duration-150 cursor-pointer flex flex-col justify-between select-none relative ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500 shadow-sm'
                    : selectedInterval === 'annual'
                    ? 'bg-[var(--color-brand-subtle)] border-[var(--color-brand)] ring-2 ring-[var(--color-brand)] shadow-md'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {config.plans.annual.name}
                    </span>
                    {isActive ? (
                      <Badge variant="success" className="text-[10px]">
                        Current Plan
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px]">
                        {config.plans.annual.badge}
                      </Badge>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">
                        {config.currencySymbol}
                        {config.plans.annual.amount}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)] font-mono">/ yr</span>
                    </div>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">
                      {config.plans.annual.intervalLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mb-3">
                    {config.plans.annual.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--color-brand)]">
                  <span>{isActive ? 'Active Plan' : 'Select Annual'}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : selectedInterval === 'annual'
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-text-inverse)]'
                        : 'border-[var(--color-border)]'
                    }`}
                  >
                    {(isActive || selectedInterval === 'annual') && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Feature Comparison Box */}
        <Card variant="surface" padding="sm" className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2 font-mono">
            Included in {selectedPlan.name}:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--color-text-primary)]">
            {selectedPlan.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Accepted Payment Methods (India & Global) */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-text-secondary)] px-1">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-[var(--color-success)]" />
            <span>256-Bit SSL Encrypted via Razorpay &amp; Stripe</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-[var(--color-text-tertiary)]">
            {config.acceptedMethods.join(' • ')}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/40 rounded-[var(--radius-subtle)] text-xs text-[var(--color-danger)] font-medium">
            {errorMessage}
          </div>
        )}

        {/* Account Tracking Verification */}
        {authState.isConfigured && (
          <div className="px-1 py-2 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] text-xs">
            {authState.user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--color-success)] font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Linked Account: <strong>{authState.user.email}</strong></span>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text-primary)]">Google Account Required</span>
                  <Badge variant="warning">Not Signed In</Badge>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Sign in with Google before paying so your Pro subscription, invoices, and unlimited downloads are permanently linked to your email across all devices.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoogleSignIn}
                  isLoading={signingIn}
                  className="w-full font-bold justify-center"
                >
                  Sign In with Google to Continue →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* CTA & Checkout Actions */}
        <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
          <Button
            variant={isSelectedPlanActive ? 'outline' : 'primary'}
            size="lg"
            onClick={handleCheckout}
            isLoading={loading}
            disabled={
              (!import.meta.env.DEV && authState.isConfigured && !authState.user) ||
              isSelectedPlanActive
            }
            rightIcon={isSelectedPlanActive ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            className="w-full text-sm font-bold uppercase tracking-wider py-3.5 shadow-md disabled:opacity-60"
          >
            {!import.meta.env.DEV && authState.isConfigured && !authState.user
              ? 'Please Sign In with Google Above'
              : isSelectedPlanActive
              ? `Current Plan (Active) ✓`
              : exportStats.isPro
              ? `Switch Plan to ${selectedPlan.name} (${config.currencySymbol}${selectedPlan.amount}) →`
              : currency === 'INR'
              ? `Pay ${config.currencySymbol}${selectedPlan.amount} via UPI / Cards`
              : `Upgrade to ${selectedPlan.name} (${config.currencySymbol}${selectedPlan.amount}) →`}
          </Button>

          {isSelectedPlanActive && (
            <p className="text-center text-[11px] text-[var(--color-text-secondary)]">
              You are currently on the {selectedPlan.name}. Select another plan above to switch or upgrade.
            </p>
          )}

          {/* BYOK Alternative Option */}
          {onOpenBYOKSettings && (
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenBYOKSettings();
                }}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] inline-flex items-center gap-1.5 cursor-pointer underline transition-colors"
              >
                <Key className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Have an API Key? Connect your Gemini/OpenAI key for free AI</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>

    {/* Printable Tax & Payment Confirmation Invoice Modal */}
    <PaymentReceiptModal
      isOpen={receiptModalOpen}
      onClose={() => {
        setReceiptModalOpen(false);
        if (receiptData?.status === 'success') {
          onClose();
        }
      }}
      receiptData={receiptData}
      onRetry={() => {
        setReceiptModalOpen(false);
        handleCheckout();
      }}
      onContinueToBuilder={() => {
        setReceiptModalOpen(false);
        onClose();
      }}
    />
    </>
  );
};
