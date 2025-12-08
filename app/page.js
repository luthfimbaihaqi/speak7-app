"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, RefreshCw, Crown, MessageCircle, X, ArrowRight, Check, Lock, AlertTriangle, BarChart3, ChevronRight, Mic2, Users, Volume2 } from "lucide-react";
import { supabase } from "@/utils/supabaseClient"; 
import Image from "next/image";

import Recorder from "@/components/Recorder";
import ScoreCard from "@/components/ScoreCard";

// --- GUILT TRIP MESSAGES (DARK HUMOR) ---
const GUILT_MESSAGES = [
  { icon: "🧐", title: "Examiner is Judging...", text: "\"Hmm, leaving already? That looks like a Band 5.0 attitude to me.\"" },
  { icon: "💸", title: "Think about the Money", text: "The real IELTS test costs $200+. Wasting practice time is expensive. Sure you want to quit?" },
  { icon: "📉", title: "Competitors are Winning", text: "While you sleep, your competitors are memorizing 50 new idioms right now." },
  { icon: "🦉", title: "The Owl is Watching", text: "You haven't practiced your 40 hours today. Don't make me come over to your house." },
  { icon: "💀", title: "RIP Your Score", text: "Here lies your Band 8.0 dream. Cause of death: Clicking Logout too early." },
  { icon: "🇬🇧", title: "The King Disapproves", text: "Do you think the King would quit? No. So get back in there and speak proper English!" },
  { icon: "🤡", title: "Are you joking?", text: "Quitting just when you were about to have a breakthrough? Classic clown move." }
];

// --- DATABASE TOKEN ---
const VALID_TOKENS = []; // Token sekarang via Database Supabase

