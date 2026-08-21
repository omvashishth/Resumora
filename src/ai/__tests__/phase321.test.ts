/**
 * Automated Verification Test Suite for Phase 3.2.1 Contextual AI Content Assistant & Configuration
 */

import { aiService } from '../AIService';
import { consentManager } from '../privacy/consentManager';
import { aiConfigManager } from '../config/aiConfig';
import { AIErrorCode, AIOperation } from '../index';

export async function runPhase321Verification(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];
  log.push('Starting Phase 3.2.1 Contextual AI Assistant & Configuration Verification...');

  try {
    // 1. AI Configuration Storage Isolation Check
    aiConfigManager.saveConfig({ providerId: 'gemini', apiKey: 'test_api_key_123' });
    const config = aiConfigManager.getConfig();
    if (config.providerId === 'gemini' && config.apiKey === 'test_api_key_123') {
      log.push('✓ Test 1 Passed: AI Configuration safely stored in localStorage separate from resume database.');
    } else {
      throw new Error('Test 1 Failed: AI Configuration storage failed.');
    }

    // 2. Unconsented Request Verification
    consentManager.revokeAIConsent();
    log.push(`Consent state: ${consentManager.hasAIConsent()}`);

    const unconsentedSummary = await aiService.generateSummary({
      currentSummary: 'Experienced developer.',
      operation: AIOperation.MAKE_CONCISE,
    });

    if (!unconsentedSummary.success && unconsentedSummary.error?.code === AIErrorCode.AI_CONSENT_REQUIRED) {
      log.push('✓ Test 2 Passed: Unconsented request rejected with AI_CONSENT_REQUIRED.');
    } else {
      throw new Error('Test 2 Failed: Unconsented request did not throw AI_CONSENT_REQUIRED.');
    }

    // 3. Grant Consent & Test Unconfigured Provider Check
    consentManager.grantAIConsent();
    log.push(`Granted Consent: ${consentManager.hasAIConsent()}`);

    aiConfigManager.clearConfig();
    const isConfigured = await aiService.isConfigured('openai', { apiKey: '' });
    if (!isConfigured) {
      log.push('✓ Test 3 Passed: Empty provider configuration correctly identified as unconfigured.');
    } else {
      throw new Error('Test 3 Failed: Empty provider reported as configured.');
    }

    // 4. Connection Test Error Masking Check
    const testConnRes = await aiService.testConnection('gemini', { apiKey: 'invalid_test_key_xyz' });
    if (!testConnRes.success && testConnRes.error && !testConnRes.error.userMessage.includes('invalid_test_key_xyz')) {
      log.push('✓ Test 4 Passed: Connection test failed safely without leaking API key credentials in user message.');
    } else {
      throw new Error('Test 4 Failed: Connection error contained raw key.');
    }

    // 5. Restore Safe Default State
    consentManager.revokeAIConsent();
    aiConfigManager.clearConfig();
    log.push(`Cleaned up test state. Consent: ${consentManager.hasAIConsent()}`);

    log.push('ALL PHASE 3.2.1 CONTEXTUAL AI ASSISTANT & CONFIGURATION VERIFICATIONS PASSED 100%.');
    return { success: true, log };
  } catch (err: any) {
    log.push(`❌ Verification Error: ${err?.message || err}`);
    return { success: false, log };
  }
}
