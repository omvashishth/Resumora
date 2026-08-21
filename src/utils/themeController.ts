/**
 * Resumora Centralized Theme Controller
 * Supports 'light' | 'dark' | 'system' themes with localStorage persistence.
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'cvforge_theme_mode';

type ThemeChangeListener = (mode: ThemeMode, activeTheme: ActiveTheme) => void;

class ThemeController {
  private currentMode: ThemeMode = 'system';
  private listeners: Set<ThemeChangeListener> = new Set();
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    // Load persisted theme or default to system
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        this.currentMode = saved;
      }
    } catch {
      this.currentMode = 'system';
    }

    // Set up OS prefers-color-scheme listener
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => {
        if (this.currentMode === 'system') {
          this.applyTheme();
        }
      });
    }

    this.applyTheme();
  }

  /**
   * Get current selected theme mode ('light' | 'dark' | 'system').
   */
  public getMode(): ThemeMode {
    return this.currentMode;
  }

  /**
   * Get actual active theme ('light' | 'dark').
   */
  public getActiveTheme(): ActiveTheme {
    if (this.currentMode === 'system') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }
    return this.currentMode;
  }

  /**
   * Set theme mode and apply to root HTML element.
   */
  public setMode(mode: ThemeMode): void {
    this.currentMode = mode;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Failed to persist theme mode:', err);
    }
    this.applyTheme();
  }

  /**
   * Toggle between light and dark mode explicitly.
   */
  public toggleTheme(): void {
    const active = this.getActiveTheme();
    this.setMode(active === 'dark' ? 'light' : 'dark');
  }

  /**
   * Apply data-theme attribute on documentElement.
   */
  private applyTheme(): void {
    if (typeof document === 'undefined') return;

    const active = this.getActiveTheme();
    document.documentElement.setAttribute('data-theme', active);
    
    // Notify all registered UI listeners
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentMode, active);
      } catch (err) {
        console.error('Error in theme change listener:', err);
      }
    });
  }

  /**
   * Subscribe to theme changes.
   */
  public subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    // Initial call
    listener(this.currentMode, this.getActiveTheme());
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const themeController = new ThemeController();
