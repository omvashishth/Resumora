import React, { useState } from 'react';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { TempoLanding } from './pages/TempoLanding';
import { FollowArtLanding } from './pages/FollowArtLanding';
import { EditorialPreloader } from './components/common/EditorialPreloader';
import { Resume } from './types/resume';
import { createSampleResume } from './utils/sampleData';

export const App: React.FC = () => {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'builder' | 'tempo-landing' | 'follow-art'>('landing');
  const [activeResume, setActiveResume] = useState<Resume | null>(null);

  const handleNavigate = (view: 'landing' | 'dashboard' | 'builder' | 'tempo-landing' | 'follow-art') => {
    setCurrentView(view);
  };

  const handleCreateNewResume = () => {
    const sample = createSampleResume();
    setActiveResume(sample);
    setCurrentView('builder');
  };

  const handleSelectResume = (resume: Resume) => {
    setActiveResume(resume);
  };

  return (
    <>
      {!loadingComplete && (
        <EditorialPreloader onComplete={() => setLoadingComplete(true)} />
      )}
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans antialiased transition-colors duration-200">
        {currentView === 'follow-art' && (
          <FollowArtLanding />
        )}

        {currentView === 'tempo-landing' && (
          <TempoLanding />
        )}

        {currentView === 'landing' && (
          <Landing
            onNavigate={handleNavigate}
            onCreateNew={handleCreateNewResume}
            onSelectResume={handleSelectResume}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} onSelectResume={handleSelectResume} />
        )}

        {currentView === 'builder' && activeResume && (
          <ResumeBuilder
            initialResume={activeResume}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </>
  );
};

export default App;
