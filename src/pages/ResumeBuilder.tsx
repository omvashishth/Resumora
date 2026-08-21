import React, { useState, useEffect } from 'react';
import type { Resume, SectionKey } from '../types/resume';
import { useResume } from '../hooks/useResume';
import { Header } from '../components/common/Header';
import { SectionNav } from '../components/editor/SectionNav';
import { PersonalEditor } from '../components/editor/PersonalEditor';
import { SummaryEditor } from '../components/editor/SummaryEditor';
import { ExperienceEditor } from '../components/editor/ExperienceEditor';
import { EducationEditor } from '../components/editor/EducationEditor';
import { ProjectsEditor } from '../components/editor/ProjectsEditor';
import { SkillsEditor } from '../components/editor/SkillsEditor';
import { CertificationsEditor } from '../components/editor/CertificationsEditor';
import { AwardsEditor } from '../components/editor/AwardsEditor';
import { LanguagesEditor } from '../components/editor/LanguagesEditor';
import { VolunteerEditor } from '../components/editor/VolunteerEditor';
import { CustomSectionsEditor } from '../components/editor/CustomSectionsEditor';
import { CustomizationPanel } from '../components/editor/CustomizationPanel';
import { ResumePreview } from '../components/preview/ResumePreview';
import { TemplateSelectorModal } from '../components/preview/TemplateSelectorModal';
import { AccountModal } from '../components/common/AccountModal';
import { exportResumeToPdf } from '../services/pdfService';
import { exportResumeToDocx } from '../services/docxService';
import { triggerResumeSync } from '../services/syncManager';
import { Eye, Edit3, ArrowLeft, Camera } from 'lucide-react';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { getTemplateById } from '../templates/TemplateRenderer';

