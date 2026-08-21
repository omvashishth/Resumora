/**
 * CVForge AI Configuration Manager
 * Manages provider settings (active mode, active BYOK provider, per-provider API keys, proxy endpoints, model selection).
 * Stores user-configured keys safely isolated per provider in browser localStorage or sessionStorage (never in resume records).
 */

import type { AIProviderId, AIProviderMode } from '../types';

export type CredentialStorageType = 'persistent' | 'session';

export interface AIConfig {
  mode: AIProviderMode;
  providerId: AIProviderId;
  apiKey?: string;
  proxyUrl?: string;
  model?: string;
  storageType?: CredentialStorageType;
}

const STORAGE_KEYS = {
  MODE: 'cvforge_ai_mode',
  PROVIDER: 'cvforge_ai_provider',
  STORAGE_TYPE: 'cvforge_ai_storage_type',
  PROXY_URL: 'cvforge_ai_proxy_url',
  MODEL: 'cvforge_ai_model',
  BYOK_PREFIX: 'cvforge_ai_byok_',
};

class AIConfigManager {
  private inMemoryKeys: Map<AIProviderId, string> = new Map();

  private getProviderKeyStorageName(providerId: AIProviderId): string {
    return `${STORAGE_KEYS.BYOK_PREFIX}${providerId}`;
  }

  public getStorageType(): CredentialStorageType {
    if (typeof window === 'undefined') return 'persistent';
    try {
      const type = localStorage.getItem(STORAGE_KEYS.STORAGE_TYPE) as CredentialStorageType | null;
      return type === 'session' ? 'session' : 'persistent';
    } catch {
      return 'persistent';
    }
  }

