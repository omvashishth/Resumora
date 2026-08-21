import React from 'react';
import { Modal } from '../common/Modal';
import type { ImportParseResult } from '../../services/resumeParser';
import {
  CheckCircle2,
  AlertTriangle,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface ImportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parseResult: ImportParseResult | null;
  onConfirmImport: () => void;
}

export const ImportReviewModal: React.FC<ImportReviewModalProps> = ({
  isOpen,
  onClose,
  parseResult,
  onConfirmImport,
}) => {
  if (!parseResult) return null;

  const { isScannedPdf, resume, confidence, warnings, success } = parseResult;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Resume Review" maxWidth="2xl">
      <div className="space-y-4">
        {/* Header Alert */}
        {isScannedPdf || !success ? (
          <div className="bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/40 rounded-[var(--radius-subtle)] p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[var(--color-danger)]">Image-Based Document Detected</h4>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                This PDF appears to be image-based or scanned. We couldn't automatically extract selectable text. You can still create a fresh resume using our structured builder.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--color-success-subtle)] border border-[var(--color-success)]/40 rounded-[var(--radius-subtle)] p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[var(--color-success)]">Import Complete</h4>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                Document text extracted and converted into structured resume fields. Review detected entries below before proceeding to the editor.
              </p>
            </div>
          </div>
        )}

        {/* Section Extraction Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card variant="surface" padding="sm" className="bg-[var(--color-surface-raised)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[var(--color-text-primary)]">
              <User className="w-4 h-4 text-[var(--color-brand)]" />
              <span>Personal Details</span>
            </div>
            <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between">
                <span>Name:</span>
                <span className="font-medium text-[var(--color-text-primary)]">{resume.personal.fullName || 'Not detected'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email:</span>
                <span className="font-medium text-[var(--color-text-primary)] truncate max-w-[140px]">{resume.personal.email || 'Not detected'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Phone:</span>
                <span className="font-medium text-[var(--color-text-primary)]">{resume.personal.phone || 'Not detected'}</span>
              </div>
            </div>
          </Card>

          <Card variant="surface" padding="sm" className="bg-[var(--color-surface-raised)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[var(--color-text-primary)]">
              <Briefcase className="w-4 h-4 text-[var(--color-success)]" />
              <span>Work Experience</span>
            </div>
            <p className="text-xs text-[var(--color-text-primary)] font-semibold mb-1">
              ✓ {confidence.experienceCount} {confidence.experienceCount === 1 ? 'position' : 'positions'} detected
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono">
              {resume.experience[0]?.position ? `@ ${resume.experience[0].company || 'Company'}` : 'Review details in builder'}
            </p>
          </Card>

          <Card variant="surface" padding="sm" className="bg-[var(--color-surface-raised)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[var(--color-text-primary)]">
              <GraduationCap className="w-4 h-4 text-[var(--color-info)]" />
              <span>Education</span>
            </div>
            <p className="text-xs text-[var(--color-text-primary)] font-semibold mb-1">
              ✓ {confidence.educationCount} {confidence.educationCount === 1 ? 'entry' : 'entries'} detected
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono">
              {resume.education[0]?.degree || 'Review degrees in builder'}
            </p>
          </Card>

          <Card variant="surface" padding="sm" className="bg-[var(--color-surface-raised)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[var(--color-text-primary)]">
              <Wrench className="w-4 h-4 text-[var(--color-warning)]" />
              <span>Skills &amp; Competencies</span>
            </div>
            <p className="text-xs text-[var(--color-text-primary)] font-semibold mb-1">
              ✓ {confidence.skillsCount} skills detected
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {resume.skills.slice(0, 4).map((s) => (
                <Badge key={s.id} variant="default">
                  {s.name}
                </Badge>
              ))}
              {resume.skills.length > 4 && (
                <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">+{resume.skills.length - 4} more</span>
              )}
            </div>
          </Card>
        </div>

        {/* Warnings Section */}
        {warnings.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
            <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider font-mono">Warnings &amp; Notifications</h4>
            <div className="space-y-1.5">
              {warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-warning)] bg-[var(--color-warning-subtle)] p-2.5 rounded-[var(--radius-subtle)] border border-[var(--color-warning)]/30">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span><strong>{w.field}:</strong> {w.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirmImport}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Review &amp; Edit Resume
          </Button>
        </div>
      </div>
    </Modal>
  );
};
