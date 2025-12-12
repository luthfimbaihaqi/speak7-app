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
    // 🔥 NEW: Tangkap data difficulty (Default: Medium)
    const difficulty = formData.get("difficulty") || "medium";

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
    // LAYER 1: VALIDASI JAVASCRIPT
    // ---------------------------------------------------------
    if (wordCount < 5) {
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

    // 2. TENTUKAN KEPRIBADIAN AI BERDASARKAN DIFFICULTY
    let difficultyInstruction = "";
    
    if (difficulty === "easy") {
        difficultyInstruction = `
        🎭 **EXAMINER PERSONA: FRIENDLY & SUPPORTIVE (Level: Easy)**
        - **Question Style:** Simple, direct, and personal.
        - **Target:** Ask about user's preferences, habits, or frequency.
        - **Constraint:** DO NOT ask complex "Why" questions about society. Keep it about the USER.
        - **Example Follow-up:** "Do you go there often?" or "Do you like doing that with friends?"
        `;
    } else if (difficulty === "hard") {
        difficultyInstruction = `
        🎭 **EXAMINER PERSONA: CRITICAL & ANALYTICAL (Level: Hard)**
        - **Question Style:** Challenging, abstract, and debate-oriented.
        - **Target:** Challenge the user's argument, ask for social implications, or predictions.
        - **Constraint:** Use sophisticated vocabulary in your question. Test their ability to defend an opinion.
        - **Example Follow-up:** "You mentioned X, but critics say Y. How do you justify that?" or "What impact does this have on the wider community?"
        `;
    } else {
        // Medium (Default)
        difficultyInstruction = `
        🎭 **EXAMINER PERSONA: STANDARD IELTS (Level: Medium)**
        - **Question Style:** Professional and inquisitive.
        - **Target:** Ask for elaboration (Reasons/Explanations).
        - **Example Follow-up:** "Why do you think that is?" or "Can you explain why you prefer X over Y?"
        `;
    }

    // 3. INSTRUKSI UTAMA & SYSTEM PROMPT
    const baseInstruction = `
      You are an IELTS Examiner. Be REALISTIC and FAIR.
      
      ${difficultyInstruction}  <-- APPLY THIS PERSONA!

      🚨 **LANGUAGE DETECTION PROTOCOL (PRIORITY #1)**:
      1. **CHECK THE TRANSCRIPT**: Does it look like English?
      2. **NON-ENGLISH INPUT**: If the user speaks Indonesian, Spanish, or any other language, OR if the text is complete gibberish:
         - **ACTION**: IMMEDIATE BAND 1.0 for ALL categories.
         - **FEEDBACK**: "No valid English detected."
         - **IMPROVEMENT**: "Speak English only."
      
      CRITICAL SCORING RULES (Only if English is detected):
      1. **PRONUNCIATION SCORING HACK**: ESTIMATE 'Pronunciation' score based on Transcript Quality.
         - Complex/Advanced words -> Good Pronunciation (6.5 - 8.0).
         - Simple/Broken English -> Basic Pronunciation (4.0 - 5.5).
      2. **CONTENT-AWARE FEEDBACK**: Quote specific details from the user's answer.
    `;

    let systemPrompt;

    if (mode === "mock-interview") {
      // --- PROMPT PART 3 (UPDATED WITH DIFFICULTY LOGIC) ---
      systemPrompt = `
        ${baseInstruction}
        
        CONTEXT: Part 3 Discussion about "${cueCard}".
        User's Answer: "${transcriptText}"

        Task:
        1. SCORE: Realistic scores.
        2. **INTERACTION (CRITICAL)**: Create a *Follow-up Question* based on the User's Answer AND the **EXAMINER PERSONA** defined above.
           - **Easy:** Ask personal preference/habit.
           - **Medium:** Ask "Why".
           - **Hard:** Challenge their idea or ask about society.
        3. FEEDBACK (Strengths - Min 3 points):
           - Content: Quote user's idea.
           - Fluency & Vocab.
        4. IMPROVEMENT (Weaknesses - Min 3 points):
           - Elaboration, Vocab, Grammar.
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
        2. FEEDBACK (Strengths).
        3. IMPROVEMENT (Weaknesses).
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
      temperature: 0.2, 
      response_format: { type: "json_object" },
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    // 4. LOGIKA PEMBULATAN SKOR
    let p = analysisResult.pronunciation || 0;
    const f = analysisResult.fluency || 0;
    const l = analysisResult.lexical || 0;
    const g = analysisResult.grammar || 0;

    if (p === 0) {
        p = g; 
        analysisResult.pronunciation = p; 
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