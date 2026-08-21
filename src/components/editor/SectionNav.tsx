import React from 'react';
import type { Resume, SectionKey } from '../../types/resume';
import { getSectionCompletion, getSectionTitle } from '../../utils/formatting';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Award,
  Trophy,
  Languages,
  Heart,
  Layers,
  Sliders,
  ChevronUp,
  ChevronDown,
  Check,
} from 'lucide-react';

interface SectionNavProps {
  resume: Resume;
  activeSection: SectionKey | 'customization';
  onSelectSection: (section: SectionKey | 'customization') => void;
  onReorderSections: (newOrder: SectionKey[]) => void;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  resume,
  activeSection,
  onSelectSection,
  onReorderSections,
}) => {
  const getSectionIcon = (key: SectionKey) => {
    switch (key) {
      case 'personal':
        return <User className="w-3.5 h-3.5 text-[var(--color-brand)] shrink-0" />;
      case 'summary':
        return <FileText className="w-3.5 h-3.5 text-[var(--color-accent-secondary)] shrink-0" />;
      case 'experience':
        return <Briefcase className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" />;
      case 'education':
        return <GraduationCap className="w-3.5 h-3.5 text-[var(--color-info)] shrink-0" />;
      case 'projects':
        return <FolderGit2 className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />;
      case 'skills':
        return <Wrench className="w-3.5 h-3.5 text-[var(--color-warning)] shrink-0" />;
      case 'certifications':
        return <Award className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" />;
      case 'awards':
        return <Trophy className="w-3.5 h-3.5 text-[var(--color-warning)] shrink-0" />;
      case 'languages':
        return <Languages className="w-3.5 h-3.5 text-[var(--color-info)] shrink-0" />;
      case 'volunteer':
        return <Heart className="w-3.5 h-3.5 text-[var(--color-danger)] shrink-0" />;
      case 'customSections':
        return <Layers className="w-3.5 h-3.5 text-[var(--color-accent-secondary)] shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[var(--color-text-secondary)] shrink-0" />;
    }
  };

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    const order = [...resume.settings.sectionOrder];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const temp = order[idx];
    order[idx] = order[targetIdx];
    order[targetIdx] = temp;
    onReorderSections(order);
  };

  return (
    <nav className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] p-2 sm:p-3">
      {/* Desktop Header */}
      <div className="hidden md:flex px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-secondary)] border-b border-[var(--color-border)] justify-between items-center mb-1">
        <span>Contents</span>
        <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">Reorder</span>
      </div>

      {/* Mobile Horizontal Pill Bar vs Desktop Vertical Sidebar List */}
      <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 md:gap-1 pb-1 md:pb-0 scrollbar-none snap-x touch-scroll">
        {resume.settings.sectionOrder.map((sectionKey, idx) => {
          const completion = getSectionCompletion(resume, sectionKey);
          const isActive = activeSection === sectionKey;
          const indexFormatted = String(idx + 1).padStart(2, '0');

          return (
            <div key={sectionKey} className="group flex items-center justify-between gap-1 shrink-0 snap-start">
              <button
                onClick={() => onSelectSection(sectionKey)}
                className={`flex items-center gap-2 px-3.5 sm:px-3 py-2 rounded-[var(--radius-subtle)] text-xs font-semibold transition-all duration-150 text-left cursor-pointer whitespace-nowrap md:w-full min-h-[40px] sm:min-h-[36px] ${
                  isActive
                    ? 'bg-[var(--color-brand)] text-[var(--color-text-inverse)] shadow-xs'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] bg-[var(--color-surface-raised)] md:bg-transparent border border-[var(--color-border)] md:border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`font-mono text-[10px] hidden sm:inline ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`}>
                    {indexFormatted}
                  </span>
                  {getSectionIcon(sectionKey)}
                  <span className="truncate">{getSectionTitle(sectionKey)}</span>
                </div>

                <div className="flex items-center gap-1.5 ml-1 shrink-0">
                  {completion.isComplete && (
                    <span className={`text-[10px] font-mono ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-success)]'}`}>
                      <Check className="w-3 h-3 inline" />
                    </span>
                  )}
                </div>
              </button>

              <div className="hidden md:group-hover:flex flex-col transition-opacity duration-150 shrink-0">
                <button
                  disabled={idx === 0}
                  onClick={() => moveSection(idx, 'up')}
                  className="p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-20 cursor-pointer"
                  title="Move up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={idx === resume.settings.sectionOrder.length - 1}
                  onClick={() => moveSection(idx, 'down')}
                  className="p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-20 cursor-pointer"
                  title="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Design Customization Item */}
        <div className="shrink-0 snap-start">
          <button
            onClick={() => onSelectSection('customization')}
            className={`flex items-center gap-2 px-3.5 sm:px-3 py-2 rounded-[var(--radius-subtle)] text-xs font-semibold transition-all duration-150 text-left cursor-pointer whitespace-nowrap md:w-full min-h-[40px] sm:min-h-[36px] ${
              activeSection === 'customization'
                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] shadow-xs'
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] bg-[var(--color-surface-raised)] md:bg-transparent border border-[var(--color-border)] md:border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>Design Style</span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};
