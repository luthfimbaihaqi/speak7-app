/**
 * IELTS4OUR — Full Exam Auto-Tester
 * 
 * Runs a complete Full Test or Quick Test simulation without microphone.
 * Uses debug_text field to skip Whisper transcription.
 * 
 * Usage:
 *   node test-exam.js              (full test, default voice)
 *   node test-exam.js quick        (quick test)
 *   node test-exam.js full billie  (full test, billie voice)
 * 
 * Requirements:
 *   - Dev server running at localhost:3000
 *   - debug_text support in route.js
 */

const BASE_URL = "http://localhost:3000";

// Pre-written answers that simulate a real candidate (~Band 6.5-7.0 level)
const ANSWERS = {
  name: "My name is Ahmad Rizky, and you can call me Rizky.",
  hometown: "I'm from Makassar, a city in South Sulawesi, Indonesia. It's a coastal city known for its seafood.",
  work_study: "I'm currently working as a software developer at a tech startup. I've been there for about two years now.",
  work_enjoy: "Yes, I really enjoy it because I get to solve interesting problems every day. My team is also very supportive, and I've learned a lot from my senior colleagues.",
  
  // Part 1 topic answers (generic enough to work with any topic set)
  p1_topic1_intro: "Well, I would say I really enjoy playing video games in my free time. I've been into gaming since I was in high school, and it's something that helps me relax after a long day at work. I mostly play online games with my friends.",
  p1_topic1_follow: "I think the main reason I like it is because it allows me to connect with my friends even when we're in different cities. We can play together online and it feels like we're hanging out, you know. Also, I find it quite challenging and that keeps things interesting.",
  p1_topic2_intro: "Hmm, let me think. I would say I prefer to go out on weekends, maybe visit a coffee shop or a mall. Sometimes I go to the park near my apartment. But honestly, if I'm really tired from work, I just stay home and watch movies or play games.",
  p1_topic2_follow: "I think going out is better for me because I tend to feel lazy if I stay home too long. When I go outside, I feel more refreshed and energized. But I also need some alone time at home to recharge, so it's kind of a balance.",

  // Part 2 long turn (1-2 minute speech)
  p2_speech: "Okay, so I'd like to talk about a trip I took to Bali last year with my college friends. We went there during the long holiday in December, and it was actually my first time visiting Bali even though I'm Indonesian. We stayed in a small villa in Ubud, which is in the central part of the island, surrounded by rice terraces and forests. What I really enjoyed was visiting the temples, especially Tanah Lot, which is this beautiful temple built on a rock in the sea. We also tried surfing at Kuta Beach, and I was terrible at it, but it was so much fun. We ate local food every day, like nasi campur and babi guling, and the flavors were amazing. The thing that made this trip really memorable was that it was the last time all five of us were together before some of my friends moved abroad for work. So it felt really special, like a farewell trip. We took so many photos and videos, and I still look at them sometimes when I miss those days. Yeah, I think that trip will always have a special place in my heart.",
  
  // Part 2 rounding
  p2_rounding: "Oh definitely, I would recommend Bali to anyone. The culture, the nature, the food, everything is amazing. And it's actually quite affordable compared to other tourist destinations.",

  // Part 3 discussion answers
  p3_answer1: "I think travel has changed a lot in my country. In the past, people mostly traveled by train or bus, and it took a very long time to reach another city. But now with budget airlines, you can fly to Bali in just two hours from Jakarta, and it's quite cheap. Also, social media has made people more interested in visiting new places because they see beautiful photos on Instagram and they want to go there too.",
  p3_answer2: "That's an interesting question. I believe technology has made traveling better in many ways. For example, we can book hotels and flights online very easily now. We can also use Google Maps to navigate in a foreign city without getting lost. However, I think sometimes people are too focused on taking photos for social media instead of actually enjoying the experience. So there's a negative side too.",
  p3_answer3: "In my opinion, tourism will become more sustainable in the future because people are becoming more aware of environmental issues. I think there will be more eco-friendly hotels and tours. Also, I believe virtual reality might change tourism, where people can experience a destination from their home first before deciding to visit. But I don't think it will replace real travel because nothing beats the actual experience of being in a new place.",
};

