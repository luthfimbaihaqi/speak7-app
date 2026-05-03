/**
 * Writing Prompts - Central Exporter
 * 
 * Barrel file that re-exports all prompt builders for IELTS Writing evaluation.
 * This allows consumers to import from a single path:
 * 
 *   import { buildTask2Prompt, buildTask1GeneralPrompt, buildTask1AcademicPrompt } 
 *     from '@/lib/writing/prompts';
 * 
 * Task types covered:
 * - Task 2 (essay) — used for both Academic and General Training modules
 * - Task 1 General Training (letter writing)
 * - Task 1 Academic (chart/graph description)
 */

export { buildTask2Prompt } from './task2Prompt.js';
export { buildTask1GeneralPrompt } from './task1GeneralPrompt.js';
export { buildTask1AcademicPrompt } from './task1AcademicPrompt.js';