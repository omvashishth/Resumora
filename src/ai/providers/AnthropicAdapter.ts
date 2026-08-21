/**
 * Anthropic Claude Provider Adapter (REST API Implementation)
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

export class AnthropicAdapter extends BaseProvider {
  public readonly id: AIProviderId = 'anthropic';
  public readonly name = 'Anthropic Claude (3.5 Sonnet/Haiku)';
  public readonly supportedModels = ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022'];

  public isConfigured(options?: AIRequestOptions): boolean {
    if (options?.apiKey || options?.proxyUrl) return true;
    try {
      return Boolean(import.meta.env?.VITE_ANTHROPIC_API_KEY || import.meta.env?.VITE_AI_API_KEY || import.meta.env?.VITE_AI_PROXY_URL);
    } catch {
      return false;
    }
  }

  private getApiKey(options?: AIRequestOptions): string {
    const key =
      options?.apiKey ||
      (import.meta.env?.VITE_ANTHROPIC_API_KEY as string) ||
      (import.meta.env?.VITE_AI_API_KEY as string);
    if (!key) throw AIError.notConfigured(this.name);
    return key;
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
      const model = options?.model || 'claude-3-5-haiku-20241022';

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Ping test' }],
          max_tokens: 5,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData?.error?.message || `HTTP ${res.status}`;
        return {
          success: false,
          error: AIError.providerUnavailable(this.name, msg),
        };
      }

      return {
        success: true,
        data: {
          success: true,
          message: `${this.name} connected successfully.`,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: AIError.providerUnavailable(this.name, err?.message || 'Connection failed'),
      };
    }
  }

  public async generateSummary(
    input: SummaryPromptInput,
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<string[]>> {
    const userPrompt = buildSummaryUserPrompt(input);
    const text = await this.callAnthropic(SUMMARY_SYSTEM_PROMPT, userPrompt, options);
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
    const text = await this.callAnthropic(BULLET_SYSTEM_PROMPT, userPrompt, options);
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
    const result = await this.callAnthropic(REWRITE_SYSTEM_PROMPT, userPrompt, options);
    return {
      success: true,
      data: result,
    };
  }

  private async callAnthropic(
    systemPrompt: string,
    userPrompt: string,
    options?: AIRequestOptions
  ): Promise<string> {
    const apiKey = this.getApiKey(options);
    const model = options?.model || 'claude-3-5-haiku-20241022';

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true',
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: options?.maxTokens ?? 800,
        temperature: options?.temperature ?? 0.3,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw AIError.requestFailed(errJson?.error?.message || `Anthropic API returned status ${res.status}`);
    }

    const json = await res.json();
    const outputText = json?.content?.[0]?.text;
    if (!outputText || typeof outputText !== 'string') {
      throw AIError.invalidResponse('Anthropic API returned an empty text response.');
    }

    return outputText.trim();
  }
}
