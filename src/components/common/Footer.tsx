import React from 'react';
import { Shield, Lock, HardDrive } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] text-[var(--color-text-secondary)] py-10 px-4 mt-auto transition-colors duration-150">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-serif font-bold text-[var(--color-text-primary)] text-base mb-2">
            <span>Resumora</span>
            <Badge variant="success">Local-First Studio</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Privacy-first career software. Your resume data is stored exclusively in your browser’s IndexedDB database with zero mandatory network dependencies.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Privacy &amp; Security</h4>
          <div className="space-y-2 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-[var(--color-brand)]" />
              <span>Zero server network transfer</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[var(--color-success)]" />
              <span>No mandatory account required</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />
              <span>Client-side PDF &amp; DOCX compilation</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-2">Architectural Guarantee</h4>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Designed for future AI writing and ATS analysis extensions without mutating your core local resume schema.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-[var(--color-border)] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono text-[var(--color-text-tertiary)] gap-2">
        <p>&copy; {new Date().getFullYear()} Resumora Resume Platform. All rights reserved.</p>
        <p>Built with React, TypeScript &amp; IndexedDB</p>
      </div>
    </footer>
  );
};
