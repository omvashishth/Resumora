/**
 * Resumora Export Limits & Monetization Entitlement Manager
 * Enforces the 1 Free Export trial policy for non-paying users.
 * Unlocks unlimited exports for Pro Monthly, Pro Annual, and Job Seeker Pass holders.
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { getCurrentUser } from './authService';
import { antiAbuseManager } from './antiAbuseManager';

const STORAGE_KEYS = {
  EXPORT_COUNT: 'resumora_export_count',
  USER_PLAN: 'resumora_user_plan',
  PLAN_EXPIRY: 'resumora_plan_expiry',
  SECURITY_SIG: 'resumora_export_checksum',
};

export type UserPlanType = 'free' | 'pass' | 'pro' | 'annual';

export interface ExportEntitlementStats {
  plan: UserPlanType;
  isPro: boolean;
  exportCount: number;
  freeExportsAllowed: number;
  remainingFreeExports: number;
  canExport: boolean;
  expiresAt?: string;
}

type ExportLimitListener = (stats: ExportEntitlementStats) => void;

class ExportLimitManager {
  private listeners: Set<ExportLimitListener> = new Set();
  private inMemoryCount = 0;
  private inMemoryPlan: UserPlanType = 'free';
  private inMemoryExpiry?: string;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    try {
      const storedCount = localStorage.getItem(STORAGE_KEYS.EXPORT_COUNT);
      const storedPlan = localStorage.getItem(STORAGE_KEYS.USER_PLAN) as UserPlanType;
      const storedExpiry = localStorage.getItem(STORAGE_KEYS.PLAN_EXPIRY);
      const abuseLock = localStorage.getItem('resumora_device_anti_abuse_lock');

      if (storedCount !== null) {
        this.inMemoryCount = parseInt(storedCount, 10) || 0;
      }
      if (abuseLock) {
        this.inMemoryCount = Math.max(this.inMemoryCount, parseInt(abuseLock, 10) || 0);
      }
      if (storedPlan) {
        this.inMemoryPlan = storedPlan;
      }
      if (storedExpiry) {
        this.inMemoryExpiry = storedExpiry;
      }

      // Check if temporary pass expired
      if (this.inMemoryPlan === 'pass' && this.inMemoryExpiry) {
        if (new Date(this.inMemoryExpiry).getTime() < Date.now()) {
          this.inMemoryPlan = 'free';
          localStorage.setItem(STORAGE_KEYS.USER_PLAN, 'free');
        }
      }
    } catch {
      // Storage unavailable
    }
  }

  public getStats(): ExportEntitlementStats {
    let plan = this.inMemoryPlan;
    let exportCount = this.inMemoryCount;
    let expiresAt = this.inMemoryExpiry;

    if (typeof window !== 'undefined') {
      try {
        const storedPlan = (localStorage.getItem(STORAGE_KEYS.USER_PLAN) as UserPlanType) || this.inMemoryPlan;
        const storedCount = parseInt(localStorage.getItem(STORAGE_KEYS.EXPORT_COUNT) || String(this.inMemoryCount), 10);
        const abuseLockCount = parseInt(localStorage.getItem('resumora_device_anti_abuse_lock') || '0', 10);
        const storedExpiry = localStorage.getItem(STORAGE_KEYS.PLAN_EXPIRY) || this.inMemoryExpiry;

        plan = storedPlan;
        exportCount = Math.max(isNaN(storedCount) ? 0 : storedCount, abuseLockCount);
        expiresAt = storedExpiry || undefined;
      } catch {
        // Fallback to in-memory
      }
    }

    const isPro = plan === 'pro' || plan === 'annual' || plan === 'pass';
    const freeExportsAllowed = 1;
    const remainingFreeExports = isPro ? 9999 : Math.max(0, freeExportsAllowed - exportCount);
    const canExport = isPro || exportCount < freeExportsAllowed;

    return {
      plan,
      isPro,
      exportCount,
      freeExportsAllowed,
      remainingFreeExports,
      canExport,
      expiresAt,
    };
  }

  public canExport(): boolean {
    return this.getStats().canExport;
  }

  /**
   * Increments the export counter and writes to IP & hardware registry.
   */
  public async recordExport(): Promise<void> {
    const current = this.getStats();
    const newCount = current.exportCount + 1;
    this.inMemoryCount = newCount;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.EXPORT_COUNT, String(newCount));
      } catch (err) {
        console.warn('Failed to persist export count:', err);
      }
    }

    // Record usage in IP & hardware anti-abuse database
    await antiAbuseManager.recordTrialUsage();

    // Sync export count to Supabase profile if signed in
    const client = getSupabaseClient();
    if (client) {
      try {
        const user = await getCurrentUser();
        if (user) {
          await client.from('profiles').update({ export_count: newCount }).eq('id', user.id);
        }
      } catch {
        // Non-blocking background sync
      }
    }

    this.notify();
  }

  /**
   * Sets the user plan after successful payment or checkout verification.
   */
  public async setPlan(plan: UserPlanType, durationDays?: number): Promise<void> {
    this.inMemoryPlan = plan;
    let expiryStr: string | undefined = undefined;

    if (durationDays) {
      const expDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      expiryStr = expDate.toISOString();
      this.inMemoryExpiry = expiryStr;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PLAN, plan);
        if (expiryStr) {
          localStorage.setItem(STORAGE_KEYS.PLAN_EXPIRY, expiryStr);
        } else {
          localStorage.removeItem(STORAGE_KEYS.PLAN_EXPIRY);
        }
      } catch (err) {
        console.warn('Failed to persist user plan:', err);
      }
    }

    // Sync to Supabase if authenticated
    const client = getSupabaseClient();
    if (client) {
      try {
        const user = await getCurrentUser();
        if (user) {
          await client.from('profiles').update({
            plan,
            plan_expires_at: expiryStr || null,
          }).eq('id', user.id);
        }
      } catch {
        // Background sync
      }
    }

    this.notify();
  }

  public resetToFree(): void {
    this.inMemoryPlan = 'free';
    this.inMemoryExpiry = undefined;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PLAN, 'free');
        localStorage.removeItem(STORAGE_KEYS.PLAN_EXPIRY);
      } catch {}
    }
    this.notify();
  }

  /**
   * Authoritative backend verification against Supabase database.
   * If user is null (logged out), immediately revokes Pro entitlements.
   */
  public async syncWithBackendUser(user: any | null): Promise<void> {
    if (!user) {
      this.resetToFree();
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    try {
      const { data, error } = await client
        .from('profiles')
        .select('plan, plan_expires_at, export_count')
        .eq('id', user.id)
        .maybeSingle();

      if (data && !error) {
        let plan: UserPlanType = (data.plan as UserPlanType) || 'free';
        let expiry = data.plan_expires_at;

        // Verify expiry
        if (plan === 'pass' && expiry) {
          if (new Date(expiry).getTime() < Date.now()) {
            plan = 'free';
          }
        }

        this.inMemoryPlan = plan;
        this.inMemoryExpiry = expiry || undefined;
        if (typeof data.export_count === 'number') {
          this.inMemoryCount = data.export_count;
        }

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEYS.USER_PLAN, plan);
            if (expiry) {
              localStorage.setItem(STORAGE_KEYS.PLAN_EXPIRY, expiry);
            } else {
              localStorage.removeItem(STORAGE_KEYS.PLAN_EXPIRY);
            }
            if (typeof data.export_count === 'number') {
              localStorage.setItem(STORAGE_KEYS.EXPORT_COUNT, String(data.export_count));
            }
          } catch {}
        }
        this.notify();
      } else {
        this.resetToFree();
      }
    } catch (err) {
      console.warn('Backend entitlement check warning:', err);
    }
  }

  public resetForTesting(): void {
    this.inMemoryCount = 0;
    this.inMemoryPlan = 'free';
    this.inMemoryExpiry = undefined;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.EXPORT_COUNT);
        localStorage.removeItem(STORAGE_KEYS.USER_PLAN);
        localStorage.removeItem(STORAGE_KEYS.PLAN_EXPIRY);
      } catch {
        // Storage clean
      }
    }
    this.notify();
  }

  public subscribe(listener: ExportLimitListener): () => void {
    this.listeners.add(listener);
    listener(this.getStats());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const stats = this.getStats();
    this.listeners.forEach((l) => l(stats));
  }
}

export const exportLimitManager = new ExportLimitManager();
