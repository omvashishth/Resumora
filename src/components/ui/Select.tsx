import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
  requiredStar?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  helperText,
  requiredStar,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          {label} {requiredStar && <span className="text-[var(--color-accent)]">*</span>}
        </label>
      )}

      <select
        id={selectId}
        className={`w-full px-3 py-2.5 sm:py-2 min-h-[42px] sm:min-h-[34px] bg-[var(--color-surface-raised)] text-base sm:text-xs text-[var(--color-text-primary)] border rounded-[var(--radius-subtle)] transition-colors duration-150 focus:outline-hidden cursor-pointer ${
          error
            ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-1 focus:ring-[var(--color-danger)]/30'
            : 'border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]/30 hover:border-[var(--color-border-strong)]'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-[11px] font-medium text-[var(--color-danger)]">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[var(--color-text-secondary)]">{helperText}</p>
      ) : null}
    </div>
  );
};