// --- BANK SOAL PART 2 ---
const CUE_CARDS = [
  { topic: "Describe a book you read that you found useful.", points: ["What the book is", "When you read it", "Why you found it useful", "And explain how it helped you"] },
  { topic: "Describe a time when you helped someone.", points: ["Who you helped", "Why they needed help", "How you helped them", "And explain how you felt about it"] },
  { topic: "Describe a popular place for sports in your city.", points: ["Where it is", "What sports people play there", "How often you go there", "And explain why it is popular"] },
  { topic: "Describe an invention that changed the world.", points: ["What the invention is", "Who invented it", "How it changed our lives", "And explain why you think it is important"] },
  { topic: "Describe a famous person you would like to meet.", points: ["Who this person is", "Why they are famous", "What you would talk about", "And explain why you want to meet them"] },
  { topic: "Describe a movie you watched recently.", points: ["What the movie was", "When and where you watched it", "Who you watched it with", "And explain why you liked or disliked it"] },
  { topic: "Describe a gift you gave to someone.", points: ["What the gift was", "Who you gave it to", "Why you chose that gift", "And explain how the person reacted"] },
  { topic: "Describe a difficult decision you made.", points: ["What the decision was", "When you made it", "Why it was difficult", "And explain the result of the decision"] },
  { topic: "Describe a website you visit often.", points: ["What the website is", "How you found it", "What you use it for", "And explain why you visit it often"] },
  { topic: "Describe a traditional festival in your country.", points: ["What the festival is", "When and where it happens", "What people do during it", "And explain why it is important"] },
  { topic: "Describe a crowded place you have visited.", points: ["Where it was", "When you went there", "Who you were with", "And explain how you felt being there"] },
  { topic: "Describe a family member you admire.", points: ["Who they are", "What they do", "Why you admire them", "And explain your relationship with them"] },
  { topic: "Describe a goal you want to achieve.", points: ["What the goal is", "Why you want to achieve it", "How you plan to achieve it", "And explain why it is important to you"] },
  { topic: "Describe a piece of art you like.", points: ["What it is", "Where you saw it", "What it looks like", "And explain why you like it"] },
  { topic: "Describe a time you were late for something.", points: ["What you were late for", "Why you were late", "What happened as a result", "And explain how you felt about it"] },
  { topic: "Describe a technological device you use daily.", points: ["What the device is", "How long you have used it", "What you use it for", "And explain why it is important to you"] },
  { topic: "Describe a trip you plan to take.", points: ["Where you want to go", "Who you would go with", "What you would do there", "And explain why you want to take this trip"] },
  { topic: "Describe a wild animal you have seen.", points: ["What animal it was", "Where you saw it", "What it was doing", "And explain how you felt when you saw it"] },
  { topic: "Describe a teacher who influenced you.", points: ["Who the teacher was", "What subject they taught", "How they influenced you", "And explain why you remember them"] },
  { topic: "Describe a song that means a lot to you.", points: ["What the song is", "When you first heard it", "What the lyrics are about", "And explain why it is special to you"] },
  { topic: "Describe a historical building in your town.", points: ["Where it is", "What it looks like", "What it is used for now", "And explain why it is important"] },
  { topic: "Describe a time you complained about something.", points: ["What you complained about", "Who you complained to", "What the result was", "And explain how you felt about the situation"] },
  { topic: "Describe a job you would not like to do.", points: ["What the job is", "What tasks it involves", "Why you think it is difficult", "And explain why you would not like to do it"] },
  { topic: "Describe a skill you want to learn.", points: ["What the skill is", "Why you want to learn it", "How you would learn it", "And explain how it would help you"] },
  { topic: "Describe a time you saved money for something.", points: ["What you saved for", "How long it took you", "How you saved the money", "And explain how you felt when you bought it"] },
  { topic: "Describe a business person you admire.", points: ["Who they are", "What business they run", "Why they are successful", "And explain why you admire them"] },
  { topic: "Describe a quiet place you like to go to.", points: ["Where it is", "How often you go there", "What you do there", "And explain why you like it"] },
  { topic: "Describe a time you received good news.", points: ["What the news was", "How you received it", "Who you shared it with", "And explain why it was good news"] },
  { topic: "Describe a change that would improve your local area.", points: ["What the change would be", "How it would be done", "Who it would benefit", "And explain why this change is necessary"] },
  { topic: "Describe a competition you would like to take part in.", points: ["What the competition is", "What you would need to do", "Why you want to participate", "And explain what prize you would like to win"] },
  // === LEVEL 2: PREMIUM (30 - 59) ===
  { topic: "Describe a piece of advice you received that was helpful.", points: ["Who gave it to you", "What the advice was", "In what situation you received it", "And explain how it helped you"] },
  { topic: "Describe a risk you took that you do not regret.", points: ["What the risk was", "Why you took it", "What the result was", "And explain why you do not regret it"] },
  { topic: "Describe a family business you know and admire.", points: ["What the business is", "Who runs it", "How you know about it", "And explain why you admire it"] },
  { topic: "Describe a rule at your school or work that you did not like.", points: ["What the rule was", "Why it was implemented", "Why you did not like it", "And explain if you followed it or not"] },
  { topic: "Describe a time you used a map to find your way.", points: ["Where you were going", "Why you needed a map", "How easy or difficult it was", "And explain if you found the place successfully"] },
  { topic: "Describe a creative person whose work you like.", points: ["Who the person is", "What kind of creative work they do", "How you know about them", "And explain why you like their work"] },
  { topic: "Describe a party that you enjoyed.", points: ["Whose party it was", "When and where it was held", "What happened during the party", "And explain why you enjoyed it"] },
  { topic: "Describe an old object which your family has kept for a long time.", points: ["What the object is", "Where it came from", "How long your family has kept it", "And explain why it is important to your family"] },
  { topic: "Describe a disagreement you had with a friend.", points: ["Who the friend was", "What the disagreement was about", "How you resolved it", "And explain how it affected your friendship"] },
  { topic: "Describe a uniform you wear (or wore) at school or work.", points: ["What it looks like", "When you wear it", "Who bought it for you", "And explain how you feel about wearing it"] },
  { topic: "Describe a speech or talk that you found interesting.", points: ["Who gave the speech", "What it was about", "Where you heard it", "And explain why you found it interesting"] },
  { topic: "Describe a time you got lost in a place you didn't know.", points: ["Where you were", "Why you were there", "How you got lost", "And explain how you found your way back"] },
  { topic: "Describe a science subject that you are interested in.", points: ["What subject it is", "How you learned about it", "Why you find it interesting", "And explain how it affects our lives"] },
  { topic: "Describe a noise that bothers you in your daily life.", points: ["What the noise is", "Where it comes from", "When it happens", "And explain why it bothers you"] },
  { topic: "Describe a place near water you enjoyed visiting.", points: ["Where this place is", "What you did there", "Who you went with", "And explain why you liked it"] },
  { topic: "Describe a toy you liked in your childhood.", points: ["What the toy was", "Who gave it to you", "How you played with it", "And explain why it was special to you"] },
  { topic: "Describe a photo of yourself that you like.", points: ["When it was taken", "Where it was taken", "Who took it", "And explain why you like this photo"] },
  { topic: "Describe a surprise that made you happy.", points: ["What the surprise was", "Who surprised you", "How you reacted", "And explain why it made you happy"] },
  { topic: "Describe a time you had to wait for something for a long time.", points: ["What you were waiting for", "How long you waited", "What you did while waiting", "And explain how you felt about waiting"] },
  { topic: "Describe a foreign culture that you are interested in learning about.", points: ["Which culture it is", "How you know about it", "What specific aspect interests you", "And explain why you want to learn more"] },
  { topic: "Describe a sport you enjoyed watching.", points: ["What sport it was", "When and where you watched it", "Who you watched it with", "And explain why you enjoyed watching it"] },
  { topic: "Describe a house or apartment you would like to live in.", points: ["Where it would be", "What it would look like", "Who you would live with", "And explain why you would like to live there"] },
  { topic: "Describe a time you were friendly to someone you didn't like.", points: ["Who the person was", "When it happened", "Why you didn't like them", "And explain why you were friendly to them"] },
  { topic: "Describe an advertisement that persuaded you to buy something.", points: ["What the advertisement was for", "Where you saw it", "What it showed", "And explain why it persuaded you"] },
  { topic: "Describe a small business you would like to open.", points: ["What kind of business it would be", "Where you would open it", "Who your customers would be", "And explain why you want to open this business"] },
  { topic: "Describe a time you moved to a new home or school.", points: ["When you moved", "Where you moved to", "Why you moved", "And explain how you felt about moving"] },
  { topic: "Describe a person who is good at apologizing.", points: ["Who this person is", "How you know them", "When they apologized to you", "And explain why you think they are good at it"] },
  { topic: "Describe a day when you woke up very early.", points: ["When it was", "Why you woke up early", "What you did that day", "And explain how you felt by the end of the day"] },
  { topic: "Describe a character from a film that you felt connected to.", points: ["Who the character is", "Which film they are in", "What their personality is like", "And explain why you felt connected to them"] },
  { topic: "Describe a traditional product from your country that is popular.", points: ["What the product is", "How it is made", "Where it is popular", "And explain why it is important to your culture"] }
];

