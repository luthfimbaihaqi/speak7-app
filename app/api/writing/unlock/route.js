import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  TOKEN_COST_UNLOCK_SINGLE_TASK,
  TOKEN_COST_UNLOCK_FULL_TEST,
} from "@/utils/writingConfig";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/writing/unlock
 * 
 * Unlock detailed feedback for a Writing submission.
 * Deducts tokens from user's balance and flips is_feedback_unlocked flag.
 * 
 * Request body:
 *   - historyId (required): row ID from writing_history OR writing_full_test_history
 *   - historyType (required): 'single_task' | 'full_test' — determines which table
 *   - userId (required): owner validation
 * 
 * Response:
 *   - 200: { success, unlocked, newBalance, tokenCost }
 *   - 400: { error } — missing/invalid input
 *   - 402: { error } — insufficient tokens (HTTP 402 Payment Required)
 *   - 403: { error } — history doesn't belong to user
 *   - 404: { error } — history not found
 *   - 409: { error } — already unlocked (returns success anyway)
 *   - 500: { error } — server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { historyId, historyType, userId } = body;

    // ═══════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════

    if (!historyId || !userId) {
      return NextResponse.json(
        { error: "Missing historyId or userId" },
        { status: 400 }
      );
    }

    if (!historyType || !["single_task", "full_test"].includes(historyType)) {
      return NextResponse.json(
        { error: "Invalid historyType. Must be 'single_task' or 'full_test'" },
        { status: 400 }
      );
    }

    // Determine table name and token cost based on type
    const tableName =
      historyType === "single_task"
        ? "writing_history"
        : "writing_full_test_history";
    const tokenCost =
      historyType === "single_task"
        ? TOKEN_COST_UNLOCK_SINGLE_TASK
        : TOKEN_COST_UNLOCK_FULL_TEST;

    // ═══════════════════════════════════════════
    // FETCH HISTORY ROW
    // ═══════════════════════════════════════════

    const { data: historyRow, error: historyError } = await supabase
      .from(tableName)
      .select("id, user_id, is_feedback_unlocked")
      .eq("id", historyId)
      .single();

    if (historyError || !historyRow) {
      return NextResponse.json(
        { error: `History not found in ${tableName}` },
        { status: 404 }
      );
    }

    if (historyRow.user_id !== userId) {
      return NextResponse.json(
        { error: "History does not belong to this user" },
        { status: 403 }
      );
    }

    // ═══════════════════════════════════════════
    // IDEMPOTENCY: Already unlocked?
    // ═══════════════════════════════════════════

    if (historyRow.is_feedback_unlocked === true) {
      // Fetch current balance for response
      const { data: profile } = await supabase
        .from("profiles")
        .select("token_balance")
        .eq("id", userId)
        .single();

      return NextResponse.json({
        success: true,
        unlocked: true,
        alreadyUnlocked: true,
        newBalance: profile?.token_balance || 0,
        tokenCost: 0,
        message: "Feedback already unlocked. No tokens deducted.",
      });
    }

    // ═══════════════════════════════════════════
    // CHECK TOKEN BALANCE
    // ═══════════════════════════════════════════

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const currentBalance = profile.token_balance || 0;

    if (currentBalance < tokenCost) {
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          message: `Kamu butuh ${tokenCost} token untuk unlock feedback. Saldo kamu: ${currentBalance} token.`,
          currentBalance,
          required: tokenCost,
        },
        { status: 402 } // Payment Required
      );
    }

    // ═══════════════════════════════════════════
    // UNLOCK TRANSACTION (logical)
    // Step 1: Flip the flag first
    // Step 2: Deduct token
    // Step 3: If step 2 fails, rollback step 1
    // ═══════════════════════════════════════════

    const unlockedAt = new Date().toISOString();

    const { error: flagError } = await supabase
      .from(tableName)
      .update({
        is_feedback_unlocked: true,
        unlocked_at: unlockedAt,
      })
      .eq("id", historyId);

    if (flagError) {
      console.error("[UNLOCK] Flag update failed:", flagError);
      return NextResponse.json(
        { error: "Failed to unlock feedback" },
        { status: 500 }
      );
    }

    // Now deduct token
    const newBalance = currentBalance - tokenCost;

    const { error: deductError } = await supabase
      .from("profiles")
      .update({ token_balance: newBalance })
      .eq("id", userId);

    if (deductError) {
      // ═══════════════════════════════════════════
      // ROLLBACK: un-flip the flag
      // ═══════════════════════════════════════════
      console.error("[UNLOCK] Deduct failed, rolling back flag:", deductError);

      await supabase
        .from(tableName)
        .update({
          is_feedback_unlocked: false,
          unlocked_at: null,
        })
        .eq("id", historyId);

      return NextResponse.json(
        { error: "Token deduction failed. Please try again." },
        { status: 500 }
      );
    }

    // ═══════════════════════════════════════════
    // SUCCESS
    // ═══════════════════════════════════════════

    console.log(
      `[UNLOCK] User ${userId.substring(0, 8)} unlocked ${historyType} ` +
        `${historyId.substring(0, 8)}. ` +
        `Balance: ${currentBalance} → ${newBalance} (-${tokenCost}).`
    );

    return NextResponse.json({
      success: true,
      unlocked: true,
      newBalance,
      tokenCost,
      unlockedAt,
    });
  } catch (error) {
    console.error("[UNLOCK] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}