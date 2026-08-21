import React from 'react';
import { VolunteerItem } from '../../types/resume';
import { Heart, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';

interface VolunteerEditorProps {
  volunteer: VolunteerItem[];
  onAdd: () => void;
  onUpdate: (id: string, update: Partial<VolunteerItem>) => void;
  onRemove: (id: string) => void;
}

export const VolunteerEditor: React.FC<VolunteerEditorProps> = ({
  volunteer,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Heart className="w-4 h-4 text-[var(--color-danger)]" /> Volunteer Experience
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Community service, non-profit work, or mentoring involvement.</p>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Volunteer Role
        </Button>
      </div>

      {volunteer.length === 0 ? (
        <Card variant="outline" className="text-center py-6 text-xs text-[var(--color-text-secondary)]">
          No volunteer experience added.
        </Card>
      ) : (
        <div className="space-y-3">
          {volunteer.map((vol) => (
            <Card key={vol.id} variant="surface" className="space-y-3 border border-[var(--color-border)]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">Volunteer Role</span>
                <button onClick={() => onRemove(vol.id)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] p-1 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Organization"
                  value={vol.organization}
                  onChange={(e) => onUpdate(vol.id, { organization: e.target.value })}
                  placeholder="CoderDojo Foundation"
                />
                <Input
                  label="Role / Position"
                  value={vol.position}
                  onChange={(e) => onUpdate(vol.id, { position: e.target.value })}
                  placeholder="Youth Coding Mentor"
                />
                <Input
                  label="Start Date"
                  type="month"
                  value={vol.startDate}
                  onChange={(e) => onUpdate(vol.id, { startDate: e.target.value })}
                />
                <Input
                  label="End Date"
                  type="month"
                  disabled={vol.current}
                  value={vol.endDate}
                  onChange={(e) => onUpdate(vol.id, { endDate: e.target.value })}
                />
              </div>
              <Textarea
                label="Description"
                rows={2}
                value={vol.description}
                onChange={(e) => onUpdate(vol.id, { description: e.target.value })}
                placeholder="Teaching web fundamentals to students..."
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
