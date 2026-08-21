import React, { useState } from 'react';
import { EducationItem } from '../../types/resume';
import { GraduationCap, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';

interface EducationEditorProps {
  education: EducationItem[];
  onAdd: () => void;
  onUpdate: (id: string, update: Partial<EducationItem>) => void;
  onRemove: (id: string) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({
  education,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (education[0]) map[education[0].id] = true;
    return map;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[var(--color-info)]" /> Education &amp; Degrees
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Degrees, academic honors, institutions, and dates.</p>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <Card variant="outline" className="text-center py-8 space-y-3">
          <p className="text-xs text-[var(--color-text-secondary)]">No education entries added yet.</p>
          <Button variant="outline" size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Degree
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {education.map((edu, idx) => {
            const isExpanded = expandedIds[edu.id] ?? true;

            return (
              <Card key={edu.id} padding="none" variant="surface" className="overflow-hidden border border-[var(--color-border)]">
                <div
                  onClick={() => toggleExpand(edu.id)}
                  className="px-4 py-3 bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] cursor-pointer flex items-center justify-between select-none transition-colors duration-150"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    <div>
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        {edu.degree || `Degree #${idx + 1}`}
                      </span>
                      {edu.institution && (
                        <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                          — {edu.institution}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(edu.id);
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
                        label="Degree / Qualification"
                        value={edu.degree}
                        onChange={(e) => onUpdate(edu.id, { degree: e.target.value })}
                        placeholder="e.g. B.S. in Computer Science"
                      />
                      <Input
                        label="Institution / University"
                        value={edu.institution}
                        onChange={(e) => onUpdate(edu.id, { institution: e.target.value })}
                        placeholder="e.g. UC Berkeley"
                      />
                      <Input
                        label="Location"
                        value={edu.location}
                        onChange={(e) => onUpdate(edu.id, { location: e.target.value })}
                        placeholder="Berkeley, CA"
                      />
                      <Input
                        label="GPA / Score (Optional)"
                        value={edu.gpa || ''}
                        onChange={(e) => onUpdate(edu.id, { gpa: e.target.value })}
                        placeholder="3.85 / 4.0"
                      />
                      <Input
                        label="Start Date"
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => onUpdate(edu.id, { startDate: e.target.value })}
                      />
                      <Input
                        label="End Date (or Expected)"
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => onUpdate(edu.id, { endDate: e.target.value })}
                      />
                    </div>

                    <Textarea
                      label="Description / Honors"
                      rows={2}
                      value={edu.description}
                      onChange={(e) => onUpdate(edu.id, { description: e.target.value })}
                      placeholder="Relevant coursework, academic distinctions, clubs, Dean's Honors List..."
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
