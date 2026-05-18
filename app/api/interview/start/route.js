import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Init Supabase Service Role (Admin)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔥 V2: Valid voice options
const VALID_VOICES = ['paul', 'billie', 'taylor'];
const DEFAULT_VOICE = 'paul';

export async function POST(request) {
  try {
    // 🔥 V2: Tangkap 'voice_choice' dari frontend (selain mode)
    const { userId, mode, voice_choice } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing User ID" }, { status: 400 });
    }

    // 🔥 V2: Validate voice_choice, default to 'paul' if invalid
    const validatedVoice = VALID_VOICES.includes(voice_choice) ? voice_choice : DEFAULT_VOICE;

    // 1. TENTUKAN HARGA & STARTING POINT
    // Default Full Test (Cost 3, Part 1)
    let tokenCost = 3;
    let startPart = 1;

    if (mode === 'quick') {
        tokenCost = 1;
        startPart = 3; // Quick Test langsung loncat ke Part 3
    }

    // 2. CEK SALDO USER (THE GATEKEEPER)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // ⛔ TOLAK JIKA SALDO KURANG
    if ((profile.token_balance || 0) < tokenCost) {
        return NextResponse.json(
            { error: "Insufficient tokens. Please top up." }, 
            { status: 402 } // 402 = Payment Required
        );
    }

    // 3. POTONG SALDO (DEDUCT)
    const newBalance = profile.token_balance - tokenCost;
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ token_balance: newBalance })
        .eq('id', userId);

    if (updateError) {
        return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
    }

    // 4. BUAT SESI BARU (CREATE SESSION)
    const { data: session, error: sessionError } = await supabase
      .from("exam_sessions")
      .insert([
        { 
          user_id: userId, 
          current_part: startPart,
          current_step: 0,
          status: 'ONGOING',
          mode: mode,
          voice_choice: validatedVoice,  // 🔥 V2: Save validated voice
          transcript: [],
          extracted_data: {}
        }
      ])
      .select('id')
      .single();

    if (sessionError) {
      // ⚠️ EMERGENCY: Jika gagal buat sesi, idealnya kita refund token di sini.
      // Untuk simplifikasi MVP, kita log error dulu.
      console.error("Failed to create session after deduction:", sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    console.log(`[START] Session created: ${session.id} | Mode: ${mode} | Voice: ${validatedVoice}`);

    // 5. SUKSES & RETURN
    return NextResponse.json({ 
        session_id: session.id,
        remaining_balance: newBalance,
        voice_choice: validatedVoice  // 🔥 V2: Return for frontend reference
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}