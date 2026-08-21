import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  requiredStar?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  requiredStar,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          {label} {requiredStar && <span className="text-[var(--color-accent)]">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`w-full py-2.5 sm:py-2 min-h-[42px] sm:min-h-[34px] bg-[var(--color-surface-raised)] text-base sm:text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] border rounded-[var(--radius-subtle)] transition-colors duration-150 focus:outline-hidden ${
            leftIcon ? 'pl-9' : 'px-3'
          } ${rightIcon ? 'pr-9' : 'pr-3'} ${
            error
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-1 focus:ring-[var(--color-danger)]/30'
              : 'border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]/30 hover:border-[var(--color-border-strong)]'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none shrink-0">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-[var(--color-danger)]">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[var(--color-text-secondary)]">{helperText}</p>
      ) : null}
    </div>
  );
};
