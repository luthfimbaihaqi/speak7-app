import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import {
  MIN_WORDS_TO_SUBMIT,
  DAILY_LIMIT_FULL_TEST,
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
 * POST /api/writing/evaluate-full-test
 * 
 * Evaluate a Full Writing Test submission (Task 1 + Task 2 bundle).
 * 
 * Request body:
 *   - sessionId (required): writing_sessions.id (session_type='full_test')
 *   - userId (required): owner validation
 *   - task1EssayText (required): Task 1 essay content
 *   - task1WordCount (required): Task 1 word count
 *   - task2EssayText (required): Task 2 essay content
 *   - task2WordCount (required): Task 2 word count
 *   - totalTimeSpentSeconds (optional): total timer at submit (max 3600)
 * 
 * Response:
 *   - 200: { success, historyId, task1Evaluation, task2Evaluation, combinedBand }
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
    const {
      sessionId,
      userId,
      task1EssayText,
      task1WordCount,
      task2EssayText,
      task2WordCount,
      totalTimeSpentSeconds,
    } = body;

    // ═══════════════════════════════════════════
    // VALIDATION LAYER
    // ═══════════════════════════════════════════

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Missing sessionId or userId" },
        { status: 400 }
      );
    }

    if (!task1EssayText || !task2EssayText) {
      return NextResponse.json(
        { error: "Both Task 1 and Task 2 essays are required" },
        { status: 400 }
      );
    }

    if (
      typeof task1WordCount !== "number" ||
      typeof task2WordCount !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid word count values" },
        { status: 400 }
      );
    }

    if (task1WordCount < MIN_WORDS_TO_SUBMIT) {
      return NextResponse.json(
        {
          error: `Task 1 must be at least ${MIN_WORDS_TO_SUBMIT} words`,
          currentWordCount: task1WordCount,
        },
        { status: 400 }
      );
    }

    if (task2WordCount < MIN_WORDS_TO_SUBMIT) {
      return NextResponse.json(
        {
          error: `Task 2 must be at least ${MIN_WORDS_TO_SUBMIT} words`,
          currentWordCount: task2WordCount,
        },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════
    // FETCH SESSION + PAIR + BOTH PROMPTS
    // ═══════════════════════════════════════════

    const { data: session, error: sessionError } = await supabase
      .from("writing_sessions")
      .select("id, user_id, session_type, is_submitted, pair_id")
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

    if (session.session_type !== "full_test") {
      return NextResponse.json(
        {
          error:
            "Wrong endpoint. Use /evaluate-single-task for single task sessions.",
        },
        { status: 400 }
      );
    }

    if (session.is_submitted) {
      return NextResponse.json(
        { error: "Session already submitted" },
        { status: 409 }
      );
    }

    // Fetch pair with both prompts (expand via FK)
    const { data: pair, error: pairError } = await supabase
      .from("writing_full_test_pairs")
      .select(
        `
        *,
        task_1_prompt:task_1_prompt_id(*),
        task_2_prompt:task_2_prompt_id(*)
      `
      )
      .eq("id", session.pair_id)
      .single();

    if (pairError || !pair) {
      return NextResponse.json(
        { error: "Full Test pair not found" },
        { status: 404 }
      );
    }

    const task1Prompt = pair.task_1_prompt;
    const task2Prompt = pair.task_2_prompt;

    if (!task1Prompt || !task2Prompt) {
      return NextResponse.json(
        { error: "Associated prompts not found" },
        { status: 404 }
      );
    }

    // ═══════════════════════════════════════════
    // QUOTA CHECK
    // ═══════════════════════════════════════════

    const today = new Date().toISOString().split("T")[0];
    const { data: existingQuota } = await supabase
      .from("writing_quotas")
      .select("full_test_daily_count, single_task_daily_count, last_usage_date")
      .eq("user_id", userId)
      .single();

    let currentCount = 0;
    if (existingQuota && existingQuota.last_usage_date === today) {
      currentCount = existingQuota.full_test_daily_count || 0;
    }

    if (currentCount >= DAILY_LIMIT_FULL_TEST) {
      const resetAt = new Date();
      resetAt.setUTCHours(24, 0, 0, 0);

      return NextResponse.json(
        {
          error: "Daily Full Test limit reached",
          message:
            "Kamu sudah menggunakan 2 kesempatan Full Test hari ini. Yuk lanjut besok!",
          resetAt: resetAt.toISOString(),
          limit: DAILY_LIMIT_FULL_TEST,
        },
        { status: 429 }
      );
    }

    // ═══════════════════════════════════════════
    // CHECKPOINT: MARK SESSION SUBMITTED
    // ═══════════════════════════════════════════

    const { error: markError } = await supabase
      .from("writing_sessions")
      .update({ is_submitted: true })
      .eq("id", sessionId);

    if (markError) {
      console.error("[EVALUATE-FULL] Failed to mark submitted:", markError);
      return NextResponse.json(
        { error: "Failed to lock session" },
        { status: 500 }
      );
    }

    let task1Evaluation = null;
    let task2Evaluation = null;
    let historyId = null;

    try {
      // ═══════════════════════════════════════════
      // BUILD AI PROMPTS (both tasks)
      // ═══════════════════════════════════════════

      let task1AiPrompt;
      if (task1Prompt.task_type === "task_1_academic") {
        task1AiPrompt = buildTask1AcademicPrompt({
          promptText: task1Prompt.prompt_text,
          essayText: task1EssayText,
          chartData: task1Prompt.chart_data,
        });
      } else if (task1Prompt.task_type === "task_1_general") {
        task1AiPrompt = buildTask1GeneralPrompt({
          promptText: task1Prompt.prompt_text,
          essayText: task1EssayText,
        });
      } else {
        throw new Error(
          `Unexpected task_1 type in pair: ${task1Prompt.task_type}`
        );
      }

      const task2AiPrompt = buildTask2Prompt({
        promptText: task2Prompt.prompt_text,
        essayText: task2EssayText,
        module: task2Prompt.module,
      });

      // ═══════════════════════════════════════════
      // CALL GPT-4o IN PARALLEL (2x)
      // ═══════════════════════════════════════════

      const [task1Completion, task2Completion] = await Promise.all([
        openai.chat.completions.create({
          model: EVALUATION_MODEL,
          messages: [{ role: "system", content: task1AiPrompt }],
          response_format: { type: "json_object" },
          temperature: EVALUATION_TEMPERATURE,
        }),
        openai.chat.completions.create({
          model: EVALUATION_MODEL,
          messages: [{ role: "system", content: task2AiPrompt }],
          response_format: { type: "json_object" },
          temperature: EVALUATION_TEMPERATURE,
        }),
      ]);

      // Parse both responses
      let task1Parsed, task2Parsed;
      try {
        task1Parsed = JSON.parse(task1Completion.choices[0].message.content);
      } catch (e) {
        throw new Error("Task 1 AI returned invalid JSON");
      }

      try {
        task2Parsed = JSON.parse(task2Completion.choices[0].message.content);
      } catch (e) {
        throw new Error("Task 2 AI returned invalid JSON");
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
        if (task1Parsed[field] === undefined || task1Parsed[field] === null) {
          throw new Error(`Task 1 AI response missing field: ${field}`);
        }
        if (task2Parsed[field] === undefined || task2Parsed[field] === null) {
          throw new Error(`Task 2 AI response missing field: ${field}`);
        }
      }

      // ═══════════════════════════════════════════
      // COMPUTE INDIVIDUAL OVERALL BANDS
      // ═══════════════════════════════════════════

      const task1Avg =
        (task1Parsed.task_achievement +
          task1Parsed.coherence_cohesion +
          task1Parsed.lexical_resource +
          task1Parsed.grammatical_range) /
        4;
      const task1Overall = ieltsRound(task1Avg);
      task1Parsed.overall_band = task1Overall;

      const task2Avg =
        (task2Parsed.task_achievement +
          task2Parsed.coherence_cohesion +
          task2Parsed.lexical_resource +
          task2Parsed.grammatical_range) /
        4;
      const task2Overall = ieltsRound(task2Avg);
      task2Parsed.overall_band = task2Overall;

      // ═══════════════════════════════════════════
      // COMPUTE COMBINED BAND (IELTS FORMULA)
      // Task 2 weighted 2x from Task 1
      // Combined = (T1 × 1 + T2 × 2) / 3
      // ═══════════════════════════════════════════

      const combinedAvg = (task1Overall * 1 + task2Overall * 2) / 3;
      const combinedBand = ieltsRound(combinedAvg);

      task1Evaluation = task1Parsed;
      task2Evaluation = task2Parsed;

      // ═══════════════════════════════════════════
      // INSERT writing_full_test_history
      // ═══════════════════════════════════════════

      const { data: historyRow, error: historyError } = await supabase
        .from("writing_full_test_history")
        .insert({
          user_id: userId,
          pair_id: pair.id,
          pair_code: pair.pair_code,
          module: pair.module,
          total_time_spent_seconds: totalTimeSpentSeconds || null,

          // Task 1
          task_1_prompt_id: task1Prompt.id,
          task_1_essay_text: task1EssayText,
          task_1_word_count: task1WordCount,
          task_1_overall_band: task1Overall,
          task_1_task_achievement: task1Parsed.task_achievement,
          task_1_coherence_cohesion: task1Parsed.coherence_cohesion,
          task_1_lexical_resource: task1Parsed.lexical_resource,
          task_1_grammatical_range: task1Parsed.grammatical_range,
          task_1_full_feedback: task1Parsed,

          // Task 2
          task_2_prompt_id: task2Prompt.id,
          task_2_essay_text: task2EssayText,
          task_2_word_count: task2WordCount,
          task_2_overall_band: task2Overall,
          task_2_task_achievement: task2Parsed.task_achievement,
          task_2_coherence_cohesion: task2Parsed.coherence_cohesion,
          task_2_lexical_resource: task2Parsed.lexical_resource,
          task_2_grammatical_range: task2Parsed.grammatical_range,
          task_2_full_feedback: task2Parsed,

          // Combined
          combined_overall_band: combinedBand,

          // Unlock state
          is_feedback_unlocked: false,
          model_version: EVALUATION_MODEL,
        })
        .select("id")
        .single();

      if (historyError || !historyRow) {
        console.error(
          "[EVALUATE-FULL] Full test history insert failed:",
          historyError
        );
        throw new Error("Failed to save full test evaluation");
      }

      historyId = historyRow.id;

      // ═══════════════════════════════════════════
      // INCREMENT QUOTA (full_test counter)
      // ═══════════════════════════════════════════

      const newFullTestCount =
        existingQuota && existingQuota.last_usage_date === today
          ? currentCount + 1
          : 1;

      const { error: quotaError } = await supabase
        .from("writing_quotas")
        .upsert(
          {
            user_id: userId,
            full_test_daily_count: newFullTestCount,
            single_task_daily_count:
              existingQuota?.last_usage_date === today
                ? existingQuota.single_task_daily_count || 0
                : 0,
            last_usage_date: today,
          },
          { onConflict: "user_id" }
        );

      if (quotaError) {
        console.error(
          "[EVALUATE-FULL] Quota update failed (non-critical):",
          quotaError
        );
      }

      // ═══════════════════════════════════════════
      // INCREMENT solved_count on pair (non-blocking)
      // ═══════════════════════════════════════════

      supabase
        .from("writing_full_test_pairs")
        .select("solved_count")
        .eq("id", pair.id)
        .single()
        .then(({ data: currentPair }) => {
          if (currentPair) {
            supabase
              .from("writing_full_test_pairs")
              .update({
                solved_count: (currentPair.solved_count || 0) + 1,
              })
              .eq("id", pair.id)
              .then(() => {})
              .catch((err) => {
                console.error(
                  "[EVALUATE-FULL] pair solved_count increment failed:",
                  err
                );
              });
          }
        });

      // ═══════════════════════════════════════════
      // CLEANUP: DELETE DRAFT SESSION
      // ═══════════════════════════════════════════

      await supabase.from("writing_sessions").delete().eq("id", sessionId);

      console.log(
        `[EVALUATE-FULL] User ${userId.substring(0, 8)} submitted Full Test ` +
          `pair ${pair.pair_code} (${pair.module}). ` +
          `T1: ${task1Overall}, T2: ${task2Overall}, Combined: ${combinedBand}. ` +
          `History: ${historyId.substring(0, 8)}.`
      );

      // ═══════════════════════════════════════════
      // SUCCESS
      // ═══════════════════════════════════════════

      return NextResponse.json({
        success: true,
        historyId,
        task1Evaluation,
        task2Evaluation,
        combinedBand,
        pairCode: pair.pair_code,
        module: pair.module,
      });
    } catch (innerError) {
      // ═══════════════════════════════════════════
      // ROLLBACK: unmark session
      // ═══════════════════════════════════════════

      console.error("[EVALUATE-FULL] Inner error, rolling back:", innerError);

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
    console.error("[EVALUATE-FULL] Outer error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Apply IELTS band rounding rules.
 * Same helper as in evaluate-single-task for consistency.
 */
function ieltsRound(value) {
  const integerPart = Math.floor(value);
  const decimal = value - integerPart;

  if (decimal < 0.25) return integerPart;
  if (decimal < 0.75) return integerPart + 0.5;
  return integerPart + 1.0;
}