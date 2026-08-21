/**
 * Verification Test Suite for AI Provider Foundation (Phase 3.1)
 */

import { aiService } from '../AIService';
import { consentManager } from '../privacy/consentManager';
import { AIErrorCode } from '../errors';

export async function runAIModuleVerification(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];
  log.push('Starting Phase 3.1 AI Provider Foundation Verification...');

  try {
    // 1. Initial State Check (No consent granted)
    log.push(`Initial AI Consent state: ${consentManager.hasAIConsent()}`);

    // 2. Unconsented Request Test (Should fail gracefully with AI_CONSENT_REQUIRED)
    const unconsentedRes = await aiService.generateSummary({});
    if (!unconsentedRes.success && unconsentedRes.error?.code === AIErrorCode.AI_CONSENT_REQUIRED) {
      log.push('✓ Test Passed: Unconsented request rejected with AI_CONSENT_REQUIRED.');
    } else {
      throw new Error('Failed: Unconsented request did not throw AI_CONSENT_REQUIRED.');
    }

    // 3. Grant Consent
    consentManager.grantAIConsent();
    log.push(`Granted AI Consent: ${consentManager.hasAIConsent()}`);

    // 4. Unconfigured Provider Request Test (Should fail gracefully with AI_NOT_CONFIGURED)
    const unconfiguredRes = await aiService.generateSummary({});
    if (!unconfiguredRes.success && unconfiguredRes.error?.code === AIErrorCode.AI_NOT_CONFIGURED) {
      log.push('✓ Test Passed: Unconfigured provider rejected with AI_NOT_CONFIGURED.');
    } else {
      throw new Error('Failed: Unconfigured provider did not return AI_NOT_CONFIGURED.');
    }

    // 5. Test Supported Method Error (Provide BYOK key so provider is configured, method should throw AI_UNSUPPORTED_OPERATION)
    const options = { apiKey: 'test_byok_key' };
    const unsupportedRes = await aiService.generateSummary({}, options);
    if (
      !unsupportedRes.success &&
      unsupportedRes.error?.code === AIErrorCode.AI_UNSUPPORTED_OPERATION
    ) {
      log.push('✓ Test Passed: Unimplemented operation threw AI_UNSUPPORTED_OPERATION cleanly without mock data.');
    } else {
      throw new Error('Failed: Operation did not return AI_UNSUPPORTED_OPERATION.');
    }

    // 6. Test Revoke Consent
    consentManager.revokeAIConsent();
    log.push(`Revoked AI Consent: ${consentManager.hasAIConsent()}`);

    log.push('ALL PHASE 3.1 AI ARCHITECTURE VERIFICATIONS PASSED 100%.');
    return { success: true, log };
  } catch (err: any) {
    log.push(`❌ Verification Error: ${err?.message || err}`);
    return { success: false, log };
  }
}
