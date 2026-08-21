import { getDB } from './database';
import { Resume } from '../types/resume';
import { createSampleResume } from '../utils/sampleData';
import { addToSyncQueue } from './syncQueueRepository';

export const getAllResumes = async (): Promise<Resume[]> => {
  const db = await getDB();
  const resumes = await db.getAllFromIndex('resumes', 'by-updated');
  // Sort descending by updatedAt
  return resumes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const getResumeById = async (id: string): Promise<Resume | null> => {
  const db = await getDB();
  const resume = await db.get('resumes', id);
  return resume || null;
};

export const saveResume = async (resume: Resume, skipSyncQueue = false): Promise<Resume> => {
  const db = await getDB();
  const currentVersion = resume.version || 1;
  const updatedResume: Resume = {
    ...resume,
    version: currentVersion + 1,
    updatedAt: new Date().toISOString(),
  };
  await db.put('resumes', updatedResume);
  if (!skipSyncQueue) {
    await addToSyncQueue(updatedResume.id, 'upsert', updatedResume.updatedAt);
  }
  return updatedResume;
};

export const deleteResume = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('resumes', id);
  // Queue cloud deletion item so deleted resume is synced to Supabase
  await addToSyncQueue(id, 'delete', new Date().toISOString());
};

export const duplicateResume = async (id: string): Promise<Resume> => {
  const db = await getDB();
  const original = await db.get('resumes', id);
  if (!original) {
    throw new Error(`Resume with ID ${id} not found.`);
  }

  const now = new Date().toISOString();
  const duplicated: Resume = {
    ...JSON.parse(JSON.stringify(original)),
    id: crypto.randomUUID(),
    title: `${original.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  return await saveResume(duplicated);
};

export const renameResume = async (id: string, newTitle: string): Promise<Resume> => {
  const db = await getDB();
  const original = await db.get('resumes', id);
  if (!original) {
    throw new Error(`Resume with ID ${id} not found.`);
  }

  const updated: Resume = {
    ...original,
    title: newTitle.trim() || 'Untitled Resume',
  };

  return await saveResume(updated);
};

export const ensureInitialSeed = async (): Promise<Resume[]> => {
  const resumes = await getAllResumes();
  if (resumes.length === 0) {
    const sample = createSampleResume();
    await saveResume(sample, true);
    return [sample];
  }
  return resumes;
};
