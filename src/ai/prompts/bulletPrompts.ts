/**
 * Centralized Prompt Builders for Experience Bullet Point Improvement
 */

import { BulletPromptInput, AIOperation } from '../types';

export const BULLET_SYSTEM_PROMPT = `You are Resumora AI, a top-tier technical resume editor.
CRITICAL SAFETY & FACTUAL ACCURACY RULES:
1. Start every bullet point with a strong action verb (e.g., Developed, Engineered, Spearheaded, Accelerated, Reduced).
2. NEVER invent fake companies, job titles, technologies, or quantitative numbers.
3. If asked to "add measurable impact", provide phrasing with explicit bracketed placeholders like "[by X%]" or "[saving $X/year]" for the user to complete, but DO NOT fabricate fake numbers.
4. Keep bullets concise (1 to 2 sentences max) and ATS-friendly.
5. Return ONLY clean text formatted as a bullet accomplishment.`;

export function buildBulletUserPrompt(input: BulletPromptInput): string {
  const bullet = input.bullet || '';
  const context = [
    input.position ? `Role: ${input.position}` : '',
    input.company ? `Company: ${input.company}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const op = input.operation || AIOperation.IMPROVE_BULLET;
  let instruction = 'Strengthen the action verb, clarity, and technical impact of this bullet point.';

  switch (op) {
    case AIOperation.MAKE_CONCISE:
      instruction = 'Trim filler words and make this bullet point short, dense, and punchy.';
      break;
    case AIOperation.ADD_IMPACT:
      instruction = 'Focus on business outcome and results. If metrics are appropriate, add bracketed placeholders like [by X%] or [X users] for the user to complete, but DO NOT invent fake numbers.';
      break;
    case AIOperation.MAKE_PROFESSIONAL:
      instruction = 'Refine language for an executive tech audience.';
      break;
    case AIOperation.REWRITE_TEXT:
      instruction = 'Provide a compelling rewrite starting with a powerful action verb.';
      break;
    default:
      instruction = 'Improve wording, action-verb strength, and clarity.';
      break;
  }

  return `${instruction}
${context ? `Context: ${context}` : ''}
Original Bullet Point:
"${bullet}"`;
}
