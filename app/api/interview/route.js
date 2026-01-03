import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// 1. CONFIGURATION
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- TOPIC ENGINE: 12 VARIATION PACKS (IELTS STANDARD) ---
const TOPIC_SETS = [
    {   // SET A: TRAVEL
        id: 'A',
        p1_topic: 'Hobbies',
        p1_intro: "Let's talk about hobbies. Do you have any hobbies?",
        p1_follow: "Why do you like it?",
        p2_topic: "Describe a memorable trip you took to a place far from your home.",
        p2_rounding: "Would you recommend that trip to others?",
        p3_context: "Travel & Tourism",
        p3_q1: "How has travel changed in your country compared to the past?",
        p3_q2: "Do you think modern technology has made traveling better or worse?",
        p3_q3: "What do you think tourism will look like in the future?"
    },
    {   // SET B: TECHNOLOGY
        id: 'B',
        p1_topic: 'Daily Routine',
        p1_intro: "Let's move on to talk about your daily routine. What is your favorite part of the day?",
        p1_follow: "Do you prefer mornings or evenings?",
        p2_topic: "Describe a piece of technology (e.g. phone, computer) that is important to you.",
        p2_rounding: "Do you use it every day?",
        p3_context: "Technology & Society",
        p3_q1: "How has technology changed the way people communicate in your country?",
        p3_q2: "Do you think children should be allowed to use smartphones at a young age?",
        p3_q3: "What new technology do you think will change our lives in the future?"
    },
    {   // SET C: SOCIAL/PEOPLE
        id: 'C',
        p1_topic: 'Food',
        p1_intro: "Let's talk about food. What is your favorite type of food?",
        p1_follow: "Do you prefer eating out or cooking at home?",
        p2_topic: "Describe a person who has influenced you significantly.",
        p2_rounding: "When did you last see this person?",
        p3_context: "Social Relationships",
        p3_q1: "What qualities do you think make a good friend or role model?",
        p3_q2: "Is it easier to meet people today than in the past?",
        p3_q3: "How do you think social media affects personal relationships?"
    },
    {   // SET D: WORK/HOME
        id: 'D',
        p1_topic: 'Home',
        p1_intro: "Let's talk about your home. Do you live in a house or an apartment?",
        p1_follow: "What do you like most about where you live?",
        p2_topic: "Describe a job you would like to have in the future.",
        p2_rounding: "Why does this job appeal to you?",
        p3_context: "Work & Employment",
        p3_q1: "How have working conditions changed in your country over the years?",
        p3_q2: "Do you think work-life balance is important? Why?",
        p3_q3: "How might technology change the way people work in the future?"
    },
    {   // SET E: EDUCATION
        id: 'E',
        p1_topic: 'Studies',
        p1_intro: "Let's talk about your studies. What did you study in school?",
        p1_follow: "Did you enjoy that subject?",
        p2_topic: "Describe a teacher who helped you in your education.",
        p2_rounding: "Do you still contact this teacher?",
        p3_context: "Education System",
        p3_q1: "What are the qualities of a good teacher?",
        p3_q2: "Do you think technology will replace teachers in the future?",
        p3_q3: "Should education be free for everyone? Why or why not?"
    },
    {   // SET F: ENVIRONMENT
        id: 'F',
        p1_topic: 'Weather',
        p1_intro: "Let's talk about the weather. What is your favorite type of weather?",
        p1_follow: "Does the weather affect your mood?",
        p2_topic: "Describe an environmental problem in your country.",
        p2_rounding: "Is the government doing anything about it?",
        p3_context: "Environment & Pollution",
        p3_q1: "Why do you think plastic pollution has become such a big problem?",
        p3_q2: "What can individuals do to help the environment?",
        p3_q3: "Is it the government's responsibility or the individual's to protect nature?"
    },
    {   // SET G: FREE TIME / MEDIA
        id: 'G',
        p1_topic: 'Free Time',
        p1_intro: "Let's talk about your free time. What do you usually do when you want to relax?",
        p1_follow: "Do you prefer spending your free time alone or with others?",
        p2_topic: "Describe a movie or TV show you enjoyed watching.",
        p2_rounding: "Would you watch it again in the future?",
        p3_context: "Media & Entertainment",
        p3_q1: "How does entertainment influence people's lives?",
        p3_q2: "Do you think streaming services are better than traditional television?",
        p3_q3: "How might entertainment change in the future?"
    },
    {   // SET H: HEALTH
        id: 'H',
        p1_topic: 'Health',
        p1_intro: "Let's talk about health. What do you usually do to stay healthy?",
        p1_follow: "Is it easy for you to maintain a healthy lifestyle?",
        p2_topic: "Describe a healthy habit you try to maintain.",
        p2_rounding: "How long have you had this habit?",
        p3_context: "Health & Lifestyle",
        p3_q1: "Why do you think people are more concerned about health nowadays?",
        p3_q2: "Do modern lifestyles make it harder to stay healthy?",
        p3_q3: "What should governments do to improve public health?"
    },
    {   // SET I: CRIME & LAW
        id: 'I',
        p1_topic: 'Rules',
        p1_intro: "Let's talk about rules. Did you have strict rules at home when you were a child?",
        p1_follow: "Do you think rules are important?",
        p2_topic: "Describe a rule or law that you think is good.",
        p2_rounding: "Does everyone follow this rule?",
        p3_context: "Crime & Society",
        p3_q1: "Why do you think some people break the law?",
        p3_q2: "Should criminals be sent to prison or given community service?",
        p3_q3: "How can technology help in preventing crime?"
    },
    {   // SET J: ART & CULTURE
        id: 'J',
        p1_topic: 'Music',
        p1_intro: "Let's talk about music. What kind of music do you like?",
        p1_follow: "Can you play any musical instruments?",
        p2_topic: "Describe a piece of art (painting, statue, etc) that you like.",
        p2_rounding: "Where did you see it?",
        p3_context: "Art & Culture",
        p3_q1: "Do you think art classes are important in schools?",
        p3_q2: "Why do some people pay a lot of money for art?",
        p3_q3: "Does government support for the arts benefit society?"
    },
    {   // SET K: TRANSPORT & CITY
        id: 'K',
        p1_topic: 'Transport',
        p1_intro: "Let's talk about transport. How do you usually travel to work or school?",
        p1_follow: "Do you prefer public or private transport?",
        p2_topic: "Describe a city you would like to visit.",
        p2_rounding: "What is this city famous for?",
        p3_context: "Urban Life",
        p3_q1: "What are the advantages of living in a big city?",
        p3_q2: "How can traffic problems be solved in major cities?",
        p3_q3: "Do you think people will continue to live in big cities in the future?"
    },
    {   // SET L: FAMILY
        id: 'L',
        p1_topic: 'Family',
        p1_intro: "Let's talk about family. Do you have a large family?",
        p1_follow: "Who are you closest to in your family?",
        p2_topic: "Describe a family celebration you attended.",
        p2_rounding: "Did you enjoy it?",
        p3_context: "Family & Society",
        p3_q1: "How have families changed in your country in recent years?",
        p3_q2: "Who should be responsible for taking care of the elderly?",
        p3_q3: "Do you think friends can be as important as family?"
    }
];

