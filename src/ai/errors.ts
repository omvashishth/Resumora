/**
 * CVForge AI Error Codes and Exception Handling Architecture
 */

export const AIErrorCode = {
  AI_NOT_CONFIGURED: 'AI_NOT_CONFIGURED',
  AI_PROVIDER_UNAVAILABLE: 'AI_PROVIDER_UNAVAILABLE',
  AI_CONSENT_REQUIRED: 'AI_CONSENT_REQUIRED',
  AI_REQUEST_FAILED: 'AI_REQUEST_FAILED',
  AI_INVALID_RESPONSE: 'AI_INVALID_RESPONSE',
  AI_UNSUPPORTED_OPERATION: 'AI_UNSUPPORTED_OPERATION',
  CVFORGE_AI_ENTITLEMENT_REQUIRED: 'CVFORGE_AI_ENTITLEMENT_REQUIRED',
  CVFORGE_AI_CREDITS_EXHAUSTED: 'CVFORGE_AI_CREDITS_EXHAUSTED',
  BYOK_NOT_CONFIGURED: 'BYOK_NOT_CONFIGURED',
  BYOK_INVALID: 'BYOK_INVALID',
} as const;

export type AIErrorCode = (typeof AIErrorCode)[keyof typeof AIErrorCode];

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly userMessage: string;
  public readonly details?: unknown;

  constructor(code: AIErrorCode, message: string, userMessage?: string, details?: unknown) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.userMessage = userMessage || message;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIError);
    }
  }

  public static notConfigured(providerName?: string): AIError {
    return new AIError(
      AIErrorCode.AI_NOT_CONFIGURED,
      `AI provider ${providerName || 'default'} is not configured.`,
      `AI assistance is currently not configured. Set an API key or proxy endpoint in Account Settings to enable AI features.`
    );
  }

  public static consentRequired(): AIError {
    return new AIError(
      AIErrorCode.AI_CONSENT_REQUIRED,
      'User consent required for AI processing.',
      'Explicit user consent is required before transmitting resume data to AI services.'
    );
  }

  public static providerUnavailable(providerName: string, reason?: string): AIError {
    const userMsg = reason
      ? `The AI service (${providerName}) returned an error: ${reason}`
      : `The AI service (${providerName}) is currently unavailable. Check your settings or network connection.`;
    return new AIError(
      AIErrorCode.AI_PROVIDER_UNAVAILABLE,
      `AI Provider ${providerName} is unavailable: ${reason || 'Connection failed'}`,
      userMsg
    );
  }

  public static unsupportedOperation(operationName: string): AIError {
    return new AIError(
      AIErrorCode.AI_UNSUPPORTED_OPERATION,
      `Operation '${operationName}' is not supported or not implemented.`,
      `The requested AI feature (${operationName}) is not available.`
    );
  }

  public static invalidResponse(details?: unknown): AIError {
    return new AIError(
      AIErrorCode.AI_INVALID_RESPONSE,
      'AI provider returned an invalid or unparseable response.',
      'Received an invalid response from the AI provider. Your resume content has not been modified.',
      details
    );
  }

  public static requestFailed(message: string, details?: unknown): AIError {
    return new AIError(
      AIErrorCode.AI_REQUEST_FAILED,
      `AI request failed: ${message}`,
      message ? `AI request failed: ${message}` : 'The AI request could not be completed. Please try again.',
      details
    );
  }

  public static creditsExhausted(remaining: number = 0): AIError {
    return new AIError(
      AIErrorCode.CVFORGE_AI_CREDITS_EXHAUSTED,
      `Resumora AI credits exhausted (${remaining} remaining).`,
      `You have used all your Resumora AI credits for this billing period. Switch to BYOK or upgrade your plan.`
    );
  }

  public static entitlementRequired(): AIError {
    return new AIError(
      AIErrorCode.CVFORGE_AI_ENTITLEMENT_REQUIRED,
      'Active Resumora AI entitlement required.',
      'Sign in or select a Resumora plan to use managed Resumora AI features.'
    );
  }

  public static byokNotConfigured(providerName: string): AIError {
    return new AIError(
      AIErrorCode.BYOK_NOT_CONFIGURED,
      `BYOK API key for ${providerName} is missing.`,
      `Enter your ${providerName} API key in Account → AI Settings to use BYOK mode.`
    );
  }
}
