/**
 * Privacy & AI Consent Manager
 * Ensures no resume data is transmitted to external AI providers without explicit user consent.
 */

const AI_CONSENT_KEY = 'cvforge_ai_consent';

export type ConsentChangeListener = (hasConsent: boolean) => void;

class ConsentManager {
  private listeners: Set<ConsentChangeListener> = new Set();

  /**
   * Check if user has granted consent for AI data processing.
   * Default is false (strict local-first privacy).
   */
  public hasAIConsent(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      return window.localStorage.getItem(AI_CONSENT_KEY) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Explicitly grant user consent for AI services.
   */
  public grantAIConsent(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(AI_CONSENT_KEY, 'true');
        this.notifyListeners(true);
      }
    } catch (err) {
      console.warn('Unable to persist AI consent state:', err);
    }
  }

  /**
   * Revoke user consent for AI services.
   */
  public revokeAIConsent(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(AI_CONSENT_KEY);
        this.notifyListeners(false);
      }
    } catch (err) {
      console.warn('Unable to clear AI consent state:', err);
    }
  }

  /**
   * Subscribe to consent state changes.
   */
  public subscribe(listener: ConsentChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(hasConsent: boolean): void {
    this.listeners.forEach((listener) => {
      try {
        listener(hasConsent);
      } catch (err) {
        console.error('Error in consent listener:', err);
      }
    });
  }
}

export const consentManager = new ConsentManager();
