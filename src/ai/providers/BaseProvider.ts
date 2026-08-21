/**
 * Abstract Base AI Provider
 * Implements IAIProvider interface with default unsupported operation errors.
 * Real adapters override supported methods.
 */

import { AIError } from '../errors';
import type {
  IAIProvider,
  AIProviderId,
  AIRequestOptions,
  AIServiceResponse,
  SummaryPromptInput,
  BulletPromptInput,
  SkillsSuggestionContext,
  ResumeAnalysisResult,
  JobDescriptionData,
  JobTailoringResult,
  TemplateAnalysisResult,
} from '../types';
import type { Resume } from '../../types/resume';

export abstract class BaseProvider implements IAIProvider {
  public abstract readonly id: AIProviderId;
  public abstract readonly name: string;
  public abstract readonly supportedModels: string[];

  public abstract isConfigured(options?: AIRequestOptions): boolean;

  public async testConnection(
    _options?: AIRequestOptions
  ): Promise<AIServiceResponse<{ success: boolean; message: string }>> {
    throw AIError.unsupportedOperation('testConnection');
  }

  public async generateSummary(
    _input: SummaryPromptInput,
    _options?: AIRequestOptions
  ): Promise<AIServiceResponse<string[]>> {
    throw AIError.unsupportedOperation('generateSummary');
  }

  public async improveBullet(
    _input: BulletPromptInput,
    _options?: AIRequestOptions
  ): Promise<AIServiceResponse<string[]>> {
    throw AIError.unsupportedOperation('improveBullet');
  }

  public async rewriteText(
    _text: string,
    _instruction: string,
    _options?: AIRequestOptions
  ): Promise<AIServiceResponse<string>> {
    throw AIError.unsupportedOperation('rewriteText');
  }

  public async suggestSkills(
    _context: SkillsSuggestionContext,
    _options?: AIRequestOptions
  ): Promise<AIServiceResponse<string[]>> {
    throw AIError.unsupportedOperation('suggestSkills');
  }

  public async analyzeResume(
    _resume: Resume,
    _options?: AIRequestOptions
  ): Promise<AIServiceResponse<ResumeAnalysisResult>> {
    throw AIError.unsupportedOperation('analyzeResume');
  }

  public async tailorToJob(
    _resume: Resume,
    _jobDescription: JobDescriptionData,
    _options?: AIRequestOptions
  ): Promise<AIServiceResponse<JobTailoringResult>> {
    throw AIError.unsupportedOperation('tailorToJob');
  }

  public async analyzeTemplate(
    _imageOrDocumentBlob: Blob,
    _options?: AIRequestOptions
  ): Promise<AIServiceResponse<TemplateAnalysisResult>> {
    throw AIError.unsupportedOperation('analyzeTemplate');
  }
}
