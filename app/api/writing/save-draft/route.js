import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/writing/save-draft
 * 
 * Auto-save draft essay to Supabase.
 * Called by frontend every 30 seconds while user is writing.
 * 
 * Request body:
 *   - sessionId (required): writing_sessions.id
 *   - userId (required): owner validation
 *   - draft (required): essay text
 *   - wordCount (required): current word count
 *   - taskNumber (optional, for full_test only): 1 or 2
 * 
 * Response:
 *   - 200: { saved: true, lastSavedAt, wordCount }
 *   - 400: { error } — missing/invalid input
 *   - 403: { error } — session doesn't belong to user
 *   - 404: { error } — session not found
 *   - 409: { error } — session already submitted
 *   - 500: { error } — server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, userId, draft, wordCount, taskNumber } = body;

    // --- VALIDATION ---
    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Missing sessionId or userId" }, 
        { status: 400 }
      );
    }

    if (draft === undefined || wordCount === undefined) {
      return NextResponse.json(
        { error: "Missing draft or wordCount" }, 
        { status: 400 }
      );
    }

    // --- FETCH SESSION ---
    const { data: session, error: fetchError } = await supabase
      .from('writing_sessions')
      .select('id, user_id, session_type, is_submitted')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // --- OWNERSHIP CHECK ---
    if (session.user_id !== userId) {
      return NextResponse.json(
        { error: "Session does not belong to this user" }, 
        { status: 403 }
      );
    }

    // --- ALREADY SUBMITTED CHECK ---
    if (session.is_submitted) {
      return NextResponse.json(
        { error: "Session already submitted. Cannot save draft." }, 
        { status: 409 }
      );
    }

    // --- BUILD UPDATE PAYLOAD BASED ON SESSION TYPE ---
    const now = new Date().toISOString();
    let updatePayload = { last_saved_at: now };

    if (session.session_type === 'single_task') {
      updatePayload.draft_text = draft;
      updatePayload.word_count = wordCount;
    } else if (session.session_type === 'full_test') {
      // Full Test: need taskNumber (1 or 2) to know which draft to update
      if (taskNumber !== 1 && taskNumber !== 2) {
        return NextResponse.json(
          { error: "Missing or invalid taskNumber (must be 1 or 2) for full_test session" }, 
          { status: 400 }
        );
      }

      if (taskNumber === 1) {
        updatePayload.task_1_draft = draft;
        updatePayload.task_1_word_count = wordCount;
      } else {
        updatePayload.task_2_draft = draft;
        updatePayload.task_2_word_count = wordCount;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid session_type" }, 
        { status: 500 }
      );
    }

    // --- UPDATE SESSION ---
    const { error: updateError } = await supabase
      .from('writing_sessions')
      .update(updatePayload)
      .eq('id', sessionId);

    if (updateError) {
      console.error("[WRITING/SAVE-DRAFT] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save draft" }, 
        { status: 500 }
      );
    }

    // --- SUCCESS ---
    return NextResponse.json({
      saved: true,
      lastSavedAt: now,
      wordCount,
      ...(taskNumber && { taskNumber }),
    });

  } catch (error) {
    console.error("[WRITING/SAVE-DRAFT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}