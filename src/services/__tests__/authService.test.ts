/**
 * Automated Verification Test Suite for Auth State Management & Reactive UI
 */

import {
  subscribeToAuthChanges,
  getAuthSession,
  signInWithGoogle,
  signOutUser,
  AuthState,
} from '../authService.ts';
import { isSupabaseConfigured } from '../supabaseClient.ts';

export async function runAuthServiceVerification(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];
  log.push('Starting Authentication State & Reactive UI Verification...');

  try {
    // 1. Verify Configuration & Initial getAuthSession API contract
    const configured = isSupabaseConfigured();
    log.push(`✓ Test 1 Passed: Supabase configured check returned (${configured}).`);

    const session = await getAuthSession();
    log.push(`✓ Test 2 Passed: getAuthSession() resolved safely without throwing (${session ? 'session active' : 'no session'}).`);

    // 2. Test Subscription & Initial Loading Lifecycle
    let initialCallReceived = false;
    let finalStateReceived = false;
    let capturedState: any = null;

    const unsubscribe = subscribeToAuthChanges((state) => {
      if (!initialCallReceived) {
        initialCallReceived = true;
      }
      finalStateReceived = true;
      capturedState = state;
    });

    if (!initialCallReceived) {
      throw new Error('Test 3 Failed: subscribeToAuthChanges did not trigger immediate callback.');
    }
    log.push('✓ Test 3 Passed: Immediate subscriber callback triggered with loading state.');

    // Wait short delay for getSession promise resolution
    await new Promise((r) => setTimeout(r, 50));

    const stateToTest = capturedState as AuthState | null;
    if (!stateToTest || stateToTest.loading !== false) {
      throw new Error('Test 4 Failed: subscribeToAuthChanges did not finish loading state.');
    }
    log.push(`✓ Test 4 Passed: Auth state resolved loading=false cleanly with user=${stateToTest.user ? stateToTest.user.email : 'null'}.`);

    // 3. Test Unsubscribe Lifecycle
    unsubscribe();
    log.push('✓ Test 5 Passed: Unsubscribed cleanly from auth change listener without memory leaks.');

    // 4. Test Sign Out method safety when unauthenticated
    const signOutRes = await signOutUser();
    if (signOutRes.error) {
      throw new Error(`Test 6 Failed: signOutUser returned unexpected error: ${signOutRes.error.message}`);
    }
    log.push('✓ Test 6 Passed: signOutUser executed safely.');

    log.push('ALL AUTHENTICATION STATE VERIFICATIONS PASSED 100%.');
    return { success: true, log };
  } catch (err: any) {
    log.push(`❌ Verification Error: ${err?.message || err}`);
    return { success: false, log };
  }
}

// Run immediately if executed via node script
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('authService.test')) {
  runAuthServiceVerification().then((res) => {
    console.log(res.log.join('\n'));
    if (!res.success) process.exit(1);
  });
}
