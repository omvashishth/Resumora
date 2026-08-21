/**
 * Google Gemini Provider Adapter (REST API Implementation)
 */

import { BaseProvider } from './BaseProvider';
import { AIError } from '../errors';
import { SUMMARY_SYSTEM_PROMPT, buildSummaryUserPrompt } from '../prompts/summaryPrompts';
import { BULLET_SYSTEM_PROMPT, buildBulletUserPrompt } from '../prompts/bulletPrompts';
import { REWRITE_SYSTEM_PROMPT, buildRewriteUserPrompt } from '../prompts/rewritePrompts';
import type {
  AIProviderId,
  AIRequestOptions,
  AIServiceResponse,
  SummaryPromptInput,
  BulletPromptInput,
} from '../types';

export class GeminiAdapter extends BaseProvider {
  public readonly id: AIProviderId = 'gemini';
  public readonly name = 'Google Gemini';
  public readonly supportedModels = ['gemini-3.6-flash', 'gemini-1.0-pro'];

  public isConfigured(options?: AIRequestOptions): boolean {
    if (options?.apiKey || options?.proxyUrl) return true;
    try {
      return Boolean(import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.VITE_AI_API_KEY || import.meta.env?.VITE_AI_PROXY_URL);
    } catch {
      return false;
    }
  }

  private getApiKey(options?: AIRequestOptions): string {
    const key =
      options?.apiKey ||
      (import.meta.env?.VITE_GEMINI_API_KEY as string) ||
      (import.meta.env?.VITE_AI_API_KEY as string);
    if (!key) throw AIError.notConfigured(this.name);
    return key;
  }

  private extractErrorMessage(errorJson: any, status: number): string {
    if (errorJson?.error?.message) {
      return errorJson.error.message;
    }
    if (errorJson?.error?.status) {
      return `Gemini API Error: ${errorJson.error.status}`;
    }
    if (status === 400) return 'HTTP 400 Invalid request or API key format.';
    if (status === 401 || status === 403) return 'HTTP 401/403 Authentication failed. Please check your Gemini API key.';
    if (status === 404) return 'HTTP 404 Model endpoint not found.';
    if (status === 429) return 'HTTP 429 Rate limit / Quota exceeded.';
    return `HTTP ${status} Request failed.`;
  }

  public async testConnection(
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<{ success: boolean; message: string }>> {
    if (!this.isConfigured(options)) {
      return {
        success: false,
        error: AIError.notConfigured(this.name),
      };
    }

    try {
      const apiKey = this.getApiKey(options);
      const model = options?.model || 'gemini-3.6-flash';
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = this.extractErrorMessage(errorData, res.status);
        return {
          success: false,
          error: AIError.providerUnavailable(this.name, msg),
        };
      }

      return {
        success: true,
        data: {
          success: true,
          message: `${this.name} (${model}) connected successfully.`,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: AIError.providerUnavailable(this.name, err?.message || 'Connection network failure.'),
      };
    }
  }

  public async generateSummary(
    input: SummaryPromptInput,
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<string[]>> {
    const userPrompt = buildSummaryUserPrompt(input);
    const text = await this.callGeminiAPI(SUMMARY_SYSTEM_PROMPT, userPrompt, options);
    return {
      success: true,
      data: [text],
    };
  }

  public async improveBullet(
    input: BulletPromptInput,
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<string[]>> {
    const userPrompt = buildBulletUserPrompt(input);
    const text = await this.callGeminiAPI(BULLET_SYSTEM_PROMPT, userPrompt, options);
    return {
      success: true,
      data: [text],
    };
  }

  public async rewriteText(
    text: string,
    instruction: string,
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<string>> {
    const userPrompt = buildRewriteUserPrompt(text, instruction);
    const result = await this.callGeminiAPI(REWRITE_SYSTEM_PROMPT, userPrompt, options);
    return {
      success: true,
      data: result,
    };
  }

  private async callGeminiAPI(
    systemPrompt: string,
    userPrompt: string,
    options?: AIRequestOptions
  ): Promise<string> {
    const apiKey = this.getApiKey(options);
    const model = options?.model || 'gemini-3.6-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.3,
          maxOutputTokens: options?.maxTokens ?? 800,
        },
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = this.extractErrorMessage(errJson, res.status);
      throw AIError.requestFailed(msg);
    }

    const json = await res.json();
    const outputText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!outputText || typeof outputText !== 'string') {
      throw AIError.invalidResponse('Gemini API returned an empty text field.');
    }

    return outputText.trim();
  }
}
