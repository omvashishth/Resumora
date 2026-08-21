import React, { useEffect, useState } from 'react';
import { themeController } from '../../utils/themeController';
import { Sun, Moon } from 'lucide-react';

/**
 * Editorial Theme Toggle with smooth icon micro-interaction.
 * Displays active state with tactile feedback.
 */
export const ThemeToggle: React.FC = () => {
  const [active, setActive] = useState<'light' | 'dark'>(themeController.getActiveTheme());

  useEffect(() => {
    const unsubscribe = themeController.subscribe(() => {
      setActive(themeController.getActiveTheme());
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    themeController.toggleTheme();
  };

  return (
    <button
      className="theme-toggle group"
      onClick={handleToggle}
      aria-label="Toggle Light/Dark theme"
      aria-pressed={active === 'dark'}
      data-active={active}
    >
      <span className="relative flex items-center justify-center w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-12">
        {active === 'light' ? (
          <Sun className="w-3.5 h-3.5 text-amber-600 transition-opacity duration-200" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-blue-400 transition-opacity duration-200" />
        )}
      </span>

      {active === 'light' ? (
        <span><strong>LIGHT</strong> | DARK</span>
      ) : (
        <span>LIGHT | <strong>DARK</strong></span>
      )}
    </button>
  );
};
