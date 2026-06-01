import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  console.log("🚀 Menerima request di /api/analyze");

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const cueCard = formData.get("cue_card");

    if (!audioFile) {
      return NextResponse.json({ error: "Audio is required" }, { status: 400 });
    }

    // 1. TRANSKRIPSI (OpenAI Whisper)
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    let transcriptText = "";

    if (buffer.length > 1000) {
      try {
        const file = await OpenAI.toFile(buffer, "user_voice.mp3");
        const trans = await openai.audio.transcriptions.create({
          file: file,
          model: "whisper-1",
          language: "en",
        });
        transcriptText = trans.text.trim();
      } catch (err) {
        transcriptText = "[Unintelligible]";
      }
    }

    const wordCount = transcriptText.trim().split(/\s+/).length;
    console.log(`🎤 Transcript (${wordCount} words): ${transcriptText}`);

    // FAIL-SAFE: Jawaban terlalu pendek
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

    // 2. SCORING (GPT-4o) — V2: All V10-V12 fixes applied
    const prompt = `
        You are an experienced IELTS Examiner. Evaluate the following Part 2 (Long Turn) response holistically.
        
        TOPIC: "${cueCard}"
        USER'S ANSWER: "${transcriptText}"

        TASK:
        1. Ignore any filler words for scoring. Focus on the OVERALL quality of the response.
        2. Assign Band Scores (0-9) based on IELTS public band descriptors. Score each criterion INDEPENDENTLY — grammar errors must NOT drag down fluency or lexical scores.
           - FLUENCY: Focus on flow and elaboration. If the candidate speaks at length, develops ideas with examples, and maintains coherence WITHOUT long pauses — that is Band 7.0+. Minor hesitations and self-corrections are normal even at Band 7-8.
           - LEXICAL: Focus on vocabulary RANGE and willingness to use less common words. If the candidate uses topic-specific vocabulary and attempts varied expressions — that is Band 7.0+. Occasional repetition is acceptable at Band 7.
           - GRAMMAR: Focus on whether the candidate ATTEMPTS complex structures (relative clauses, conditionals, passive voice). If they use a mix of simple and complex sentences with some errors that do NOT impede communication — that is Band 6.5-7.0. Only give Band 5.0-5.5 if errors are frequent AND cause confusion.
           - PRONUNCIATION: If the transcription is clean and accurate (few misheard words), assume the candidate speaks clearly — that is Band 7.0+. Only lower the score if there are signs of unclear speech (e.g., [Unintelligible] markers, garbled words).
           
           IMPORTANT: Be encouraging but fair. A candidate who communicates effectively, elaborates well, and uses examples should NOT receive below Band 6.5 overall. The goal is to motivate learners, not discourage them.
        
        🚨 CRITICAL FAIL-SAFE:
        If the transcript contains mostly non-English words, gibberish, or the user is consistently silent/refuses to answer, you MUST give a Band 1.0 or 2.0 overall and skip detailed feedback.
        
        3. **EVIDENCE-BASED FEEDBACK** (CRITICAL):
           - **Strengths**: DO NOT use generic phrases like "Good fluency". Instead, explicitly mention the **TOPICS** the user discussed. 
             - Correct Example: "You demonstrated strong vocabulary when describing the *traffic problems in Jakarta*, specifically using the phrase 'influx of vehicles'."
           - **Area to Improve**: DO NOT use generic phrases like "Grammar needs work". Instead, **QUOTE THE USER'S EXACT MISTAKE**.
             - Correct Example: "When describing your experience, you said '*it make me feel happy*', which should be '*it made me feel happy*'."
        
        4. **MODEL ANSWER** for Part 2:
           Write a Band 9.0 monologue for the topic "${cueCard}".
           CRITICAL: Base the model answer on the CANDIDATE'S OWN topic and details from their speech.
           For example, if the candidate talked about a specific book, write a Band 9.0 version about THAT book — do NOT invent a completely different book they never mentioned.
           The candidate said: "${transcriptText.substring(0, 500)}"
           Use their specific details (names, places, experiences they mentioned) but express them with Band 9.0 grammar, vocabulary, and coherence.
        
        5. **GRAMMAR CLINIC** (maximum 8 items):
           Identify only GENUINE grammatical errors from the transcript.
           
           INCLUDE these error types:
           - Subject-verb agreement (e.g. "it make" → "it makes")
           - Tense errors (e.g. "I still a child" → "I was still a child")
           - Missing or wrong auxiliary verbs (e.g. "I not go" → "I did not go")
           - Preposition errors (e.g. "depend of" → "depend on")
           - Word form errors (e.g. "I am very satisfy" → "I am very satisfied")
           - Article misuse that causes confusion
           
           DO NOT INCLUDE:
           - Stylistic preferences (e.g. suggesting "however" instead of "but")
           - Minor article omissions common in spoken English
           - Self-corrections (these show awareness, not weakness)
           - Informal register (spoken English is naturally less formal than written)
           - Rephrasing that is "better" but the original is not wrong
           - Vocabulary choices that are valid but uncommon (e.g. "discombobulated" is correct English — do NOT replace it)
           
           FORMAT: Each item must be a SHORT, targeted correction.
           - "original" = the SPECIFIC phrase with the error (maximum 15 words, not a whole paragraph)
           - "correction" = the corrected phrase only (maximum 15 words)
           - "reason" = brief explanation (one sentence)
           DO NOT paste entire paragraphs as "original". Extract only the broken phrase.
           If the candidate's grammar is already good and there are fewer than 2 genuine errors, return an EMPTY array []. Do NOT invent corrections for sentences that are already correct. Do NOT suggest "better" alternatives for correct sentences. If it is not broken, do not fix it.

        6. **IMPROVEMENT** field:
           DO NOT write generic advice like "Focus on subject-verb agreement." or "Try to provide more specific examples."
           Instead, quote at least ONE specific mistake from the transcript and show the fix.
           If the candidate made very few errors, acknowledge their strong grammar and suggest ONE area to push toward Band 8+ (e.g. "Your grammar is strong. To reach Band 8+, try using more conditional structures like 'Had I known...' or inversion like 'Not only did I...'").
           Example: "You said 'it tells us about the memories for the main character and explain' — use 'of' instead of 'for' and match the verb: 'tells us about the memories of the main character and explains.'"

        RETURN JSON FORMAT ONLY:
        {
            "fluency": number, "lexical": number, "grammar": number, "pronunciation": number,
            "feedback": ["string (Strength with evidence)", "string (Strength with evidence)", "string (Improvement with evidence)"],
            "improvement": "string (with specific quoted examples)",
            "modelAnswer": "string",
            "grammarCorrection": [{ "original": "string (short phrase only)", "correction": "string (short phrase only)", "reason": "string (one sentence)" }]
        }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    // 🔥 V2: Filter out hallucinated grammar corrections
    if (analysisResult.grammarCorrection) {
        const lowerTranscript = transcriptText.toLowerCase();
        analysisResult.grammarCorrection = analysisResult.grammarCorrection.filter(item => {
            // Remove if original === correction (no actual fix)
            if (item.original.trim().toLowerCase() === item.correction.trim().toLowerCase()) return false;
            // Remove if the original phrase doesn't exist in transcript (hallucinated)
            const searchPhrase = item.original.toLowerCase().substring(0, 20);
            if (!lowerTranscript.includes(searchPhrase)) return false;
            return true;
        });
    }

    // 3. PEMBULATAN SKOR OVERALL
    const f = analysisResult.fluency || 0;
    const l = analysisResult.lexical || 0;
    const g = analysisResult.grammar || 0;
    let p = analysisResult.pronunciation || 0;

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