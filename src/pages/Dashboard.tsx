import React, { useState, useEffect } from 'react';
import type { Resume } from '../types/resume';
import {
  deleteResume,
  duplicateResume,
  renameResume,
  ensureInitialSeed,
  getAllResumes,
  saveResume,
} from '../storage/resumeRepository';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Modal } from '../components/common/Modal';
import { ImportReviewModal } from '../components/import/ImportReviewModal';
import { AccountModal } from '../components/common/AccountModal';
import { createEmptyResume } from '../utils/sampleData';
import { exportResumeToPdf } from '../services/pdfService';
import { exportResumeToDocx } from '../services/docxService';
import { importResumeFile } from '../services/importService';
import type { ImportParseResult } from '../services/resumeParser';
import { triggerResumeSync, performFullTwoWaySync, subscribeSyncStatus } from '../services/syncManager';
import { getCurrentUser } from '../services/authService';
import { exportLimitManager } from '../services/exportLimitManager';
import { PaywallModal, PaywallTriggerReason } from '../components/pricing/PaywallModal';
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  FileText,
  Clock,
  Upload,
  AlertTriangle,
  Tag,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { TemplateRenderer } from '../templates/TemplateRenderer';

interface DashboardProps {
  onNavigate: (view: 'landing' | 'dashboard' | 'builder', resumeId?: string) => void;
  onSelectResume: (resume: Resume) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectResume }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [renameModalItem, setRenameModalItem] = useState<{ id: string; title: string } | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PaywallTriggerReason>('export_limit');

  // Import state
  const [importing, setImporting] = useState(false);
  const [parseResult, setParseResult] = useState<ImportParseResult | null>(null);
  const [importReviewOpen, setImportReviewOpen] = useState(false);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      await ensureInitialSeed();
      const user = await getCurrentUser();
      if (user) {
        await performFullTwoWaySync();
      }
      const data = await getAllResumes();
      setResumes(data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    const unsubSync = subscribeSyncStatus((status) => {
      if (status.state === 'synced') {
        getAllResumes().then(setResumes);
      }
    });
    return () => {
      unsubSync();
    };
  }, []);

  const handleCreateNew = () => {
    const newResume = createEmptyResume('New Professional Resume');
    onSelectResume(newResume);
    onNavigate('builder', newResume.id);
  };

  const handleEdit = (resume: Resume) => {
    onSelectResume(resume);
    onNavigate('builder', resume.id);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await duplicateResume(id);
      triggerResumeSync(copy.id, 'upsert');
      await fetchResumes();
    } catch (err) {
      console.error('Duplicate error:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalId) return;
    try {
      await deleteResume(deleteModalId);
      triggerResumeSync(deleteModalId, 'delete');
      setDeleteModalId(null);
      await fetchResumes();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameModalItem || !newTitleInput.trim()) return;
    try {
      const updated = await renameResume(renameModalItem.id, newTitleInput);
      triggerResumeSync(updated.id, 'upsert');
      setRenameModalItem(null);
      await fetchResumes();
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  const handleDownloadPdf = async (resume: Resume) => {
    if (!exportLimitManager.canExport()) {
      setPaywallReason('export_limit');
      setPaywallOpen(true);
      return;
    }

    try {
      const blob = await exportResumeToPdf(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.personal.fullName || resume.title || 'Resume'}.pdf`.replace(/\s+/g, '_');
      a.click();
      URL.revokeObjectURL(url);
      await exportLimitManager.recordExport();
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const handleDownloadDocx = async (resume: Resume) => {
    if (!exportLimitManager.canExport()) {
      setPaywallReason('export_limit');
      setPaywallOpen(true);
      return;
    }

    try {
      const blob = await exportResumeToDocx(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.personal.fullName || resume.title || 'Resume'}.docx`.replace(/\s+/g, '_');
      a.click();
      URL.revokeObjectURL(url);
      await exportLimitManager.recordExport();
    } catch (err) {
      console.error('DOCX export error:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("File exceeds the maximum allowed size of 15MB.");
      e.target.value = '';
      return;
    }

    const fileNameLower = file.name.toLowerCase();
    const isAllowed =
      fileNameLower.endsWith('.pdf') ||
      fileNameLower.endsWith('.docx') ||
      fileNameLower.endsWith('.json') ||
      file.type === 'application/pdf' ||
      file.type.includes('wordprocessingml') ||
      file.type.includes('msword') ||
      file.type === 'application/json';

    if (!isAllowed) {
      alert("Unsupported file format. Please upload a PDF, DOCX, or JSON document.");
      e.target.value = '';
      return;
    }

    setImporting(true);
    try {
      const result = await importResumeFile(file);
      setParseResult(result);
      setImportReviewOpen(true);
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (parseResult?.resume) {
      try {
        await saveResume(parseResult.resume);
        triggerResumeSync(parseResult.resume.id, 'upsert');
      } catch (e) {
        console.warn('Could not immediately save imported resume to storage:', e);
      }
      onSelectResume(parseResult.resume);
      setImportReviewOpen(false);
      onNavigate('builder', parseResult.resume.id);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex flex-col font-sans transition-colors duration-150">
      <Header
        currentView="dashboard"
        onNavigate={onNavigate}
        onOpenAccountModal={() => setAccountModalOpen(true)}
        onOpenPaywallModal={() => {
          setPaywallReason('export_limit');
          setPaywallOpen(true);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Header & Editorial Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-[var(--color-border)]">
          <div>
            <span className="text-[11px] sm:text-[12px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] font-semibold block mb-2 sm:mb-4">
              Document Catalog
            </span>
            <h1 className="font-serif text-[36px] sm:text-[48px] md:text-[64px] font-[700] uppercase leading-[0.85] sm:leading-[0.8] tracking-tighter text-[var(--color-text-primary)]">
              My Resumes
            </h1>
            <p className="text-xs sm:text-[14px] text-[var(--color-text-secondary)] mt-3 sm:mt-4 font-normal leading-relaxed">
              Locally stored in browser IndexedDB with zero mandatory network dependencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
            <label className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[36px] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] cursor-pointer transition-colors duration-150">
              <Upload className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>{importing ? 'Extracting...' : 'Import Resume'}</span>
              <input
                type="file"
                accept=".pdf,.docx,.json"
                onChange={handleFileUpload}
                className="hidden"
                disabled={importing}
              />
            </label>

            <Button
              variant="primary"
              size="md"
              onClick={handleCreateNew}
              leftIcon={<Plus className="w-4 h-4" />}
              className="flex-1 sm:flex-initial min-h-[40px] sm:min-h-[36px]"
            >
              Create Resume →
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-6 h-6 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono text-[var(--color-text-secondary)]">Loading resumes from local database...</p>
          </div>
        ) : resumes.length === 0 ? (
          /* Empty State */
          <Card variant="surface" className="max-w-md mx-auto text-center py-10 sm:py-12 px-4 sm:px-6 space-y-4">
            <div className="w-12 h-12 rounded-[var(--radius-medium)] bg-[var(--color-surface-raised)] border border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-accent)] mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Create your first resume</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
              Select a battle-tested template, upload an existing resume, or enter your background to export vector PDFs and Word documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button variant="primary" size="md" onClick={handleCreateNew} className="flex-1 min-h-[40px]">
                Create Resume →
              </Button>
              <label className="flex-1 py-2 px-3 min-h-[40px] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold text-xs uppercase tracking-wider rounded-[var(--radius-subtle)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150">
                <Upload className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Start from Existing</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={importing}
                />
              </label>
            </div>
          </Card>
        ) : (
          /* Resume Card Grid (Editorial Stationery Papers) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {resumes.map((res, index) => {
              const formattedDate = new Date(res.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const indexFormatted = String(index + 1).padStart(2, '0');

              return (
                <Card
                  key={res.id}
                  variant="interactive"
                  padding="none"
                  className="flex flex-col justify-between overflow-hidden shadow-sm group border border-[var(--color-border-strong)] transition-all duration-[400ms] hover:shadow-2xl hover:-translate-y-1"
                >
                  {/* Miniature Document Paper Thumbnail */}
                  <div
                    onClick={() => handleEdit(res)}
                    className="h-56 sm:h-64 bg-[var(--color-surface-raised)] border-b border-[var(--color-border-strong)] relative overflow-hidden flex justify-center items-start p-4 cursor-pointer select-none group-hover:bg-[var(--color-surface-hover)] transition-colors duration-[400ms]"
                  >
                    <div className="w-[210mm] min-h-[297mm] bg-white text-black pointer-events-none shadow-sm border border-black/10 origin-top scale-[0.27] sm:scale-[0.3] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[0.32]">
                      <TemplateRenderer resume={res} isPreview={true} />
                    </div>
                    <span className="absolute top-4 left-4 text-[10px] font-mono font-bold text-[var(--color-text-tertiary)] bg-[var(--color-surface-raised)] px-2 py-0.5 border border-[var(--color-border-strong)]">
                      {indexFormatted}
                    </span>
                    <Badge variant="primary" className="absolute top-4 right-4 uppercase bg-[var(--color-accent)] text-[var(--color-text-inverse)] border-none">
                      {res.templateId}
                    </Badge>
                  </div>

                  {/* Document Metadata & Actions */}
                  <div className="p-4 bg-[var(--color-surface)] space-y-3">
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] line-clamp-1">
                        {res.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                        {res.personal.fullName || 'No candidate specified'}
                      </p>
                      <div className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1.5 mt-1 font-mono">
                        <Clock className="w-3 h-3 text-[var(--color-text-secondary)]" />
                        <span>Edited {formattedDate}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEdit(res)}
                          leftIcon={<Edit className="w-3.5 h-3.5" />}
                          className="min-h-[38px] sm:min-h-[32px]"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDuplicate(res.id)}
                          leftIcon={<Copy className="w-3.5 h-3.5" />}
                          className="min-h-[38px] sm:min-h-[32px]"
                        >
                          Duplicate
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadPdf(res)}
                            className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-success)] font-semibold flex items-center gap-1 cursor-pointer transition-colors duration-150 text-[11px]"
                          >
                            <FileText className="w-3.5 h-3.5 text-[var(--color-success)]" /> PDF
                          </button>
                          <span className="text-[var(--color-border)]">•</span>
                          <button
                            onClick={() => handleDownloadDocx(res)}
                            className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-secondary)] font-semibold flex items-center gap-1 cursor-pointer transition-colors duration-150 text-[11px]"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" /> DOCX
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setRenameModalItem({ id: res.id, title: res.title });
                              setNewTitleInput(res.title);
                            }}
                            className="p-2 sm:p-1 rounded-[3px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors duration-150 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="Rename"
                            aria-label="Rename document"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModalId(res.id)}
                            className="p-2 sm:p-1 rounded-[3px] text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-raised)] transition-colors duration-150 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="Delete"
                            aria-label="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteModalId)}
        onClose={() => setDeleteModalId(null)}
        title="Delete Resume Document?"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[var(--color-danger)] bg-[var(--color-danger-subtle)] p-3 rounded-[var(--radius-subtle)] border border-[var(--color-danger)]/30">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-xs">
              This action cannot be undone. The resume document will be permanently removed from IndexedDB.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setDeleteModalId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={Boolean(renameModalItem)}
        onClose={() => setRenameModalItem(null)}
        title="Rename Document"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <Input
            label="Document Title"
            value={newTitleInput}
            onChange={(e) => setNewTitleInput(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setRenameModalItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={!newTitleInput.trim()}>
              Save Title
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Review Modal */}
      <ImportReviewModal
        isOpen={importReviewOpen}
        onClose={() => setImportReviewOpen(false)}
        parseResult={parseResult}
        onConfirmImport={handleConfirmImport}
      />

      {/* Account Settings Modal */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onOpenPaywallModal={() => {
          setPaywallReason('export_limit');
          setPaywallOpen(true);
        }}
      />

      {/* Paywall & Pricing Modal */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        triggerReason={paywallReason}
        onPaymentSuccess={(msg) => {
          alert(`🎉 ${msg}`);
        }}
      />

      <Footer />
    </div>
  );
};
