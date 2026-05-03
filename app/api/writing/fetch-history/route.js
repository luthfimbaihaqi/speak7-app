import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/writing/fetch-history
 * 
 * Fetch user's Writing submissions history (Single Task + Full Test combined).
 * Used by Progress Page to render the full Writing timeline.
 * 
 * Request body:
 *   - userId (required): user to fetch history for
 *   - limit (optional, default 50): max items to return
 *   - offset (optional, default 0): pagination offset
 *   - filter (optional): { type?, taskType?, module? } — future use
 * 
 * Response:
 *   - 200: { success, writing: [items], total, hasMore }
 *   - 400: { error } — missing userId
 *   - 500: { error } — server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, limit = 50, offset = 0 } = body;

    // ═══════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // ═══════════════════════════════════════════
    // FETCH BOTH HISTORY TABLES IN PARALLEL
    // ═══════════════════════════════════════════

    const [singleTaskResult, fullTestResult] = await Promise.all([
      // Single Task submissions
      supabase
        .from("writing_history")
        .select(
          `
          id,
          prompt_id,
          prompt_code,
          task_type,
          word_count,
          time_spent_seconds,
          overall_band,
          task_achievement,
          coherence_cohesion,
          lexical_resource,
          grammatical_range,
          is_feedback_unlocked,
          created_at
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      // Full Test submissions
      supabase
        .from("writing_full_test_history")
        .select(
          `
          id,
          pair_id,
          pair_code,
          module,
          total_time_spent_seconds,
          task_1_prompt_id,
          task_1_word_count,
          task_1_overall_band,
          task_2_prompt_id,
          task_2_word_count,
          task_2_overall_band,
          combined_overall_band,
          is_feedback_unlocked,
          created_at
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (singleTaskResult.error) {
      console.error(
        "[FETCH-HISTORY] Single task fetch error:",
        singleTaskResult.error
      );
      return NextResponse.json(
        { error: "Failed to fetch Single Task history" },
        { status: 500 }
      );
    }

    if (fullTestResult.error) {
      console.error(
        "[FETCH-HISTORY] Full test fetch error:",
        fullTestResult.error
      );
      return NextResponse.json(
        { error: "Failed to fetch Full Test history" },
        { status: 500 }
      );
    }

    // ═══════════════════════════════════════════
    // NORMALIZE SINGLE TASK ITEMS
    // ═══════════════════════════════════════════

    const singleTaskItems = (singleTaskResult.data || []).map((row) => ({
      id: row.id,
      type: "writing_single_task",
      created_at: row.created_at,
      prompt_code: row.prompt_code,
      task_type: row.task_type,
      word_count: row.word_count,
      time_spent_seconds: row.time_spent_seconds,
      overall_band: parseFloat(row.overall_band),
      criteria: {
        task_achievement: parseFloat(row.task_achievement),
        coherence_cohesion: parseFloat(row.coherence_cohesion),
        lexical_resource: parseFloat(row.lexical_resource),
        grammatical_range: parseFloat(row.grammatical_range),
      },
      is_feedback_unlocked: row.is_feedback_unlocked,
      raw: row,
    }));

    // ═══════════════════════════════════════════
    // NORMALIZE FULL TEST ITEMS
    // ═══════════════════════════════════════════

    const fullTestItems = (fullTestResult.data || []).map((row) => ({
      id: row.id,
      type: "writing_full_test",
      created_at: row.created_at,
      pair_code: row.pair_code,
      module: row.module,
      total_time_spent_seconds: row.total_time_spent_seconds,
      task_1: {
        prompt_id: row.task_1_prompt_id,
        word_count: row.task_1_word_count,
        overall_band: parseFloat(row.task_1_overall_band),
      },
      task_2: {
        prompt_id: row.task_2_prompt_id,
        word_count: row.task_2_word_count,
        overall_band: parseFloat(row.task_2_overall_band),
      },
      overall_band: parseFloat(row.combined_overall_band),
      is_feedback_unlocked: row.is_feedback_unlocked,
      raw: row,
    }));

    // ═══════════════════════════════════════════
    // COMBINE + SORT
    // ═══════════════════════════════════════════

    const combined = [...singleTaskItems, ...fullTestItems].sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    const total = combined.length;

    // ═══════════════════════════════════════════
    // PAGINATE
    // ═══════════════════════════════════════════

    const paginated = combined.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    // ═══════════════════════════════════════════
    // SUCCESS
    // ═══════════════════════════════════════════

    return NextResponse.json({
      success: true,
      writing: paginated,
      total,
      hasMore,
      offset,
      limit,
    });
  } catch (error) {
    console.error("[FETCH-HISTORY] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}