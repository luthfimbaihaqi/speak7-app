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

    // 2. TENTUKAN SYSTEM PROMPT
    let systemPrompt;

    if (mode === "mock-interview") {
      // --- PROMPT PART 3 (HUMANIZED / NATURAL STYLE) ---
      systemPrompt = `
        You are an IELTS Examiner conducting Part 3 (Discussion). 
        The user just answered a question about: "${cueCard}".
        User's Answer: "${transcriptText}"

        Your Task:
        1. SCORING LOGIC (STRICT BUT FAIR):
           - Check RELEVANCE & DEPTH. If off-topic or too short, penalize score.

        2. INTERACTION:
           - Create ONE follow-up question.
           - LANGUAGE: Clear, simple, B2 vocabulary. No complex jargon.

        3. FEEDBACK (THE MOST IMPORTANT PART):
           - REWRITE the user's answer to be Band 8.0 level.
           - STYLE GUIDE: **Must be CASUAL & NATURAL (Spoken English).**
           - FORBIDDEN: Do NOT use academic linking words like "Furthermore", "Moreover", "Consequently", "Thus".
           - REQUIRED: Use Phrasal Verbs (e.g., "end up", "figure out"), Idioms, and natural fillers (e.g., "Well,", "Actually,", "To be honest,").
           - TONE: Like a native speaker chatting with a friend, not a professor writing an essay.

           - Also provide ONE specific "improvement" suggestion explaining the score.

        Return ONLY valid JSON:
        {
          "fluency": number,
          "lexical": number,
          "grammar": number,
          "pronunciation": number,
          "nextQuestion": "string",
          "feedback": ["string", "string"], 
          "improvement": "string", 
          "modelAnswer": "string", 
          "grammarCorrection": [
             { "original": "string", "correction": "string", "reason": "string" }
          ]
        }
      `;
    } else {
      // --- PROMPT PART 2 (CUE CARD - HUMANIZED) ---
      systemPrompt = `
        You are an official IELTS Speaking examiner. Analyze the user's response.
        
        Task 1: Scoring (0-9, 0.5 increments ONLY)
        - Provide scores for: Fluency, Lexical, Grammar, Pronunciation.
        
        Task 2: Feedback & Improvement.
        
        Task 3: Grammar Correction.
        
        Task 4: Model Answer (HUMANIZED)
        - Rewrite the user's response to be Band 8.0 level.
        - STYLE GUIDE: **Conversational & Natural.**
        - FORBIDDEN: Avoid robotic/academic connectors.
        - REQUIRED: Use storytelling markers (e.g. "So basically...", "The funny thing is...", "I guess...").
        - Make it sound like a real person talking.

        Return ONLY valid JSON:
        {
          "fluency": number,
          "lexical": number,
          "grammar": number,
          "pronunciation": number,
          "feedback": ["string", "string"],
          "improvement": "string",
          "grammarCorrection": [
            { "original": "string", "correction": "string", "reason": "string" }
          ],
          "modelAnswer": "string"
        }
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Topic: ${cueCard}. Transcript: "${transcriptText}"` },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    // 3. LOGIKA PEMBULATAN SKOR
    const f = analysisResult.fluency || 0;
    const l = analysisResult.lexical || 0;
    const g = analysisResult.grammar || 0;
    const p = analysisResult.pronunciation || 0;

    const average = (f + l + g + p) / 4;
    const decimalPart = average % 1;
    const integerPart = Math.floor(average);

    let finalOverall;
    if (decimalPart < 0.25) finalOverall = integerPart;
    else if (decimalPart < 0.75) finalOverall = integerPart + 0.5;
    else finalOverall = integerPart + 1.0;

    return NextResponse.json({
      topic: cueCard, // Mengirim balik judul topik agar frontend tidak salah
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