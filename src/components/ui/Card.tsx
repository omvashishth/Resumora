import React from 'react';

export type CardVariant = 'surface' | 'elevated' | 'interactive' | 'outline';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantStyles: Record<CardVariant, string> = {
    surface: 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]',
    elevated: 'bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-primary)] shadow-paper',
    interactive:
      'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] transition-all duration-150',
    outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`rounded-[var(--radius-subtle)] ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
