import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'oxide' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-active)] text-[var(--color-text-inverse)] font-semibold tracking-wide uppercase border border-transparent shadow-xs',
    oxide:
      'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-active)] text-[var(--color-text-inverse)] font-semibold tracking-wide uppercase border border-transparent shadow-xs',
    secondary:
      'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-active)] text-[var(--color-text-primary)] font-semibold tracking-wide uppercase border border-[var(--color-border)]',
    ghost:
      'bg-transparent hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-active)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium border border-transparent',
    danger:
      'bg-[var(--color-danger)] hover:opacity-90 active:opacity-100 text-[#F9F8F6] font-semibold tracking-wide uppercase border border-transparent',
    outline:
      'bg-transparent hover:bg-[var(--color-surface)] active:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] font-semibold tracking-wide uppercase',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1.5 sm:py-1 min-h-[36px] sm:min-h-[28px] text-xs sm:text-[11px] rounded-[var(--radius-subtle)] gap-1.5',
    md: 'px-3.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[34px] text-xs rounded-[var(--radius-subtle)] gap-2',
    lg: 'px-5 py-3 sm:py-2.5 min-h-[46px] text-sm sm:text-xs rounded-[var(--radius-subtle)] gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-[var(--color-border-focus)]/50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