interface ResumeBuilderProps {
  initialResume: Resume;
  onNavigate: (view: 'landing' | 'dashboard' | 'builder') => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ initialResume, onNavigate }) => {
  const {
    resume,
    saveStatus,
    setTitle,
    setTemplateId,
    updateSettings,
    reorderSections,
    updatePersonal,
    setSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addExperienceBullet,
    updateExperienceBullet,
    removeExperienceBullet,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addSkill,
    removeSkill,
    addCertification,
    updateCertification,
    removeCertification,
    addAward,
    updateAward,
    removeAward,
    addLanguage,
    removeLanguage,
    addVolunteer,
    updateVolunteer,
    removeVolunteer,
    addCustomSection,
    removeCustomSection,
  } = useResume(initialResume);

  const [activeSection, setActiveSection] = useState<SectionKey | 'customization'>('personal');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<'account' | 'ai'>('account');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  // Sync state changes with cloud queue if logged in
  useEffect(() => {
    if (saveStatus === 'saved') {
      triggerResumeSync(resume.id, 'upsert');
    }
  }, [saveStatus, resume.id]);

  const handleDownloadPdf = async () => {
    setLoadingMessage('Preparing PDF export...');
    try {
      const blob = await exportResumeToPdf(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.personal.fullName || resume.title || 'Resume'}.pdf`.replace(/\s+/g, '_');
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleDownloadDocx = async () => {
    setLoadingMessage('Preparing DOCX export...');
    try {
      const blob = await exportResumeToDocx(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.personal.fullName || resume.title || 'Resume'}.docx`.replace(/\s+/g, '_');
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export DOCX:', err);
    } finally {
      setLoadingMessage(null);
    }
  };

  const openAISettings = () => {
    setAccountModalTab('ai');
    setAccountModalOpen(true);
  };

  const renderActiveEditor = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalEditor personal={resume.personal} onChange={updatePersonal} />;
      case 'summary':
        return <SummaryEditor summary={resume.summary} onChange={setSummary} onOpenAISettings={openAISettings} />;
      case 'experience':
        return (
          <ExperienceEditor
            experience={resume.experience}
            onAdd={addExperience}
            onUpdate={updateExperience}
            onRemove={removeExperience}
            onAddBullet={addExperienceBullet}
            onUpdateBullet={updateExperienceBullet}
            onRemoveBullet={removeExperienceBullet}
            onOpenAISettings={openAISettings}
          />
        );
      case 'education':
        return (
          <EducationEditor
            education={resume.education}
            onAdd={addEducation}
            onUpdate={updateEducation}
            onRemove={removeEducation}
          />
        );
      case 'projects':
        return (
          <ProjectsEditor
            projects={resume.projects}
            onAdd={addProject}
            onUpdate={updateProject}
            onRemove={removeProject}
          />
        );
      case 'skills':
        return (
          <SkillsEditor
            skills={resume.skills}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
          />
        );
      case 'certifications':
        return (
          <CertificationsEditor
            certifications={resume.certifications}
            onAdd={addCertification}
            onUpdate={updateCertification}
            onRemove={removeCertification}
          />
        );
      case 'awards':
        return (
          <AwardsEditor
            awards={resume.awards}
            onAdd={addAward}
            onUpdate={updateAward}
            onRemove={removeAward}
          />
        );
      case 'languages':
        return (
          <LanguagesEditor
            languages={resume.languages}
            onAdd={addLanguage}
            onRemove={removeLanguage}
          />
        );
      case 'volunteer':
        return (
          <VolunteerEditor
            volunteer={resume.volunteer}
            onAdd={addVolunteer}
            onUpdate={updateVolunteer}
            onRemove={removeVolunteer}
          />
        );
      case 'customSections':
        return (
          <CustomSectionsEditor
            customSections={resume.customSections}
            onAddSection={addCustomSection}
            onRemoveSection={removeCustomSection}
            onUpdateSection={() => {}}
          />
        );
      case 'customization':
        return <CustomizationPanel settings={resume.settings} onChange={updateSettings} />;
      default:
        return <PersonalEditor personal={resume.personal} onChange={updatePersonal} />;
    }
  };

  const sectionList: Array<SectionKey | 'customization'> = [
    ...resume.settings.sectionOrder,
    'customization',
  ];
  const currentSectionIdx = sectionList.indexOf(activeSection);
  const prevSection = currentSectionIdx > 0 ? sectionList[currentSectionIdx - 1] : null;
  const nextSection =
    currentSectionIdx < sectionList.length - 1 ? sectionList[currentSectionIdx + 1] : null;

  const getStepLabel = (key: SectionKey | 'customization') => {
    if (key === 'customization') return 'Design Style';
    switch (key) {
      case 'personal': return 'Personal';
      case 'summary': return 'Summary';
      case 'experience': return 'Experience';
      case 'education': return 'Education';
      case 'projects': return 'Projects';
      case 'skills': return 'Skills';
      case 'certifications': return 'Certs';
      case 'awards': return 'Awards';
      case 'languages': return 'Languages';
      case 'volunteer': return 'Volunteer';
      case 'customSections': return 'Custom';
      default: return key;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex flex-col font-sans transition-colors duration-150">
      <Header
        currentView="builder"
        onNavigate={onNavigate}
        resumeTitle={resume.title}
        saveStatus={saveStatus}
        onDownloadPdf={handleDownloadPdf}
        onDownloadDocx={handleDownloadDocx}
        onChangeTemplate={() => setTemplateModalOpen(true)}
        onOpenAccountModal={() => {
          setAccountModalTab('account');
          setAccountModalOpen(true);
        }}
      />

      {/* Title Subheader */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-[var(--radius-subtle)] hover:bg-[var(--color-surface-hover)] transition-colors duration-150 cursor-pointer shrink-0"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={resume.title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-sm sm:text-[16px] font-serif font-[700] uppercase tracking-tight text-[var(--color-text-primary)] border-b border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-hidden px-1 py-0.5 transition-colors truncate max-w-[180px] sm:max-w-xs md:max-w-md"
          />
        </div>

        {/* Mobile Tab Toggle */}
        <div className="flex md:hidden bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-0.5 rounded-[var(--radius-subtle)] shrink-0">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-subtle)] transition-colors duration-150 ${
              mobileTab === 'editor'
                ? 'bg-[var(--color-brand)] text-[var(--color-text-inverse)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Editor
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-subtle)] transition-colors duration-150 ${
              mobileTab === 'preview'
                ? 'bg-[var(--color-brand)] text-[var(--color-text-inverse)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>
      </div>

      {/* Photo Template Empty State Banner */}
      {getTemplateById(resume.templateId).supportsPhoto && !resume.personal.avatarUrl && (
        <div className="bg-[var(--color-brand-subtle)] border-b border-[var(--color-brand)]/30 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[var(--color-text-primary)]">
          <span className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>Photo Template Active: Add a profile photo in Personal Details to complete this layout.</span>
          </span>
          <button
            onClick={() => {
              setActiveSection('personal');
              setMobileTab('editor');
            }}
            className="px-2.5 py-1 bg-[var(--color-brand)] text-[var(--color-text-inverse)] rounded-[var(--radius-subtle)] text-xs font-bold hover:bg-[var(--color-brand-hover)] transition-colors cursor-pointer shrink-0"
          >
            Upload Photo
          </button>
        </div>
      )}

      {/* Responsive Builder Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5 overflow-hidden">
        {/* Column 1: Navigation (3 cols on desktop) */}
        <div
          className={`md:col-span-4 lg:col-span-3 shrink-0 ${
            mobileTab === 'editor' ? 'block' : 'hidden md:block'
          }`}
        >
          <SectionNav
            resume={resume}
            activeSection={activeSection}
            onSelectSection={(sec) => setActiveSection(sec)}
            onReorderSections={reorderSections}
          />
        </div>

        {/* Column 2: Form Editor (4 cols on desktop) */}
        <div
          className={`md:col-span-8 lg:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] p-4 sm:p-5 md:overflow-y-auto md:max-h-[82vh] flex flex-col justify-between ${
            mobileTab === 'editor' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex-1">{renderActiveEditor()}</div>

          {/* Mobile Step Flow Navigation */}
          <div className="mt-8 pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-2 md:hidden">
            {prevSection ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSection(prevSection);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-2 bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer transition-colors"
              >
                ← {getStepLabel(prevSection)}
              </button>
            ) : <div />}

            {nextSection ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSection(nextSection);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-[var(--color-text-inverse)] rounded-[var(--radius-subtle)] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                {getStepLabel(nextSection)} →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className="px-3.5 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-text-inverse)] rounded-[var(--radius-subtle)] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                View A4 Preview →
              </button>
            )}
          </div>
        </div>

        {/* Column 3: A4 Preview (5 cols on desktop) */}
        <div
          className={`md:col-span-12 lg:col-span-5 h-[calc(100dvh-140px)] md:h-[82vh] ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ResumePreview resume={resume} />
        </div>
      </div>

      {/* Modals */}
      <TemplateSelectorModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        currentTemplateId={resume.templateId}
        onSelectTemplate={setTemplateId}
        sampleResume={resume}
      />

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        defaultTab={accountModalTab}
      />
      {loadingMessage && <LoadingOverlay message={loadingMessage} />}
    </div>
  );
};
