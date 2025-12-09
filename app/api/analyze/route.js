import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request) {
  console.log("🚀 Menerima request di /api/analyze");

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Server Error: API Key Groq belum disetting." },
      { status: 500 }
    );
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const cueCard = formData.get("cue_card");
    const mode = formData.get("mode") || "cue-card"; 

    if (!audioFile) {
      return NextResponse.json({ error: "Audio is required" }, { status: 400 });
    }

    // 1. TRANSKRIPSI
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      language: "en",
      response_format: "json",
    });

    const transcriptText = transcription.text;
    const wordCount = transcriptText.trim().split(/\s+/).length;

    console.log(`🎤 Transcript (${wordCount} words): ${transcriptText}`);

    // ---------------------------------------------------------
    // LAYER 1: VALIDASI JAVASCRIPT (Tetap ada biar gak boncos)
    // ---------------------------------------------------------
    if (wordCount < 5) { // Saya turunkan jadi 5 kata biar gak terlalu galak di awal
      return NextResponse.json({
        topic: cueCard,
        transcript: transcriptText,
        overall: 1.0,
        fluency: 1.0,
        lexical: 1.0,
        grammar: 1.0,
        pronunciation: 1.0,
        feedback: [
          "No speech detected or answer too short.",
          "Please speak clearly for at least 10 seconds.",
          "IELTS requires lengthy responses to evaluate fluency."
        ],
        improvement: "Try to expand your answer. Don't just say 'Yes' or 'No'.",
        grammarCorrection: [],
        modelAnswer: "N/A"
      });
    }

    // 2. TENTUKAN SYSTEM PROMPT (BALANCING: REALISTIC SCORING)
    let systemPrompt;

    // Instruksi Dasar (Updated)
    const baseInstruction = `
      You are an IELTS Examiner. Be REALISTIC and FAIR (Not too kind, not too mean).
      
      CRITICAL:
      1. **PRONUNCIATION SCORING HACK**: You cannot hear audio. You must ESTIMATE 'Pronunciation' score based on the Transcript Quality.
         - If the transcript is grammatically complex and uses advanced words -> Assume GOOD Pronunciation (Score 6.5 - 8.0).
         - If the transcript is broken english or very simple -> Assume BASIC Pronunciation (Score 4.0 - 5.5).
         - DO NOT RETURN 0 for Pronunciation. Give a realistic estimate.

      2. **CONTENT-AWARE FEEDBACK**:
         - Quote specific things the user said in 'feedback' (Strengths) and 'improvement'.
         - Example: "You argued that 'traffic is bad', but..."
      
      SCORING GUIDE (0-9 Scale):
      - Native-like flow & vocab: 8.0 - 9.0
      - Good flow, minor errors: 6.5 - 7.5
      - Frequent pauses, simple sentences: 5.0 - 6.0
      - Broken sentences, hard to understand: 3.0 - 4.5
      - Very short (< 20 words): Max Score 3.0
    `;

    if (mode === "mock-interview") {
      // --- PROMPT PART 3 ---
      systemPrompt = `
        ${baseInstruction}
        
        CONTEXT: Part 3 Discussion about "${cueCard}".
        User's Answer: "${transcriptText}"

        Task:
        1. SCORE: Give realistic scores (Fluency, Lexical, Grammar, Pronunciation).
        2. INTERACTION: One follow-up question.
        3. FEEDBACK (Strengths - Min 3 points):
           - Content: Quote user's idea.
           - Fluency: Comment on length/flow.
           - Vocab: Praise a good word used.
        4. IMPROVEMENT (Weaknesses - Min 3 points):
           - Elaboration: What was missing?
           - Vocab: Suggest a C1 synonym for a specific word they used.
           - Grammar: Fix a mistake.
        5. MODEL ANSWER: Band 8.5 rewriting (Natural style).

        Return JSON:
        {
          "fluency": number, "lexical": number, "grammar": number, "pronunciation": number,
          "nextQuestion": "string",
          "feedback": ["string", "string", "string"], 
          "improvement": "string", 
          "modelAnswer": "string", 
          "grammarCorrection": [{ "original": "string", "correction": "string", "reason": "string" }]
        }
      `;
    } else {
      // --- PROMPT PART 2 ---
      systemPrompt = `
        ${baseInstruction}

        CONTEXT: Part 2 Long Turn about "${cueCard}".
        User's Answer: "${transcriptText}"
        
        Task:
        1. SCORE: Realistic scores.
        2. FEEDBACK (Strengths - Min 3 points):
           - Content: Quote specific details.
           - Fluency.
           - Vocab.
        3. IMPROVEMENT (Weaknesses - Min 3 points):
           - Elaboration.
           - Vocab Upgrade.
           - Grammar Fix.
        4. MODEL ANSWER: Storytelling style (Band 8.5).

        Return JSON:
        {
          "fluency": number, "lexical": number, "grammar": number, "pronunciation": number,
          "feedback": ["string", "string", "string"],
          "improvement": "string",
          "grammarCorrection": [{ "original": "string", "correction": "string", "reason": "string" }],
          "modelAnswer": "string"
        }
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Evaluate this answer honestly.` },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Sedikit dinaikkan dari 0.1 biar gak terlalu kaku, tapi masih konsisten
      response_format: { type: "json_object" },
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    // 3. LOGIKA PEMBULATAN SKOR
    // Fallback: Kalau AI masih ngasih 0 di Pronunciation, kita ambil rata-rata dari skill lain
    let p = analysisResult.pronunciation || 0;
    const f = analysisResult.fluency || 0;
    const l = analysisResult.lexical || 0;
    const g = analysisResult.grammar || 0;

    // HACK: Kalau Pronunciation 0 (AI Gagal menebak), samakan dengan Grammar
    if (p === 0) {
        p = g; 
        analysisResult.pronunciation = p; // Update object biar di frontend muncul
    }

    const average = (f + l + g + p) / 4;
    const decimalPart = average % 1;
    const integerPart = Math.floor(average);

    let finalOverall;
    if (decimalPart < 0.25) finalOverall = integerPart;
    else if (decimalPart < 0.75) finalOverall = integerPart + 0.5;
    else finalOverall = integerPart + 1.0;

    return NextResponse.json({
      topic: cueCard, 
      transcript: transcriptText,
      ...analysisResult,
      overall: finalOverall,
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada AI." },
      { status: 500 }
    );
  }
}