/**
 * Centralized Prompt Builders for Summary Improvement
 */

import { SummaryPromptInput, AIOperation } from '../types';

export const SUMMARY_SYSTEM_PROMPT = `You are Resumora AI, an expert executive resume editor and career strategist.
CRITICAL SAFETY & FACTUAL ACCURACY RULES:
1. Preserve all factual claims, degrees, titles, employers, and skill names present in the input.
2. NEVER invent fake employers, degrees, metrics, numbers, percentages, or non-existent achievements.
3. If asked to "add measurable impact", suggest wording where a bracketed placeholder like "[X%]" or "[X team members]" can be filled in by the user, but DO NOT invent fake numbers.
4. Keep the summary professional, high-impact, and between 2 and 4 sentences.
5. Return ONLY clean text. Do not wrap output in JSON or markdown codeblocks unless instructed.`;

export function buildSummaryUserPrompt(input: SummaryPromptInput): string {
  const current = input.currentSummary || '';
  const role = input.targetRole ? `Target Role: ${input.targetRole}` : '';
  const op = input.operation || AIOperation.IMPROVE_SUMMARY;

  let instruction = 'Rewrite and enhance the following professional summary for clarity and executive impact.';

  switch (op) {
    case AIOperation.MAKE_CONCISE:
      instruction = 'Make this professional summary more concise, punchy, and direct while preserving core achievements.';
      break;
    case AIOperation.MAKE_PROFESSIONAL:
      instruction = 'Refine the phrasing to be more formal, authoritative, and executive-level.';
      break;
    case AIOperation.ADD_IMPACT:
      instruction = 'Refine the wording to emphasize strategic impact. If quantitative metrics could fit, use bracketed placeholders like [X%] or [X team members] for the user to fill in, but DO NOT invent fake numbers.';
      break;
    case AIOperation.REWRITE_TEXT:
      instruction = 'Provide a fresh, elegant editorial rewrite of this summary.';
      break;
    default:
      instruction = 'Enhance clarity, action-oriented tone, and professional impact.';
      break;
  }

  return `${instruction}
${role}
Current Summary:
"${current}"`;
}
