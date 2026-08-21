import React, { useState } from 'react';
import { Sparkles, ChevronDown, Zap, ShieldAlert, Award, FileEdit } from 'lucide-react';
import { AIOperation } from '../../ai/types';

export interface AIOptionItem {
  operation: AIOperation;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface AIActionButtonProps {
  options: AIOptionItem[];
  onSelectOption: (operation: AIOperation) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const AIActionButton: React.FC<AIActionButtonProps> = ({
  options,
  onSelectOption,
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)] bg-[var(--color-brand-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-brand)]/30 rounded-[var(--radius-subtle)] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand)] shrink-0" />
        <span>{isLoading ? 'Processing…' : 'Improve with AI'}</span>
        <ChevronDown className="w-3 h-3 text-[var(--color-text-secondary)] opacity-80 shrink-0" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-56 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] shadow-paper py-1 z-50 animate-in fade-in duration-150"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-3 py-1 border-b border-[var(--color-border)] text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-tertiary)]">
            Contextual AI Polish
          </div>

          {options.map((opt) => (
            <button
              key={opt.operation}
              onClick={() => {
                setOpen(false);
                onSelectOption(opt.operation);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-start gap-2 cursor-pointer transition-colors duration-150"
            >
              <span className="mt-0.5 text-[var(--color-brand)] shrink-0">
                {opt.icon || <Sparkles className="w-3.5 h-3.5" />}
              </span>
              <div>
                <span className="block font-semibold text-xs text-[var(--color-text-primary)]">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="block text-[10px] text-[var(--color-text-secondary)] leading-tight">
                    {opt.description}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
