import { addToSyncQueue, getPendingSyncItems, removeQueueItem, updateQueueItem, clearQueueForResume } from '../storage/syncQueueRepository';
import { getResumeById, saveResume, getAllResumes } from '../storage/resumeRepository';
import { upsertCloudResume, deleteCloudResume, fetchCloudResumes } from './cloudResumeRepository';
import { getCurrentUser } from './authService';

export type SyncState = 'local' | 'saving' | 'syncing' | 'synced' | 'offline' | 'failed' | 'conflict';

export interface SyncStatus {
  state: SyncState;
  lastSyncedAt?: string;
  pendingCount: number;
  message?: string;
  conflictResumeId?: string;
}

type SyncStatusListener = (status: SyncStatus) => void;

let listeners: SyncStatusListener[] = [];
let currentStatus: SyncStatus = {
  state: 'local',
  pendingCount: 0,
};

export const subscribeSyncStatus = (listener: SyncStatusListener) => {
  listeners.push(listener);
  listener(currentStatus);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const notifyStatus = (status: Partial<SyncStatus>) => {
  currentStatus = { ...currentStatus, ...status };
  listeners.forEach((l) => l(currentStatus));
};

export const triggerResumeSync = async (resumeId: string, operation: 'upsert' | 'delete' = 'upsert') => {
  const resume = await getResumeById(resumeId);
  const updatedAt = resume?.updatedAt || new Date().toISOString();
  await addToSyncQueue(resumeId, operation, updatedAt);

  if (!navigator.onLine) {
    notifyStatus({ state: 'offline', message: 'Offline. Changes saved locally.' });
    return;
  }

  processSyncQueue();
};

export const processSyncQueue = async () => {
  const user = await getCurrentUser();
  if (!user) {
    notifyStatus({ state: 'local', pendingCount: 0 });
    return;
  }

  if (!navigator.onLine) {
    notifyStatus({ state: 'offline', message: 'Offline mode active.' });
    return;
  }

  const items = await getPendingSyncItems();
  if (items.length === 0) {
    notifyStatus({ state: 'synced', pendingCount: 0, lastSyncedAt: new Date().toISOString() });
    return;
  }

  notifyStatus({ state: 'syncing', pendingCount: items.length });

  for (const item of items) {
    if (item.retryCount >= 5) {
      notifyStatus({ state: 'failed', message: `Sync failed for resume. Max retries exceeded.` });
      continue;
    }

    try {
      if (item.operation === 'upsert') {
        const resume = await getResumeById(item.resumeId);
        if (resume) {
          const res = await upsertCloudResume(resume, user.id);
          if (res.success) {
            await removeQueueItem(item.id);
          } else {
            item.retryCount += 1;
            item.status = 'failed';
            item.errorMessage = res.error;
            await updateQueueItem(item);
          }
        } else {
          await removeQueueItem(item.id);
        }
      } else if (item.operation === 'delete') {
        const res = await deleteCloudResume(item.resumeId, user.id);
        if (res.success) {
          await removeQueueItem(item.id);
        } else {
          item.retryCount += 1;
          item.status = 'failed';
          await updateQueueItem(item);
        }
      }
    } catch (err: any) {
      console.error('Sync queue item error:', err);
      item.retryCount += 1;
      item.status = 'failed';
      await updateQueueItem(item);
    }
  }

  const remaining = await getPendingSyncItems();
  if (remaining.length === 0) {
    notifyStatus({ state: 'synced', pendingCount: 0, lastSyncedAt: new Date().toISOString() });
  } else {
    notifyStatus({ state: 'failed', pendingCount: remaining.length });
  }
};

export const syncAllLocalResumesToCloud = async (): Promise<{ count: number; error?: string }> => {
  const user = await getCurrentUser();
  if (!user) {
    return { count: 0, error: 'User is not logged in' };
  }

  const localResumes = await getAllResumes();
  let count = 0;
  let lastError: string | undefined;

  for (const resume of localResumes) {
    const res = await upsertCloudResume(resume, user.id);
    if (res.success) {
      count++;
      await clearQueueForResume(resume.id);
    } else {
      lastError = res.error;
    }
  }

  await pullCloudResumesToLocal();

  notifyStatus({ state: 'synced', pendingCount: 0, lastSyncedAt: new Date().toISOString() });
  return { count, error: count === 0 && localResumes.length > 0 ? lastError : undefined };
};

export const pullCloudResumesToLocal = async (): Promise<number> => {
  const user = await getCurrentUser();
  if (!user) return 0;

  const records = await fetchCloudResumes(user.id);
  let importedCount = 0;

  const pendingItems = await getPendingSyncItems();
  const pendingResumeIds = new Set(pendingItems.map((i) => i.resumeId));

  for (const rec of records) {
    const local = await getResumeById(rec.id);
    if (!local) {
      await saveResume(
        {
          ...rec.resume_data,
          version: rec.version || 1,
          updatedAt: rec.updated_at || rec.resume_data.updatedAt,
        },
        true
      );
      importedCount++;
    } else {
      const localTime = new Date(local.updatedAt).getTime();
      const cloudTime = new Date(rec.updated_at).getTime();
      const localVersion = local.version || 1;
      const cloudVersion = rec.version || 1;

      const hasUnsyncedLocalEdits = pendingResumeIds.has(local.id);

      if (hasUnsyncedLocalEdits && cloudTime > localTime && cloudVersion !== localVersion) {
        // Conflict! Both local and cloud have un-synced edits.
        // Preserve local copy and save cloud copy as conflict duplicate to prevent data loss.
        const conflictCopy = {
          ...rec.resume_data,
          id: crypto.randomUUID(),
          title: `${rec.name || local.title} (Cloud Copy)`,
          version: cloudVersion,
          updatedAt: rec.updated_at,
        };
        await saveResume(conflictCopy, true);
        importedCount++;
      } else if (cloudTime > localTime || cloudVersion > localVersion) {
        await saveResume(
          {
            ...rec.resume_data,
            version: cloudVersion,
            updatedAt: rec.updated_at,
          },
          true
        );
        importedCount++;
      }
    }
  }

  return importedCount;
};

export const performFullTwoWaySync = async (): Promise<{ pulled: number; pushed: number; error?: string }> => {
  const user = await getCurrentUser();
  if (!user) return { pulled: 0, pushed: 0, error: 'User not authenticated' };

  if (!navigator.onLine) {
    notifyStatus({ state: 'offline', message: 'Offline mode active.' });
    return { pulled: 0, pushed: 0, error: 'Offline' };
  }

  notifyStatus({ state: 'syncing', pendingCount: 0 });

  try {
    // 1. Process any queued pending operations
    await processSyncQueue();

    // 2. Pull cloud resumes into IndexedDB
    const pulled = await pullCloudResumesToLocal();

    // 3. Upload any local resumes that do not exist in cloud yet
    const localResumes = await getAllResumes();
    const cloudRecords = await fetchCloudResumes(user.id);
    const cloudIds = new Set(cloudRecords.map((r) => r.id));

    let pushed = 0;
    for (const local of localResumes) {
      if (!cloudIds.has(local.id)) {
        const res = await upsertCloudResume(local, user.id);
        if (res.success) pushed++;
      }
    }

    notifyStatus({ state: 'synced', pendingCount: 0, lastSyncedAt: new Date().toISOString() });
    return { pulled, pushed };
  } catch (err: any) {
    notifyStatus({ state: 'failed', message: err?.message || 'Sync failed' });
    return { pulled: 0, pushed: 0, error: err?.message };
  }
};

// Listen to network online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processSyncQueue();
  });
  window.addEventListener('offline', () => {
    notifyStatus({ state: 'offline', message: 'Offline mode active.' });
  });
}
