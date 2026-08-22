import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ATSAnalysisResult } from '../../utils/atsScoreEngine';

interface ATSScoreBadgeProps {
  analysis: ATSAnalysisResult;
  onClick: () => void;
}

export const ATSScoreBadge: React.FC<ATSScoreBadgeProps> = ({ analysis, onClick }) => {
  const [pulsing, setPulsing] = useState(false);
  const { overallScore, grade } = analysis;

  // Trigger brief pulse animation whenever the score changes
  useEffect(() => {
    setPulsing(true);
    const t = setTimeout(() => setPulsing(false), 800);
    return () => clearTimeout(t);
  }, [overallScore]);

  const getColorStyles = () => {
    if (overallScore >= 82) {
      return {
        bg: 'bg-[var(--color-success)]/10 hover:bg-[var(--color-success)]/20 border-[var(--color-success)]/40',
        text: 'text-[var(--color-success)]',
        badge: 'bg-[var(--color-success)] text-white',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      };
    }
    if (overallScore >= 60) {
      return {
        bg: 'bg-[var(--color-warning)]/10 hover:bg-[var(--color-warning)]/20 border-[var(--color-warning)]/40',
        text: 'text-[var(--color-warning)]',
        badge: 'bg-[var(--color-warning)] text-white',
        icon: <TrendingUp className="w-3.5 h-3.5" />,
      };
    }
    return {
      bg: 'bg-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/20 border-[var(--color-danger)]/40',
      text: 'text-[var(--color-danger)]',
      badge: 'bg-[var(--color-danger)] text-white',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    };
  };

  const colors = getColorStyles();

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:py-1.5 rounded-[var(--radius-subtle)] border transition-all duration-200 cursor-pointer select-none group ${
        colors.bg
      } ${pulsing ? 'scale-105 shadow-sm' : ''}`}
      title="Click to view ATS Scorecard Audit & Job Description Matcher"
      aria-label={`ATS Score: ${overallScore}% Grade ${grade}`}
    >
      <div className="flex items-center gap-1">
        <Target className={`w-3.5 h-3.5 ${colors.text} shrink-0`} />
        <span className="text-[11px] sm:text-xs font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
          ATS:
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className={`text-xs sm:text-sm font-extrabold font-mono ${colors.text}`}>
          {overallScore}%
        </span>
        <span className="hidden md:inline text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
          {grade}
        </span>
      </div>
    </button>
  );
};
