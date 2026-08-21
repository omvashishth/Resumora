import React, { useState } from 'react';
import { SkillItem } from '../../types/resume';
import { Wrench, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface SkillsEditorProps {
  skills: SkillItem[];
  onAddSkill: (name: string, category: string, level: string) => void;
  onRemoveSkill: (id: string) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  skills,
  onAddSkill,
  onRemoveSkill,
}) => {
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('General');
  const [level, setLevel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    onAddSkill(skillName, category, level);
    setSkillName('');
  };

  const quickSuggestions = [
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'Tailwind CSS',
    'PostgreSQL',
    'AWS',
    'Docker',
    'GraphQL',
    'Git',
    'REST APIs',
    'Agile',
  ];

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4">
        <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[var(--color-warning)]" /> Skills &amp; Competencies
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          Technical skills, frameworks, tools, and domain expertise.
        </p>
      </div>

      {/* Add Skill Form */}
      <Card variant="surface" padding="md">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Skill Name"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. React"
            />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'General', label: 'General' },
                { value: 'Frontend', label: 'Frontend' },
                { value: 'Backend', label: 'Backend' },
                { value: 'Languages', label: 'Languages' },
                { value: 'Databases', label: 'Databases' },
                { value: 'DevOps', label: 'DevOps' },
                { value: 'Tools', label: 'Tools' },
              ]}
            />
            <Select
              label="Proficiency (Optional)"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              options={[
                { value: '', label: 'None' },
                { value: 'Expert', label: 'Expert' },
                { value: 'Advanced', label: 'Advanced' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Beginner', label: 'Beginner' },
              ]}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!skillName.trim()}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full"
          >
            Add Skill
          </Button>
        </form>
      </Card>

      {/* Quick Add Pills */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] block mb-1.5">
          Quick Add Popular Skills:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onAddSkill(s, 'General', '')}
              className="text-[11px] font-medium bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-2.5 py-1 rounded-[var(--radius-subtle)] transition-colors cursor-pointer"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Added Skills List */}
      <div>
        <h4 className="text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Added Skills ({skills.length}):</h4>
        {skills.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)] italic">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="default" className="text-xs font-medium py-1 px-2.5">
                <span>{skill.name}</span>
                {skill.level && <span className="text-[10px] text-[var(--color-warning)]">({skill.level})</span>}
                <button
                  onClick={() => onRemoveSkill(skill.id)}
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
