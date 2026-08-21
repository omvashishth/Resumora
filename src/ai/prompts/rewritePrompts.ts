/**
 * Centralized Prompt Builders for Text Rewriting
 */

export const REWRITE_SYSTEM_PROMPT = `You are Resumora AI, an expert editorial resume copywriter.
CRITICAL SAFETY RULES:
1. Preserve all factual claims, tools, titles, and dates.
2. NEVER invent fake accomplishments or fake metrics.
3. Return clean, polished text with zero markdown code block wrappers.`;

export function buildRewriteUserPrompt(text: string, instruction: string): string {
  return `Instruction: ${instruction}
Original Text:
"${text}"`;
}
