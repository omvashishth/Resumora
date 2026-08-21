import React, { useState } from 'react';
import { FileText, Sparkles, Zap, ShieldAlert, Award, FileEdit, Settings } from 'lucide-react';
import { Textarea } from '../ui/Textarea';
import { AIActionButton, AIOptionItem } from '../ai/AIActionButton';
import { AISuggestionPanel } from '../ai/AISuggestionPanel';
import { AIConsentModal } from '../ai/AIConsentModal';
import { aiService } from '../../ai/AIService';
import { consentManager } from '../../ai/privacy/consentManager';
import { AIOperation } from '../../ai/types';
import { AIErrorCode } from '../../ai/errors';
import { Button } from '../ui/Button';

interface SummaryEditorProps {
  summary: string;
  onChange: (summary: string) => void;
  onOpenAISettings?: () => void;
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({
  summary,
  onChange,
  onOpenAISettings,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [pendingOperation, setPendingOperation] = useState<AIOperation | null>(null);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unconfigured, setUnconfigured] = useState(false);

  const summaryAIOptions: AIOptionItem[] = [
    {
      operation: AIOperation.IMPROVE_SUMMARY,
      label: 'Improve & Polish',
      description: 'Enhance clarity, action verbs, and tone.',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      operation: AIOperation.MAKE_CONCISE,
      label: 'Make Concise',
      description: 'Trim filler words for high impact.',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    {
      operation: AIOperation.MAKE_PROFESSIONAL,
      label: 'Make Professional',
      description: 'Elevate phrasing to executive standard.',
      icon: <Award className="w-3.5 h-3.5" />,
    },
    {
      operation: AIOperation.ADD_IMPACT,
      label: 'Add Measurable Impact',
      description: 'Suggest placeholders for key metrics.',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    {
      operation: AIOperation.REWRITE_TEXT,
      label: 'Fresh Rewrite',
      description: 'Generate an alternative phrasing.',
      icon: <FileEdit className="w-3.5 h-3.5" />,
    },
  ];

  const executeAIOperation = async (operation: AIOperation) => {
    const isConfigured = await aiService.isConfigured();
    if (!isConfigured) {
      setUnconfigured(true);
      return;
    }

    if (!consentManager.hasAIConsent()) {
      setPendingOperation(operation);
      setConsentModalOpen(true);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setUnconfigured(false);

    try {
      const res = await aiService.generateSummary({
        currentSummary: summary,
        operation,
      });

      if (res.success && res.data && res.data[0]) {
        setActiveSuggestion(res.data[0]);
      } else if (res.error) {
        if (res.error.code === AIErrorCode.AI_NOT_CONFIGURED) {
          setUnconfigured(true);
        } else {
          setErrorMessage(res.error.userMessage);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'AI service error.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = (suggested: string) => {
    onChange(suggested);
    setActiveSuggestion(null);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--color-accent-secondary)]" /> Professional Summary
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            A high-impact 2–4 sentence pitch highlighting your career achievements, core strengths, and key value.
          </p>
        </div>

        <AIActionButton
          options={summaryAIOptions}
          onSelectOption={executeAIOperation}
          isLoading={loading}
        />
      </div>

      {unconfigured && (
        <div className="p-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
            <Sparkles className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>AI Assistance Isn't Configured Yet</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Connect an AI provider (Google Gemini, OpenAI, Anthropic, or Ollama) in Account Settings to use AI polish features.
          </p>
          {onOpenAISettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAISettings}
              leftIcon={<Settings className="w-3.5 h-3.5" />}
            >
              Open AI Settings
            </Button>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/40 rounded-[var(--radius-subtle)] text-xs text-[var(--color-danger)] flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold underline ml-2 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {activeSuggestion ? (
        <AISuggestionPanel
          originalText={summary}
          suggestedText={activeSuggestion}
          onAccept={handleAcceptSuggestion}
          onTryAgain={() => pendingOperation && executeAIOperation(pendingOperation)}
          onReject={() => setActiveSuggestion(null)}
          isLoading={loading}
        />
      ) : (
        <div>
          <Textarea
            label="Summary Paragraph"
            rows={5}
            value={summary}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Results-driven Senior Software Engineer with 6+ years of experience building high-scale web applications, cloud microservices, and reactive user interfaces..."
            helperText="Tip: Focus on quantifiable accomplishments and core technologies."
          />
          <div className="text-right text-[11px] font-mono text-[var(--color-text-tertiary)] mt-1">
            <span>{summary.length} characters</span>
          </div>
        </div>
      )}

      <AIConsentModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        onConsentGranted={() => {
          if (pendingOperation) {
            executeAIOperation(pendingOperation);
          }
        }}
      />
    </div>
  );
};
