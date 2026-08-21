import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Resume } from '../types/resume';

export interface SyncQueueItem {
  id: string;
  resumeId: string;
  operation: 'upsert' | 'delete';
  localVersion: number;
  localUpdatedAt: string;
  retryCount: number;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed' | 'conflict';
  errorMessage?: string;
}

export interface ResumeDB extends DBSchema {
  resumes: {
    key: string;
    value: Resume;
    indexes: { 'by-updated': string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-status': string; 'by-resume': string };
  };
}

const DB_NAME = 'ResumeBuilderDB';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<ResumeDB>> | null = null;

export const getDB = (): Promise<IDBPDatabase<ResumeDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<ResumeDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1 || !db.objectStoreNames.contains('resumes')) {
          const store = db.createObjectStore('resumes', { keyPath: 'id' });
          store.createIndex('by-updated', 'updatedAt');
        }
        if (oldVersion < 2 || !db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          queueStore.createIndex('by-status', 'status');
          queueStore.createIndex('by-resume', 'resumeId');
        }
      },
    });
  }
  return dbPromise;
};
