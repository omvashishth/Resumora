/**
 * AI Provider Registry & Lazy Loader Factory
 * Dynamically imports provider modules on demand to maintain light initial bundle size.
 */

import type { IAIProvider, AIProviderId } from '../types';
import { AIError } from '../errors';

type ProviderLoader = () => Promise<IAIProvider>;

class ProviderRegistry {
  private loaders: Map<AIProviderId, ProviderLoader> = new Map();
  private instances: Map<AIProviderId, IAIProvider> = new Map();
  private activeProviderId: AIProviderId = 'cvforge';

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    // Lazy dynamic imports for provider modules
    this.loaders.set('cvforge', async () => {
      const { CVForgeAIAdapter } = await import('./CVForgeAIAdapter');
      return new CVForgeAIAdapter();
    });

    this.loaders.set('openai', async () => {
      const { OpenAIAdapter } = await import('./OpenAIAdapter');
      return new OpenAIAdapter();
    });

    this.loaders.set('gemini', async () => {
      const { GeminiAdapter } = await import('./GeminiAdapter');
      return new GeminiAdapter();
    });

    this.loaders.set('anthropic', async () => {
      const { AnthropicAdapter } = await import('./AnthropicAdapter');
      return new AnthropicAdapter();
    });

    this.loaders.set('local', async () => {
      const { LocalAdapter } = await import('./LocalAdapter');
      return new LocalAdapter();
    });
  }

  /**
   * Dynamically loads and returns a provider instance.
   */
  public async getProvider(id?: AIProviderId): Promise<IAIProvider> {
    const targetId = id || this.activeProviderId;
    if (this.instances.has(targetId)) {
      return this.instances.get(targetId)!;
    }

    const loader = this.loaders.get(targetId);
    if (!loader) {
      throw AIError.unsupportedOperation(`Provider '${targetId}' is not registered`);
    }

    const instance = await loader();
    this.instances.set(targetId, instance);
    return instance;
  }

  public setActiveProvider(id: AIProviderId): void {
    if (!this.loaders.has(id)) {
      throw AIError.unsupportedOperation(`Provider '${id}' is not registered`);
    }
    this.activeProviderId = id;
  }

  public getActiveProviderId(): AIProviderId {
    return this.activeProviderId;
  }

  public getRegisteredProviderIds(): AIProviderId[] {
    return Array.from(this.loaders.keys());
  }
}

export const providerRegistry = new ProviderRegistry();
