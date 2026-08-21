import { useEffect, useRef, useState } from 'react';
import { Resume } from '../types/resume';
import { saveResume } from '../storage/resumeRepository';

export type SaveStatus = 'saved' | 'saving' | 'error';

export const useAutosave = (resume: Resume | null, delayMs: number = 800) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!resume) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await saveResume(resume);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('error');
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [resume, delayMs]);

  return { saveStatus };
};
