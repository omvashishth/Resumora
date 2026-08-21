import React from 'react';
import { CertificationItem } from '../../types/resume';
import { Award, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface CertificationsEditorProps {
  certifications: CertificationItem[];
  onAdd: () => void;
  onUpdate: (id: string, update: Partial<CertificationItem>) => void;
  onRemove: (id: string) => void;
}

export const CertificationsEditor: React.FC<CertificationsEditorProps> = ({
  certifications,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--color-success)]" /> Certifications &amp; Licenses
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Professional certifications, credentials, and verification links.</p>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <Card variant="outline" className="text-center py-6 text-xs text-[var(--color-text-secondary)]">
          No certifications added.
        </Card>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert) => (
            <Card key={cert.id} variant="surface" className="space-y-3 border border-[var(--color-border)]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">Certification Details</span>
                <button
                  onClick={() => onRemove(cert.id)}
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Certification Name"
                  value={cert.name}
                  onChange={(e) => onUpdate(cert.id, { name: e.target.value })}
                  placeholder="AWS Certified Solutions Architect"
                />
                <Input
                  label="Issuer / Organization"
                  value={cert.issuer}
                  onChange={(e) => onUpdate(cert.id, { issuer: e.target.value })}
                  placeholder="Amazon Web Services"
                />
                <Input
                  label="Date Issued"
                  type="month"
                  value={cert.date}
                  onChange={(e) => onUpdate(cert.id, { date: e.target.value })}
                />
                <Input
                  label="Credential URL"
                  type="url"
                  value={cert.url}
                  onChange={(e) => onUpdate(cert.id, { url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
