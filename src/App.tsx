import React, { useState, useEffect } from 'react';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { TempoLanding } from './pages/TempoLanding';
import { FollowArtLanding } from './pages/FollowArtLanding';
import { EditorialPreloader } from './components/common/EditorialPreloader';
import { Resume } from './types/resume';
import { createSampleResume } from './utils/sampleData';
import { ensureInitialSeed, getResumeById, getAllResumes } from './storage/resumeRepository';
import { stripeService } from './services/stripeService';

export const App: React.FC = () => {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'builder' | 'tempo-landing' | 'follow-art'>('landing');
  const [activeResume, setActiveResume] = useState<Resume | null>(null);

  // Initialize data and check URL routes & payments on startup
  useEffect(() => {
    const initApp = async () => {
      try {
        const seeded = await ensureInitialSeed();
        if (seeded && seeded.length > 0) {
          setActiveResume(seeded[0]);
        }
      } catch (err) {
        console.warn('Initial seed error:', err);
        setActiveResume(createSampleResume());
      }

      if (typeof window !== 'undefined') {
        const search = window.location.search;
        const pathname = window.location.pathname;

        // 1. Handle Stripe checkout return
        if (search.includes('payment=success')) {
          const urlParams = new URLSearchParams(search);
          const sessionId = urlParams.get('session_id') || undefined;
          const interval = urlParams.get('interval') || 'monthly';
          await stripeService.verifyAndActivate(sessionId, interval);
          setCurrentView('builder');
          window.history.replaceState({}, document.title, '/builder');
          return;
        }

        // 2. Handle initial path navigation
        if (pathname.includes('/builder')) {
          setCurrentView('builder');
        } else if (pathname.includes('/dashboard')) {
          setCurrentView('dashboard');
        }
      }
    };

    initApp();

    // Listen for browser back/forward buttons
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname.includes('/builder')) {
        setCurrentView('builder');
      } else if (pathname.includes('/dashboard')) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = async (
    view: 'landing' | 'dashboard' | 'builder' | 'tempo-landing' | 'follow-art',
    resumeId?: string
  ) => {
    if (resumeId) {
      try {
        const found = await getResumeById(resumeId);
        if (found) {
          setActiveResume(found);
        }
      } catch (e) {
        console.warn('Error loading resume by id:', e);
      }
    } else if (view === 'builder' && !activeResume) {
      const all = await getAllResumes();
      if (all.length > 0) {
        setActiveResume(all[0]);
      } else {
        setActiveResume(createSampleResume());
      }
    }

    setCurrentView(view);

    // Update browser URL cleanly
    if (typeof window !== 'undefined') {
      const targetPath = view === 'landing' ? '/' : `/${view}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  };

  const handleCreateNewResume = () => {
    const sample = createSampleResume();
    setActiveResume(sample);
    setCurrentView('builder');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/builder');
    }
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

        {currentView === 'builder' && (
          <ResumeBuilder
            initialResume={activeResume || createSampleResume()}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </>
  );
};

export default App;
