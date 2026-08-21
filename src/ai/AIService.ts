/**
 * CVForge AIService Facade
 * Central entry point for all AI feature requests.
 * Transparently routes requests based on active mode ('cvforge' managed vs 'byok'),
 * enforces privacy consent, verifies entitlements, deducts credits on success,
 * sanitizes raw error traces, and logs usage.
 */

import { providerRegistry } from './providers/providerRegistry';
import { consentManager } from './privacy/consentManager';
import { entitlementsManager } from './entitlements/entitlementsManager';
import { defaultUsageLogger, IAIUsageLogger, sanitizeSecretString } from './usage/usageLogger';
import { ResponseValidator } from './validation/responseValidator';
import { aiConfigManager } from './config/aiConfig';
import { AIError } from './errors';
import type {
  AIProviderId,
  AIProviderMode,
  AIRequestOptions,
  AIServiceResponse,
  SummaryPromptInput,
  BulletPromptInput,
  SkillsSuggestionContext,
  ResumeAnalysisResult,
  JobDescriptionData,
  JobTailoringResult,
  TemplateAnalysisResult,
  IAIProvider,
} from './types';
import type { Resume } from '../types/resume';

export class AIService {
  private usageLogger: IAIUsageLogger = defaultUsageLogger;

  /**
   * Configure custom usage logger if needed.
   */
  public setUsageLogger(logger: IAIUsageLogger): void {
    this.usageLogger = logger;
  }

  /**
   * Set active AI provider mode ('cvforge' | 'byok').
   */
  public setMode(mode: AIProviderMode): void {
    aiConfigManager.saveConfig({ mode });
  }

  /**
   * Get active AI provider mode.
   */
  public getMode(): AIProviderMode {
    return aiConfigManager.getConfig().mode;
  }

  /**
   * Set active BYOK provider ID (e.g., 'gemini', 'openai', 'anthropic', 'local').
   */
  public setActiveProvider(providerId: AIProviderId): void {
    providerRegistry.setActiveProvider(providerId);
    aiConfigManager.saveConfig({ providerId });
  }

  /**
   * Remove stored key for a specific provider.
   */
  public removeProviderKey(providerId: AIProviderId): void {
    aiConfigManager.removeKey(providerId);
  }

  /**
   * Get active provider ID based on mode.
   */
  public getActiveProviderId(): AIProviderId {
    const config = aiConfigManager.getConfig();
    if (config.mode === 'cvforge') return 'cvforge';
    return config.providerId || 'gemini';
  }

  /**
   * Merges user-saved configuration with runtime options.
   */
  private getMergedOptions(targetProviderId?: AIProviderId, options?: AIRequestOptions): AIRequestOptions {
    const config = aiConfigManager.getConfig(targetProviderId);
    return {
      apiKey: options?.apiKey || config.apiKey,
      proxyUrl: options?.proxyUrl || config.proxyUrl,
      model: options?.model || config.model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      systemPrompt: options?.systemPrompt,
    };
  }

  /**
   * Privacy Consent Verification Helper
   */
  private verifyConsent(): void {
    if (!consentManager.hasAIConsent()) {
      throw AIError.consentRequired();
    }
  }

  /**
   * Resolves target provider & verifies entitlement / configuration.
   * Guarantees BYOK keys are STRIPPED when mode === 'cvforge'.
   */
  private async getVerifiedProvider(
    overrideProviderId?: AIProviderId,
    options?: AIRequestOptions
  ): Promise<{ provider: IAIProvider; mergedOptions: AIRequestOptions; mode: AIProviderMode }> {
    this.verifyConsent();
    const config = aiConfigManager.getConfig(overrideProviderId);
    const mode = config.mode;

    if (mode === 'cvforge' && !overrideProviderId) {
      if (!entitlementsManager.canUseCVForgeAI()) {
        throw AIError.creditsExhausted(entitlementsManager.getRemainingCredits());
      }
      const provider = await providerRegistry.getProvider('cvforge');
      // Strictly isolate: strip BYOK keys from managed proxy requests
      const cvforgeOptions: AIRequestOptions = {
        ...options,
        apiKey: undefined,
        proxyUrl: config.proxyUrl,
      };
      return { provider, mergedOptions: cvforgeOptions, mode: 'cvforge' };
    }

    // BYOK Mode
    const targetId = overrideProviderId || config.providerId || 'gemini';
    const provider = await providerRegistry.getProvider(targetId);
    const mergedOptions = this.getMergedOptions(targetId, options);

    if (!provider.isConfigured(mergedOptions)) {
      throw AIError.byokNotConfigured(provider.name);
    }
    return { provider, mergedOptions, mode: 'byok' };
  }

