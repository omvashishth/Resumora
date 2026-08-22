import { getSupabaseClient } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { performFullTwoWaySync } from './syncManager';
import { exportLimitManager } from './exportLimitManager';
import { entitlementsManager } from '../ai/entitlements/entitlementsManager';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isConfigured: boolean;
  loading?: boolean;
}

export const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { error: new Error('Supabase is not configured. Local-only mode is active.') };
  }
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });
  return { error };
};

export const signOutUser = async (): Promise<{ error: Error | null }> => {
  // Always immediately purge client-side entitlements and Pro state on sign out
  exportLimitManager.resetToFree();
  entitlementsManager.resetToFree();

  const client = getSupabaseClient();
  if (!client) return { error: null };
  const { error } = await client.auth.signOut();
  return { error };
};

export const getAuthSession = async (): Promise<Session | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session || null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  if (data.session?.user) return data.session.user;
  const { data: userData } = await client.auth.getUser();
  return userData.user;
};

export const subscribeToAuthChanges = (callback: (state: AuthState) => void) => {
  const client = getSupabaseClient();
  if (!client) {
    callback({ user: null, session: null, isConfigured: false, loading: false });
    return () => {};
  }

  let isSubscribed = true;

  // Immediate loading state
  callback({ user: null, session: null, isConfigured: true, loading: true });

  // 1. Retrieve current session using getSession()
  client.auth
    .getSession()
    .then(({ data }) => {
      if (!isSubscribed) return;
      const session = data?.session || null;
      const user = session?.user || null;

      // Sync entitlements strictly with backend user profile
      exportLimitManager.syncWithBackendUser(user);
      if (!user) {
        entitlementsManager.resetToFree();
      }

      callback({
        user,
        session,
        isConfigured: true,
        loading: false,
      });
    })
    .catch(() => {
      if (!isSubscribed) return;
      exportLimitManager.resetToFree();
      entitlementsManager.resetToFree();
      callback({
        user: null,
        session: null,
        isConfigured: true,
        loading: false,
      });
    });

  // 2. Subscribe to auth state changes using onAuthStateChange
  const { data: listener } = client.auth.onAuthStateChange((event, session) => {
    if (!isSubscribed) return;
    const user = session?.user || null;

    // Authoritative backend sync on all auth events
    exportLimitManager.syncWithBackendUser(user);
    if (!user) {
      entitlementsManager.resetToFree();
    }

    if (user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
      performFullTwoWaySync().catch(console.error);
    }

    callback({
      user,
      session: session || null,
      isConfigured: true,
      loading: false,
    });
  });

  return () => {
    isSubscribed = false;
    listener.subscription?.unsubscribe();
  };
};

export const deleteCloudAccount = async (): Promise<{ error: Error | null }> => {
  exportLimitManager.resetToFree();
  entitlementsManager.resetToFree();

  const client = getSupabaseClient();
  if (!client) {
    return { error: new Error('Supabase is not configured.') };
  }
  // Delete user cloud resumes first
  const user = await getCurrentUser();
  if (user) {
    await client.from('resumes').delete().eq('user_id', user.id);
  }
  // Sign out user session
  const { error } = await client.auth.signOut();
  return { error };
};
