import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { TEMPLATES, getTemplateById } from '../../templates/TemplateRenderer';
import type { TemplateId, Resume } from '../../types/resume';
import { Check, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateId: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
  sampleResume: Resume;
}

const PLACEHOLDER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="38" r="22" fill="%2394a3b8"/><path d="M20 90 C20 65 35 60 50 60 C65 60 80 65 80 90 Z" fill="%2394a3b8"/></svg>`;

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTemplateId,
  onSelectTemplate,
  sampleResume,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'photo', label: 'Photo', icon: <Camera className="w-3 h-3 text-[var(--color-brand)]" /> },
    { id: 'Modern', label: 'Modern' },
    { id: 'Minimalist', label: 'Minimal' },
    { id: 'Executive', label: 'Executive' },
    { id: 'Academic', label: 'Academic' },
    { id: 'Traditional', label: 'Traditional' },
  ];

  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'photo') return tmpl.supportsPhoto === true;
    return tmpl.category === activeCategory;
  });

  const activeTemplateDef = getTemplateById(currentTemplateId);
  const isPhotoTemplateActive = activeTemplateDef.supportsPhoto === true;
  const hasUserPhoto = Boolean(sampleResume.personal.avatarUrl);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Resume Template" maxWidth="4xl">
      <div className="space-y-4">
        {/* Category Filter Pills */}
        <div className="flex overflow-x-auto gap-1.5 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] scrollbar-none snap-x touch-scroll">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-subtle)] transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 snap-start min-h-[40px] sm:min-h-[36px] ${
                  isActive
                    ? 'bg-[var(--color-brand)] text-[var(--color-text-inverse)] shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                {cat.icon && <span className="shrink-0">{cat.icon}</span>}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Empty Photo State Banner */}
        {isPhotoTemplateActive && !hasUserPhoto && (
          <div className="p-3 bg-[var(--color-brand-subtle)] border border-[var(--color-brand)]/40 rounded-[var(--radius-subtle)] flex items-center justify-between text-xs text-[var(--color-text-primary)]">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
              <span>
                <strong>Photo Template Active:</strong> Add a profile photo under Personal Details to complete this layout.
              </span>
            </span>
          </div>
        )}

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tmpl, index) => {
            const isSelected = tmpl.id === currentTemplateId;
            const Component = tmpl.component;

            // Use real avatarUrl if user uploaded one; otherwise fallback to silhouette for photo template previews
            const previewAvatar = hasUserPhoto
              ? sampleResume.personal.avatarUrl
              : tmpl.supportsPhoto
              ? PLACEHOLDER_AVATAR
              : '';

            const previewResume: Resume = {
              ...sampleResume,
              templateId: tmpl.id,
              personal: { ...sampleResume.personal, avatarUrl: previewAvatar },
            };

            const indexFormatted = String(index + 1).padStart(2, '0');

            return (
              <Card
                key={tmpl.id}
                padding="none"
                variant={isSelected ? 'interactive' : 'surface'}
                className={`overflow-hidden flex flex-col justify-between group border border-[var(--color-border)] ${
                  isSelected ? 'border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]' : ''
                }`}
              >
                {/* Mini Document Box */}
                <div className="h-56 sm:h-60 overflow-hidden bg-[var(--color-surface-raised)] relative p-2 flex justify-center items-start border-b border-[var(--color-border)]">
                  <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 pointer-events-none shadow-paper origin-top scale-[0.26] sm:scale-[0.27] transition-transform duration-150">
                    <Component resume={previewResume} isPreview={true} />
                  </div>
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-mono font-bold text-[var(--color-accent)] bg-[var(--color-surface-raised)] px-2 py-0.5 border border-[var(--color-border)] rounded-[2px]">
                    {indexFormatted}
                  </span>

                  {tmpl.supportsPhoto && (
                    <Badge variant="success" className="absolute bottom-2.5 left-2.5 text-[10px]">
                      <Camera className="w-3 h-3 inline mr-0.5" /> PHOTO
                    </Badge>
                  )}

                  {isSelected && (
                    <Badge variant="primary" className="absolute top-2.5 right-2.5">
                      <Check className="w-3 h-3 inline mr-0.5" /> Selected
                    </Badge>
                  )}
                </div>

                {/* Card Information */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-[var(--color-surface)]">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-serif text-xs font-bold text-[var(--color-text-primary)]">{tmpl.name}</h4>
                      <Badge variant="secondary">{tmpl.category}</Badge>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">{tmpl.description}</p>
                  </div>

                  <Button
                    variant={isSelected ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => {
                      onSelectTemplate(tmpl.id);
                      onClose();
                    }}
                    className="w-full"
                  >
                    {isSelected ? 'Active Template' : 'Use Template'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