async function callStart(userId, mode, voiceChoice) {
  const res = await fetch(`${BASE_URL}/api/interview/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, mode, voice_choice: voiceChoice }),
  });
  return res.json();
}

async function callInterview(sessionId, action, debugText = null) {
  const formData = new FormData();
  
  // Always send a tiny audio blob (required by FormData structure)
  const emptyBlob = new Blob([new Uint8Array(10)], { type: "audio/webm" });
  formData.append("audio", emptyBlob, "test.webm");
  formData.append("session_id", sessionId);
  formData.append("action", action);
  
  if (debugText) {
    formData.append("debug_text", debugText);
  }

  const res = await fetch(`${BASE_URL}/api/interview`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

function logStep(label, data) {
  const examiner = data.text?.substring(0, 80) || "(no text)";
  const part = data.meta?.part || "?";
  const step = data.meta?.step || "?";
  console.log(`  [P${part}/S${step}] ${label}`);
  console.log(`    Examiner: ${examiner}${data.text?.length > 80 ? "..." : ""}`);
  if (data.meta?.topic) console.log(`    Topic: ${data.meta.topic}`);
  if (data.meta?.p2_subpoints) console.log(`    Subpoints: ${data.meta.p2_subpoints.join(" | ")}`);
}

async function runFullTest(userId, voiceChoice) {
  console.log("\n========================================");
  console.log("  IELTS4OUR FULL TEST — AUTO TESTER");
  console.log("========================================\n");

  // 1. Start session
  console.log("[1] Starting session...");
  const startData = await callStart(userId, "full", voiceChoice);
  const sessionId = startData.session_id;
  console.log(`  Session ID: ${sessionId}`);
  console.log(`  Voice: ${voiceChoice}\n`);

  // 2. Intro (examiner greeting)
  console.log("[2] Triggering intro...");
  let data = await callInterview(sessionId, "start");
  logStep("INTRO", data);

  // 3. Part 1: Name
  console.log("\n[3] Part 1 — Name");
  data = await callInterview(sessionId, "answer", ANSWERS.name);
  logStep("NAME → Where from?", data);

  // 4. Part 1: Hometown
  console.log("\n[4] Part 1 — Hometown");
  data = await callInterview(sessionId, "answer", ANSWERS.hometown);
  logStep("HOMETOWN → Work/Study?", data);

  // 5. Part 1: Work/Study
  console.log("\n[5] Part 1 — Work/Study");
  data = await callInterview(sessionId, "answer", ANSWERS.work_study);
  logStep("WORK → Follow-up", data);

  // 6. Part 1: Enjoy?
  console.log("\n[6] Part 1 — Enjoy?");
  data = await callInterview(sessionId, "answer", ANSWERS.work_enjoy);
  logStep("ENJOY → Topic 1", data);

  // 7. Part 1: Topic 1 Intro
  console.log("\n[7] Part 1 — Topic 1 Intro");
  data = await callInterview(sessionId, "answer", ANSWERS.p1_topic1_intro);
  logStep("TOPIC1 INTRO → Follow", data);

  // 8. Part 1: Topic 1 Follow
  console.log("\n[8] Part 1 — Topic 1 Follow");
  data = await callInterview(sessionId, "answer", ANSWERS.p1_topic1_follow);
  logStep("TOPIC1 FOLLOW → Topic 2", data);

  // 9. Part 1: Topic 2 Intro
  console.log("\n[9] Part 1 — Topic 2 Intro");
  data = await callInterview(sessionId, "answer", ANSWERS.p1_topic2_intro);
  logStep("TOPIC2 INTRO → Follow", data);

  // 10. Part 1: Topic 2 Follow → transitions to Part 2
  console.log("\n[10] Part 1 — Topic 2 Follow → Part 2");
  data = await callInterview(sessionId, "answer", ANSWERS.p1_topic2_follow);
  logStep("TOPIC2 FOLLOW → Part 2 Card", data);

  // 11. Part 2: Long Turn speech (simulating timeout with speech)
  console.log("\n[11] Part 2 — Long Turn Speech");
  data = await callInterview(sessionId, "timeout", ANSWERS.p2_speech);
  logStep("SPEECH → Rounding Q", data);

  // 12. Part 2: Rounding answer
  console.log("\n[12] Part 2 — Rounding Answer");
  data = await callInterview(sessionId, "answer", ANSWERS.p2_rounding);
  logStep("ROUNDING → Transition", data);

  // 13. Part 2 step 3 → Part 3 transition (auto_next or answer to transition)
  console.log("\n[13] Part 2 → Part 3 Transition");
  data = await callInterview(sessionId, "answer", "Yes, I think so.");
  logStep("TRANSITION → Part 3 Q1", data);

  // 14. Part 3: Q1
  console.log("\n[14] Part 3 — Q1 Answer");
  data = await callInterview(sessionId, "answer", ANSWERS.p3_answer1);
  logStep("Q1 → Q2", data);

  // 15. Part 3: Q2 (AI-generated follow-up)
  console.log("\n[15] Part 3 — Q2 Answer");
  data = await callInterview(sessionId, "answer", ANSWERS.p3_answer2);
  logStep("Q2 → Q3", data);

  // 16. Part 3: Q3 (final) — should trigger scoring
  console.log("\n[16] Part 3 — Q3 Answer (FINAL)");
  data = await callInterview(sessionId, "answer", ANSWERS.p3_answer3);
  logStep("Q3 → FINISHED", data);

  // 17. Print results
  if (data.meta?.isFinished && data.meta?.score) {
    const s = data.meta.score;
    console.log("\n========================================");
    console.log("  EXAM RESULTS");
    console.log("========================================");
    console.log(`  Overall:        ${s.overall}`);
    console.log(`  Fluency:        ${s.fluency}`);
    console.log(`  Lexical:        ${s.lexical}`);
    console.log(`  Grammar:        ${s.grammar}`);
    console.log(`  Pronunciation:  ${s.pronunciation}`);
    console.log("\n  --- Feedback ---");
    s.feedback?.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log(`\n  --- Improvement ---\n  ${s.improvement}`);
    console.log(`\n  --- Grammar Clinic (${s.grammarCorrection?.length || 0} items) ---`);
    s.grammarCorrection?.forEach((g, i) => {
      console.log(`  ${i + 1}. "${g.original}" → "${g.correction}"`);
      console.log(`     Reason: ${g.reason}`);
    });
    console.log(`\n  --- Model Answer ---\n  ${s.modelAnswer?.substring(0, 300)}...`);
    console.log("\n========================================\n");
  } else {
    console.log("\n[!] Exam did not finish properly. Last response:");
    console.log(JSON.stringify(data, null, 2));
  }
}

async function runQuickTest(userId, voiceChoice) {
  console.log("\n========================================");
  console.log("  IELTS4OUR QUICK TEST — AUTO TESTER");
  console.log("========================================\n");

  console.log("[1] Starting session...");
  const startData = await callStart(userId, "quick", voiceChoice);
  const sessionId = startData.session_id;
  console.log(`  Session ID: ${sessionId}`);
  console.log(`  Voice: ${voiceChoice}\n`);

  console.log("[2] Triggering intro...");
  let data = await callInterview(sessionId, "start_quick");
  logStep("INTRO + Q1", data);

  console.log("\n[3] Q1 Answer");
  data = await callInterview(sessionId, "answer", ANSWERS.p3_answer1);
  logStep("Q1 → Q2", data);

  console.log("\n[4] Q2 Answer (AI follow-up)");
  data = await callInterview(sessionId, "answer", ANSWERS.p3_answer2);
  logStep("Q2 → Q3", data);

  console.log("\n[5] Q3 Answer");
  data = await callInterview(sessionId, "answer", ANSWERS.p3_answer3);
  logStep("Q3 → Q4", data);

  console.log("\n[6] Q4 Answer (AI follow-up)");
  data = await callInterview(sessionId, "answer", "I think both sides have valid points. Governments should set the rules, but individuals also need to take responsibility in their daily choices.");
  logStep("Q4 → Q5", data);

  console.log("\n[7] Q5 Answer (FINAL)");
  data = await callInterview(sessionId, "answer", "In my opinion, the future will bring more awareness about these issues. Young people today are already more conscious about sustainability and social responsibility than previous generations.");
  logStep("Q5 → FINISHED", data);

  if (data.meta?.isFinished && data.meta?.score) {
    const s = data.meta.score;
    console.log("\n========================================");
    console.log("  EXAM RESULTS");
    console.log("========================================");
    console.log(`  Overall:        ${s.overall}`);
    console.log(`  Fluency:        ${s.fluency}`);
    console.log(`  Lexical:        ${s.lexical}`);
    console.log(`  Grammar:        ${s.grammar}`);
    console.log(`  Pronunciation:  ${s.pronunciation}`);
    console.log("\n  --- Feedback ---");
    s.feedback?.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log(`\n  --- Improvement ---\n  ${s.improvement}`);
    console.log(`\n  --- Grammar Clinic (${s.grammarCorrection?.length || 0} items) ---`);
    s.grammarCorrection?.forEach((g, i) => {
      console.log(`  ${i + 1}. "${g.original}" → "${g.correction}"`);
      console.log(`     Reason: ${g.reason}`);
    });
    console.log("\n========================================\n");
  } else {
    console.log("\n[!] Exam did not finish properly. Last response:");
    console.log(JSON.stringify(data, null, 2));
  }
}

// --- MAIN ---
const args = process.argv.slice(2);
const mode = args[0] || "full";
const voice = args[1] || "paul";

const TEST_USER_ID = "a19e84f3-1c49-4ca1-b2f3-cd1a2709b5da";

console.log(`Mode: ${mode} | Voice: ${voice}`);

if (mode === "quick") {
  runQuickTest(TEST_USER_ID, voice).catch(console.error);
} else {
  runFullTest(TEST_USER_ID, voice).catch(console.error);
}