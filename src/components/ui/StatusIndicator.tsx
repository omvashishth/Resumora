import React from 'react';
import { Badge, BadgeVariant } from './Badge';

export type StatusType = 'saved' | 'saving' | 'error' | 'synced' | 'offline' | 'pending';

export interface StatusIndicatorProps {
  status: StatusType;
  customText?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  customText,
  className = '',
}) => {
  const config: Record<StatusType, { label: string; variant: BadgeVariant; dotColor: string }> = {
    saved: { label: 'Saved locally', variant: 'default', dotColor: 'bg-[var(--color-success)]' },
    saving: { label: 'Saving...', variant: 'warning', dotColor: 'bg-[var(--color-warning)] animate-pulse' },
    error: { label: 'Sync error', variant: 'danger', dotColor: 'bg-[var(--color-danger)]' },
    synced: { label: 'Cloud synced', variant: 'success', dotColor: 'bg-[var(--color-success)]' },
    offline: { label: 'Offline mode', variant: 'default', dotColor: 'bg-[var(--color-text-tertiary)]' },
    pending: { label: 'Sync pending', variant: 'warning', dotColor: 'bg-[var(--color-warning)] animate-pulse' },
  };

  const current = config[status];

  return (
    <Badge variant={current.variant} className={`font-mono text-[10px] tracking-wider ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${current.dotColor}`} />
      {customText || current.label}
    </Badge>
  );
};
