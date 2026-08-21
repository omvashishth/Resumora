/**
 * Local / Self-Hosted LLM Provider Adapter (Ollama / Local REST API)
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

export class LocalAdapter extends BaseProvider {
  public readonly id: AIProviderId = 'local';
  public readonly name = 'Local LLM (Ollama / WebLLM)';
  public readonly supportedModels = ['llama3.2', 'mistral', 'phi3'];

  public isConfigured(_options?: AIRequestOptions): boolean {
    return true; // Local adapter defaults to accessible local server
  }

  private getEndpoint(options?: AIRequestOptions): string {
    return options?.proxyUrl || import.meta.env?.VITE_LOCAL_LLM_URL || 'http://localhost:11434/api/generate';
  }

  public async testConnection(
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<{ success: boolean; message: string }>> {
    const endpoint = this.getEndpoint(options);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options?.model || 'llama3.2',
          prompt: 'ping',
          stream: false,
        }),
      });

      if (!res.ok) {
        return {
          success: false,
          error: AIError.providerUnavailable(this.name, `Ollama returned HTTP ${res.status}`),
        };
      }

      return {
        success: true,
        data: {
          success: true,
          message: `${this.name} connected at ${endpoint}.`,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: AIError.providerUnavailable(
          this.name,
          `Could not connect to Ollama at ${endpoint}. Make sure Ollama is running locally.`
        ),
      };
    }
  }

  public async generateSummary(
    input: SummaryPromptInput,
    options?: AIRequestOptions
  ): Promise<AIServiceResponse<string[]>> {
    const userPrompt = buildSummaryUserPrompt(input);
    const text = await this.callLocalAPI(SUMMARY_SYSTEM_PROMPT, userPrompt, options);
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
    const text = await this.callLocalAPI(BULLET_SYSTEM_PROMPT, userPrompt, options);
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
    const result = await this.callLocalAPI(REWRITE_SYSTEM_PROMPT, userPrompt, options);
    return {
      success: true,
      data: result,
    };
  }

  private async callLocalAPI(
    systemPrompt: string,
    userPrompt: string,
    options?: AIRequestOptions
  ): Promise<string> {
    const endpoint = this.getEndpoint(options);
    const model = options?.model || 'llama3.2';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw AIError.requestFailed(`Local LLM server returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const outputText = json?.response;
    if (!outputText || typeof outputText !== 'string') {
      throw AIError.invalidResponse('Local LLM server returned an empty response.');
    }

    return outputText.trim();
  }
}