  public setStorageType(type: CredentialStorageType): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.STORAGE_TYPE, type);
    } catch {
      // Storage unavailable
    }
  }

  /**
   * Get effective AI configuration for active mode and target provider.
   */
  public getConfig(targetProviderId?: AIProviderId): AIConfig {
    if (typeof window === 'undefined') {
      return { mode: 'cvforge', providerId: 'cvforge', storageType: 'persistent' };
    }

    let mode: AIProviderMode = 'cvforge';
    let providerId: AIProviderId = 'cvforge';
    let apiKey: string | undefined = undefined;
    let proxyUrl: string | undefined = undefined;
    let model: string | undefined = undefined;
    const storageType = this.getStorageType();

    try {
      const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) as AIProviderMode | null;
      if (savedMode && ['cvforge', 'byok'].includes(savedMode)) {
        mode = savedMode;
      }

      const savedProvider = localStorage.getItem(STORAGE_KEYS.PROVIDER) as AIProviderId | null;
      if (savedProvider && ['cvforge', 'openai', 'gemini', 'anthropic', 'local'].includes(savedProvider)) {
        providerId = savedProvider;
      } else if (mode === 'byok') {
        providerId = 'gemini';
      } else {
        providerId = 'cvforge';
      }

      const activePid = targetProviderId || (mode === 'byok' ? providerId : 'cvforge');

      // Retrieve key isolated by provider ID
      if (mode === 'byok') {
        apiKey = this.getProviderKey(activePid);

        // Fallback to environment variable for dev testing if no key saved
        if (!apiKey) {
          if (activePid === 'gemini' && import.meta.env?.VITE_GEMINI_API_KEY) {
            apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          } else if (activePid === 'openai' && import.meta.env?.VITE_OPENAI_API_KEY) {
            apiKey = import.meta.env.VITE_OPENAI_API_KEY;
          } else if (activePid === 'anthropic' && import.meta.env?.VITE_ANTHROPIC_API_KEY) {
            apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
          } else if (import.meta.env?.VITE_AI_API_KEY) {
            apiKey = import.meta.env.VITE_AI_API_KEY;
          }
        }
      }

      const savedProxy = localStorage.getItem(STORAGE_KEYS.PROXY_URL);
      if (savedProxy) {
        proxyUrl = savedProxy;
      } else if (import.meta.env?.VITE_AI_PROXY_URL || import.meta.env?.VITE_CVFORGE_AI_ENDPOINT) {
        proxyUrl = import.meta.env.VITE_AI_PROXY_URL || import.meta.env.VITE_CVFORGE_AI_ENDPOINT;
      }

      const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL);
      if (savedModel) {
        model = savedModel;
      }
    } catch {
      // Fallback on error
    }

    return {
      mode,
      providerId,
      apiKey,
      proxyUrl,
      model,
      storageType,
    };
  }

  /**
   * Reads per-provider key from memory, sessionStorage, or localStorage based on preference.
   */
  public getProviderKey(providerId: AIProviderId): string | undefined {
    if (this.inMemoryKeys.has(providerId)) {
      return this.inMemoryKeys.get(providerId);
    }

    if (typeof window === 'undefined') return undefined;

    const storageName = this.getProviderKeyStorageName(providerId);
    try {
      const sessionVal = sessionStorage.getItem(storageName);
      if (sessionVal) return sessionVal;

      const localVal = localStorage.getItem(storageName);
      if (localVal) return localVal;

      // Legacy single key fallback for backwards compatibility
      const legacyKey = localStorage.getItem('cvforge_ai_byok_key');
      if (legacyKey) return legacyKey;
    } catch {
      // Storage error
    }

    return undefined;
  }

  /**
   * Save configuration and provider-isolated key.
   */
  public saveConfig(config: Partial<AIConfig>): void {
    if (typeof window === 'undefined') return;

    try {
      if (config.storageType) {
        this.setStorageType(config.storageType);
      }

      if (config.mode) {
        localStorage.setItem(STORAGE_KEYS.MODE, config.mode);
      }

      if (config.providerId) {
        localStorage.setItem(STORAGE_KEYS.PROVIDER, config.providerId);
      }

      const activePid = config.providerId || this.getConfig().providerId;
      if (config.apiKey !== undefined && activePid) {
        this.saveProviderKey(activePid, config.apiKey);
      }

      if (config.proxyUrl !== undefined) {
        if (config.proxyUrl.trim()) {
          localStorage.setItem(STORAGE_KEYS.PROXY_URL, config.proxyUrl.trim());
        } else {
          localStorage.removeItem(STORAGE_KEYS.PROXY_URL);
        }
      }

      if (config.model !== undefined) {
        if (config.model.trim()) {
          localStorage.setItem(STORAGE_KEYS.MODEL, config.model.trim());
        } else {
          localStorage.removeItem(STORAGE_KEYS.MODEL);
        }
      }
    } catch (err) {
      console.warn('Failed to save AI configuration:', err);
    }
  }

  /**
   * Save provider key isolated to specific provider ID.
   */
  public saveProviderKey(providerId: AIProviderId, key: string): void {
    const trimmed = key.trim();
    const storageName = this.getProviderKeyStorageName(providerId);
    const storageType = this.getStorageType();

    if (!trimmed) {
      this.removeKey(providerId);
      return;
    }

    this.inMemoryKeys.set(providerId, trimmed);

    if (typeof window === 'undefined') return;

    try {
      if (storageType === 'session') {
        sessionStorage.setItem(storageName, trimmed);
        localStorage.removeItem(storageName);
      } else {
        localStorage.setItem(storageName, trimmed);
        sessionStorage.removeItem(storageName);
      }
    } catch {
      // Storage error
    }
  }

  /**
   * Remove specified provider credentials completely from persistent and session stores.
   */
  public removeKey(providerId: AIProviderId): void {
    this.inMemoryKeys.delete(providerId);

    if (typeof window === 'undefined') return;

    const storageName = this.getProviderKeyStorageName(providerId);
    try {
      localStorage.removeItem(storageName);
      sessionStorage.removeItem(storageName);
      localStorage.removeItem('cvforge_ai_byok_key'); // clear legacy key
    } catch {
      // Storage error
    }
  }

  /**
   * Clear all AI configurations & keys across memory, session, and persistent storage.
   */
  public clearConfig(): void {
    this.inMemoryKeys.clear();

    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.MODE);
      localStorage.removeItem(STORAGE_KEYS.PROVIDER);
      localStorage.removeItem(STORAGE_KEYS.PROXY_URL);
      localStorage.removeItem(STORAGE_KEYS.MODEL);
      localStorage.removeItem('cvforge_ai_byok_key');

      ['gemini', 'openai', 'anthropic', 'local', 'cvforge'].forEach((pid) => {
        const keyName = this.getProviderKeyStorageName(pid as AIProviderId);
        localStorage.removeItem(keyName);
        sessionStorage.removeItem(keyName);
      });
    } catch (err) {
      console.warn('Failed to clear AI config:', err);
    }
  }
}

export const aiConfigManager = new AIConfigManager();
