import React from 'react';
import { AwardItem } from '../../types/resume';
import { Trophy, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface AwardsEditorProps {
  awards: AwardItem[];
  onAdd: () => void;
  onUpdate: (id: string, update: Partial<AwardItem>) => void;
  onRemove: (id: string) => void;
}

export const AwardsEditor: React.FC<AwardsEditorProps> = ({
  awards,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[var(--color-warning)]" /> Honors &amp; Awards
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Competitions, hackathons, company recognition, or grants.</p>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Award
        </Button>
      </div>

      {awards.length === 0 ? (
        <Card variant="outline" className="text-center py-6 text-xs text-[var(--color-text-secondary)]">
          No awards added.
        </Card>
      ) : (
        <div className="space-y-3">
          {awards.map((award) => (
            <Card key={award.id} variant="surface" className="space-y-3 border border-[var(--color-border)]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">Award Details</span>
                <button onClick={() => onRemove(award.id)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] p-1 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Award Title"
                  value={award.title}
                  onChange={(e) => onUpdate(award.id, { title: e.target.value })}
                  placeholder="1st Place Hackathon Winner"
                />
                <Input
                  label="Issuer"
                  value={award.issuer}
                  onChange={(e) => onUpdate(award.id, { issuer: e.target.value })}
                  placeholder="SF Tech Summit 2023"
                />
                <Input
                  label="Date"
                  type="month"
                  value={award.date}
                  onChange={(e) => onUpdate(award.id, { date: e.target.value })}
                />
                <Input
                  label="Description"
                  value={award.description}
                  onChange={(e) => onUpdate(award.id, { description: e.target.value })}
                  placeholder="Awarded among 100+ teams for..."
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
