import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  LayoutDashboard,
  Layers,
  Download,
  ChevronDown,
  FileSpreadsheet,
  User,
  Cloud,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { subscribeToAuthChanges, AuthState } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { subscribeSyncStatus, SyncStatus } from '../../services/syncManager';
import { themeController, ThemeMode, ActiveTheme } from '../../utils/themeController';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatusIndicator, StatusType } from '../ui/StatusIndicator';
import { ResumoraLogo } from './ResumoraLogo';
import { ATSScoreBadge } from '../ats/ATSScoreBadge';
import type { ATSAnalysisResult } from '../../utils/atsScoreEngine';
import { exportLimitManager, ExportEntitlementStats } from '../../services/exportLimitManager';
import { Sparkles, Crown } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'dashboard' | 'builder';
  onNavigate: (view: 'landing' | 'dashboard' | 'builder') => void;
  resumeTitle?: string;
  saveStatus?: string;
  onDownloadPdf?: () => void;
  onDownloadDocx?: () => void;
  onChangeTemplate?: () => void;
  onOpenAccountModal?: () => void;
  atsAnalysis?: ATSAnalysisResult;
  onOpenATSModal?: () => void;
  onOpenPaywallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  resumeTitle,
  saveStatus,
  onDownloadPdf,
  onDownloadDocx,
  onChangeTemplate,
  onOpenAccountModal,
  atsAnalysis,
  onOpenATSModal,
  onOpenPaywallModal,
}) => {
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(themeController.getMode());
  const [activeTheme, setActiveTheme] = useState<ActiveTheme>(themeController.getActiveTheme());
  const [exportStats, setExportStats] = useState<ExportEntitlementStats>(exportLimitManager.getStats());
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isConfigured: isSupabaseConfigured(),
    loading: isSupabaseConfigured(),
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: 'local', pendingCount: 0 });

  useEffect(() => {
    const unsubAuth = subscribeToAuthChanges(setAuthState);
    const unsubSync = subscribeSyncStatus(setSyncStatus);
    const unsubTheme = themeController.subscribe((mode, active) => {
      setThemeMode(mode);
      setActiveTheme(active);
    });
    const unsubExport = exportLimitManager.subscribe(setExportStats);

    return () => {
      unsubAuth();
      unsubSync();
      unsubTheme();
      unsubExport();
    };
  }, []);

  const getStatusType = (): StatusType => {
    if (saveStatus === 'saving') return 'saving';
    if (saveStatus === 'error') return 'error';
    if (syncStatus.state === 'synced') return 'synced';
    return 'saved';
  };

  const getThemeIcon = () => {
    if (themeMode === 'system') return <Monitor className="w-3.5 h-3.5" />;
    return activeTheme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />;
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-background)]/95 border-b border-[var(--color-border)] text-[var(--color-text-primary)] px-4 lg:px-8 py-2.5 backdrop-blur-xs transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Typographic Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-hidden cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 rounded-[var(--radius-subtle)] bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-text-inverse)] shadow-xs group-hover:bg-[var(--color-brand-hover)] transition-colors duration-150 shrink-0">
            <ResumoraLogo size="xs" strokeWidth={3.2} />
          </div>
          <div>
            <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-[var(--color-text-primary)]">
              Resumora
            </span>
            <span className="hidden sm:flex text-[10px] text-[var(--color-text-secondary)] font-mono tracking-wide -mt-0.5 items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[var(--color-success)] inline" /> Local-First Studio
            </span>
          </div>
        </button>

        {/* Builder View Title & Autosave Badge */}
        {currentView === 'builder' && (
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-xs font-semibold text-[var(--color-text-primary)] truncate max-w-xs">
              {resumeTitle || 'Untitled Resume'}
            </div>
            {saveStatus && <StatusIndicator status={getStatusType()} />}
          </div>
        )}

        {/* Navigation & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Switcher Controller */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              leftIcon={getThemeIcon()}
              title={`Theme: ${themeMode}`}
              className="px-2 sm:px-2.5"
            >
              <span className="hidden md:inline capitalize">{themeMode}</span>
            </Button>

            {themeMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-36 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] shadow-paper py-1 z-50 animate-in fade-in duration-150"
                onMouseLeave={() => setThemeMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    themeController.setMode('light');
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                    themeMode === 'light'
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5" /> Light
                  </span>
                </button>
                <button
                  onClick={() => {
                    themeController.setMode('dark');
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                    themeMode === 'dark'
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5" /> Dark
                  </span>
                </button>
                <button
                  onClick={() => {
                    themeController.setMode('system');
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                    themeMode === 'system'
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5" /> System
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Account / Cloud Sync Trigger Button */}
          {onOpenAccountModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAccountModal}
              leftIcon={
                authState.user ? (
                  authState.user.user_metadata?.avatar_url || authState.user.user_metadata?.picture ? (
                    <img
                      src={authState.user.user_metadata.avatar_url || authState.user.user_metadata.picture}
                      alt="Google Avatar"
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <Cloud className="w-3.5 h-3.5 text-[var(--color-success)]" />
                  )
                ) : (
                  <User className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                )
              }
              title={authState.user ? 'Google Account Connected' : 'Local-First Mode'}
              className="px-2 sm:px-2.5"
            >
              <span className="hidden md:inline-flex items-center gap-1.5">
                {authState.user ? (
                  <>
                    <span className="truncate max-w-[100px]">
                      {authState.user.user_metadata?.full_name ||
                        authState.user.user_metadata?.name ||
                        'ACCOUNT'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[var(--color-success)] inline-block" title="Connected" />
                  </>
                ) : (
                  'ACCOUNT'
                )}
              </span>
            </Button>
          )}

          {currentView !== 'landing' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('landing')}
              className="hidden md:inline-flex"
            >
              Home
            </Button>
          )}

          {currentView !== 'dashboard' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              leftIcon={<LayoutDashboard className="w-3.5 h-3.5 text-[var(--color-brand)]" />}
              className="px-2 sm:px-2.5"
            >
              <span className="hidden sm:inline">My Resumes</span>
              <span className="sm:hidden">Resumes</span>
            </Button>
          )}

          {currentView === 'builder' && (
            <>
              {atsAnalysis && onOpenATSModal && (
                <ATSScoreBadge analysis={atsAnalysis} onClick={onOpenATSModal} />
              )}

              {onChangeTemplate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onChangeTemplate}
                  leftIcon={<Layers className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />}
                  className="px-2 sm:px-2.5"
                >
                  <span className="hidden sm:inline">Templates</span>
                </Button>
              )}

              {/* Upgrade or Pro Badge */}
              {exportStats.isPro ? (
                <div
                  onClick={onOpenAccountModal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-[var(--radius-subtle)] text-[11px] font-bold text-amber-500 cursor-pointer select-none"
                  title="Resumora Pro Active"
                >
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>PRO</span>
                </div>
              ) : (
                onOpenPaywallModal && (
                  <button
                    onClick={onOpenPaywallModal}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-[var(--radius-subtle)] hover:bg-amber-500/20 transition-colors duration-150 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Upgrade</span>
                  </button>
                )
              )}

              {/* Download Menu Dropdown */}
              <div className="relative">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  rightIcon={<ChevronDown className="w-3 h-3 opacity-80" />}
                  className="px-2.5 sm:px-3"
                >
                  <span>Export</span>
                </Button>

                {downloadMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-2rem)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] shadow-paper py-1.5 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setDownloadMenuOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setDownloadMenuOpen(false);
                        onDownloadPdf?.();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center justify-between cursor-pointer transition-colors duration-150"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[var(--color-success)]" />
                        <span>PDF Document</span>
                      </span>
                      <Badge variant="success">Vector</Badge>
                    </button>
                    <button
                      onClick={() => {
                        setDownloadMenuOpen(false);
                        onDownloadDocx?.();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center justify-between cursor-pointer transition-colors duration-150"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />
                        <span>DOCX Word</span>
                      </span>
                      <Badge variant="secondary">Editable</Badge>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {currentView === 'landing' && (
            <Button variant="primary" size="sm" onClick={() => onNavigate('dashboard')} className="px-3">
              <span className="hidden sm:inline">My Resumes →</span>
              <span className="sm:hidden">Resumes →</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
