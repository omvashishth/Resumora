/**
 * CVForge AI Architecture Types & Contracts
 */

import type { Resume } from '../types/resume';
import type { AIError } from './errors';

export type AIProviderId = 'cvforge' | 'openai' | 'gemini' | 'anthropic' | 'local';
export type AIProviderMode = 'cvforge' | 'byok';
export type EntitlementStatus = 'NOT_AUTHENTICATED' | 'NO_PLAN' | 'TRIAL' | 'ACTIVE' | 'EXHAUSTED' | 'SUSPENDED';
export type PlanTier = 'free' | 'pro' | 'unlimited';

export interface AIEntitlement {
  status: EntitlementStatus;
  plan: PlanTier;
  totalCredits: number;
  remainingCredits: number;
  resetDate?: string;
}

export const AIOperation = {
  IMPROVE_SUMMARY: 'IMPROVE_SUMMARY',
  IMPROVE_BULLET: 'IMPROVE_BULLET',
  REWRITE_TEXT: 'REWRITE_TEXT',
  MAKE_CONCISE: 'MAKE_CONCISE',
  MAKE_PROFESSIONAL: 'MAKE_PROFESSIONAL',
  ADD_IMPACT: 'ADD_IMPACT',
} as const;

export type AIOperation = (typeof AIOperation)[keyof typeof AIOperation];

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  apiKey?: string; // Runtime user-provided BYOK key
  proxyUrl?: string; // Production backend proxy URL
}

export interface AIServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: AIError;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// AI Feature Prompt Inputs
export interface SummaryPromptInput {
  currentSummary?: string;
  targetRole?: string;
  experienceSummary?: string;
  jobDescription?: string;
  operation?: AIOperation;
}

export interface BulletPromptInput {
  bullet: string;
  position?: string;
  company?: string;
  operation?: AIOperation;
  targetTone?: 'concise' | 'achievement-focused' | 'technical' | 'leadership' | 'ats-friendly';
}

export interface SkillsSuggestionContext {
  experienceTitles: string[];
  educationDegrees: string[];
  projectTech: string[];
  existingSkills: string[];
}

export interface ResumeAnalysisResult {
  score: number; // 0 - 100
  summary: string;
  clarityIssues: string[];
  consistencyIssues: string[];
  missingFields: string[];
  formattingRisks: string[];
  atsScore: number;
}

export interface JobDescriptionData {
  roleTitle: string;
  companyName?: string;
  seniorityLevel?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  responsibilities: string[];
}

export interface JobTailoringResult {
  matchScore: number;
  missingSkills: string[];
  suggestedBullets: { experienceId: string; bullet: string }[];
  suggestedSummary: string;
}

export interface TemplateAnalysisResult {
  layoutType: string;
  columnCount: number;
  detectedColors: string[];
  confidence: {
    layout: 'HIGH' | 'MEDIUM' | 'LOW';
    typography: 'HIGH' | 'MEDIUM' | 'LOW';
    colors: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

/**
 * Provider-independent interface that all AI adapters must implement.
 */
export interface IAIProvider {
  readonly id: AIProviderId;
  readonly name: string;
  readonly supportedModels: string[];

  isConfigured(options?: AIRequestOptions): boolean;
  testConnection(options?: AIRequestOptions): Promise<AIServiceResponse<{ success: boolean; message: string }>>;

  generateSummary(input: SummaryPromptInput, options?: AIRequestOptions): Promise<AIServiceResponse<string[]>>;
  improveBullet(input: BulletPromptInput, options?: AIRequestOptions): Promise<AIServiceResponse<string[]>>;
  rewriteText(text: string, instruction: string, options?: AIRequestOptions): Promise<AIServiceResponse<string>>;
  suggestSkills(context: SkillsSuggestionContext, options?: AIRequestOptions): Promise<AIServiceResponse<string[]>>;
  analyzeResume(resume: Resume, options?: AIRequestOptions): Promise<AIServiceResponse<ResumeAnalysisResult>>;
  tailorToJob(resume: Resume, jobDescription: JobDescriptionData, options?: AIRequestOptions): Promise<AIServiceResponse<JobTailoringResult>>;
  analyzeTemplate(imageOrDocumentBlob: Blob, options?: AIRequestOptions): Promise<AIServiceResponse<TemplateAnalysisResult>>;
}
