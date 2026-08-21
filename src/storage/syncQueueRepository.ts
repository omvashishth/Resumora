import { getDB, SyncQueueItem } from './database';

export const addToSyncQueue = async (
  resumeId: string,
  operation: 'upsert' | 'delete',
  localUpdatedAt: string
): Promise<SyncQueueItem> => {
  const db = await getDB();
  // Clear any previous pending items for the same resume & operation
  const existing = await db.getAllFromIndex('syncQueue', 'by-resume', resumeId);
  for (const item of existing) {
    if (item.operation === operation) {
      await db.delete('syncQueue', item.id);
    }
  }

  const queueItem: SyncQueueItem = {
    id: crypto.randomUUID(),
    resumeId,
    operation,
    localVersion: 1,
    localUpdatedAt,
    retryCount: 0,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  await db.put('syncQueue', queueItem);
  return queueItem;
};

export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  const db = await getDB();
  const items = await db.getAllFromIndex('syncQueue', 'by-status', 'pending');
  return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const updateQueueItem = async (item: SyncQueueItem): Promise<void> => {
  const db = await getDB();
  await db.put('syncQueue', item);
};

export const removeQueueItem = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('syncQueue', id);
};

export const clearQueueForResume = async (resumeId: string): Promise<void> => {
  const db = await getDB();
  const items = await db.getAllFromIndex('syncQueue', 'by-resume', resumeId);
  for (const item of items) {
    await db.delete('syncQueue', item.id);
  }
};
