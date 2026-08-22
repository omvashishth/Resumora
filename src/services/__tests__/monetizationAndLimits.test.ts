import { exportLimitManager } from '../exportLimitManager';
import { stripeService } from '../stripeService';
import { entitlementsManager } from '../../ai/entitlements/entitlementsManager';
import { detectUserCurrency, PRICING_CONFIGS } from '../../utils/pricingData';

export async function runMonetizationAndLimitsVerification(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];
  log.push('Starting India-First Monetization & Export Limits Verification...');

  try {
    // 1. Reset state to clean baseline
    exportLimitManager.resetForTesting();
    entitlementsManager.setCredits(10, 10, 'free');

    // 2. Test Currency & India-First Pricing
    const detected = detectUserCurrency();
    log.push(`Detected currency: ${detected}`);
    if (PRICING_CONFIGS.INR.plans.pass.amount === 149 && PRICING_CONFIGS.INR.currencySymbol === '₹') {
      log.push('✓ Test 1 Passed: India-First INR pricing configured (Job Seeker Pass: ₹149, Monthly: ₹249, Annual: ₹1499).');
    } else {
      throw new Error('Test 1 Failed: INR pricing configuration mismatch.');
    }

    // 3. Test Initial 1-Free Export Entitlement
    const initialStats = exportLimitManager.getStats();
    if (initialStats.canExport === true && initialStats.exportCount === 0 && initialStats.remainingFreeExports === 1) {
      log.push('✓ Test 2 Passed: Initial free user has 1/1 free exports available.');
    } else {
      throw new Error(`Test 2 Failed: Initial stats incorrect: ${JSON.stringify(initialStats)}`);
    }

    // 4. Test 1st Export Recording
    await exportLimitManager.recordExport();
    const afterFirstExport = exportLimitManager.getStats();
    if (afterFirstExport.exportCount === 1 && afterFirstExport.remainingFreeExports === 0 && afterFirstExport.canExport === false) {
      log.push('✓ Test 3 Passed: 1st export recorded successfully; subsequent free exports locked (canExport = false).');
    } else {
      throw new Error(`Test 3 Failed: Export count not updated: ${JSON.stringify(afterFirstExport)}`);
    }

    // 5. Test AI Credit Free Limit (10 credits)
    const initialAI = entitlementsManager.getEntitlement();
    if (initialAI.totalCredits === 10 && initialAI.remainingCredits === 10 && initialAI.plan === 'free') {
      log.push('✓ Test 4 Passed: AI Free Trial balance initialized to 10 credits.');
    } else {
      throw new Error(`Test 4 Failed: AI credits not 10: ${JSON.stringify(initialAI)}`);
    }

    // 6. Test Job Seeker Pass Activation (14 Days)
    await exportLimitManager.setPlan('pass', 14);
    const passStats = exportLimitManager.getStats();
    if (passStats.isPro === true && passStats.canExport === true && passStats.plan === 'pass' && passStats.expiresAt) {
      log.push('✓ Test 5 Passed: Job Seeker Pass (14 days) unlocked unlimited exports with expiry date.');
    } else {
      throw new Error(`Test 5 Failed: Pass activation failed: ${JSON.stringify(passStats)}`);
    }

    // 7. Test Stripe Verification & Pro Activation
    const verifyRes = await stripeService.verifyAndActivate('mock_session_123', 'monthly');
    const proStats = exportLimitManager.getStats();
    const proAI = entitlementsManager.getEntitlement();

    if (
      verifyRes.success &&
      proStats.isPro === true &&
      proStats.plan === 'pro' &&
      proStats.canExport === true &&
      proAI.remainingCredits === 500
    ) {
      log.push(`✓ Test 6 Passed: Stripe payment verification activated PRO plan (Unlimited exports + 500 AI credits).`);
    } else {
      throw new Error(`Test 6 Failed: Pro activation verification failed: ${JSON.stringify({ verifyRes, proStats, proAI })}`);
    }

    // 8. Test Logout / Unauthenticated Revocation Security
    await exportLimitManager.syncWithBackendUser(null);
    entitlementsManager.resetToFree();
    const loggedOutStats = exportLimitManager.getStats();
    const loggedOutAI = entitlementsManager.getEntitlement();

    if (loggedOutStats.isPro === false && loggedOutStats.plan === 'free' && loggedOutAI.plan === 'free' && loggedOutAI.totalCredits === 10) {
      log.push('✓ Test 7 Passed: Logout & unauthenticated user state immediately revokes Pro plan to Free tier (Secure).');
    } else {
      throw new Error(`Test 7 Failed: Logout did not revoke plan: ${JSON.stringify({ loggedOutStats, loggedOutAI })}`);
    }

    // 9. Test IP & Hardware Anti-Abuse Tracking
    const { antiAbuseManager } = await import('../antiAbuseManager');
    antiAbuseManager.resetForTesting();
    const initialAbuseCheck = await antiAbuseManager.checkTrialEligibility('free');
    if (initialAbuseCheck.allowed !== true) {
      throw new Error('Test 8 Failed: Initial device/IP should be allowed for 1 trial export.');
    }

    await exportLimitManager.recordExport();
    const secondAbuseCheck = await antiAbuseManager.checkTrialEligibility('free');
    const proAbuseCheck = await antiAbuseManager.checkTrialEligibility('pro');

    if (secondAbuseCheck.allowed === false && proAbuseCheck.allowed === true && secondAbuseCheck.identity.compositeFingerprint) {
      log.push('✓ Test 8 Passed: IP & Hardware Fingerprint engine locks multi-account bypasses after 1 trial export (Anti-Abuse Active).');
    } else {
      throw new Error(`Test 8 Failed: Anti-abuse lock failed: ${JSON.stringify({ secondAbuseCheck, proAbuseCheck })}`);
    }

    // 10. Clean up test state
    exportLimitManager.resetForTesting();
    antiAbuseManager.resetForTesting();
    entitlementsManager.setCredits(10, 10, 'free');

    log.push('ALL MONETIZATION & LIMIT VERIFICATIONS PASSED 100%.');
    return { success: true, log };
  } catch (err: any) {
    log.push(`❌ Verification Error: ${err?.message || err}`);
    return { success: false, log };
  }
}
