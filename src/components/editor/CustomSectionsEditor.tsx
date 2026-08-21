import React from 'react';
import { CustomSection } from '../../types/resume';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';

interface CustomSectionsEditorProps {
  customSections: CustomSection[];
  onAddSection: (title?: string) => void;
  onRemoveSection: (id: string) => void;
  onUpdateSection: (sections: CustomSection[]) => void;
}

export const CustomSectionsEditor: React.FC<CustomSectionsEditorProps> = ({
  customSections,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
}) => {
  const updateSectionTitle = (sectionId: string, title: string) => {
    const updated = customSections.map((cs) => (cs.id === sectionId ? { ...cs, title } : cs));
    onUpdateSection(updated);
  };

  const addItemToSection = (sectionId: string) => {
    const updated = customSections.map((cs) => {
      if (cs.id !== sectionId) return cs;
      return {
        ...cs,
        items: [
          ...cs.items,
          { id: crypto.randomUUID(), title: '', subtitle: '', date: '', description: '' },
        ],
      };
    });
    onUpdateSection(updated);
  };

  const updateItem = (sectionId: string, itemId: string, field: string, val: string) => {
    const updated = customSections.map((cs) => {
      if (cs.id !== sectionId) return cs;
      return {
        ...cs,
        items: cs.items.map((item) => (item.id === itemId ? { ...item, [field]: val } : item)),
      };
    });
    onUpdateSection(updated);
  };

  const removeItem = (sectionId: string, itemId: string) => {
    const updated = customSections.map((cs) => {
      if (cs.id !== sectionId) return cs;
      return {
        ...cs,
        items: cs.items.filter((item) => item.id !== itemId),
      };
    });
    onUpdateSection(updated);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-accent-secondary)]" /> Custom Sections
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Add user-defined custom sections (e.g. Publications, Patents, Speaking).</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => onAddSection('New Custom Section')} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Custom Section
        </Button>
      </div>

      {customSections.length === 0 ? (
        <Card variant="outline" className="text-center py-6 text-xs text-[var(--color-text-secondary)]">
          No custom sections added yet.
        </Card>
      ) : (
        <div className="space-y-6">
          {customSections.map((cs) => (
            <Card key={cs.id} variant="surface" className="space-y-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Input
                  value={cs.title}
                  onChange={(e) => updateSectionTitle(cs.id, e.target.value)}
                  placeholder="Section Title (e.g. Publications)"
                  className="font-bold text-sm"
                />
                <button
                  onClick={() => onRemoveSection(cs.id)}
                  className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-raised)] rounded-[var(--radius-subtle)] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {cs.items.map((item) => (
                  <div key={item.id} className="bg-[var(--color-surface-raised)] p-3 rounded-[var(--radius-subtle)] border border-[var(--color-border)] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">Entry</span>
                      <button onClick={() => removeItem(cs.id, item.id)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={item.title}
                        onChange={(e) => updateItem(cs.id, item.id, 'title', e.target.value)}
                        placeholder="Title / Name"
                      />
                      <Input
                        value={item.date || ''}
                        onChange={(e) => updateItem(cs.id, item.id, 'date', e.target.value)}
                        placeholder="Date / Year"
                      />
                    </div>
                    <Textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateItem(cs.id, item.id, 'description', e.target.value)}
                      placeholder="Description / details..."
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItemToSection(cs.id)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-[var(--color-accent-secondary)]"
              >
                Add Entry to {cs.title || 'Section'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
