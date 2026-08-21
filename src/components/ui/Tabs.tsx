import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex bg-[var(--color-surface)] border border-[var(--color-border)] p-0.5 rounded-[var(--radius-subtle)] ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-subtle)] transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-[var(--color-brand)] text-[var(--color-text-inverse)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] ${
                  isActive ? 'bg-[var(--color-brand-active)] text-[var(--color-text-inverse)]' : 'bg-[var(--color-border)] text-[var(--color-text-primary)]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
