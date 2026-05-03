/**
 * WRITING FEATURE CONFIG
 * 
 * Central config for IELTS Writing feature.
 * Modify values here to change behavior across entire feature.
 * 
 * When monetizing in the future:
 * - Set IS_FREE_MODE to false
 * - Adjust TOKEN_COST_UNLOCK_* values as needed
 */

// ============================================
// FEATURE FLAGS
// ============================================

/**
 * Master switch for free mode.
 * When true: feedback unlock still requires tokens, but easier to adjust
 * When false: may introduce token cost per attempt (future)
 */
export const IS_FREE_MODE = true;

// ============================================
// ACCESS & QUOTA
// ============================================

/**
 * Daily attempt limits (reset at midnight local time).
 * Single Task and Full Test have SEPARATE counters.
 */
export const DAILY_LIMIT_SINGLE_TASK = 2;
export const DAILY_LIMIT_FULL_TEST = 2;

/**
 * Rate limiting to prevent spam.
 * User must wait this many seconds between submissions.
 */
export const SUBMIT_COOLDOWN_SECONDS = 30;

/**
 * Minimum word count required before user can submit.
 * Below this threshold, submit button is disabled.
 */
export const MIN_WORDS_TO_SUBMIT = 100;

// ============================================
// PRICING (TOKEN COSTS)
// ============================================

/**
 * Tokens required to unlock detailed feedback.
 * Single Task = 1 task evaluated = 1 token
 * Full Test = 2 tasks evaluated = 2 tokens
 */
export const TOKEN_COST_UNLOCK_SINGLE_TASK = 1;
export const TOKEN_COST_UNLOCK_FULL_TEST = 2;

/**
 * Tokens required to start a new attempt.
 * Currently 0 (free) — kept as variable for future monetization.
 */
export const TOKEN_COST_NEW_ATTEMPT_SINGLE_TASK = 0;
export const TOKEN_COST_NEW_ATTEMPT_FULL_TEST = 0;

// ============================================
// TASK CONFIGURATIONS
// ============================================

/**
 * Configuration per task type.
 * Used by UI to render labels, enforce word counts, show duration targets.
 */
export const TASK_CONFIGS = {
  task_1_academic: {
    label: 'Task 1 Academic',
    shortLabel: 'Task 1',
    description: 'Describe visual information (chart, graph, table)',
    wordCountMin: 150,
    targetDurationSeconds: 1200, // 20 min — IELTS real target
    icon: 'BarChart3',
  },
  task_1_general: {
    label: 'Task 1 General',
    shortLabel: 'Task 1',
    description: 'Write a letter (formal, semi-formal, or informal)',
    wordCountMin: 150,
    targetDurationSeconds: 1200,
    icon: 'Mail',
  },
  task_2: {
    label: 'Task 2',
    shortLabel: 'Task 2',
    description: 'Write an essay (argument, opinion, or discussion)',
    wordCountMin: 250,
    targetDurationSeconds: 2400, // 40 min — IELTS real target
    icon: 'FileText',
  },
};

// ============================================
// MODE CONFIGURATIONS
// ============================================

/**
 * Single Task Practice Mode.
 * User picks ONE task (Task 1 OR Task 2) and practices at their own pace.
 * Uses stopwatch count-UP, no hard time limit.
 * Commit-or-abandon: must complete in single session.
 */
export const SINGLE_TASK_MODE = {
  id: 'single_task',
  label: 'Single Task Practice',
  shortLabel: 'Practice',
  description: 'Focus on one task. No time pressure.',
  hasTimer: false, // stopwatch count-up
  hasHardLimit: false,
  trackTimeSpent: true, // display in ScoreCard
  persistDraft: false, // commit-or-abandon behavior
};

/**
 * Full Writing Test Mode.
 * User gets Task 1 + Task 2 bundle with strict 60-min timer.
 * Simulates real IELTS exam.
 */
