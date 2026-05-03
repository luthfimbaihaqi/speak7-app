import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { 
  DAILY_LIMIT_SINGLE_TASK, 
  DAILY_LIMIT_FULL_TEST 
} from "@/utils/writingConfig";

// Init Supabase Service Role (bypass RLS, server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/writing/start
 * 
 * Start a new Writing session (Single Task or Full Test).
 * 
 * Request body:
 *   - userId (required): Supabase auth user ID
 *   - mode (required): 'single_task' | 'full_test'
 *   - promptId (required for single_task): writing_prompts.id
 *   - pairId (required for full_test): writing_full_test_pairs.id
 * 
 * Response:
 *   - 200: { sessionId, mode, promptData, pairData }
 *   - 400: { error } — missing/invalid input
 *   - 401: { error } — user not found
 *   - 404: { error } — prompt/pair not found
 *   - 429: { error, resetAt, remainingToday } — quota exhausted
 *   - 500: { error } — server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, mode, promptId, pairId } = body;

    // --- VALIDATION ---
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!mode || !['single_task', 'full_test'].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'single_task' or 'full_test'" }, 
        { status: 400 }
      );
    }

    if (mode === 'single_task' && !promptId) {
      return NextResponse.json(
        { error: "Missing promptId for single_task mode" }, 
        { status: 400 }
      );
    }

    if (mode === 'full_test' && !pairId) {
      return NextResponse.json(
        { error: "Missing pairId for full_test mode" }, 
        { status: 400 }
      );
    }

    // --- VERIFY USER EXISTS ---
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // --- CHECK DAILY QUOTA ---
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data: quota } = await supabase
      .from('writing_quotas')
      .select('single_task_daily_count, full_test_daily_count, last_usage_date')
      .eq('user_id', userId)
      .single();

    let singleTaskCount = 0;
    let fullTestCount = 0;

    if (quota) {
      // If last usage is today, use existing counts
      // If last usage is yesterday or older, effectively reset (counts ignored)
      if (quota.last_usage_date === today) {
        singleTaskCount = quota.single_task_daily_count || 0;
        fullTestCount = quota.full_test_daily_count || 0;
      }
    }

    const limit = mode === 'full_test' ? DAILY_LIMIT_FULL_TEST : DAILY_LIMIT_SINGLE_TASK;
    const currentCount = mode === 'full_test' ? fullTestCount : singleTaskCount;

    if (currentCount >= limit) {
      // Calculate next reset time (midnight user's local time — we use UTC for simplicity)
      const resetAt = new Date();
      resetAt.setUTCHours(24, 0, 0, 0); // next midnight UTC

      return NextResponse.json(
        {
          error: "Daily limit reached",
          message: mode === 'full_test'
            ? "Kamu sudah menggunakan 2 kesempatan Full Test hari ini. Yuk lanjut besok!"
            : "Kamu sudah menggunakan 2 kesempatan Single Task hari ini. Yuk lanjut besok!",
          resetAt: resetAt.toISOString(),
          remainingToday: 0,
          limit: limit,
        },
        { status: 429 }
      );
    }

    // --- FETCH PROMPT OR PAIR DATA ---
    let promptData = null;
    let pairData = null;

    if (mode === 'single_task') {
      const { data: prompt, error: promptError } = await supabase
        .from('writing_prompts')
        .select('*')
        .eq('id', promptId)
        .eq('is_active', true)
        .single();

      if (promptError || !prompt) {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
      }

      promptData = prompt;
    } else {
      // full_test: fetch pair + both prompts
      const { data: pair, error: pairError } = await supabase
        .from('writing_full_test_pairs')
        .select(`
          *,
          task_1_prompt:task_1_prompt_id(*),
          task_2_prompt:task_2_prompt_id(*)
        `)
        .eq('id', pairId)
        .eq('is_active', true)
        .single();

      if (pairError || !pair) {
        return NextResponse.json({ error: "Full Test pair not found" }, { status: 404 });
      }

      pairData = pair;
    }

    // --- CREATE OR UPDATE WRITING SESSION ---
    let sessionId;

    if (mode === 'single_task') {
      // Check if session already exists (resume or overwrite)
      const { data: existingSession } = await supabase
        .from('writing_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', promptId)
        .eq('session_type', 'single_task')
        .single();

      if (existingSession) {
        // Commit-or-abandon: reset existing draft (fresh attempt)
        const { data: updatedSession, error: updateError } = await supabase
          .from('writing_sessions')
          .update({
            draft_text: null,
            word_count: 0,
            started_at: new Date().toISOString(),
            last_saved_at: new Date().toISOString(),
            is_submitted: false,
          })
          .eq('id', existingSession.id)
          .select('id')
          .single();

        if (updateError) {
          console.error("Session update error:", updateError);
          return NextResponse.json({ error: "Failed to reset session" }, { status: 500 });
        }

        sessionId = updatedSession.id;
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('writing_sessions')
          .insert([{
            user_id: userId,
            prompt_id: promptId,
            session_type: 'single_task',
            draft_text: null,
            word_count: 0,
          }])
          .select('id')
          .single();

        if (createError) {
          // Race condition handling: another concurrent request created session first
          if (createError.code === '23505') {
            console.log(`[WRITING/START] Race detected on Single Task. Fetching existing session.`);
            const { data: raceSession, error: raceError } = await supabase
              .from('writing_sessions')
              .select('id')
              .eq('user_id', userId)
              .eq('prompt_id', promptId)
              .eq('session_type', 'single_task')
              .single();

            if (raceError || !raceSession) {
              console.error("Race recovery failed:", raceError);
              return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
            }
            sessionId = raceSession.id;
          } else {
            console.error("Session create error:", createError);
            return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
          }
        } else {
          sessionId = newSession.id;
        }
      }
    } else {
      // full_test session
      const { data: existingSession } = await supabase
        .from('writing_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('pair_id', pairId)
        .eq('session_type', 'full_test')
        .single();

      if (existingSession) {
        // Reset for fresh attempt
        const { data: updatedSession, error: updateError } = await supabase
          .from('writing_sessions')
          .update({
            task_1_draft: null,
            task_1_word_count: 0,
            task_2_draft: null,
            task_2_word_count: 0,
            started_at: new Date().toISOString(),
            last_saved_at: new Date().toISOString(),
            is_submitted: false,
          })
          .eq('id', existingSession.id)
          .select('id')
          .single();

        if (updateError) {
          console.error("Full Test session update error:", updateError);
          return NextResponse.json({ error: "Failed to reset session" }, { status: 500 });
        }

        sessionId = updatedSession.id;
      } else {
        const { data: newSession, error: createError } = await supabase
          .from('writing_sessions')
          .insert([{
            user_id: userId,
            pair_id: pairId,
            session_type: 'full_test',
            task_1_draft: null,
            task_1_word_count: 0,
            task_2_draft: null,
            task_2_word_count: 0,
          }])
          .select('id')
          .single();

        if (createError) {
          // Race condition handling: another concurrent request created session first
          if (createError.code === '23505') {
            console.log(`[WRITING/START] Race detected on Full Test. Fetching existing session.`);
            const { data: raceSession, error: raceError } = await supabase
              .from('writing_sessions')
              .select('id')
              .eq('user_id', userId)
              .eq('pair_id', pairId)
              .eq('session_type', 'full_test')
              .single();

            if (raceError || !raceSession) {
              console.error("Race recovery failed:", raceError);
              return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
            }
            sessionId = raceSession.id;
          } else {
            console.error("Full Test session create error:", createError);
            return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
          }
        } else {
          sessionId = newSession.id;
        }
      }
    }

    // --- ASYNC: INCREMENT VIEWS (fire-and-forget) ---
    // Don't block response. If it fails, just log. User experience > counter accuracy.
    incrementViews(userId, mode, promptId, pairId, today).catch(err => {
      console.error("Views increment failed (non-blocking):", err);
    });

    console.log(
      `[WRITING/START] User ${userId.substring(0,8)} started ${mode} ` +
      `(${mode === 'full_test' ? `pair ${pairData.pair_code}` : `prompt ${promptData.code}`}). ` +
      `Session: ${sessionId.substring(0,8)}. ` +
      `Today count: ST=${singleTaskCount}, FT=${fullTestCount}`
    );

    return NextResponse.json({
      success: true,
      sessionId,
      mode,
      promptData,
      pairData,
      quotaInfo: {
        singleTaskUsedToday: singleTaskCount,
        fullTestUsedToday: fullTestCount,
        singleTaskLimit: DAILY_LIMIT_SINGLE_TASK,
        fullTestLimit: DAILY_LIMIT_FULL_TEST,
      }
    });

  } catch (error) {
    console.error("[WRITING/START] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}

/**
 * Increment views counter with debounce (1 view per user per day per content).
 * Runs async, don't block response.
 */
async function incrementViews(userId, mode, promptId, pairId, today) {
  const targetId = mode === 'single_task' ? promptId : pairId;
  if (!targetId) return;

  // Check if user already viewed this today
  const { data: existingView } = await supabase
    .from('writing_prompt_views')
    .select('last_viewed_date')
    .eq('user_id', userId)
    .eq('prompt_id', mode === 'single_task' ? promptId : pairId)
    .single();

  const alreadyViewedToday = existingView?.last_viewed_date === today;
  if (alreadyViewedToday) return;

  // Upsert the view record
  await supabase
    .from('writing_prompt_views')
    .upsert({
      user_id: userId,
      prompt_id: targetId,
      last_viewed_date: today,
    });

  // Increment global counter
  const table = mode === 'single_task' ? 'writing_prompts' : 'writing_full_test_pairs';
  
  // Use RPC for atomic increment (avoid race conditions)
  // If RPC not available, fallback to SELECT + UPDATE
  const { data: current } = await supabase
    .from(table)
    .select('views_count')
    .eq('id', targetId)
    .single();

  if (current) {
    await supabase
      .from(table)
      .update({ views_count: (current.views_count || 0) + 1 })
      .eq('id', targetId);
  }
}