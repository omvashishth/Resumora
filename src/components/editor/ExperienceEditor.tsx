import React, { useState } from 'react';
import { ExperienceItem } from '../../types/resume';
import { Briefcase, Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Sparkles, Zap, ShieldAlert, Award, FileEdit, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { AIActionButton, AIOptionItem } from '../ai/AIActionButton';
import { AISuggestionPanel } from '../ai/AISuggestionPanel';
import { AIConsentModal } from '../ai/AIConsentModal';
import { aiService } from '../../ai/AIService';
import { consentManager } from '../../ai/privacy/consentManager';
import { AIOperation } from '../../ai/types';
import { AIErrorCode } from '../../ai/errors';

interface ExperienceEditorProps {
  experience: ExperienceItem[];
  onAdd: () => void;
  onUpdate: (id: string, update: Partial<ExperienceItem>) => void;
  onRemove: (id: string) => void;
  onAddBullet: (expId: string, index?: number) => void;
  onUpdateBullet: (expId: string, bulletIndex: number, text: string) => void;
  onRemoveBullet: (expId: string, bulletIndex: number) => void;
  onOpenAISettings?: () => void;
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experience,
  onAdd,
  onUpdate,
  onRemove,
  onAddBullet,
  onUpdateBullet,
  onRemoveBullet,
  onOpenAISettings,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (experience[0]) map[experience[0].id] = true;
    return map;
  });

  const [activeAIBulletTarget, setActiveAIBulletTarget] = useState<{
    expId: string;
    bulletIndex: number;
    originalBullet: string;
    suggestion: string;
    operation: AIOperation;
  } | null>(null);

  const [loadingBulletTarget, setLoadingBulletTarget] = useState<string | null>(null);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [pendingAIBullet, setPendingAIBullet] = useState<{
    expId: string;
    bulletIndex: number;
    operation: AIOperation;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unconfigured, setUnconfigured] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const bulletAIOptions: AIOptionItem[] = [
    {
      operation: AIOperation.IMPROVE_BULLET,
      label: 'Make Stronger',
      description: 'Lead with strong action verbs & impact.',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      operation: AIOperation.MAKE_CONCISE,
      label: 'Make Concise',
      description: 'Trim filler words for high impact.',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    {
      operation: AIOperation.ADD_IMPACT,
      label: 'Add Measurable Impact',
      description: 'Suggest placeholders for metrics.',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    {
      operation: AIOperation.REWRITE_TEXT,
      label: 'Fresh Rewrite',
      description: 'Alternative phrasing with high clarity.',
      icon: <FileEdit className="w-3.5 h-3.5" />,
    },
  ];

  const executeAIBulletOperation = async (expId: string, bulletIndex: number, operation: AIOperation) => {
    const isConfigured = await aiService.isConfigured();
    if (!isConfigured) {
      setUnconfigured(true);
      return;
    }

    const targetExp = experience.find((e) => e.id === expId);
    if (!targetExp) return;
    const bulletText = targetExp.bullets[bulletIndex] || '';

    if (!consentManager.hasAIConsent()) {
      setPendingAIBullet({ expId, bulletIndex, operation });
      setConsentModalOpen(true);
      return;
    }

    const key = `${expId}-${bulletIndex}`;
    setLoadingBulletTarget(key);
    setErrorMessage(null);
    setUnconfigured(false);

    try {
      const res = await aiService.improveBullet({
        bullet: bulletText,
        position: targetExp.position,
        company: targetExp.company,
        operation,
      });

      if (res.success && res.data && res.data[0]) {
        setActiveAIBulletTarget({
          expId,
          bulletIndex,
          originalBullet: bulletText,
          suggestion: res.data[0],
          operation,
        });
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
      setLoadingBulletTarget(null);
    }
  };

  const handleAcceptBulletSuggestion = (expId: string, bulletIndex: number, text: string) => {
    onUpdateBullet(expId, bulletIndex, text);
    setActiveAIBulletTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[var(--color-success)]" /> Work Experience
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            List your professional employment history in reverse chronological order.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Experience
        </Button>
      </div>

      {unconfigured && (
        <div className="p-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
            <Sparkles className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>AI Assistance Isn't Configured Yet</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Connect an AI provider (Google Gemini, OpenAI, Anthropic, or Ollama) in Account Settings to use AI bullet features.
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

      {experience.length === 0 ? (
        <Card variant="outline" className="text-center py-8 space-y-3">
          <p className="text-xs text-[var(--color-text-secondary)]">No work experience added yet.</p>
          <Button variant="outline" size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Your First Role
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {experience.map((exp, idx) => {
            const isExpanded = expandedIds[exp.id] ?? true;

            return (
              <Card key={exp.id} padding="none" variant="surface" className="overflow-hidden border border-[var(--color-border)]">
                <div
                  onClick={() => toggleExpand(exp.id)}
                  className="px-4 py-3 bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] cursor-pointer flex items-center justify-between select-none transition-colors duration-150"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    <div>
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        {exp.position || `Role #${idx + 1}`}
                      </span>
                      {exp.company && (
                        <span className="text-xs text-[var(--color-text-secondary)] ml-2">@ {exp.company}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(exp.id);
                      }}
                      className="p-1 rounded-[3px] text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-raised)] transition-colors duration-150 cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Job Title"
                        value={exp.position}
                        onChange={(e) => onUpdate(exp.id, { position: e.target.value })}
                        placeholder="e.g. Senior Software Engineer"
                      />

                      <Input
                        label="Company / Organization"
                        value={exp.company}
                        onChange={(e) => onUpdate(exp.id, { company: e.target.value })}
                        placeholder="e.g. Acme Tech Corp"
                      />

                      <Input
                        label="Location"
                        value={exp.location}
                        onChange={(e) => onUpdate(exp.id, { location: e.target.value })}
                        placeholder="e.g. San Francisco, CA (or Remote)"
                      />

                      <Input
                        label="Start Date"
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => onUpdate(exp.id, { startDate: e.target.value })}
                      />

                      <Input
                        label="End Date"
                        type="month"
                        disabled={exp.current}
                        value={exp.endDate}
                        onChange={(e) => onUpdate(exp.id, { endDate: e.target.value })}
                      />

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => onUpdate(exp.id, { current: e.target.checked })}
                            className="w-4 h-4 rounded-[var(--radius-subtle)] text-[var(--color-brand)] focus:ring-[var(--color-border-focus)] border-[var(--color-border)] bg-[var(--color-surface-raised)]"
                          />
                          <span>I currently work here</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                          Key Achievements &amp; Responsibilities (Bullet Points)
                        </label>
                        <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
                          Press <kbd className="bg-[var(--color-surface-raised)] px-1 border border-[var(--color-border)] rounded text-[var(--color-text-primary)]">Enter</kbd> to add bullet
                        </span>
                      </div>

                      <div className="space-y-3">
                        {exp.bullets.map((bullet, bulletIdx) => {
                          const isCurrentTarget =
                            activeAIBulletTarget?.expId === exp.id &&
                            activeAIBulletTarget.bulletIndex === bulletIdx;
                          const key = `${exp.id}-${bulletIdx}`;

                          return (
                            <div key={bulletIdx} className="space-y-2">
                              {isCurrentTarget ? (
                                <AISuggestionPanel
                                  originalText={activeAIBulletTarget.originalBullet}
                                  suggestedText={activeAIBulletTarget.suggestion}
                                  onAccept={(txt) => handleAcceptBulletSuggestion(exp.id, bulletIdx, txt)}
                                  onTryAgain={() => executeAIBulletOperation(exp.id, bulletIdx, activeAIBulletTarget.operation)}
                                  onReject={() => setActiveAIBulletTarget(null)}
                                  isLoading={loadingBulletTarget === key}
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-[var(--color-text-tertiary)] text-xs font-mono">•</span>
                                  <Input
                                    value={bullet}
                                    onChange={(e) => onUpdateBullet(exp.id, bulletIdx, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        onAddBullet(exp.id, bulletIdx);
                                      } else if (
                                        e.key === 'Backspace' &&
                                        bullet === '' &&
                                        exp.bullets.length > 1
                                      ) {
                                        e.preventDefault();
                                        onRemoveBullet(exp.id, bulletIdx);
                                      }
                                    }}
                                    placeholder="e.g. Led redesign of core backend architecture, reducing latency by 35%..."
                                    className="flex-1"
                                  />

                                  <AIActionButton
                                    options={bulletAIOptions}
                                    onSelectOption={(op) => executeAIBulletOperation(exp.id, bulletIdx, op)}
                                    isLoading={loadingBulletTarget === key}
                                    disabled={!bullet.trim()}
                                  />

                                  <button
                                    onClick={() => onRemoveBullet(exp.id, bulletIdx)}
                                    className="p-1 rounded-[3px] text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-raised)] transition-colors duration-150 cursor-pointer"
                                    title="Delete bullet"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddBullet(exp.id)}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="mt-2.5 text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]"
                      >
                        Add Bullet Point
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AIConsentModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        onConsentGranted={() => {
          if (pendingAIBullet) {
            executeAIBulletOperation(
              pendingAIBullet.expId,
              pendingAIBullet.bulletIndex,
              pendingAIBullet.operation
            );
          }
        }}
      />
    </div>
  );
};