export const FULL_TEST_MODE = {
  id: 'full_test',
  label: 'Full Writing Test',
  shortLabel: 'Full Test',
  description: '60 minutes. Task 1 + Task 2. Real exam conditions.',
  hasTimer: true,
  hasHardLimit: true,
  totalDurationSeconds: 3600, // 60 min strict
  autoSubmitOnTimeout: true,
  trackTimeSpent: true,
  persistDraft: true, // can resume within the session
};

// ============================================
// AUTO-SAVE CONFIGURATION
// ============================================

/**
 * Auto-save behavior to prevent data loss.
 * 
 * Strategy: Hybrid
 * - localStorage: real-time saves (debounced) for instant recovery
 * - Supabase: periodic saves for cross-device persistence
 */
export const AUTOSAVE_LOCALSTORAGE_DEBOUNCE_MS = 500;
export const AUTOSAVE_SUPABASE_INTERVAL_MS = 30000; // 30 seconds

// ============================================
// EVALUATION CONFIGURATION
// ============================================

/**
 * AI model used for evaluation.
 * Logged in writing_history.model_version for tracking.
 */
export const EVALUATION_MODEL = 'gpt-4o';

/**
 * Temperature for evaluation calls.
 * Low temperature = consistent, reproducible scoring.
 */
export const EVALUATION_TEMPERATURE = 0.3;

// ============================================
// UI / DISPLAY
// ============================================

/**
 * Brand color identity for Writing feature.
 * Used for CTA buttons, accents, badges, borders.
 */
export const WRITING_BRAND_COLOR = 'emerald';

/**
 * Timer warning thresholds (Full Test mode only).
 * Visual cue changes when time remaining drops below these values.
 */
export const TIMER_WARNING_SECONDS = 300; // 5 min — amber
export const TIMER_CRITICAL_SECONDS = 60; // 1 min — red

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get task config by task_type.
 * @param {string} taskType - e.g. 'task_1_academic', 'task_2'
 * @returns {object} task configuration
 */
export function getTaskConfig(taskType) {
  return TASK_CONFIGS[taskType] || null;
}

/**
 * Check if user can submit (meets minimum word count).
 * @param {number} wordCount 
 * @returns {boolean}
 */
export function canSubmit(wordCount) {
  return wordCount >= MIN_WORDS_TO_SUBMIT;
}

/**
 * Get token cost for unlocking feedback based on mode.
 * @param {string} modeId - 'single_task' or 'full_test'
 * @returns {number} token cost
 */
export function getUnlockCost(modeId) {
  if (modeId === 'full_test') return TOKEN_COST_UNLOCK_FULL_TEST;
  return TOKEN_COST_UNLOCK_SINGLE_TASK;
}

/**
 * Get daily limit based on mode.
 * @param {string} modeId - 'single_task' or 'full_test'
 * @returns {number} daily limit
 */
export function getDailyLimit(modeId) {
  if (modeId === 'full_test') return DAILY_LIMIT_FULL_TEST;
  return DAILY_LIMIT_SINGLE_TASK;
}

/**
 * Format seconds into readable time string.
 * Used for "Time spent" display in ScoreCard.
 * @param {number} seconds 
 * @returns {string} e.g. "28 min 15 sec" or "1 hr 15 min"
 */
export function formatTimeSpent(seconds) {
  if (seconds === null || seconds === undefined) return '—';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  if (minutes > 0) {
    return `${minutes} min ${secs} sec`;
  }
  return `${secs} sec`;
}

/**
 * Format seconds into countdown format for Full Test timer.
 * @param {number} seconds 
 * @returns {string} e.g. "38:24" or "01:05"
 */
export function formatCountdown(seconds) {
  if (seconds < 0) seconds = 0;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get timer status based on remaining seconds.
 * Used to determine color/warning state.
 * @param {number} remainingSeconds 
 * @returns {string} 'normal' | 'warning' | 'critical'
 */
export function getTimerStatus(remainingSeconds) {
  if (remainingSeconds <= TIMER_CRITICAL_SECONDS) return 'critical';
  if (remainingSeconds <= TIMER_WARNING_SECONDS) return 'warning';
  return 'normal';
}