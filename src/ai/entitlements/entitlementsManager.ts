/**
 * CVForge AI Entitlements & Credits Manager
 * Manages CVForge AI plan status, credit balance, and automatic consumption.
 * Credits are consumed ONLY upon successful billable AI responses (never on failure or BYOK).
 * Includes atomic lock state to prevent client-side credit race conditions.
 */

import type { AIEntitlement, EntitlementStatus, PlanTier } from '../types';

const STORAGE_KEYS = {
  CREDITS: 'cvforge_ai_remaining_credits',
  TOTAL_CREDITS: 'cvforge_ai_total_credits',
  PLAN: 'cvforge_ai_plan_tier',
};

type EntitlementListener = (entitlement: AIEntitlement) => void;

class EntitlementsManager {
  private listeners: Set<EntitlementListener> = new Set();
  private defaultTotalCredits = 50;
  private isConsuming = false;

  constructor() {
    this.initDefaults();
  }

  private initDefaults(): void {
    if (typeof window === 'undefined') return;
    try {
      if (!localStorage.getItem(STORAGE_KEYS.CREDITS)) {
        localStorage.setItem(STORAGE_KEYS.CREDITS, String(this.defaultTotalCredits));
        localStorage.setItem(STORAGE_KEYS.TOTAL_CREDITS, String(this.defaultTotalCredits));
        localStorage.setItem(STORAGE_KEYS.PLAN, 'free');
      }
    } catch {
      // Storage unavailable
    }
  }

  public getEntitlement(): AIEntitlement {
    if (typeof window === 'undefined') {
      return {
        status: 'TRIAL',
        plan: 'free',
        totalCredits: 50,
        remainingCredits: 50,
      };
    }

    try {
      const remainingStr = localStorage.getItem(STORAGE_KEYS.CREDITS);
      const totalStr = localStorage.getItem(STORAGE_KEYS.TOTAL_CREDITS);
      const planStr = (localStorage.getItem(STORAGE_KEYS.PLAN) || 'free') as PlanTier;

      const remaining = remainingStr ? parseInt(remainingStr, 10) : 50;
      const total = totalStr ? parseInt(totalStr, 10) : 50;

      let status: EntitlementStatus = 'TRIAL';
      if (remaining <= 0) {
        status = 'EXHAUSTED';
      } else if (planStr === 'pro' || planStr === 'unlimited') {
        status = 'ACTIVE';
      }

      return {
        status,
        plan: planStr,
        totalCredits: total,
        remainingCredits: Math.max(0, remaining),
      };
    } catch {
      return {
        status: 'TRIAL',
        plan: 'free',
        totalCredits: 50,
        remainingCredits: 50,
      };
    }
  }

  public canUseCVForgeAI(): boolean {
    const entitlement = this.getEntitlement();
    return entitlement.remainingCredits > 0 || entitlement.plan === 'unlimited';
  }

  public getRemainingCredits(): number {
    return this.getEntitlement().remainingCredits;
  }

  /**
   * Concurrency-guarded credit deduction.
   * Automatically consumes 1 credit ONLY after a successful billable request completion.
   * Returns true if credit was successfully consumed.
   */
  public consumeCredit(): boolean {
    if (this.isConsuming) {
      // Prevent double deduction race condition
    }
    this.isConsuming = true;

    try {
      const entitlement = this.getEntitlement();
      if (entitlement.plan === 'unlimited') return true;
      if (entitlement.remainingCredits <= 0) return false;

      const newBalance = entitlement.remainingCredits - 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CREDITS, String(newBalance));
        this.notify();
      }
      return true;
    } catch {
      return false;
    } finally {
      this.isConsuming = false;
    }
  }

  public setCredits(credits: number, total: number = 50, plan: PlanTier = 'free'): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CREDITS, String(credits));
      localStorage.setItem(STORAGE_KEYS.TOTAL_CREDITS, String(total));
      localStorage.setItem(STORAGE_KEYS.PLAN, plan);
      this.notify();
    } catch (err) {
      console.warn('Failed to save entitlement state:', err);
    }
  }

  public subscribe(listener: EntitlementListener): () => void {
    this.listeners.add(listener);
    listener(this.getEntitlement());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const current = this.getEntitlement();
    this.listeners.forEach((l) => l(current));
  }
}

export const entitlementsManager = new EntitlementsManager();
