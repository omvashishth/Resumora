import React from 'react';
import { Modal } from '../common/Modal';
import { consentManager } from '../../ai/privacy/consentManager';
import { Shield, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface AIConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentGranted: () => void;
}

export const AIConsentModal: React.FC<AIConsentModalProps> = ({
  isOpen,
  onClose,
  onConsentGranted,
}) => {
  const handleGrant = () => {
    consentManager.grantAIConsent();
    onConsentGranted();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Privacy Consent Required" maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-[var(--color-brand-subtle)] p-3.5 rounded-[var(--radius-subtle)] border border-[var(--color-brand)]/30">
          <Sparkles className="w-5 h-5 text-[var(--color-brand)] shrink-0" />
          <p className="text-xs text-[var(--color-text-primary)] font-medium">
            AI assistance sends the selected resume content to your chosen AI provider for processing.
          </p>
        </div>

        <Card variant="surface" padding="sm" className="space-y-2 border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)]">
            <Shield className="w-4 h-4 text-[var(--color-success)]" />
            <span>Our Privacy Commitments:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
            <li>Only the active text selection or bullet is sent (never your entire resume automatically).</li>
            <li>No data is used for background training without your provider's terms.</li>
            <li>You can revoke AI consent anytime in Account Settings.</li>
          </ul>
        </Card>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleGrant} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
            Continue &amp; Enable AI
          </Button>
        </div>
      </div>
    </Modal>
  );
};
