import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Transkrip Cue Card user: "Describe a time when you helped someone"
const TEST_CUE_CARD = "Describe a time when you helped someone.";
const TEST_TRANSCRIPT = "I helped my friend see me struggling with her financial back then and she asked me whether can I give some loan to her. Then I asked her politely what kind of situation that she's been going through because money is very sensitive in terms of any relationship so I need to know the clear reason behind it. and she tells me everything about her condition, about her life situations. So after all the things that she told me, I helped her by loaned my money to her every month for about 3 months. I think it feels so good to be able to help my friends because I know how it feels when we need some help but there is no one can help us.";

export async function GET() {
  try {
    const prompt = `
        You are an experienced IELTS Examiner. Evaluate the following Part 2 (Long Turn) response holistically.
        
        TOPIC: "${TEST_CUE_CARD}"
        USER'S ANSWER: "${TEST_TRANSCRIPT}"

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
        
        4. **MODEL ANSWER**: Write a natural, Band 9.0 storytelling monologue for this Part 2 topic. Make it sound human and engaging.
        
        5. **GRAMMAR CLINIC**: Identify ALL major grammatical errors (up to 15 items). Focus on mistakes that impact clarity or recurring errors.

        RETURN JSON FORMAT ONLY:
        {
            "fluency": number, "lexical": number, "grammar": number, "pronunciation": number,
            "feedback": ["string (Strength with evidence)", "string (Strength with evidence)", "string (Improvement with evidence)"],
            "improvement": "string",
            "modelAnswer": "string",
            "grammarCorrection": [{ "original": "string", "correction": "string", "reason": "string" }]
        }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Calculate Overall (same logic as production)
    const f = result.fluency || 0;
    const l = result.lexical || 0;
    const g = result.grammar || 0;
    let p = result.pronunciation || 0;
    if (p === 0) p = g;

    const avg = (f + l + g + p) / 4;
    const decimal = avg % 1;
    let overall = Math.floor(avg);
    if (decimal >= 0.75) overall += 1.0;
    else if (decimal >= 0.25) overall += 0.5;

    return NextResponse.json({
      message: "Cue Card Score Test — NEW prompt (GPT-4o) vs OLD (Groq Llama)",
      topic: TEST_CUE_CARD,
      new_scores: {
        fluency: result.fluency,
        lexical: result.lexical,
        grammar: result.grammar,
        pronunciation: result.pronunciation,
        overall: overall,
      },
      old_scores: {
        fluency: 6,
        lexical: 5.5,
        grammar: 5,
        pronunciation: 5,
        overall: 5.5,
      },
      feedback: result.feedback,
      grammarCorrection: result.grammarCorrection,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}