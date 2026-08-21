import React, { useState } from 'react';
import { LanguageItem } from '../../types/resume';
import { Languages, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface LanguagesEditorProps {
  languages: LanguageItem[];
  onAdd: (language: string, proficiency: string) => void;
  onRemove: (id: string) => void;
}

export const LanguagesEditor: React.FC<LanguagesEditorProps> = ({
  languages,
  onAdd,
  onRemove,
}) => {
  const [langName, setLangName] = useState('');
  const [proficiency, setProficiency] = useState('Fluent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!langName.trim()) return;
    onAdd(langName, proficiency);
    setLangName('');
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4">
        <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Languages className="w-4 h-4 text-[var(--color-accent-secondary)]" /> Languages Spoken
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Spoken and written language proficiencies.</p>
      </div>

      <Card variant="surface" padding="md">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Language"
              value={langName}
              onChange={(e) => setLangName(e.target.value)}
              placeholder="e.g. Spanish"
            />
            <Select
              label="Proficiency"
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              options={[
                { value: 'Native', label: 'Native / Bilingual' },
                { value: 'Fluent', label: 'Fluent' },
                { value: 'Proficient', label: 'Proficient' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Basic', label: 'Basic' },
                { value: '', label: 'None (Language Name Only)' },
              ]}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!langName.trim()}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full"
          >
            Add Language
          </Button>
        </form>
      </Card>

      <div className="space-y-2">
        {languages.map((l) => (
          <div key={l.id} className="flex justify-between items-center bg-[var(--color-surface)] px-4 py-2 rounded-[var(--radius-subtle)] border border-[var(--color-border)] text-xs">
            <span className="font-semibold text-[var(--color-text-primary)]">{l.language}</span>
            <div className="flex items-center gap-2">
              {l.proficiency && (
                <Badge variant="secondary">{l.proficiency}</Badge>
              )}
              <button onClick={() => onRemove(l.id)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
