/**
 * CVForge AI Managed Provider Adapter
 * Handles managed AI requests routed through CVForge proxy endpoint.
 * Zero user API keys required in browser.
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

export class CVForgeAIAdapter extends BaseProvider {
  public readonly id: AIProviderId = 'cvforge';
  public readonly name = 'Resumora AI (Managed Cloud Service)';
  public readonly supportedModels = ['cvforge-v1-fast', 'cvforge-v1-pro'];

  public isConfigured(_options?: AIRequestOptions): boolean {
    return true; // Managed service is enabled by default
  }

  private getEndpoint(options?: AIRequestOptions): string {
    return options?.proxyUrl || import.meta.env?.VITE_CVFORGE_AI_ENDPOINT || '/api/ai/v1';
  }

  public async testConnection(
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<{ success: boolean; message: string }>> {
    const endpoint = this.getEndpoint(options);
    try {
      // Minimal test request
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping' }),
      });

      if (!res.ok && res.status !== 404) {
        return {
          success: false,
          error: AIError.providerUnavailable(this.name, `CVForge AI endpoint returned status ${res.status}`),
        };
      }

      return {
        success: true,
        data: {
          success: true,
          message: `${this.name} connection test ready.`,
        },
      };
    } catch {
      // Local dev mode without backend running still reports ready status for entitlement checking
      return {
        success: true,
        data: {
          success: true,
          message: `${this.name} ready (Local dev mode).`,
        },
      };
    }
  }

  public async generateSummary(
    input: SummaryPromptInput,
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<string[]>> {
    const userPrompt = buildSummaryUserPrompt(input);
    const text = await this.callManagedEndpoint(SUMMARY_SYSTEM_PROMPT, userPrompt, options);
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
    const text = await this.callManagedEndpoint(BULLET_SYSTEM_PROMPT, userPrompt, options);
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
    const result = await this.callManagedEndpoint(REWRITE_SYSTEM_PROMPT, userPrompt, options);
    return {
      success: true,
      data: result,
    };
  }

  private async callManagedEndpoint(
    systemPrompt: string,
    userPrompt: string,
    options?: AIRequestOptions
  ): Promise<string> {
    const endpoint = this.getEndpoint(options);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          model: options?.model || 'cvforge-v1-fast',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.text && typeof json.text === 'string') {
          return json.text.trim();
        }
      }
    } catch {
      // Network/Endpoint unavailable fallback in client environment
    }

    throw AIError.providerUnavailable(this.name, 'Resumora backend server is not connected.');
  }
}