// --- BANK SOAL PART 3 (MOCK INTERVIEW) ---
const PART3_TOPICS = [
  { topic: "Technology & Education", startQ: "Do you think computers will eventually replace teachers in the classroom?" },
  { topic: "Environment", startQ: "What are the biggest environmental problems facing your country right now?" },
  { topic: "Tourism", startQ: "Do you think tourism always benefits a local community?" },
  { topic: "Health & Lifestyle", startQ: "How can people be encouraged to live a healthier lifestyle?" },
  { topic: "Work & Life Balance", startQ: "Is it difficult for people in your country to find a good work-life balance?" },
  { topic: "Social Media", startQ: "Has social media improved the way we communicate or made it worse?" },
  { topic: "Traditional Culture", startQ: "Is it important to preserve traditional festivals and customs?" },
  { topic: "Transport", startQ: "What is the best way to reduce traffic congestion in big cities?" }
];

// --- INFO BANK ---
const BANK_INFO = {
  bankName: "BCA",             
  accountNumber: "3010166291", 
  accountName: "LUTHFI MUHAMMAD BAIHAQI", 
  price: "Rp 25.000",
  email: "luthfibaihaqi851@gmail.com",
  waNumber: "6281311364731" 
};

export default function Home() {
  const [dailyCue, setDailyCue] = useState(CUE_CARDS[0]);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [isRotating, setIsRotating] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  const [practiceMode, setPracticeMode] = useState("cue-card"); 
  const [part3Topic, setPart3Topic] = useState(PART3_TOPICS[0]);
  
  const [interviewQuestion, setInterviewQuestion] = useState(""); 
  const accumulatedScoresRef = useRef([]); 
  const [accumulatedScoresState, setAccumulatedScoresState] = useState([]); 
  
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  
  // MODALS STATE
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [guiltMessage, setGuiltMessage] = useState(GUILT_MESSAGES[0]);
  
  const [tokenInput, setTokenInput] = useState("");
  const [userProfile, setUserProfile] = useState(null); 

  const randomizeCue = () => {
    setIsRotating(true);
    
    if (practiceMode === 'cue-card') {
        const maxIndex = isPremium ? CUE_CARDS.length : 30;
        const randomIndex = Math.floor(Math.random() * maxIndex);
        setDailyCue(CUE_CARDS[randomIndex]);
    } else {
        const randomIndex = Math.floor(Math.random() * PART3_TOPICS.length);
        const newTopic = PART3_TOPICS[randomIndex];
        setPart3Topic(newTopic);
        setInterviewQuestion(newTopic.startQ);
        
        accumulatedScoresRef.current = []; 
        setAccumulatedScoresState([]);     
        
        setAnalysisResult(null); 
    }

    setTimeout(() => setIsRotating(false), 500);
  };

  useEffect(() => {
    async function checkPremiumStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            setUserProfile(user);
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_premium, premium_expiry')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                const isStillValid = profile.is_premium && (profile.premium_expiry > Date.now());
                setIsPremium(isStillValid);
            }
        } else {
            const expiryStr = localStorage.getItem("ielts4our_premium_expiry");
            if (expiryStr && Date.now() < parseInt(expiryStr)) {
                setIsPremium(true);
            } else {
                setIsPremium(false);
            }
        }
    }

    checkPremiumStatus();
  }, []);

  useEffect(() => {
      if (practiceMode === 'mock-interview') {
          setInterviewQuestion(part3Topic.startQ);
          accumulatedScoresRef.current = [];
          setAccumulatedScoresState([]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]); 

  useEffect(() => {
    if (analysisResult) {
      const resultSection = document.getElementById("result-section");
      if (resultSection) {
        setTimeout(() => {
          resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [analysisResult]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; 
        utterance.rate = 1.0; 
        utterance.onstart = () => setIsSpeakingAI(true);
        utterance.onend = () => setIsSpeakingAI(false);
        window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnalysisComplete = async (data) => {
    const todayStr = new Date().toDateString();
    
    // --- STREAK LOGIC ---
    const lastPracticeDate = localStorage.getItem("ielts4our_last_date");
    let currentStreak = parseInt(localStorage.getItem("ielts4our_streak") || "0");

    if (lastPracticeDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastPracticeDate === yesterday.toDateString()) currentStreak += 1;
      else currentStreak = 1; 
      localStorage.setItem("ielts4our_streak", currentStreak);
      localStorage.setItem("ielts4our_last_date", todayStr);
    }

    const saveData = async (finalResult) => {
        try {
            if (userProfile) {
                const { error } = await supabase.from('practice_history').insert({
                    user_id: userProfile.id,
                    topic: finalResult.topic,
                    overall_score: finalResult.overall,
                    fluency: finalResult.fluency,
                    lexical: finalResult.lexical,
                    grammar: finalResult.grammar,
                    pronunciation: finalResult.pronunciation,
                    full_feedback: finalResult
                });
            } else {
                const historyItem = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }), 
                    ...finalResult 
                };
                const existingHistory = JSON.parse(localStorage.getItem("ielts4our_history") || "[]");
                const updatedHistory = [...existingHistory, historyItem].slice(-30); 
                localStorage.setItem("ielts4our_history", JSON.stringify(updatedHistory));
            }
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    if (practiceMode === 'mock-interview') {
        accumulatedScoresRef.current.push(data);
        setAccumulatedScoresState([...accumulatedScoresRef.current]);

        const currentCount = accumulatedScoresRef.current.length;

        if (currentCount < 3) {
            if (data.nextQuestion) {
                setInterviewQuestion(data.nextQuestion);
            }
        } else {
            const allScores = accumulatedScoresRef.current; 
            const avgOverall = allScores.reduce((acc, curr) => acc + (curr.overall || 0), 0) / 3;
            const avgFluency = allScores.reduce((acc, curr) => acc + (curr.fluency || 0), 0) / 3;
            const avgLexical = allScores.reduce((acc, curr) => acc + (curr.lexical || 0), 0) / 3;
            const avgGrammar = allScores.reduce((acc, curr) => acc + (curr.grammar || 0), 0) / 3;
            const avgPronunc = allScores.reduce((acc, curr) => acc + (curr.pronunciation || 0), 0) / 3;

            const finalScore = Math.round(avgOverall * 2) / 2;

            let stitchedTranscript = "";
            let stitchedModelAnswer = "";

            allScores.forEach((round, index) => {
                stitchedTranscript += `❓ Q${index + 1}: ${round.transcript}\n\n`;
                if(round.modelAnswer) {
                    stitchedModelAnswer += `💡 Q${index + 1} Suggestion:\n${round.modelAnswer}\n\n`;
                }
            });

            const allGrammar = allScores.flatMap(s => s.grammarCorrection || []).slice(0, 5);

            const finalResult = {
                topic: `Mock Interview: ${part3Topic.topic}`,
                overall: finalScore,
                fluency: Math.round(avgFluency * 2) / 2,
                lexical: Math.round(avgLexical * 2) / 2,
                grammar: Math.round(avgGrammar * 2) / 2,
                pronunciation: Math.round(avgPronunc * 2) / 2,
                feedback: allScores[2].feedback, 
                improvement: allScores[2].improvement, 
                grammarCorrection: allGrammar,
                transcript: stitchedTranscript, 
                modelAnswer: stitchedModelAnswer 
            };

            setAnalysisResult(finalResult);
            saveData(finalResult); 
        }

    } else {
        setAnalysisResult(data);
        const resultToSave = {
            ...data,
            topic: data.topic || dailyCue.topic 
        };
        saveData(resultToSave);
    }
  };

  const validateToken = async () => {
    const cleanToken = tokenInput.trim().toUpperCase();
    
    if (!userProfile) {
        alert("⚠️ Mohon LOGIN atau REGISTER terlebih dahulu untuk mengaktifkan Premium.");
        return;
    }

    try {
        const { data, error } = await supabase.rpc('redeem_token', { 
            code_input: cleanToken 
        });

        if (error) throw error;

        if (data === 'SUCCESS') {
            setIsPremium(true);
            alert(`🎉 Aktivasi Berhasil! Akun Anda sekarang PREMIUM selama 30 Hari.`);
            setShowUpgradeModal(false);
            setTokenInput("");
            randomizeCue(); 
        } else if (data === 'INVALID_TOKEN') {
            alert("❌ Kode Token Salah/Tidak Ditemukan.");
        } else if (data === 'ALREADY_USED') {
            alert("❌ Kode Token SUDAH PERNAH DIGUNAKAN.");
        } else {
            alert(`Gagal: ${data}`);
        }

    } catch (err) {
        console.error("Token Error:", err);
        alert("Terjadi kesalahan koneksi.");
    }
  };

  // --- LOGOUT LOGIC (GUILT TRIP) ---
  const handleLogoutClick = () => {
    // 1. Pick Random Message
    const randomMsg = GUILT_MESSAGES[Math.floor(Math.random() * GUILT_MESSAGES.length)];
    setGuiltMessage(randomMsg);
    // 2. Show Modal
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const confirmViaWA = () => {
    const text = `Halo Admin Ielts4our, saya sudah transfer ${BANK_INFO.price} untuk upgrade Premium.`;
    const url = `https://wa.me/${BANK_INFO.waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleModeSwitch = (mode) => {
    if (mode === "mock-interview" && !isPremium) {
        setShowUpgradeModal(true);
        return;
    }
    setPracticeMode(mode);
    setAnalysisResult(null); 
    
    accumulatedScoresRef.current = [];
    setAccumulatedScoresState([]);
    
    if (mode === "mock-interview") {
        setInterviewQuestion(part3Topic.startQ);
    }
  };

  return (
    <main className="min-h-screen pb-20 px-4 selection:bg-teal-500/30 selection:text-teal-200">
      {/* HEADER */}
    <header className="flex flex-col md:flex-row justify-between items-center py-8 max-w-5xl mx-auto gap-4">
        
        {/* BAGIAN LOGO BARU */}
        <div className="flex items-center gap-3">
          {/* Logo Image */}
          <div className="relative w-32 h-10 md:w-40 md:h-12">
             <Image 
               src="/logo-white.png"
               alt="IELTS4our Logo"
               fill
               className="object-contain object-left"
               priority
             />
          </div>
          
          <Link href="/about" className="hidden md:block ml-2 text-sm font-medium text-slate-400 hover:text-white transition-colors tracking-wide">
            Meet the Creator
          </Link>

          {isPremium && (
            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-yellow-500/20">
              Pro
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/progress">
             <motion.div 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
               title="My Progress"
             >
                <BarChart3 className="w-5 h-5" />
             </motion.div>
          </Link>

          {/* LOGIN / USERNAME BUTTON */}
          {userProfile ? (
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleLogoutClick} // TRIGGER MODAL GUILT
               className="px-4 py-2.5 bg-teal-500/10 hover:bg-red-500/10 border border-teal-500/20 hover:border-red-500/20 rounded-full text-teal-300 hover:text-red-400 transition-all text-xs font-bold flex items-center gap-2"
               title="Click to Logout"
            >
                {userProfile.email?.split('@')[0]}
            </motion.button>
          ) : (
            <Link href="/auth">
                <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-300 hover:text-white transition-colors text-xs font-bold"
                >
                Login
                </motion.button>
            </Link>
          )}

          {!isPremium && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpgradeModal(true)}
              className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-medium rounded-full text-sm flex items-center gap-2 transition-all shadow-lg"
            >
              <Crown className="w-4 h-4 text-yellow-400" />
              Upgrade Pro
            </motion.button>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto mt-6 mb-12">
        <div className="md:hidden mb-6">
           <Link href="/about" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-0.5 hover:border-white transition-all">
             ✨ Meet the Creator <ChevronRight className="w-3 h-3" />
           </Link>
        </div>

        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-widest mb-6"
        >
          <Sparkles className="w-3 h-3" />
          {isPremium ? "Premium Mode Unlocked" : "Daily Speaking Practice"}
        </motion.div>
        
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
          Master Your Speaking <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-purple-200">
            With IELTS4OUR
          </span>
        </h2>
        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
          {isPremium 
            ? "Nikmati akses tanpa batas, durasi lebih panjang, dan jawaban Band 8.0."
            : "Latihan setiap hari, dapatkan skor instan, dan perbaiki grammar secara otomatis."}
        </p>
      </div>

      {/* UI TAB SWITCHER */}
      <div className="max-w-xs mx-auto mb-8 bg-slate-900/50 backdrop-blur-md p-1 rounded-full border border-white/10 flex relative shadow-inner">
         <button 
            onClick={() => handleModeSwitch("cue-card")}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "cue-card" ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-slate-500 hover:text-slate-300"}`}
         >
            <Mic2 className="w-3.5 h-3.5" />
            Cue Card Practice
         </button>
         <button 
            onClick={() => handleModeSwitch("mock-interview")}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "mock-interview" ? "bg-teal-500/20 text-teal-300 shadow-lg border border-teal-500/30" : "text-slate-500 hover:text-slate-300"}`}
         >
            <Users className="w-3.5 h-3.5" />
            Mock Interview
            {!isPremium && <Lock className="w-3 h-3 text-yellow-500 ml-1" />}
         </button>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          <div className={`absolute -inset-1 bg-gradient-to-r ${practiceMode === 'cue-card' ? 'from-teal-500 to-purple-600' : 'from-blue-500 to-teal-400'} rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}></div>
          
          <div className="relative glass-panel rounded-[2rem] p-8 md:p-12 overflow-hidden min-h-[500px] flex flex-col justify-center">
             
             {/* MODE 1: CUE CARD */}
             {practiceMode === "cue-card" && !analysisResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                            {CUE_CARDS.indexOf(dailyCue) >= 30 ? <Crown className="w-6 h-6 text-yellow-400" /> : <BookOpen className="w-6 h-6 text-teal-400" />}
                        </div>
                        <div>
                            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                            {CUE_CARDS.indexOf(dailyCue) >= 30 ? "Premium Topic" : "Todays Topic"}
                            </h3>
                            <div className="text-white font-bold flex items-center gap-2">
                            IELTS Cue Card
                            </div>
                        </div>
                        </div>
                        <button onClick={randomizeCue} className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all group" title="Ganti Soal"><RefreshCw className={`w-5 h-5 ${isRotating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} /></button>
                    </div>
                    <div className="text-center mb-10">
                        <p className="text-2xl md:text-4xl font-bold text-white leading-tight mb-8">"{dailyCue.topic}"</p>
                        <div className="inline-block text-left bg-black/20 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                           <p className="text-teal-400 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2"><ArrowRight className="w-4 h-4" /> You can say:</p>
                           <ul className="space-y-3">{dailyCue.points?.map((point, index) => (<li key={index} className="flex items-start gap-3 text-slate-300 text-sm md:text-base"><span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 shrink-0"></span>{point}</li>))}</ul>
                        </div>
                    </div>
                    <Recorder cueCard={dailyCue.topic} onAnalysisComplete={handleAnalysisComplete} maxDuration={isPremium ? 120 : 60} mode={practiceMode} />
                </motion.div>
             )}

             {/* MODE 2: MOCK INTERVIEW */}
             {practiceMode === "mock-interview" && !analysisResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                        <div>
                           <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest text-left">Discussion Topic</h3>
                           <h2 className="text-xl md:text-2xl font-bold text-white text-left">{part3Topic.topic}</h2>
                        </div>
                        <button onClick={randomizeCue} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all group" title="Ganti Topik"><RefreshCw className={`w-5 h-5 ${isRotating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} /></button>
                    </div>
                    
                    <div className="flex justify-center gap-2 mb-6 items-center">
                        <span className="text-xs text-slate-400 mr-2 uppercase font-bold tracking-wider">Question {accumulatedScoresState.length + 1} of 3</span>
                        {[0, 1, 2].map(step => (
                            <div key={step} className={`h-2 w-8 rounded-full transition-all ${accumulatedScoresState.length >= step ? 'bg-teal-400' : 'bg-white/10'}`}></div>
                        ))}
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 max-w-lg mx-auto mb-10 text-left relative transition-all min-h-[120px] flex flex-col justify-center">
                        <div className="absolute -top-3 left-6 px-2 bg-slate-900 text-teal-400 text-[10px] font-bold uppercase tracking-wider border border-white/10 rounded flex items-center gap-1">AI Examiner</div>
                        <div className="flex gap-4 items-start">
                            <p className="text-lg text-slate-200 italic leading-relaxed flex-1">"{interviewQuestion}"</p>
                            <button 
                                onClick={() => speakText(interviewQuestion)}
                                className="p-2 rounded-full bg-white/5 hover:bg-teal-500/20 text-slate-400 hover:text-teal-400 transition-all shrink-0 border border-white/10"
                                title="Play Audio"
                            >
                                {isSpeakingAI ? <Volume2 className="w-5 h-5 animate-pulse text-teal-400"/> : <Volume2 className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    <Recorder cueCard={part3Topic.topic} onAnalysisComplete={handleAnalysisComplete} maxDuration={60} mode={practiceMode} />
                </motion.div>
             )}

             {/* RESULT / SCORECARD */}
             {analysisResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Analysis Result</h2>
                        <button 
                            onClick={() => { 
                                setAnalysisResult(null); 
                                accumulatedScoresRef.current = []; 
                                setAccumulatedScoresState([]);     
                                handleModeSwitch(practiceMode); 
                            }} 
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white font-bold transition-all"
                        >
                            Try Another Topic
                        </button>
                    </div>
                    <ScoreCard 
                        result={analysisResult} 
                        cue={analysisResult.topic || dailyCue.topic} 
                        isPremiumExternal={isPremium}
                        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                    />
                </motion.div>
             )}

          </div>
        </motion.div>
      </div>
      
      {/* MODAL PEMBAYARAN */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden relative max-h-[85vh] overflow-y-auto">
             <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-2 bg-black/20 rounded-full"><X className="w-5 h-5"/></button>
             
             <div className="bg-gradient-to-br from-amber-500/10 to-purple-600/10 p-6 md:p-8 text-center border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-600"></div>
                <Crown className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                <h3 className="text-xl md:text-2xl font-bold text-white">Upgrade to Premium</h3>
                <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xs mx-auto">Investasi kecil untuk masa depan dan skor IELTS impianmu.</p>
             </div>

             <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                {/* --- COMPARISON TABLE --- */}
                <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                   <div className="grid grid-cols-3 p-3 md:p-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest text-center bg-black/20">
                      <div className="text-left">Feature</div>
                      <div>Free</div>
                      <div className="text-yellow-400">Pro</div>
                   </div>
                   <div className="divide-y divide-white/5 text-sm">
                      <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                        <div className="text-left text-slate-300 text-xs md:text-sm">Mock Interview</div>
                        <div className="text-slate-500 flex justify-center"><X className="w-3 h-3 md:w-4 md:h-4"/></div>
                        <div className="font-bold text-white text-xs md:text-sm flex justify-center"><Check className="w-3 h-3 md:w-4 md:h-4 text-emerald-400"/></div>
                      </div>
                      <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                        <div className="text-left text-slate-300 text-xs md:text-sm">Duration</div>
                        <div className="text-slate-500 text-xs md:text-sm">60s</div>
                        <div className="font-bold text-white text-xs md:text-sm">60s</div>
                      </div>
                      <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                        <div className="text-left text-slate-300 text-xs md:text-sm">Model Answer</div>
                        <div className="text-slate-500 flex justify-center"><Lock className="w-3 h-3 md:w-4 md:h-4"/></div>
                        <div className="font-bold text-white text-xs md:text-sm">Band 8.0</div>
                      </div>
                   </div>
                </div>

                <div className="space-y-5">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">1. Transfer via Bank</p>
                    <div className="flex flex-col md:flex-row justify-between md:items-center text-white font-mono gap-1">
                      <span className="text-sm md:text-base text-slate-300">{BANK_INFO.bankName}</span>
                      <span className="font-bold text-lg md:text-xl tracking-wider select-all">{BANK_INFO.accountNumber}</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-2 border-t border-white/5 pt-2 flex justify-between">
                       <span>a.n {BANK_INFO.accountName}</span>
                       <span className="text-teal-400 font-bold">{BANK_INFO.price}</span>
                    </p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex gap-3 items-start text-left">
                     <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                     <div className="text-xs text-yellow-200/90 leading-relaxed">
                        <span className="font-bold text-yellow-400">PENTING:</span> Kirim bukti bayar via WhatsApp/Email. Pastikan foto menampilkan <span className="font-bold text-yellow-400">Tanggal & Jam</span> transaksi. Admin akan mengirim Token setelah verifikasi.
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <button onClick={confirmViaWA} className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 group">
                       <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform"/> Konfirmasi WA
                    </button>
                    <a href={`mailto:${BANK_INFO.email}`} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10">
                       Via Email
                    </a>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">3. Activate Token</p>
                    <div className="flex flex-col md:flex-row gap-2">
                       <input 
                         type="text" 
                         placeholder="PASTE TOKEN HERE..."
                         value={tokenInput}
                         onChange={(e) => setTokenInput(e.target.value)}
                         className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white/10 text-center uppercase tracking-widest text-sm placeholder:text-slate-600"
                       />
                       <button onClick={validateToken} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 text-sm whitespace-nowrap">
                         Aktifkan
                       </button>
                    </div>
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      )}

      {/* --- NEW GUILT TRIP MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl relative"
            >
                <div className="text-6xl mb-4 animate-bounce">{guiltMessage.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{guiltMessage.title}</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    {guiltMessage.text}
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => setShowLogoutModal(false)}
                        className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-teal-500/20"
                    >
                        NO, I WANT BAND 8.0!
                    </button>
                    <button 
                        onClick={confirmLogout}
                        className="text-xs text-slate-500 hover:text-red-400 mt-2 transition-colors"
                    >
                        I give up, let me sleep...
                    </button>
                </div>
            </motion.div>
        </div>
      )}

      <footer className="text-center mt-24 pb-10 text-slate-600 text-xs md:text-sm">
        <p className="mb-4">&copy; 2025 Ielts4our. Created with ❤️ by <Link href="/about" className="hover:text-teal-400 transition-colors">Luthfi Baihaqi</Link>.</p>
        
        <button 
          onClick={() => {
            if(confirm("⚠️ RESET MODE: Apakah Anda yakin ingin menghapus status Premium, History, dan Streak?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-[10px] text-red-500/50 hover:text-red-500 border border-red-900/30 px-2 py-1 rounded bg-red-900/10 transition-all"
        >
          [DEV] Reset All Data
        </button>
      </footer>
    </main>
  );
}