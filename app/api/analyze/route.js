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

    // 2. SCORING & KOREKSI
    const systemPrompt = `
      You are an official IELTS Speaking examiner. Analyze the user's response.
      
      Task 1: Scoring (0-9, 0.5 increments)
      - Fluency, Lexical, Grammar, Pronunciation.
      
      Task 2: Feedback
      - 2 positive feedback points.
      - 1 specific improvement suggestion.
      
      Task 3: Grammar & Vocabulary Correction (CRITICAL)
      - Identify 3-5 specific sentences with grammatical errors or weak vocabulary.
      - Provide a "grammarCorrection" array. Each item must have:
        - "original": The user's exact sentence.
        - "correction": A better/correct version (Band 8.0 style).
        - "reason": Brief explanation of the error or improvement.
      
      Task 4: Model Answer
      - Rewrite the user's response to be Band 8.0 level, keeping their original ideas.

      Return ONLY valid JSON:
      {
        "fluency": number,
        "lexical": number,
        "grammar": number,
        "pronunciation": number,
        "overall": number,
        "feedback": ["string", "string"],
        "improvement": "string",
        "grammarCorrection": [
          { "original": "string", "correction": "string", "reason": "string" }
        ],
        "modelAnswer": "string"
      }
    `;

    const userMessage = `
      Cue card Topic: ${cueCard}
      User's Transcript: "${transcriptText}"
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json({
      transcript: transcriptText,
      ...analysisResult,
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada AI." },
      { status: 500 }
    );
  }
}