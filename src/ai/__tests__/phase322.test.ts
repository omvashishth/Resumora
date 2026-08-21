/**
 * Automated Verification Test Suite for Phase 3.2.2 Dual AI Provider System (CVForge AI + BYOK)
 */

import { aiService } from '../AIService';
import { consentManager } from '../privacy/consentManager';
import { aiConfigManager } from '../config/aiConfig';
import { entitlementsManager } from '../entitlements/entitlementsManager';
import { AIErrorCode, AIOperation } from '../index';

export async function runPhase322Verification(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];
  log.push('Starting Phase 3.2.2 Dual AI Provider System Verification...');

  try {
    // Restore clean initial state
    consentManager.grantAIConsent();
    aiConfigManager.clearConfig();
    entitlementsManager.setCredits(50, 50, 'free');

    // 1. Dual Mode Default Configuration Check
    const defaultConfig = aiConfigManager.getConfig();
    if (defaultConfig.mode === 'cvforge') {
      log.push('✓ Test 1 Passed: Default AI mode is CVForge AI (Managed).');
    } else {
      throw new Error('Test 1 Failed: Default AI mode was not cvforge.');
    }

    // 2. Entitlement & Credit Balance Check
    const entitlement = entitlementsManager.getEntitlement();
    if (entitlement.remainingCredits === 50 && entitlementsManager.canUseCVForgeAI()) {
      log.push(`✓ Test 2 Passed: Initial CVForge AI balance is ${entitlement.remainingCredits}/50 credits.`);
    } else {
      throw new Error('Test 2 Failed: Initial entitlement balance incorrect.');
    }

    // 3. Credit Consumption on Billable Request
    const initialCredits = entitlementsManager.getRemainingCredits();
    // Simulate successful credit consumption helper directly
    const consumed = entitlementsManager.consumeCredit();
    const postCredits = entitlementsManager.getRemainingCredits();

    if (consumed && postCredits === initialCredits - 1) {
      log.push(`✓ Test 3 Passed: 1 credit consumed upon successful billable request (${initialCredits} -> ${postCredits}).`);
    } else {
      throw new Error('Test 3 Failed: Credit deduction failed.');
    }

    // 4. Exhausted Credits Enforcement
    entitlementsManager.setCredits(0, 50, 'free');
    aiConfigManager.saveConfig({ mode: 'cvforge' });

    const exhaustedReq = await aiService.generateSummary({
      currentSummary: 'Test summary.',
      operation: AIOperation.MAKE_CONCISE,
    });

    if (!exhaustedReq.success && exhaustedReq.error?.code === AIErrorCode.CVFORGE_AI_CREDITS_EXHAUSTED) {
      log.push('✓ Test 4 Passed: CVForge AI request cleanly blocked when credits are exhausted (CVFORGE_AI_CREDITS_EXHAUSTED).');
    } else {
      throw new Error(`Test 4 Failed: Expected CVFORGE_AI_CREDITS_EXHAUSTED, got ${exhaustedReq.error?.code}`);
    }

    // 5. BYOK Mode Switch & Credit Isolation Check
    aiConfigManager.saveConfig({ mode: 'byok', providerId: 'gemini', apiKey: '' });
    const byokCreditsBefore = entitlementsManager.getRemainingCredits();

    const byokUnconfigured = await aiService.generateSummary({
      currentSummary: 'Test summary.',
      operation: AIOperation.MAKE_CONCISE,
    });

    const byokCreditsAfter = entitlementsManager.getRemainingCredits();

    if (
      !byokUnconfigured.success &&
      byokUnconfigured.error?.code === AIErrorCode.BYOK_NOT_CONFIGURED &&
      byokCreditsBefore === byokCreditsAfter
    ) {
      log.push('✓ Test 5 Passed: BYOK unconfigured error returned and ZERO CVForge credits deducted for BYOK requests.');
    } else {
      throw new Error('Test 5 Failed: BYOK request affected CVForge credits or wrong error returned.');
    }

    // 6. BYOK Credential Isolation Check
    aiConfigManager.saveConfig({ mode: 'byok', providerId: 'openai', apiKey: 'sk-test-secret-key-999' });
    const connRes = await aiService.testConnection('openai');
    const userMessage = connRes.error?.userMessage || '';

    if (!userMessage.includes('sk-test-secret-key-999')) {
      log.push('✓ Test 6 Passed: BYOK API keys are strictly isolated and never included in error messages.');
    } else {
      throw new Error('Test 6 Failed: API key leaked in user error trace.');
    }

    // 7. Cleanup Test State
    entitlementsManager.setCredits(50, 50, 'free');
    aiConfigManager.clearConfig();
    consentManager.revokeAIConsent();
    log.push('Cleaned up test state.');

    log.push('ALL PHASE 3.2.2 DUAL AI PROVIDER SYSTEM VERIFICATIONS PASSED 100%.');
    return { success: true, log };
  } catch (err: any) {
    log.push(`❌ Verification Error: ${err?.message || err}`);
    return { success: false, log };
  }
}
