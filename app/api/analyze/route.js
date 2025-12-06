import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request) {
  console.log("🚀 Menerima request di /api/analyze");

  // 1. Cek API KEY
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

    // 2. TRANSKRIPSI (Audio -> Teks)
    console.log("⏳ Mengirim audio ke Groq Whisper...");
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      language: "en", // Memaksa deteksi Bahasa Inggris
      response_format: "json",
    });

    const transcriptText = transcription.text;
    console.log("✅ Transkripsi:", transcriptText.substring(0, 30) + "...");

    // 3. SCORING (Teks -> Nilai IELTS)
    console.log("⏳ Mengirim teks ke LLaMA 3.3...");
    
    // PERBAIKAN PROMPT: Meminta AI memperbaiki cerita User, bukan membuat cerita baru
    const systemPrompt = `
      You are an official IELTS Speaking examiner. Analyze the user's response.
      
      Task 1: Scoring
      Score each criterion from 0-9 using only 0.5 increments:
      - Fluency and Coherence
      - Lexical Resource
      - Grammatical Range and Accuracy
      - Pronunciation
      
      Task 2: Feedback
      - Provide 2 positive feedbacks ("feedback" array).
      - Provide 1 specific improvement ("improvement" string).
      
      Task 3: Band 8.0 Model Answer (CRITICAL)
      - "modelAnswer": Rewrite the USER'S EXACT RESPONSE to make it sound like a Band 8.0 speaker.
      - KEEP the user's original ideas, context, and story. DO NOT invent a new story.
      - Fix their grammar, upgrade their vocabulary, and improve flow.
      - If the user's answer is too short (under 2 sentences), expand it slightly using logically related ideas based on their keywords.

      Return ONLY valid JSON with this structure:
      {
        "fluency": number,
        "lexical": number,
        "grammar": number,
        "pronunciation": number,
        "overall": number,
        "feedback": ["string", "string"],
        "improvement": "string",
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

    const content = completion.choices[0].message.content;
    const analysisResult = JSON.parse(content);

    console.log("✅ Scoring selesai.");

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