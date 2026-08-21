import { getSupabaseClient } from './supabaseClient';
import type { Resume } from '../types/resume';

export interface CloudResumeRecord {
  id: string;
  user_id: string;
  name: string;
  resume_data: Resume;
  template_id: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export const fetchCloudResumes = async (userId: string): Promise<CloudResumeRecord[]> => {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    // Fallback if deleted_at column is not present
    const fallback = await client
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (fallback.error) {
      console.error('Error fetching cloud resumes:', fallback.error);
      return [];
    }
    return (fallback.data as CloudResumeRecord[]) || [];
  }
  return (data as CloudResumeRecord[]) || [];
};

export const upsertCloudResume = async (
  resume: Resume,
  userId: string
): Promise<{ success: boolean; version?: number; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured' };
  }

  const payload = {
    id: resume.id,
    user_id: userId,
    name: resume.title || 'Untitled Resume',
    resume_data: resume,
    template_id: resume.templateId || 'modern',
    version: resume.version || 1,
    updated_at: resume.updatedAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from('resumes')
    .upsert(payload, { onConflict: 'id' })
    .select('version');

  if (error) {
    console.error('Error upserting cloud resume:', error);
    return { success: false, error: error.message };
  }

  const recordVersion = Array.isArray(data) && data.length > 0 ? data[0].version : 1;
  return { success: true, version: recordVersion };
};

export const deleteCloudResume = async (
  resumeId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured' };
  }

  const { error } = await client
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting cloud resume:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};
