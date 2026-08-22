/**
 * AI Usage Logging Abstraction with Secret Sanitization
 */

import type { AIProviderId } from '../types';

export interface AIUsageRecord {
  id: string;
  timestamp: string; // ISO string
  provider: AIProviderId;
  model: string;
  operation: 'summary' | 'bullet' | 'rewrite' | 'skills' | 'analysis' | 'tailoring' | 'template';
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  success: boolean;
  resumeId?: string;
  errorMessage?: string;
}

export interface IAIUsageLogger {
  logUsage(record: Omit<AIUsageRecord, 'id' | 'timestamp'>): Promise<void>;
  getUsageHistory(limit?: number): Promise<AIUsageRecord[]>;
  clearHistory(): Promise<void>;
}

/**
 * Secret sanitizer helper preventing keys, tokens, and secrets from entering log history.
 */
export function sanitizeSecretString(text?: string): string | undefined {
  if (!text) return undefined;
  return text
    .replace(/(sk-[a-zA-Z0-9_-]{10,})/g, '[REDACTED_API_KEY]')
    .replace(/(AIzaSy[a-zA-Z0-9_-]{10,})/g, '[REDACTED_API_KEY]')
    .replace(/(bearer\s+[a-zA-Z0-9._-]{10,})/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/(key=[a-zA-Z0-9_-]{10,})/gi, 'key=[REDACTED_KEY]');
}

/**
 * Local in-memory / localStorage circular buffer logger (no database modifications required).
 */
export class LocalUsageLogger implements IAIUsageLogger {
  private readonly storageKey = 'cvforge_ai_usage_history';
  private readonly maxRecords = 50;
  private inMemoryLogs: AIUsageRecord[] = [];

  public async logUsage(record: Omit<AIUsageRecord, 'id' | 'timestamp'>): Promise<void> {
    const sanitizedError = sanitizeSecretString(record.errorMessage);

    const fullRecord: AIUsageRecord = {
      ...record,
      errorMessage: sanitizedError,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    try {
      this.inMemoryLogs.unshift(fullRecord);
      this.inMemoryLogs = this.inMemoryLogs.slice(0, this.maxRecords);

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.inMemoryLogs));
      }
    } catch (err) {
      console.warn('Failed to log AI usage:', err);
    }
  }

  public async getUsageHistory(limit?: number): Promise<AIUsageRecord[]> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          return limit ? parsed.slice(0, limit) : parsed;
        }
      }
      return limit ? this.inMemoryLogs.slice(0, limit) : this.inMemoryLogs;
    } catch {
      return limit ? this.inMemoryLogs.slice(0, limit) : this.inMemoryLogs;
    }
  }

  public async clearHistory(): Promise<void> {
    this.inMemoryLogs = [];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.storageKey);
      }
    } catch (err) {
      console.warn('Failed to clear AI usage history:', err);
    }
  }
}

export const defaultUsageLogger: IAIUsageLogger = new LocalUsageLogger();
