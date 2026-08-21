import React, { useState } from 'react';
import { ProjectItem } from '../../types/resume';
import { FolderGit2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';

interface ProjectsEditorProps {
  projects: ProjectItem[];
  onAdd: () => void;
  onUpdate: (id: string, update: Partial<ProjectItem>) => void;
  onRemove: (id: string) => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
  projects,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (projects[0]) map[projects[0].id] = true;
    return map;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTechInputChange = (projId: string, value: string) => {
    const techList = value.split(',').map((t) => t.trim());
    onUpdate(projId, { technologies: techList });
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[var(--color-accent)]" /> Projects
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Open source projects, personal applications, or research work.</p>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card variant="outline" className="text-center py-8 space-y-3">
          <p className="text-xs text-[var(--color-text-secondary)]">No projects added yet.</p>
          <Button variant="outline" size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add First Project
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((proj, idx) => {
            const isExpanded = expandedIds[proj.id] ?? true;

            return (
              <Card key={proj.id} padding="none" variant="surface" className="overflow-hidden border border-[var(--color-border)]">
                <div
                  onClick={() => toggleExpand(proj.id)}
                  className="px-4 py-3 bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] cursor-pointer flex items-center justify-between select-none transition-colors duration-150"
                >
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    {proj.name || `Project #${idx + 1}`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(proj.id);
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
                        label="Project Name"
                        value={proj.name}
                        onChange={(e) => onUpdate(proj.id, { name: e.target.value })}
                        placeholder="e.g. OmniData Engine"
                      />
                      <Input
                        label="Project URL / Link"
                        type="url"
                        value={proj.url}
                        onChange={(e) => onUpdate(proj.id, { url: e.target.value })}
                        placeholder="https://github.com/username/project"
                      />
                      <div className="sm:col-span-2">
                        <Input
                          label="Technologies Used (comma separated)"
                          value={proj.technologies ? proj.technologies.join(', ') : ''}
                          onChange={(e) => handleTechInputChange(proj.id, e.target.value)}
                          placeholder="TypeScript, React, Node.js, PostgreSQL"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    <Textarea
                      label="Description / Bullet Highlights"
                      rows={3}
                      value={proj.bullets ? proj.bullets.join('\n') : ''}
                      onChange={(e) => onUpdate(proj.id, { bullets: e.target.value.split('\n') })}
                      placeholder="Built CRDT-based offline sync algorithm...&#10;Achieved 10,000 ops/sec throughput..."
                      helperText="Put each key bullet accomplishment on a new line."
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
