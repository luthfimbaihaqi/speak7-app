import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import {
  MIN_WORDS_TO_SUBMIT,
  DAILY_LIMIT_SINGLE_TASK,
  EVALUATION_MODEL,
  EVALUATION_TEMPERATURE,
} from "@/utils/writingConfig";
import {
  buildTask2Prompt,
  buildTask1GeneralPrompt,
  buildTask1AcademicPrompt,
} from "@/lib/writing/prompts";

// Init clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/writing/evaluate-single-task
 * 
 * Evaluate a Single Task Practice submission.
 * 
 * Request body:
 *   - sessionId (required): writing_sessions.id
 *   - userId (required): owner validation
 *   - essayText (required): final essay content
 *   - wordCount (required): final word count
 *   - timeSpentSeconds (optional): stopwatch value at submit
 * 
 * Response:
 *   - 200: { success, historyId, evaluation }
 *   - 400: { error } — validation failed
 *   - 403: { error } — ownership check failed
 *   - 404: { error } — session not found
 *   - 409: { error } — already submitted
 *   - 429: { error } — quota exhausted
 *   - 500: { error } — AI failure or server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, userId, essayText, wordCount, timeSpentSeconds } = body;

    // ═══════════════════════════════════════════
    // VALIDATION LAYER
    // ═══════════════════════════════════════════

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Missing sessionId or userId" },
        { status: 400 }
      );
    }

    if (!essayText || typeof essayText !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid essayText" },
        { status: 400 }
      );
    }

    if (typeof wordCount !== "number" || wordCount < MIN_WORDS_TO_SUBMIT) {
      return NextResponse.json(
        {
          error: `Essay must be at least ${MIN_WORDS_TO_SUBMIT} words`,
          currentWordCount: wordCount,
        },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════
    // FETCH SESSION + PROMPT
    // ═══════════════════════════════════════════

    const { data: session, error: sessionError } = await supabase
      .from("writing_sessions")
      .select(`
        id,
        user_id,
        session_type,
        is_submitted,
        prompt_id
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.user_id !== userId) {
      return NextResponse.json(
        { error: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    if (session.session_type !== "single_task") {
      return NextResponse.json(
        { error: "Wrong endpoint. Use /evaluate-full-test for full test sessions." },
        { status: 400 }
      );
    }

    if (session.is_submitted) {
      return NextResponse.json(
        { error: "Session already submitted" },
        { status: 409 }
      );
    }

    // Fetch prompt details
    const { data: prompt, error: promptError } = await supabase
      .from("writing_prompts")
      .select("*")
      .eq("id", session.prompt_id)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { error: "Associated prompt not found" },
        { status: 404 }
      );
    }

    // ═══════════════════════════════════════════
    // QUOTA CHECK
    // ═══════════════════════════════════════════

    const today = new Date().toISOString().split("T")[0];
    const { data: existingQuota } = await supabase
      .from("writing_quotas")
      .select("single_task_daily_count, last_usage_date")
      .eq("user_id", userId)
      .single();

    let currentCount = 0;
    if (existingQuota && existingQuota.last_usage_date === today) {
      currentCount = existingQuota.single_task_daily_count || 0;
    }

    if (currentCount >= DAILY_LIMIT_SINGLE_TASK) {
      const resetAt = new Date();
      resetAt.setUTCHours(24, 0, 0, 0);

      return NextResponse.json(
        {
          error: "Daily Single Task limit reached",
          message: "Kamu sudah menggunakan 2 kesempatan Single Task hari ini. Yuk lanjut besok!",
          resetAt: resetAt.toISOString(),
          limit: DAILY_LIMIT_SINGLE_TASK,
        },
        { status: 429 }
      );
    }

    // ═══════════════════════════════════════════
    // CHECKPOINT: MARK SESSION SUBMITTED (prevent race)
    // ═══════════════════════════════════════════

    const { error: markError } = await supabase
      .from("writing_sessions")
      .update({ is_submitted: true })
      .eq("id", sessionId);

    if (markError) {
      console.error("[EVALUATE-SINGLE] Failed to mark submitted:", markError);
      return NextResponse.json(
        { error: "Failed to lock session" },
        { status: 500 }
      );
    }

    // From here, we need to ROLLBACK session on any failure
    let evaluation = null;
    let historyId = null;

    try {
      // ═══════════════════════════════════════════
      // BUILD AI PROMPT
      // ═══════════════════════════════════════════

      let aiPrompt;
      if (prompt.task_type === "task_2") {
        aiPrompt = buildTask2Prompt({
          promptText: prompt.prompt_text,
          essayText,
          module: prompt.module,
        });
      } else if (prompt.task_type === "task_1_general") {
        aiPrompt = buildTask1GeneralPrompt({
          promptText: prompt.prompt_text,
          essayText,
        });
      } else if (prompt.task_type === "task_1_academic") {
        aiPrompt = buildTask1AcademicPrompt({
          promptText: prompt.prompt_text,
          essayText,
          chartData: prompt.chart_data,
        });
      } else {
        throw new Error(`Unknown task_type: ${prompt.task_type}`);
      }

      // ═══════════════════════════════════════════
      // CALL GPT-4o
      // ═══════════════════════════════════════════

      const completion = await openai.chat.completions.create({
        model: EVALUATION_MODEL,
        messages: [{ role: "system", content: aiPrompt }],
        response_format: { type: "json_object" },
        temperature: EVALUATION_TEMPERATURE,
      });

      const rawResponse = completion.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error("[EVALUATE-SINGLE] JSON parse error:", parseError);
        throw new Error("AI returned invalid JSON");
      }

      // Validate required fields (V2 schema — comprehensive feedback)
      const requiredFields = [
        "overall_band",
        "task_achievement",
        "coherence_cohesion",
        "lexical_resource",
        "grammatical_range",
        "task_achievement_summary",
        "coherence_cohesion_summary",
        "lexical_resource_summary",
        "grammatical_range_summary",
        "biggest_improvement_area",
        "strengths",
        "weaknesses",
        "grammar_clinic",
        "vocabulary_suggestions",
        "model_answer",
      ];

      for (const field of requiredFields) {
        if (parsed[field] === undefined || parsed[field] === null) {
          throw new Error(`AI response missing required field: ${field}`);
        }
      }

      // ═══════════════════════════════════════════
      // IELTS ROUNDING (recompute overall for consistency)
      // ═══════════════════════════════════════════

      const avg =
        (parsed.task_achievement +
          parsed.coherence_cohesion +
          parsed.lexical_resource +
          parsed.grammatical_range) /
        4;

      const computedOverall = ieltsRound(avg);

      // Use computed over AI's value (trust our math more)
      parsed.overall_band = computedOverall;

      evaluation = parsed;

      // ═══════════════════════════════════════════
      // INSERT WRITING_HISTORY
      // ═══════════════════════════════════════════

      const { data: historyRow, error: historyError } = await supabase
        .from("writing_history")
        .insert({
          user_id: userId,
          prompt_id: prompt.id,
          prompt_code: prompt.code,
          task_type: prompt.task_type,
          essay_text: essayText,
          word_count: wordCount,
          time_spent_seconds: timeSpentSeconds || null,
          overall_band: computedOverall,
          task_achievement: parsed.task_achievement,
          coherence_cohesion: parsed.coherence_cohesion,
          lexical_resource: parsed.lexical_resource,
          grammatical_range: parsed.grammatical_range,
          full_feedback: parsed,
          is_feedback_unlocked: false,
          model_version: EVALUATION_MODEL,
        })
        .select("id")
        .single();

      if (historyError || !historyRow) {
        console.error("[EVALUATE-SINGLE] History insert failed:", historyError);
        throw new Error("Failed to save evaluation result");
      }

      historyId = historyRow.id;

      // ═══════════════════════════════════════════
      // INCREMENT QUOTA (non-blocking if fail, but log)
      // ═══════════════════════════════════════════

      const newCount = existingQuota && existingQuota.last_usage_date === today
        ? currentCount + 1
        : 1;

      const { error: quotaError } = await supabase
        .from("writing_quotas")
        .upsert(
          {
            user_id: userId,
            single_task_daily_count: newCount,
            full_test_daily_count: existingQuota?.last_usage_date === today
              ? existingQuota.full_test_daily_count || 0
              : 0,
            last_usage_date: today,
          },
          { onConflict: "user_id" }
        );

      if (quotaError) {
        console.error("[EVALUATE-SINGLE] Quota update failed (non-critical):", quotaError);
      }

      // ═══════════════════════════════════════════
      // INCREMENT solved_count (non-blocking)
      // ═══════════════════════════════════════════

      supabase
        .from("writing_prompts")
        .select("solved_count")
        .eq("id", prompt.id)
        .single()
        .then(({ data: currentPrompt }) => {
          if (currentPrompt) {
            supabase
              .from("writing_prompts")
              .update({ solved_count: (currentPrompt.solved_count || 0) + 1 })
              .eq("id", prompt.id)
              .then(() => {})
              .catch((err) => {
                console.error("[EVALUATE-SINGLE] solved_count increment failed:", err);
              });
          }
        });

      // ═══════════════════════════════════════════
      // CLEANUP: DELETE DRAFT SESSION
      // ═══════════════════════════════════════════

      await supabase.from("writing_sessions").delete().eq("id", sessionId);

      console.log(
        `[EVALUATE-SINGLE] User ${userId.substring(0, 8)} submitted ${prompt.task_type} ` +
          `(${prompt.code}). Overall: ${computedOverall}. History: ${historyId.substring(0, 8)}.`
      );

      // ═══════════════════════════════════════════
      // SUCCESS
      // ═══════════════════════════════════════════

      return NextResponse.json({
        success: true,
        historyId,
        evaluation,
      });
    } catch (innerError) {
      // ═══════════════════════════════════════════
      // ROLLBACK: unmark session as submitted
      // ═══════════════════════════════════════════

      console.error("[EVALUATE-SINGLE] Inner error, rolling back:", innerError);

      await supabase
        .from("writing_sessions")
        .update({ is_submitted: false })
        .eq("id", sessionId);

      return NextResponse.json(
        {
          error: "Evaluation failed. Please try again.",
          detail: innerError.message || String(innerError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[EVALUATE-SINGLE] Outer error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Apply IELTS band rounding rules.
 * - Decimal < 0.25 → round down
 * - 0.25 ≤ decimal < 0.75 → round to .5
 * - Decimal ≥ 0.75 → round up
 */
function ieltsRound(value) {
  const integerPart = Math.floor(value);
  const decimal = value - integerPart;

  if (decimal < 0.25) return integerPart;
  if (decimal < 0.75) return integerPart + 0.5;
  return integerPart + 1.0;
}