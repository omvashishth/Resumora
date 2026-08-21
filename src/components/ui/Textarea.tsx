import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  requiredStar?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  requiredStar,
  className = '',
  id,
  rows = 4,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          {label} {requiredStar && <span className="text-[var(--color-accent)]">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full px-3.5 py-2.5 sm:py-2 bg-[var(--color-surface-raised)] text-base sm:text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] border rounded-[var(--radius-subtle)] transition-colors duration-150 focus:outline-hidden ${
          error
            ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-1 focus:ring-[var(--color-danger)]/30'
            : 'border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]/30 hover:border-[var(--color-border-strong)]'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] font-medium text-[var(--color-danger)]">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[var(--color-text-secondary)]">{helperText}</p>
      ) : null}
    </div>
  );
};
