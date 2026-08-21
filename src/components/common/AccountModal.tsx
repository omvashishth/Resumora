import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuthChanges,
  deleteCloudAccount,
  AuthState,
} from '../../services/authService';
import {
  subscribeSyncStatus,
  processSyncQueue,
  syncAllLocalResumesToCloud,
  SyncStatus,
} from '../../services/syncManager';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { getAllResumes } from '../../storage/resumeRepository';
import { aiConfigManager, AIConfig, CredentialStorageType } from '../../ai/config/aiConfig';
import { entitlementsManager } from '../../ai/entitlements/entitlementsManager';
import { aiService } from '../../ai/AIService';
import { consentManager } from '../../ai/privacy/consentManager';
import type { AIProviderId, AIProviderMode, AIEntitlement } from '../../ai/types';
import {
  Mail,
  Lock,
  Cloud,
  RefreshCw,
  LogOut,
  Trash2,
  AlertTriangle,
  HardDrive,
  ShieldCheck,
  Sparkles,
  Key,
  Globe,
  CheckCircle2,
  CreditCard,
  Shield,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'account' | 'ai';
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, defaultTab = 'account' }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'ai'>(defaultTab);

  // Auth & Cloud state
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isConfigured: isSupabaseConfigured(),
    loading: isSupabaseConfigured(),
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: 'local',
    pendingCount: 0,
  });

  const [localResumeCount, setLocalResumeCount] = useState(0);
  const [syncingAll, setSyncingAll] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  // AI Configuration & Entitlement state
  const [aiConfig, setAIConfig] = useState<AIConfig>(aiConfigManager.getConfig());
  const [entitlement, setEntitlement] = useState<AIEntitlement>(entitlementsManager.getEntitlement());
  const [isAIConfigured, setIsAIConfigured] = useState(false);
  const [hasConsent, setHasConsent] = useState(consentManager.hasAIConsent());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    const unsubAuth = subscribeToAuthChanges(setAuthState);
    const unsubSync = subscribeSyncStatus(setSyncStatus);
    const unsubConsent = consentManager.subscribe(setHasConsent);
    const unsubEntitlement = entitlementsManager.subscribe(setEntitlement);

    getAllResumes().then((resumes) => {
      setLocalResumeCount(resumes.length);
    });

    checkAIStatus();

    return () => {
      unsubAuth();
      unsubSync();
      unsubConsent();
      unsubEntitlement();
    };
  }, []);

  const checkAIStatus = async () => {
    const configured = await aiService.isConfigured(aiConfig.providerId);
    setIsAIConfigured(configured);
  };

  const handleModeChange = (mode: AIProviderMode) => {
    const updated = { ...aiConfig, mode };
    setAIConfig(updated);
    aiConfigManager.saveConfig(updated);
    aiService.setMode(mode);
    checkAIStatus();
  };

  const handleRemoveKey = () => {
    aiService.removeProviderKey(aiConfig.providerId);
    setAIConfig({ ...aiConfig, apiKey: '' });
    setIsAIConfigured(false);
    setTestResult({ type: 'success', text: `API key for ${aiConfig.providerId} removed cleanly.` });
  };

  const handleSaveAIConfig = async () => {
    aiConfigManager.saveConfig(aiConfig);
    aiService.setMode(aiConfig.mode);
    aiService.setActiveProvider(aiConfig.providerId);
    await checkAIStatus();
    setTestResult({ type: 'success', text: 'AI configuration saved successfully.' });
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      aiConfigManager.saveConfig(aiConfig);
      aiService.setMode(aiConfig.mode);
      aiService.setActiveProvider(aiConfig.providerId);

      const res = await aiService.testConnection(
        aiConfig.mode === 'cvforge' ? 'cvforge' : aiConfig.providerId,
        {
          apiKey: aiConfig.apiKey,
          proxyUrl: aiConfig.proxyUrl,
        }
      );

      if (res.success && res.data) {
        setTestResult({ type: 'success', text: res.data.message });
        setIsAIConfigured(true);
      } else if (res.error) {
        setTestResult({ type: 'error', text: res.error.userMessage });
        setIsAIConfigured(false);
      }
    } catch (err: any) {
      setTestResult({ type: 'error', text: err?.message || 'Connection test failed.' });
      setIsAIConfigured(false);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthMessage(null);

    try {
      const res = await signInWithGoogle();
      if (res.error) setAuthMessage({ type: 'error', text: res.error.message });
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err?.message || 'Google sign-in error.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setAuthMessage(null);
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    setAuthMessage(null);
    try {
      const res = await syncAllLocalResumesToCloud();
      if (res.error) {
        setAuthMessage({ type: 'error', text: res.error });
      } else {
        setAuthMessage({
          type: 'success',
          text: `Synchronized ${res.count} local resume(s) to your cloud account!`,
        });
      }
      const updatedList = await getAllResumes();
      setLocalResumeCount(updatedList.length);
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err?.message || 'Cloud sync failed.' });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setAuthLoading(true);
    try {
      const res = await deleteCloudAccount();
      if (res.error) {
        setAuthMessage({ type: 'error', text: res.error.message });
      } else {
        setConfirmDeleteAccount(false);
        setAuthMessage({ type: 'success', text: 'Cloud account deleted successfully.' });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account & System Settings" maxWidth="lg">
      <div className="space-y-4">
        {/* Main Tab Navigation */}
        <Tabs
          tabs={[
            { id: 'account', label: 'Cloud & Auth', icon: <Cloud className="w-3.5 h-3.5" /> },
            { id: 'ai', label: 'AI Assistance (Dual Mode)', icon: <Sparkles className="w-3.5 h-3.5" /> },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />

        {activeTab === 'ai' ? (
          /* AI Configuration Tab */
          <div className="space-y-4">
            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Resumora AI */}
              <div
                onClick={() => handleModeChange('cvforge')}
                className={`p-3.5 rounded-[var(--radius-subtle)] border cursor-pointer transition-all duration-150 select-none ${
                  aiConfig.mode === 'cvforge'
                    ? 'bg-[var(--color-brand-subtle)] border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[var(--color-brand)]" />
                    <span>Resumora AI</span>
                  </span>
                  <input
                    type="radio"
                    name="aiMode"
                    checked={aiConfig.mode === 'cvforge'}
                    onChange={() => handleModeChange('cvforge')}
                    className="w-3.5 h-3.5 text-[var(--color-brand)] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Use Resumora's managed AI service. No API key required.
                </p>
                <div className="mt-2.5 pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[var(--color-text-tertiary)] uppercase font-semibold">Credits</span>
                  <span className="font-bold text-[var(--color-brand)]">
                    {entitlement.remainingCredits} / {entitlement.totalCredits} remaining
                  </span>
                </div>
              </div>

              {/* Option B: BYOK */}
              <div
                onClick={() => handleModeChange('byok')}
                className={`p-3.5 rounded-[var(--radius-subtle)] border cursor-pointer transition-all duration-150 select-none ${
                  aiConfig.mode === 'byok'
                    ? 'bg-[var(--color-brand-subtle)] border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Bring Your Own Key (BYOK)</span>
                  </span>
                  <input
                    type="radio"
                    name="aiMode"
                    checked={aiConfig.mode === 'byok'}
                    onChange={() => handleModeChange('byok')}
                    className="w-3.5 h-3.5 text-[var(--color-brand)] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Connect your own Gemini, OpenAI, Anthropic, or Ollama API key.
                </p>
                <div className="mt-2.5 pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[var(--color-text-tertiary)] uppercase font-semibold">Resumora Credits</span>
                  <span className="font-bold text-[var(--color-success)]">0 Consumed (Free)</span>
                </div>
              </div>
            </div>

            {/* Config Panel Body */}
            {aiConfig.mode === 'cvforge' ? (
              <Card variant="surface" className="space-y-3 border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[var(--color-brand)]" />
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      Resumora AI Plan Entitlement
                    </span>
                  </div>
                  <Badge variant="success">
                    {entitlement.plan.toUpperCase()} TIER ({entitlement.status})
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-[var(--color-text-secondary)]">
                    <span>Available AI Credits:</span>
                    <span className="font-bold text-[var(--color-text-primary)]">
                      {entitlement.remainingCredits} / {entitlement.totalCredits}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-surface-raised)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div
                      className="bg-[var(--color-brand)] h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, (entitlement.remainingCredits / entitlement.totalCredits) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Credits are automatically consumed only when an AI request succeeds. Server endpoints handle credentials safely.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                <Select
                  label="BYOK AI Provider"
                  value={aiConfig.providerId}
                  onChange={(e) => {
                    const pid = e.target.value as AIProviderId;
                    const keyForNewPid = aiConfigManager.getProviderKey(pid) || '';
                    setAIConfig({ ...aiConfig, providerId: pid, apiKey: keyForNewPid });
                  }}
                  options={[
                    { value: 'gemini', label: 'Google Gemini (3.6 Flash)' },
                    { value: 'openai', label: 'OpenAI (GPT-4o / GPT-4o-mini)' },
                    { value: 'anthropic', label: 'Anthropic Claude (3.5 Sonnet)' },
                    { value: 'local', label: 'Local LLM (Ollama / WebLLM)' },
                  ]}
                />

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      API Key ({aiConfig.providerId.toUpperCase()})
                    </label>
                    {aiConfig.apiKey && (
                      <button
                        onClick={handleRemoveKey}
                        className="text-[10px] font-mono text-[var(--color-danger)] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Key
                      </button>
                    )}
                  </div>
                  <Input
                    type="password"
                    value={aiConfig.apiKey || ''}
                    onChange={(e) => setAIConfig({ ...aiConfig, apiKey: e.target.value })}
                    placeholder="sk-..."
                    leftIcon={<Key className="w-4 h-4" />}
                  />
                </div>

                <Select
                  label="Credential Storage Preference"
                  value={aiConfig.storageType || 'persistent'}
                  onChange={(e) => setAIConfig({ ...aiConfig, storageType: e.target.value as CredentialStorageType })}
                  options={[
                    { value: 'persistent', label: 'Persistent Local Storage (Retained across restarts)' },
                    { value: 'session', label: 'Session Storage Only (Cleared on tab close)' },
                  ]}
                />

                <Input
                  label="Custom Backend Proxy URL (Optional)"
                  type="url"
                  value={aiConfig.proxyUrl || ''}
                  onChange={(e) => setAIConfig({ ...aiConfig, proxyUrl: e.target.value })}
                  placeholder="https://api.yourcompany.com/ai/v1"
                  leftIcon={<Globe className="w-4 h-4" />}
                />

                {/* Honest Security Notice */}
                <div className="p-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)]">
                    <Shield className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                    <span>Security &amp; Cloud Isolation Notice</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                    BYOK credentials are stored locally on this device and strictly isolated from resume cloud sync, IndexedDB resume records, and export files.
                  </p>
                </div>
              </div>
            )}

            {/* Privacy Consent Controls */}
            <Card variant="surface" className="flex items-center justify-between border border-[var(--color-border)] p-3">
              <div>
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                  Explicit Privacy Consent
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  {hasConsent
                    ? 'Consent granted. Minimum text snippets transmitted only on user action.'
                    : 'Consent revoked. No resume content will be transmitted to any AI provider.'}
                </span>
              </div>

              <Button
                variant={hasConsent ? 'outline' : 'primary'}
                size="sm"
                onClick={() => {
                  if (hasConsent) consentManager.revokeAIConsent();
                  else consentManager.grantAIConsent();
                }}
              >
                {hasConsent ? 'Revoke Consent' : 'Enable AI'}
              </Button>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestConnection}
                isLoading={testingConnection}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="flex-1"
              >
                Test Connection
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAIConfig}
                className="flex-1"
              >
                Save Settings
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-[var(--radius-subtle)] text-xs font-medium border ${
                  testResult.type === 'error'
                    ? 'bg-[var(--color-danger-subtle)] border-[var(--color-danger)]/40 text-[var(--color-danger)]'
                    : 'bg-[var(--color-success-subtle)] border-[var(--color-success)]/40 text-[var(--color-success)]'
                }`}
              >
                {testResult.text}
              </div>
            )}
          </div>
        ) : (
          /* Cloud & Auth Tab */
          <div className="space-y-4">
            {authState.loading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-5 h-5 text-[var(--color-brand)] animate-spin" />
                <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                  Verifying session...
                </span>
              </div>
            ) : !authState.isConfigured ? (
              <Card variant="surface" className="space-y-3 border border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-warning)]">
                  <HardDrive className="w-4 h-4" />
                  <span>100% Device-Local Mode Active</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Supabase cloud credentials are not configured in environment variables. Your resumes are stored safely in browser IndexedDB with zero network dependency.
                </p>
                <div className="p-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] text-[11px] font-mono text-[var(--color-text-secondary)]">
                  Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable multi-device cloud sync.
                </div>
              </Card>
            ) : authState.user ? (
              <div className="space-y-4">
                <div className="border-b border-[var(--color-border)] pb-3">
                  <h3 className="font-serif text-base font-bold text-[var(--color-text-primary)]">
                    Account &amp; Cloud Sync
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-success)] font-medium mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Signed in with Google</span>
                  </div>
                </div>

                <Card variant="surface" className="flex items-center justify-between border border-[var(--color-border)] p-3.5">
                  <div className="flex items-center gap-3">
                    {authState.user.user_metadata?.avatar_url || authState.user.user_metadata?.picture ? (
                      <img
                        src={authState.user.user_metadata.avatar_url || authState.user.user_metadata.picture}
                        alt="Google Avatar"
                        className="w-10 h-10 rounded-full border border-[var(--color-border)] object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--color-brand)] border border-[var(--color-brand-hover)] flex items-center justify-center text-[var(--color-text-inverse)] font-bold text-sm">
                        {(authState.user.user_metadata?.full_name || authState.user.user_metadata?.name || authState.user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-text-primary)]">
                        {authState.user.user_metadata?.full_name || authState.user.user_metadata?.name || 'Google User'}
                      </h4>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {authState.user.email}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={handleSignOut} leftIcon={<LogOut className="w-3.5 h-3.5" />}>
                    Sign Out
                  </Button>
                </Card>

                <Card variant="surface" className="space-y-3 border border-[var(--color-border)] p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
                        <Cloud className="w-4 h-4 text-[var(--color-brand)]" />
                        <span>Cloud Sync</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        Your resumes are synced across your devices.
                      </p>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>

                  <div className="text-xs text-[var(--color-text-secondary)] flex items-center justify-between font-mono pt-2 border-t border-[var(--color-border)]">
                    <span>Last Synced:</span>
                    <span>
                      {syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => processSyncQueue()}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                      className="w-full"
                    >
                      Sync Pending Changes
                    </Button>
                  </div>
                </Card>

                {localResumeCount > 0 && (
                  <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        Local Device Resumes ({localResumeCount})
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSyncAll}
                        isLoading={syncingAll}
                      >
                        Sync All to Cloud
                      </Button>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Upload all local resumes stored on this device to your cloud account for multi-device access.
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-[var(--color-border)] flex justify-between items-center">
                  <button
                    onClick={() => setConfirmDeleteAccount(true)}
                    className="text-xs font-medium text-[var(--color-danger)] hover:opacity-80 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Cloud Account</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-2 space-y-1">
                  <h3 className="font-serif text-base font-bold text-[var(--color-text-primary)]">
                    Sign in with Google
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Sign in with Google to enable multi-device resume cloud backups.
                  </p>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-[var(--radius-subtle)] font-medium text-sm flex items-center justify-center gap-3 transition-all duration-150 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{authLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>

                <div className="p-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  <span className="font-semibold text-[var(--color-text-primary)] block mb-0.5 uppercase tracking-wider text-[10px] font-mono">Local-First Guarantee:</span>
                  Signing in is completely optional. You can continue creating, editing, and exporting resumes locally without an account.
                </div>
              </div>
            )}

            {authMessage && (
              <div
                className={`p-3 rounded-[var(--radius-subtle)] text-xs font-medium border ${
                  authMessage.type === 'error'
                    ? 'bg-[var(--color-danger-subtle)] border-[var(--color-danger)]/40 text-[var(--color-danger)]'
                    : 'bg-[var(--color-success-subtle)] border-[var(--color-success)]/40 text-[var(--color-success)]'
                }`}
              >
                {authMessage.text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Deletion Confirmation Sub-Modal */}
      {confirmDeleteAccount && (
        <div className="mt-4 p-4 bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/40 rounded-[var(--radius-subtle)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-danger)]">
            <AlertTriangle className="w-4 h-4" />
            <span>Delete Cloud Account?</span>
          </div>
          <p className="text-xs text-[var(--color-danger)]/90 leading-relaxed">
            Your cloud resume backups will be permanently removed. Your local IndexedDB data on this device will remain safe.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setConfirmDeleteAccount(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteAccountConfirm}>
              Confirm Account Deletion
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
