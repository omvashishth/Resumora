/**
 * AI Response Validation & Sanitization Layer
 * Ensures AI outputs are validated and sanitized prior to modifying UI state or Resume model.
 */

import { AIError } from '../errors';
import type { AIServiceResponse } from '../types';

export class ResponseValidator {
  /**
   * Sanitizes string output by removing potential script tags or unsafe HTML.
   */
  public static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .trim();
  }

  /**
   * Sanitizes an array of string outputs.
   */
  public static sanitizeArray(inputs: string[]): string[] {
    if (!Array.isArray(inputs)) return [];
    return inputs.map((item) => this.sanitizeString(item)).filter(Boolean);
  }

  /**
   * Validates that output conforms to a type guard validator function.
   */
  public static validateOutput<T>(
    data: unknown,
    validatorFn: (val: unknown) => val is T,
    errorDetails?: string
  ): AIServiceResponse<T> {
    if (!validatorFn(data)) {
      return {
        success: false,
        error: AIError.invalidResponse(errorDetails || 'Data failed schema validation'),
      };
    }
    return {
      success: true,
      data,
    };
  }
}