  /**
   * Post-Request Credit Handler: Deducts 1 credit ONLY after successful billable CVForge AI request.
   */
  private handleSuccessCredits(mode: AIProviderMode): void {
    if (mode === 'cvforge') {
      entitlementsManager.consumeCredit();
    }
  }

  /**
   * Test Connection Helper (Does not send resume data, strips keys in error messages)
   */
  public async testConnection(
    providerId?: AIProviderId,
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<{ success: boolean; message: string }>> {
    try {
      const config = aiConfigManager.getConfig(providerId);
      const targetId = providerId || (config.mode === 'cvforge' ? 'cvforge' : config.providerId || 'gemini');
      const provider = await providerRegistry.getProvider(targetId);

      const mergedOptions = config.mode === 'cvforge' && !providerId
        ? { apiKey: undefined, proxyUrl: config.proxyUrl }
        : this.getMergedOptions(targetId, options);

      const res = await provider.testConnection(mergedOptions);
      if (res.error) {
        res.error = this.sanitizeError(res.error);
      }
      return res;
    } catch (err: any) {
      const aiErr = err instanceof AIError ? err : AIError.providerUnavailable('Target AI Provider', err?.message);
      return {
        success: false,
        error: this.sanitizeError(aiErr),
      };
    }
  }

  /**
   * Check if current AI provider is configured.
   */
  public async isConfigured(providerId?: AIProviderId, options?: AIRequestOptions): Promise<boolean> {
    try {
      const config = aiConfigManager.getConfig(providerId);
      if (config.mode === 'cvforge' && !providerId) {
        return entitlementsManager.canUseCVForgeAI();
      }
      const targetId = providerId || config.providerId || 'gemini';
      const provider = await providerRegistry.getProvider(targetId);
      const mergedOptions = this.getMergedOptions(targetId, options);
      return provider.isConfigured(mergedOptions);
    } catch {
      return false;
    }
  }

  /**
   * Feature: Summary Generator
   */
  public async generateSummary(
    input: SummaryPromptInput,
    options?: AIRequestOptions,
    providerId?: AIProviderId
  ): Promise<AIServiceResponse<string[]>> {
    try {
      const { provider, mergedOptions, mode } = await this.getVerifiedProvider(providerId, options);
      const res = await provider.generateSummary(input, mergedOptions);
      if (res.success && res.data) {
        res.data = ResponseValidator.sanitizeArray(res.data);
        this.handleSuccessCredits(mode);
      }
      this.logSuccess('summary', provider.id, mergedOptions.model || provider.supportedModels[0], res.usage);
      return res;
    } catch (err) {
      return this.handleError('summary', providerId || this.getActiveProviderId(), err);
    }
  }

  /**
   * Feature: Bullet Point Improver
   */
  public async improveBullet(
    input: BulletPromptInput,
    options?: AIRequestOptions,
    providerId?: AIProviderId
  ): Promise<AIServiceResponse<string[]>> {
    try {
      const { provider, mergedOptions, mode } = await this.getVerifiedProvider(providerId, options);
      const res = await provider.improveBullet(input, mergedOptions);
      if (res.success && res.data) {
        res.data = ResponseValidator.sanitizeArray(res.data);
        this.handleSuccessCredits(mode);
      }
      this.logSuccess('bullet', provider.id, mergedOptions.model || provider.supportedModels[0], res.usage);
      return res;
    } catch (err) {
      return this.handleError('bullet', providerId || this.getActiveProviderId(), err);
    }
  }

  /**
   * Feature: Text Rewriter
   */
  public async rewriteText(
    text: string,
    instruction: string,
    options?: AIRequestOptions,
    providerId?: AIProviderId
  ): Promise<AIServiceResponse<string>> {
    try {
      const { provider, mergedOptions, mode } = await this.getVerifiedProvider(providerId, options);
      const res = await provider.rewriteText(text, instruction, mergedOptions);
      if (res.success && res.data) {
        res.data = ResponseValidator.sanitizeString(res.data);
        this.handleSuccessCredits(mode);
      }
      this.logSuccess('rewrite', provider.id, mergedOptions.model || provider.supportedModels[0], res.usage);
      return res;
    } catch (err) {
      return this.handleError('rewrite', providerId || this.getActiveProviderId(), err);
    }
  }

  /**
   * Feature: Skills Recommendation Engine
   */
  public async suggestSkills(
    context: SkillsSuggestionContext,
    options?: AIRequestOptions,
    providerId?: AIProviderId
  ): Promise<AIServiceResponse<string[]>> {
    try {
      const { provider, mergedOptions, mode } = await this.getVerifiedProvider(providerId, options);
      const res = await provider.suggestSkills(context, mergedOptions);
      if (res.success && res.data) {
        res.data = ResponseValidator.sanitizeArray(res.data);
        this.handleSuccessCredits(mode);
      }
      this.logSuccess('skills', provider.id, mergedOptions.model || provider.supportedModels[0], res.usage);
      return res;
    } catch (err) {
      return this.handleError('skills', providerId || this.getActiveProviderId(), err);
    }
  }

  /**
   * Feature: Resume Analysis Audit
   */
  public async analyzeResume(
    resume: Resume,
    options?: AIRequestOptions,
    providerId?: AIProviderId
  ): Promise<AIServiceResponse<ResumeAnalysisResult>> {
    try {
      const { provider, mergedOptions, mode } = await this.getVerifiedProvider(providerId, options);
      const res = await provider.analyzeResume(resume, mergedOptions);
      if (res.success) {
        this.handleSuccessCredits(mode);
      }
      this.logSuccess('analysis', provider.id, mergedOptions.model || provider.supportedModels[0], res.usage);
      return res;
    } catch (err) {
      return this.handleError('analysis', providerId || this.getActiveProviderId(), err);
    }
  }

  /**
   * Feature: Job Tailoring Analysis
   */
  public async tailorToJob(
    resume: Resume,
    jobDescription: JobDescriptionData,
    options?: AIRequestOptions,
    providerId?: AIProviderId
  ): Promise<AIServiceResponse<JobTailoringResult>> {
    try {
      const { provider, mergedOptions, mode } = await this.getVerifiedProvider(providerId, options);
      const res = await provider.tailorToJob(resume, jobDescription, mergedOptions);
      if (res.success) {
        this.handleSuccessCredits(mode);
      }
      this.logSuccess('tailoring', provider.id, mergedOptions.model || provider.supportedModels[0], res.usage);
      return res;
    } catch (err) {
      return this.handleError('tailoring', providerId || this.getActiveProviderId(), err);
    }
  }

  /**
   * Feature: Template Analysis & Extraction
   */
  public async analyzeTemplate(
    imageOrDocumentBlob: Blob,
    options?: AIRequestOptions,
    providerId?: AIProviderId
  ): Promise<AIServiceResponse<TemplateAnalysisResult>> {
    try {
      const { provider, mergedOptions, mode } = await this.getVerifiedProvider(providerId, options);
      const res = await provider.analyzeTemplate(imageOrDocumentBlob, mergedOptions);
      if (res.success) {
        this.handleSuccessCredits(mode);
      }
      this.logSuccess('template', provider.id, mergedOptions.model || provider.supportedModels[0], res.usage);
      return res;
    } catch (err) {
      return this.handleError('template', providerId || this.getActiveProviderId(), err);
    }
  }

  private sanitizeError(err: AIError): AIError {
    const sanitizedMsg = sanitizeSecretString(err.userMessage) || err.userMessage;
    return new AIError(err.code, err.message, sanitizedMsg, err.details);
  }

  private logSuccess(
    operation: 'summary' | 'bullet' | 'rewrite' | 'skills' | 'analysis' | 'tailoring' | 'template',
    provider: AIProviderId,
    model: string,
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  ): void {
    this.usageLogger.logUsage({
      provider,
      model: model || 'default',
      operation,
      promptTokens: usage?.promptTokens || 0,
      completionTokens: usage?.completionTokens || 0,
      totalTokens: usage?.totalTokens || 0,
      success: true,
    });
  }

  private handleError<T>(
    operation: 'summary' | 'bullet' | 'rewrite' | 'skills' | 'analysis' | 'tailoring' | 'template',
    provider: AIProviderId,
    err: unknown
  ): AIServiceResponse<T> {
    const rawAiError = err instanceof AIError ? err : AIError.requestFailed((err as Error)?.message || 'Unknown error');
    const aiError = this.sanitizeError(rawAiError);

    this.usageLogger.logUsage({
      provider,
      model: 'unknown',
      operation,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      success: false,
      errorMessage: aiError.userMessage,
    });
    return {
      success: false,
      error: aiError,
    };
  }
}

export const aiService = new AIService();
