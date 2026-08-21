import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'oxide'
  | 'success'
  | 'warning'
  | 'danger'
  | 'secondary';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  icon,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    primary: 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border-[var(--color-brand)]/40 font-semibold',
    oxide: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]/40 font-semibold',
    success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success)]/40 font-semibold',
    warning: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/40 font-semibold',
    danger: 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border-[var(--color-danger)]/40 font-semibold',
    secondary: 'bg-[var(--color-accent-secondary-subtle)] text-[var(--color-accent-secondary)] border-[var(--color-accent-secondary)]/40 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-[var(--radius-subtle)] border shrink-0 ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
