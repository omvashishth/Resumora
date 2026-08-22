/**
 * Resumora Anti-Abuse & Multi-Account Limit Enforcement Manager
 * Tracks IP Addresses and Device Fingerprints in Supabase Backend to prevent:
 * 1. Creating new Google accounts to get multiple free exports.
 * 2. Clearing browser cookies / local storage to reset free trial counters.
 * 3. Incognito session bypasses.
 */

import { getDeviceNetworkIdentity, DeviceNetworkIdentity } from './deviceFingerprint';
import { getSupabaseClient } from './supabaseClient';
import { getCurrentUser } from './authService';

const LOCAL_FINGERPRINT_LOCK_KEY = 'resumora_device_anti_abuse_lock';

export interface AbuseCheckResult {
  allowed: boolean;
  exportCount: number;
  maxFreeAllowed: number;
  reason?: 'limit_reached' | 'ip_restricted' | 'ok';
  identity: DeviceNetworkIdentity;
}

class AntiAbuseManager {
  private inMemoryExportCount: number = 0;

  constructor() {
    this.initLocalLock();
  }

  private initLocalLock() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(LOCAL_FINGERPRINT_LOCK_KEY);
      if (stored) {
        this.inMemoryExportCount = parseInt(stored, 10) || 0;
      }
    } catch {
      // Storage blocked
    }
  }

  /**
   * Evaluates if the current IP address and device are eligible for a free export.
   * If user has an active PRO subscription in Supabase, this check always passes.
   */
  public async checkTrialEligibility(userPlan: string = 'free'): Promise<AbuseCheckResult> {
    const isPro = userPlan === 'pro' || userPlan === 'annual' || userPlan === 'pass';
    const identity = await getDeviceNetworkIdentity();
    const maxFreeAllowed = 1;

    // Paid Pro users have unlimited access regardless of IP/device history
    if (isPro) {
      return {
        allowed: true,
        exportCount: this.inMemoryExportCount,
        maxFreeAllowed,
        reason: 'ok',
        identity,
      };
    }

    // 1. Check local device lock (catches standard resets)
    let localCount = this.inMemoryExportCount;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_FINGERPRINT_LOCK_KEY);
        if (stored) {
          localCount = Math.max(localCount, parseInt(stored, 10) || 0);
        }
      } catch {}
    }

    if (localCount >= maxFreeAllowed) {
      return {
        allowed: false,
        exportCount: localCount,
        maxFreeAllowed,
        reason: 'limit_reached',
        identity,
      };
    }

    // 2. Query Supabase backend for authoritative IP & hardware fingerprint record
    const client = getSupabaseClient();
    if (client) {
      try {
        // Query by IP Hash OR composite hardware fingerprint
        const { data, error } = await client
          .from('device_ip_records')
          .select('export_count, user_ids')
          .or(`ip_hash.eq.${identity.ipHash},composite_fingerprint.eq.${identity.compositeFingerprint}`)
          .maybeSingle();

        if (data && !error) {
          const dbExportCount = Number(data.export_count) || 0;
          if (dbExportCount >= maxFreeAllowed) {
            // Lock local storage to sync with database record
            this.setLocalLock(dbExportCount);
            return {
              allowed: false,
              exportCount: dbExportCount,
              maxFreeAllowed,
              reason: 'ip_restricted',
              identity,
            };
          }
        }
      } catch (err) {
        console.warn('Anti-abuse backend lookup fallback:', err);
      }
    }

    return {
      allowed: true,
      exportCount: localCount,
      maxFreeAllowed,
      reason: 'ok',
      identity,
    };
  }

  /**
   * Records a free trial export to both local device lock and Supabase backend IP registry.
   */
  public async recordTrialUsage(): Promise<void> {
    const identity = await getDeviceNetworkIdentity();
    const newCount = this.inMemoryExportCount + 1;
    this.inMemoryExportCount = newCount;
    this.setLocalLock(newCount);

    const client = getSupabaseClient();
    if (client) {
      try {
        const user = await getCurrentUser();
        const userId = user?.id || null;

        // Upsert record into device_ip_records in Supabase
        await client.from('device_ip_records').upsert(
          {
            ip_hash: identity.ipHash,
            device_fingerprint: identity.deviceFingerprint,
            composite_fingerprint: identity.compositeFingerprint,
            export_count: newCount,
            last_ip_sample: identity.ip.startsWith('local') ? 'local' : identity.ip.substring(0, 7) + '...',
            last_used_at: new Date().toISOString(),
            user_ids: userId ? [userId] : [],
          },
          {
            onConflict: 'composite_fingerprint',
          }
        );
      } catch (err) {
        console.warn('Non-blocking IP usage recording warning:', err);
      }
    }
  }

  private setLocalLock(count: number) {
    this.inMemoryExportCount = count;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_FINGERPRINT_LOCK_KEY, String(count));
      } catch {}
    }
  }

  public resetForTesting() {
    this.inMemoryExportCount = 0;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_FINGERPRINT_LOCK_KEY);
      } catch {}
    }
  }
}

export const antiAbuseManager = new AntiAbuseManager();