function getTopicSet(sessionId) {
    if (!sessionId) return TOPIC_SETS[0];
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
        hash += sessionId.charCodeAt(i);
    }
    return TOPIC_SETS[hash % TOPIC_SETS.length];
}

// --- SCORING HELPER (UPDATED: EVIDENCE-BASED FEEDBACK) ---
async function generateScore(fullTranscript, topicContext) {
    // 🔥 CHECK: Is this a Full Test (Has Part 2) or Quick Test?
    const hasPart2 = fullTranscript.some(t => t.part === 2);

    let modelAnswerInstruction = "";
    if (hasPart2) {
        // FULL TEST: Generate a Monologue for Part 2
        modelAnswerInstruction = "4. Provide a 'Model Answer' for the Part 2 section (The Long Turn). Write a natural, Band 9.0 storytelling monologue based on the topic.";
    } else {
        // QUICK TEST: Rewrite User's Part 3 Answers
        modelAnswerInstruction = "4. **IMPROVED ANSWERS**: Identify the user's answers to the Part 3 questions. Rewrite them into Band 9.0 standard English (Natural & Sophisticated). Format strictly as:\n'Q1 (Context): [Improved Answer]'\n\n'Q2 (Context): [Improved Answer]'...";
    }

    // 🔥🔥 NEW PROMPT WITH EVIDENCE-BASED FEEDBACK INSTRUCTIONS 🔥🔥
    const prompt = `
        You are a strict IELTS Examiner. Evaluate the following Full Speaking Test Transcript.
        
        TOPIC CONTEXT: ${topicContext}
        TRANSCRIPT:
        ${JSON.stringify(fullTranscript)}

        TASK:
        1. Ignore the Examiner's lines for scoring. Focus ONLY on the User's answers.
        2. Assign Band Scores (0-9) for: Fluency, Lexical Resource, Grammatical Range, Pronunciation.
        
        3. **EVIDENCE-BASED FEEDBACK** (CRITICAL):
           - **Strengths**: DO NOT use generic phrases like "Good fluency". Instead, explicitly mention the **TOPICS** the user discussed. 
             - Correct Example: "You demonstrated strong vocabulary when describing the *traffic problems in Jakarta*, specifically using the phrase 'influx of vehicles'."
           - **Area to Improve**: DO NOT use generic phrases like "Grammar needs work". Instead, **QUOTE THE USER'S EXACT MISTAKE**.
             - Correct Example: "When answering about future technology, you said '*it make us easier*', which is grammatically incorrect. It should be '*it makes it easier for us*'."
        
        ${modelAnswerInstruction}
        
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
        model: "gpt-4o-mini", 
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Calculate Overall
    const avg = (result.fluency + result.lexical + result.grammar + result.pronunciation) / 4;
    const decimal = avg % 1;
    let overall = Math.floor(avg);
    if (decimal >= 0.75) overall += 1.0;
    else if (decimal >= 0.25) overall += 0.5;

    return { ...result, overall };
}

// --- HELPER: INSTRUKSI (PERSONA V3: STANDARD IELTS) ---
function getInstruction(part, step, contextData, userLastText, topicSet, isSilent = false, isShortAnswer = false, isExamFinished = false, isQuickStart = false) {
  const nickname = contextData?.nickname || "Candidate";
  const userContent = isSilent ? "(User remained silent)" : `"${userLastText}"`;

  let basePrompt = `
    You are Mr. Paul, a professional IELTS Examiner. 
    TONE: Friendly, polite, but professional and objective.
    
    🚨 CRITICAL RULES:
    1. **NO REPETITION**: Avoid repeating "I see what you mean" constantly. Use varied acknowledgments (e.g., "That's an interesting perspective," "I understand," or just "Right.").
    2. **LISTEN & PIVOT**: Briefly acknowledge the user's point, then smoothly transition to the next question.
    3. **KEEP IT BRIEF**: Ask one clear question at a time.
  `;

  if (isExamFinished) {
      return `${basePrompt} SITUATION: Final question answered. TASK: Say "Thank you. That is the end of the speaking test. You have done well. Have a great day."`;
  }

  // PART 1
  if (part === 1) {
    switch (step) {
      case 0: return `${basePrompt} TASK: Greet warmly, INTRODUCE YOURSELF as "Mr. Paul", and ask for the candidate's full name.`;
      case 1: return `${basePrompt} SITUATION: User name: ${userContent}. TASK: Acknowledge. Ask: "What shall I call you?"`;
      case 2: return `${basePrompt} SITUATION: User nickname: ${userContent}. TASK: Address by nickname. Ask: "Where are you from?"`;
      case 3: return `${basePrompt} SITUATION: From ${userContent}. TASK: Acknowledge. Pivot to Work/Study. Ask: "Do you work or are you a student?"`;
      case 4: return `${basePrompt} SITUATION: Job/Study: ${userContent}. TASK: Acknowledge. Ask ONE simple follow-up (e.g. "Do you enjoy it?").`;
      case 5: return `${basePrompt} SITUATION: Answered: ${userContent}. TASK: Acknowledge. Transition to ${topicSet.p1_topic}. Ask: "${topicSet.p1_intro}"`;
      case 6: return `${basePrompt} SITUATION: Answered: ${userContent}. TASK: React naturally. Ask: "${topicSet.p1_follow}"`;
      case 7: return `${basePrompt} SITUATION: End of Part 1. TASK: Say "Thank you. That is the end of Part 1. Now let's move on to Part 2."`;
      default: return `${basePrompt} TASK: Move to Part 2.`;
    }
  }

  // PART 2
  if (part === 2) {
      if (step === 0) {
          return `${basePrompt}
            SITUATION: Starting Part 2.
            TASK: State the topic: "${topicSet.p2_topic}"
            INSTRUCTION: Say "I will give you a topic... You have one minute to prepare."`;
      }
      
      if (step === 1) {
        if (isShortAnswer) return `${basePrompt} SITUATION: User stopped early. TASK: Say "You still have time. Is there anything else you'd like to add?"`;
        if (isSilent && !isShortAnswer) return `${basePrompt} SITUATION: Prep over. TASK: Say "Please start speaking. I will stop you after 2 minutes."`;
        return `${basePrompt} SITUATION: Ready to speak. TASK: Say "Please start speaking."`;
      }

      if (step === 2) {
        return `${basePrompt}
            SITUATION: Candidate finished speech about "${topicSet.p2_topic}".
            TASK: Say "Thank you" to stop them. 
            CRITICAL: Check if user ALREADY answered "${topicSet.p2_rounding}".
            - IF YES: Ask a different simple rounding question.
            - IF NO: Ask "${topicSet.p2_rounding}".`;
      }

      if (step === 3) {
         return `${basePrompt} SITUATION: Answered rounding. TASK: Say "Thank you." TRANSITION: "Now let's move on to Part 3."`;
      }
  }
  
  // PART 3 (DISCUSSION) - 🔥 TWEAK: STANDARD IELTS (EXPLORATORY)
  if (part === 3) {
      const part3Base = `
        ${basePrompt}
        MODE: PART 3 DISCUSSION (Two-way discussion).
        STRATEGY: 
        - DO NOT be aggressive. Do NOT use phrases like "Isn't it true that...".
        - BE CURIOUS: Ask "Why" or "How" to encourage the user to elaborate.
        - EXPLORE: If the user gives a personal opinion, ask about the wider society or future implications.
        - Style: "Why do you think that is?", "Do you think this will change in the future?", "What about people who disagree?"
      `;

      if (step === 0) {
          if (isQuickStart) {
              return `${part3Base} 
              SITUATION: STARTING QUICK TEST MODE (Part 3 Only).
              TOPIC: ${topicSet.p3_context}
              TASK: 
              1. Say "Hello! Welcome to the Quick Test. In this session, we will jump straight to Part 3 and discuss ${topicSet.p3_context}."
              2. IMMEDIATELY Ask Question 1: "${topicSet.p3_q1}".`;
          }
          return `${part3Base} SITUATION: Start Part 3 (Topic: ${topicSet.p3_context}). TASK: Ask: "${topicSet.p3_q1}".`;
      }
      
      if (step === 1) return `${part3Base} SITUATION: Answered: ${userContent}. TASK: Acknowledge briefly (e.g. "That's a valid point"), then Ask: "${topicSet.p3_q2}".`;
      
      if (step === 2) return `${part3Base} SITUATION: Answered: ${userContent}. TASK: Acknowledge briefly, then Ask: "${topicSet.p3_q3}".`;
  }
  
  return `${basePrompt} TASK: Say "Thank you, exam finished."`;
}


