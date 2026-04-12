import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Transkrip influencer yang sama persis
const TEST_TRANSCRIPT = [
  { part: 3, step: 0, user: "", ai: "Hello, Candidate! Welcome to the Quick Test. In this session, we will jump straight to Part 3 and discuss Health & Lifestyle. Why do you think people are more concerned about health nowadays?" },
  { part: 3, step: 1, user: "First and foremost, I think, because people are more aware with the problem like health issue nowadays. I can say that's the impact of technological development, especially social media. So people can just easily find the information about the illness or the disease that can get through them. And second, I can say people are more aware on healthy lifestyle, which is important for them.", ai: "How do you think social media specifically influences people's awareness of health issues, Candidate?" },
  { part: 3, step: 2, user: "It's a very interesting question. I can say it's very huge, you know, social media plays a significant role in enhancing or improving the awareness of people, especially about health, they can provide so many important information for them. And if people get like something that is wrong, or incorrect, they can easily find the correct one on social media. So I think the role is very crucial.", ai: "Do modern lifestyles make it harder to stay healthy?" },
  { part: 3, step: 3, user: "No, I don't think so because there are so many healthy health facilities that even the government provide to the people. Like for example, in every parks in a big city, in big cities, the government already provide like a mini gym, so people can just use it as a free facilities. Or even like for example, people can easily do sport like paddle, pilates, because there are so many places where provided those sport. And I can say it is more accessible.", ai: "Candidate, considering your point about accessible facilities in big cities, how might people in rural areas experience challenges in maintaining a healthy lifestyle?" },
  { part: 3, step: 4, user: "Honestly, in my opinion, I think people in rural areas can be healthier compared to those who live in cities. Because people who live in rural areas, they do not get exposed to pollution, especially air pollution, which can make them healthier compared to us. And also the food that they eat, I can't say it's still organic compared to those who live in cities. Because as I said earlier, people who live in cities, even though the sport facilities are accessible, but they still need to realize the air pollution is higher compared to in rural areas. And then the food that they consume can be more dangerous, like fast food everywhere. So I think people who live in rural areas can be healthier, so much healthier.", ai: "What should governments do to improve public health, Candidate?" },
  { part: 3, step: 5, user: "Well, there are so many things that the government can obviously do, obviously can do. The first thing is they must invest in the city development or city design. Like they must provide this green area for people, this high building area for businesses. So the location, the area can be balanced. People can still do sport while they're busy, for example. And also, of course, the awareness for the people is very important. The government can socialize, make a socialization with the people that the facilities, for example, are free for them, or maybe even though like they have to pay some cost, they also need to share it with the people.", ai: "Thank you, Candidate. That is the end of the speaking test. You have done well. Have a great day." }
];

export async function GET() {
  try {
    const topicContext = "Health & Lifestyle";

    const prompt = `
        You are an experienced IELTS Examiner. Evaluate the following Full Speaking Test Transcript holistically.
        
        TOPIC CONTEXT: ${topicContext}
        TRANSCRIPT:
        ${JSON.stringify(TEST_TRANSCRIPT)}

        TASK:
        1. Ignore the Examiner's lines for scoring. Focus ONLY on the User's answers.
        2. Assign Band Scores (0-9) based on IELTS public band descriptors. Score each criterion INDEPENDENTLY — grammar errors must NOT drag down fluency or lexical scores.
           - FLUENCY: Focus on flow and elaboration. If the candidate speaks at length, develops ideas with examples, and maintains coherence WITHOUT long pauses — that is Band 7.0+. Minor hesitations and self-corrections are normal even at Band 7-8.
           - LEXICAL: Focus on vocabulary RANGE and willingness to use less common words. If the candidate uses topic-specific vocabulary and attempts varied expressions — that is Band 7.0+. Occasional repetition is acceptable at Band 7.
           - GRAMMAR: Focus on whether the candidate ATTEMPTS complex structures (relative clauses, conditionals, passive voice). If they use a mix of simple and complex sentences with some errors that do NOT impede communication — that is Band 6.5-7.0. Only give Band 5.0-5.5 if errors are frequent AND cause confusion.
           - PRONUNCIATION: If the Whisper transcription is clean and accurate (few misheard words), assume the candidate speaks clearly — that is Band 7.0+. Only lower the score if there are signs of unclear speech (e.g., [Unintelligible] markers, garbled words).
           
           IMPORTANT: Be encouraging but fair. A candidate who communicates effectively, elaborates well, and uses examples should NOT receive below Band 6.5 overall. The goal is to motivate learners, not discourage them.
        
        🚨 CRITICAL FAIL-SAFE:
        If the transcript contains mostly non-English words, gibberish, or the user is consistently silent/refuses to answer, you MUST give a Band 1.0 or 2.0 overall and skip detailed feedback.
        
        3. **EVIDENCE-BASED FEEDBACK** (CRITICAL):
           - **Strengths**: DO NOT use generic phrases like "Good fluency". Instead, explicitly mention the **TOPICS** the user discussed. 
             - Correct Example: "You demonstrated strong vocabulary when describing the *traffic problems in Jakarta*, specifically using the phrase 'influx of vehicles'."
           - **Area to Improve**: DO NOT use generic phrases like "Grammar needs work". Instead, **QUOTE THE USER'S EXACT MISTAKE**.
             - Correct Example: "When answering about future technology, you said '*it make us easier*', which is grammatically incorrect. It should be '*it makes it easier for us*'."
        
        4. **IMPROVED ANSWERS**: Identify the user's answers to the Part 3 questions. Rewrite them into Band 9.0 standard English (Natural & Sophisticated). Format strictly as:
        'Q1 (Context): [Improved Answer]'

        'Q2 (Context): [Improved Answer]'...
        
        5. **GRAMMAR CLINIC**: Identify ALL major grammatical errors (up to 15 items). Focus on mistakes that impact clarity or recurring errors.

        RETURN JSON FORMAT ONLY:
        {
            "fluency": number, "lexical": number, "grammar": number, "pronunciation": number,
            "feedback": ["string (Strength with evidence)", "string (Strength with evidence)", "string (Improvement with evidence)"],
            "improvement": "string",
            "modelAnswer": "string (The Model Answer or The 3 Improved Answers)",
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
    const avg = (result.fluency + result.lexical + result.grammar + result.pronunciation) / 4;
    const decimal = avg % 1;
    let overall = Math.floor(avg);
    if (decimal >= 0.75) overall += 1.0;
    else if (decimal >= 0.25) overall += 0.5;

    return NextResponse.json({
      message: "Score test with NEW prompt",
      scores: {
        fluency: result.fluency,
        lexical: result.lexical,
        grammar: result.grammar,
        pronunciation: result.pronunciation,
        overall: overall,
      },
      old_scores: {
        fluency: 6,
        lexical: 6,
        grammar: 5,
        pronunciation: 6,
        overall: 6,
      },
      feedback: result.feedback,
      grammarCorrection: result.grammarCorrection,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}