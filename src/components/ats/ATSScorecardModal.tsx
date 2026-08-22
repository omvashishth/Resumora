import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Tabs } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Textarea';
import type { Resume, SectionKey } from '../../types/resume';
import { analyzeResumeATS, ATSAnalysisResult, ATSRecommendation } from '../../utils/atsScoreEngine';
import { analyzeJobDescriptionMatch, JDMatchAnalysisResult, KeywordMatchItem } from '../../utils/jdKeywordMatcher';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  Sparkles,
  Plus,
  Zap,
  Search,
  ShieldCheck,
} from 'lucide-react';

interface ATSScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume;
  onNavigateSection?: (section: SectionKey | 'customization') => void;
  onAddSkill?: (skillName: string, category?: string) => void;
  onOpenAISettings?: () => void;
}

export const ATSScorecardModal: React.FC<ATSScorecardModalProps> = ({
  isOpen,
  onClose,
  resume,
  onNavigateSection,
  onAddSkill,
  onOpenAISettings,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'jd-match'>('audit');
  const [jdInputText, setJdInputText] = useState('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Compute live ATS score
  const atsResult: ATSAnalysisResult = useMemo(() => {
    return analyzeResumeATS(resume);
  }, [resume]);

  // Compute live JD Match score
  const jdResult: JDMatchAnalysisResult = useMemo(() => {
    return analyzeJobDescriptionMatch(resume, jdInputText);
  }, [resume, jdInputText]);

  const handleFixClick = (rec: ATSRecommendation) => {
    if (rec.sectionKey && onNavigateSection) {
      onNavigateSection(rec.sectionKey);
      onClose();
    }
  };

  const handleAddMissingSkill = (item: KeywordMatchItem) => {
    if (onAddSkill) {
      const category = item.category === 'Technical' || item.category === 'Framework/Library' ? 'Technical' : 'Tools';
      onAddSkill(item.keyword, category);
      setCopiedNotification(`Added "${item.keyword}" to your Skills section.`);
      setTimeout(() => setCopiedNotification(null), 3000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 82) return 'text-[var(--color-success)]';
    if (score >= 60) return 'text-[var(--color-warning)]';
    return 'text-[var(--color-danger)]';
  };

  const getScoreBg = (score: number) => {
    if (score >= 82) return 'bg-[var(--color-success)]';
    if (score >= 60) return 'bg-[var(--color-warning)]';
    return 'bg-[var(--color-danger)]';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ATS Scorecard & Job Matcher"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <Tabs
          tabs={[
            {
              id: 'audit',
              label: 'ATS Scorecard Audit',
              icon: <Target className="w-4 h-4" />,
            },
            {
              id: 'jd-match',
              label: 'Job Description Matcher',
              icon: <Search className="w-4 h-4" />,
            },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'audit' | 'jd-match')}
        />

        {copiedNotification && (
          <div className="p-2.5 bg-[var(--color-success)]/10 border border-[var(--color-success)]/40 rounded-[var(--radius-subtle)] text-xs text-[var(--color-success)] flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: ATS SCORECARD AUDIT                                                */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Top Score Banner */}
            <div className="p-4 sm:p-5 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-xs">
                  <div className="text-center">
                    <span className={`text-xl sm:text-2xl font-extrabold font-mono tracking-tight ${getScoreColor(atsResult.overallScore)}`}>
                      {atsResult.overallScore}%
                    </span>
                    <span className="block text-[10px] font-mono font-bold text-[var(--color-text-secondary)] -mt-1">
                      GRADE {atsResult.grade}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--color-text-primary)]">
                      ATS Optimization Score
                    </h3>
                    <Badge variant={atsResult.overallScore >= 82 ? 'success' : atsResult.overallScore >= 60 ? 'warning' : 'danger'}>
                      {atsResult.grade} Rating
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {atsResult.verdict}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-[var(--color-text-tertiary)]">
                    <span>{atsResult.totalWordCount} total words</span>
                    <span>•</span>
                    <span>{atsResult.actionVerbs.strongVerbsCount} power verbs</span>
                    <span>•</span>
                    <span>{atsResult.metrics.bulletsWithMetricsCount} metrics detected</span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right w-full sm:w-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('jd-match')}
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                  className="w-full sm:w-auto"
                >
                  Match with Job Post →
                </Button>
              </div>
            </div>

            {/* Category Progress Bars */}
            <div>
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">
                Evaluation Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(atsResult.categories).map((cat) => (
                  <div
                    key={cat.name}
                    className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[var(--color-text-primary)]">{cat.name}</span>
                      <span className="font-mono font-bold text-[var(--color-text-secondary)]">
                        {cat.score} / {cat.maxScore} pts ({cat.percentage}%)
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-1.5 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${getScoreBg(cat.percentage)}`}
                        style={{ width: `${Math.max(4, cat.percentage)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">{cat.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Recommendations Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Actionable Fixes ({atsResult.recommendations.length})
                </h4>
                <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
                  Prioritized by impact
                </span>
              </div>

              {atsResult.recommendations.length === 0 ? (
                <div className="p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/40 rounded-[var(--radius-subtle)] flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">
                      Zero Critical ATS Issues Found!
                    </p>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                      Your resume follows high-ranking ATS formatting and semantic best practices.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {atsResult.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-[var(--radius-subtle)] flex items-start justify-between gap-3 transition-colors duration-150"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {rec.severity === 'critical' ? (
                            <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />
                          ) : rec.severity === 'warning' ? (
                            <Info className="w-4 h-4 text-[var(--color-warning)]" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-[var(--color-brand)]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--color-text-primary)]">
                              {rec.title}
                            </span>
                            <Badge
                              variant={
                                rec.severity === 'critical'
                                  ? 'danger'
                                  : rec.severity === 'warning'
                                  ? 'warning'
                                  : 'secondary'
                              }
                            >
                              +{rec.impactPoints} pts
                            </Badge>
                          </div>
                          <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                            {rec.description}
                          </p>
                        </div>
                      </div>

                      {rec.sectionKey && (
                        <button
                          onClick={() => handleFixClick(rec)}
                          className="shrink-0 text-[11px] font-semibold text-[var(--color-brand)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                        >
                          <span>Fix Section</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Verbs & KPI Insights */}
            <div className="p-3.5 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[var(--color-brand)]" /> Power Verbs Detected ({atsResult.actionVerbs.strongVerbsCount})
                </span>
                <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                  {atsResult.metrics.metricPercentage}% metric density
                </span>
              </div>

              {atsResult.actionVerbs.detectedStrongVerbs.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.actionVerbs.detectedStrongVerbs.map((verb) => (
                    <span
                      key={verb}
                      className="px-2 py-0.5 text-[11px] font-mono bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-subtle)] capitalize"
                    >
                      ✓ {verb}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  No strong power verbs identified. Start bullet points with past-tense action words like "Architected", "Engineered", "Optimized", "Scaled".
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: JOB DESCRIPTION KEYWORD MATCHER                                     */}
        {/* ========================================================================= */}
        {activeTab === 'jd-match' && (
          <div className="space-y-5">
            <div>
              <Textarea
                label="Target Job Description"
                placeholder="Paste the full job description or job posting text here (e.g. responsibilities, requirements, technical stack)..."
                rows={5}
                value={jdInputText}
                onChange={(e) => setJdInputText(e.target.value)}
                helperText="Resumora extracts technical competencies, tools, frameworks, and keywords locally in your browser."
              />
            </div>

            {jdInputText.trim().length >= 20 ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Match Result Banner */}
                <div className="p-4 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
                      <span className={`text-lg font-extrabold font-mono ${getScoreColor(jdResult.matchScore)}`}>
                        {jdResult.matchScore}%
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                          Job Keyword Match
                        </h4>
                        <Badge variant={jdResult.matchScore >= 75 ? 'success' : jdResult.matchScore >= 50 ? 'warning' : 'danger'}>
                          {jdResult.matchedCount} of {jdResult.totalExtractedKeywords} Keywords
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {jdResult.jobTitleDetected ? `Target Role: ${jdResult.jobTitleDetected}` : 'Analyzed key technical skills & qualifications.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-success)] font-bold">{jdResult.matchedCount} matched</span>
                    {' • '}
                    <span className="text-[var(--color-danger)] font-bold">{jdResult.missingCount} missing</span>
                  </div>
                </div>

                {/* Missing Keywords Section with Quick Add Action */}
                {jdResult.missingKeywords.length > 0 && (
                  <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-warning)]" /> Missing Keywords from Job Description ({jdResult.missingKeywords.length})
                      </h4>
                      <span className="text-[11px] text-[var(--color-text-secondary)]">
                        Click "+" to add to Skills
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                      {jdResult.missingKeywords.map((item) => (
                        <div
                          key={item.keyword}
                          className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-[var(--radius-subtle)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
                        >
                          <span className="capitalize font-mono">{item.keyword}</span>
                          <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">({item.occurrencesInJob}x)</span>
                          {onAddSkill && (
                            <button
                              onClick={() => handleAddMissingSkill(item)}
                              className="p-0.5 text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] rounded-[2px] transition-colors cursor-pointer"
                              title={`Add ${item.keyword} to your resume skills`}
                              aria-label={`Add ${item.keyword}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Keywords Section */}
                {jdResult.matchedKeywords.length > 0 && (
                  <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] space-y-3">
                    <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" /> Matched Keywords in Your Resume ({jdResult.matchedKeywords.length})
                    </h4>

                    <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
                      {jdResult.matchedKeywords.map((item) => (
                        <div
                          key={item.keyword}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-subtle)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-xs text-[var(--color-text-primary)]"
                        >
                          <span className="text-[var(--color-success)] font-bold">✓</span>
                          <span className="capitalize font-mono">{item.keyword}</span>
                          <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">({item.matchedLocations[0] || 'Resume'})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-subtle)] space-y-2">
                <Search className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto opacity-60" />
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Paste a Job Description to Match
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)] max-w-sm mx-auto">
                  Copy requirements from LinkedIn, Indeed, or Greenhouse and paste above to see your instant keyword match percentage.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <div className="text-[11px] font-mono text-[var(--color-text-tertiary)] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-success)]" /> 100% Client-Side Local Analysis
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