// --- MAIN HANDLER ---
export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const sessionId = formData.get("session_id");
    const action = formData.get("action") || "answer"; 

    if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const { data: session, error: dbError } = await supabase
      .from("exam_sessions").select("*").eq("id", sessionId).single();

    if (dbError || !session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    
    if (session.status === 'COMPLETED') {
        return NextResponse.json({ error: "Exam finished", score: session.score_data }, { status: 400 });
    }

    const topicSet = getTopicSet(sessionId);
    let { current_part, current_step, extracted_data, transcript } = session;
    let userText = "";
    let isSilent = true;

    // TRANSCRIPTION
    if (audioFile && audioFile.size > 0 && action !== 'start' && action !== 'auto_next' && action !== 'start_quick') {
        const buffer = Buffer.from(await audioFile.arrayBuffer());
        if (buffer.length > 1000) { 
            try {
                const file = await OpenAI.toFile(buffer, "user_voice.mp3");
                const trans = await openai.audio.transcriptions.create({
                    file: file, model: "whisper-1", language: "en",
                });
                userText = trans.text.trim();
                if (userText.length > 1) isSilent = false;
            } catch (err) { userText = "[Unintelligible]"; }
        }
    }

    console.log(`[P${current_part}/S${current_step}] Action: ${action} | Topic: ${topicSet.id} | Words: ${userText.split(/\s+/).length}`);

    // --- LOGIC CORE ---
    let nextStep = current_step;
    let nextPart = current_part;
    let isShortAnswer = false; 
    let metaTopic = null;
    let isExamFinished = false; 
    let isQuickStart = false; // Flag for Quick Test Intro

    // ACTION LOGIC
    if (action === 'start') {
        nextPart = 1; nextStep = 0;
    }
    // QUICK TEST LOGIC
    else if (action === 'start_quick') {
        nextPart = 3; 
        nextStep = 0;
        metaTopic = topicSet.p3_context; 
        isQuickStart = true; 
    }
    else if (action === 'auto_next') {
        if (current_part === 1 && current_step === 7) {
            nextPart = 2; nextStep = 0;
            metaTopic = topicSet.p2_topic; 
        }
        else if (current_part === 2 && current_step === 3) {
            nextPart = 3; nextStep = 0;
        }
    }
    else if (action === 'timeout') {
        if (current_part === 1) { 
            nextPart = 2; nextStep = 0; 
            metaTopic = topicSet.p2_topic;
        }
        else if (current_part === 2) { 
            if (current_step === 0) {
                 const wordCount = userText.split(/\s+/).length;
                 if (wordCount > 10 && !isSilent) nextStep = 2; 
                 else nextStep = 1; 
            } 
            else if (current_step === 1) nextStep = 2; 
        }
        else if (current_part === 3) { 
             if (current_step < 2) nextStep = current_step + 1;
             else isExamFinished = true;
        }
    } 
    else { // ACTION: ANSWER
        if (current_part === 1) {
            if (!isSilent && current_step < 3) { /* Extraction logic */ }
            if (current_step < 7) nextStep = current_step + 1;
            else { 
                nextPart = 2; nextStep = 0; 
                metaTopic = topicSet.p2_topic;
            }
        } 
        else if (current_part === 2) {
             if (current_step === 0) {
                 const wordCount = userText.split(/\s+/).length;
                 if (wordCount > 10 && !isSilent) nextStep = 2; else nextStep = 1;
             } 
             else if (current_step === 1) {
                 const wordCount = userText.split(/\s+/).length;
                 if (wordCount < 8 && !isSilent) { isShortAnswer = true; nextStep = 1; } 
                 else nextStep = 2; 
             }
             else if (current_step === 2) nextStep = 3; 
             else if (current_step === 3) { nextPart = 3; nextStep = 0; }
        }
        else if (current_part === 3) {
             if (current_step < 2) nextStep = current_step + 1;
             else isExamFinished = true;
        }
    }

    const instruction = getInstruction(nextPart, nextStep, extracted_data, userText, topicSet, isSilent, isShortAnswer, isExamFinished, isQuickStart);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Mr. Paul. Speak natural English. Follow instructions EXACTLY." },
        { role: "user", content: instruction }
      ],
      max_tokens: 150, temperature: 0.3, 
    });
    const aiResponseText = completion.choices[0].message.content;

    // --- DB UPDATE & SCORING ---
    const newTranscriptEntry = { part: current_part, step: current_step, user: userText, ai: aiResponseText, timestamp: new Date().toISOString() };
    const fullTranscript = [...(transcript || []), newTranscriptEntry]; // Gabungkan untuk scoring

    const updateData = {
          current_part: nextPart,
          current_step: nextStep,
          transcript: fullTranscript,
          updated_at: new Date().toISOString()
    };
    
    let finalScore = null;
    if (isExamFinished) {
        updateData.status = 'COMPLETED';
        // 1. Generate Score
        finalScore = await generateScore(fullTranscript, topicSet.p2_topic);
        
        // 2. Format Transcript String untuk UI (Fixed Chronological Order)
        const formattedTranscript = fullTranscript.map((t, index) => {
            if (index === 0) return `🧑‍🏫 ${t.ai}`;
            return `👤 ${t.user || "(Silent)"}\n\n🧑‍🏫 ${t.ai}`;
        }).join('\n\n──────────────────────────────\n\n');
        
        // 3. Masukkan formatted transcript ke objek skor
        finalScore.transcript = formattedTranscript; 

        updateData.score_data = finalScore;
    }

    await supabase.from("exam_sessions").update(updateData).eq("id", sessionId);

    // TTS
    const mp3 = await openai.audio.speech.create({ 
        model: "tts-1", voice: "alloy", input: aiResponseText 
    });
    const audioBase64 = Buffer.from(await mp3.arrayBuffer()).toString("base64");

    return NextResponse.json({
      text: aiResponseText,
      audio: `data:audio/mp3;base64,${audioBase64}`,
      userTranscript: userText,
      meta: { 
          part: nextPart, 
          step: nextStep, 
          topic: metaTopic, 
          isFinished: isExamFinished,
          score: finalScore 
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}