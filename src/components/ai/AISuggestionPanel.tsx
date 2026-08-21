import React from 'react';
import { Sparkles, Check, RotateCcw, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface AISuggestionPanelProps {
  originalText: string;
  suggestedText: string;
  onAccept: (text: string) => void;
  onTryAgain: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({
  originalText,
  suggestedText,
  onAccept,
  onTryAgain,
  onReject,
  isLoading = false,
}) => {
  const containsBracketedMetric = /\[.*?\]/.test(suggestedText);

  return (
    <Card variant="surface" padding="md" className="space-y-4 border border-[var(--color-brand)]/40 bg-[var(--color-surface-raised)] animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-brand)]">
          <Sparkles className="w-4 h-4 text-[var(--color-brand)]" />
          <span>AI Editorial Comparison</span>
        </div>
        <button
          onClick={onReject}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] p-1 rounded-[var(--radius-subtle)] hover:bg-[var(--color-surface)] cursor-pointer"
          title="Discard suggestion"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Side-by-side or stacked Editorial Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Original */}
        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] block">
            Original Text
          </span>
          <p className="text-[var(--color-text-secondary)] leading-relaxed italic">
            "{originalText || 'Empty'}"
          </p>
        </div>

        {/* AI Suggestion */}
        <div className="p-3 bg-[var(--color-brand-subtle)] border border-[var(--color-brand)]/30 rounded-[var(--radius-subtle)] space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-brand)] flex items-center justify-between">
            <span>AI Suggestion</span>
            <ShieldCheck className="w-3 h-3 text-[var(--color-success)] inline" />
          </span>
          <p className="text-[var(--color-text-primary)] font-medium leading-relaxed">
            "{suggestedText}"
          </p>
        </div>
      </div>

      {/* Metric Warning Notice if brackets detected */}
      {containsBracketedMetric && (
        <div className="flex items-center gap-2 text-[11px] text-[var(--color-warning)] bg-[var(--color-warning-subtle)] p-2.5 rounded-[var(--radius-subtle)] border border-[var(--color-warning)]/30">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            <strong>Action Required:</strong> Review AI-generated placeholders (e.g. <code>[X%]</code>) and replace them with your actual metrics before saving.
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
        <Button variant="ghost" size="sm" onClick={onReject} leftIcon={<X className="w-3.5 h-3.5" />}>
          Keep Original
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onTryAgain}
          isLoading={isLoading}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAccept(suggestedText)}
          leftIcon={<Check className="w-3.5 h-3.5" />}
        >
          Accept Suggestion
        </Button>
      </div>
    </Card>
  );
};
