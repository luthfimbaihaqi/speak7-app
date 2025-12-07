"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, RefreshCw, Crown, MessageCircle, X, ArrowRight, Check, Lock, AlertTriangle, BarChart3 } from "lucide-react";

import Recorder from "@/components/Recorder";
import ScoreCard from "@/components/ScoreCard";
// HAPUS IMPORT STREAKBADGE (Sudah dipindah ke halaman Progress)

// --- DATABASE TOKEN (I4-XXX) ---
const VALID_TOKENS = [
  "I4-ALPHA", "I4-BRAVO", "I4-DELTA", "I4-ECHO9", "I4-G0LD1",
  "I4-LION7", "I4-TIGER", "I4-WK29A", "I4-QW88X", "I4-MN12P",
  "I4-X9L2K", "I4-M4P1Z", "I4-K8J9R", "I4-H3V5C", "I4-B2N6M",
  "I4-R9T4W", "I4-Y7U8I", "I4-O0P1L", "I4-A2S3D", "I4-F4G5H",
  "I4-J6K7L", "I4-Z8X9C", "I4-V0B1N", "I4-M2Q3W", "I4-E4R5T",
  "I4-Y6U7I", "I4-O8P9A", "I4-S1D2F", "I4-G3H4J", "I4-K5L6Z",
  "I4-X7C8V", "I4-B9N0M", "I4-Q1W2E", "I4-R3T4Y", "I4-U5I6O",
  "I4-P7A8S", "I4-D9F0G", "I4-H1J2K", "I4-L3Z4X", "I4-C5V6B",
  "I4-N7M8Q", "I4-W9E0R", "I4-T1Y2U", "I4-I3O4P", "I4-A5S6D",
  "I4-F7G8H", "I4-J9K0L", "I4-Z1X2C", "I4-V3B4N", "I4-M5Q6W",
  "I4-2025A", "I4-PRO01", "I4-BEST9", "I4-WIN88", "I4-TOP77",
  "I4-SKILL", "I4-IELTS", "I4-BAND8", "I4-BAND7", "I4-SPEAK",
  "I4-FAST1", "I4-COOL2", "I4-GOOD3", "I4-NICE4", "I4-EASY5",
  "I4-HARD6", "I4-TEST7", "I4-EXAM8", "I4-PASS9", "I4-FAIL0",
  "I4-ACE11", "I4-KING2", "I4-QUEN3", "I4-JACK4", "I4-TEN10",
  "I4-ONE01", "I4-TWO02", "I4-SIX06", "I4-NINE9", "I4-ZERO0",
  "I4-RX782", "I4-EV001", "I4-GUNDM", "I4-ZAKU2", "I4-GOUF3",
  "I4-DOM09", "I4-GELG4", "I4-GM005", "I4-BALL6", "I4-AGUY7",
  "I4-LUTH1", "I4-USER2", "I4-PRO99", "I4-MAX00", "I4-ULTRA"
];

// --- BANK SOAL ---
const CUE_CARDS = [
  // === LEVEL 1: FREE (0 - 29) ===
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

// --- INFO BANK ---
const BANK_INFO = {
  bankName: "BCA",             
  accountNumber: "123-456-7890", 
  accountName: "LUTHFI BAIHAQI", 
  price: "Rp 25.000",
  email: "luthfibaihaqi851@gmail.com",
  waNumber: "6281234567890" 
};

export default function Home() {
  const [dailyCue, setDailyCue] = useState(CUE_CARDS[0]);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // HAPUS state streakKey karena badge di header sudah hilang
  const [isRotating, setIsRotating] = useState(false);
  const [isPremium, setIsPremium] = useState(false); 
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  const randomizeCue = () => {
    setIsRotating(true);
    const maxIndex = isPremium ? CUE_CARDS.length : 30;
    const randomIndex = Math.floor(Math.random() * maxIndex);
    setDailyCue(CUE_CARDS[randomIndex]);
    setTimeout(() => setIsRotating(false), 500);
  };

  useEffect(() => {
    const expiryStr = localStorage.getItem("ielts4our_premium_expiry");
    if (expiryStr) {
      const expiryTime = parseInt(expiryStr);
      const now = Date.now();
      if (now < expiryTime) {
        setIsPremium(true); 
      } else {
        setIsPremium(false);
        localStorage.removeItem("ielts4our_premium_expiry"); 
      }
    } else {
      setIsPremium(false);
    }
  }, []);

  useEffect(() => {
      randomizeCue();
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

  const handleAnalysisComplete = (data) => {
    setAnalysisResult(data);
    const todayStr = new Date().toDateString();
    
    // --- STREAK LOGIC (Tetap dihitung, tapi tidak mentrigger badge) ---
    const lastPracticeDate = localStorage.getItem("ielts4our_last_date");
    let currentStreak = parseInt(localStorage.getItem("ielts4our_streak") || "0");

    if (lastPracticeDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastPracticeDate === yesterday.toDateString()) {
        currentStreak += 1;
      } else {
        currentStreak = 1; 
      }
      localStorage.setItem("ielts4our_streak", currentStreak);
      localStorage.setItem("ielts4our_last_date", todayStr);
      // setStreakKey tidak perlu dipanggil lagi
    }

    // --- SAVE HISTORY LOGIC (My Progress) ---
    const historyItem = {
       id: Date.now(),
       date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }), 
       topic: dailyCue.topic,
       overall: data.overall,
       fluency: data.fluency,
       lexical: data.lexical,
       grammar: data.grammar,
       pronunciation: data.pronunciation
    };

    const existingHistory = JSON.parse(localStorage.getItem("ielts4our_history") || "[]");
    const updatedHistory = [...existingHistory, historyItem].slice(-30); 
    localStorage.setItem("ielts4our_history", JSON.stringify(updatedHistory));
  };

  const validateToken = () => {
    const cleanToken = tokenInput.trim().toUpperCase();
    if (VALID_TOKENS.includes(cleanToken)) {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); 

      setIsPremium(true);
      localStorage.setItem("ielts4our_premium_expiry", expiryDate.getTime().toString());
      
      alert(`🎉 Selamat! Akun PRO aktif 30 hari.`);
      setShowUpgradeModal(false);
      setTokenInput("");
      randomizeCue(); 
    } else {
      alert("❌ Kode Token Salah.");
    }
  };

  const confirmViaWA = () => {
    const text = `Halo Admin Ielts4our, saya sudah transfer ${BANK_INFO.price} untuk upgrade Premium.`;
    const url = `https://wa.me/${BANK_INFO.waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen pb-20 px-4 selection:bg-teal-500/30 selection:text-teal-200">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center py-8 max-w-5xl mx-auto gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="font-black text-white text-lg tracking-tighter">I4</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white/90">
            Ielts<span className="text-teal-400">4our</span>
          </h1>
          {isPremium && (
            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-yellow-500/20">
              Pro Member
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* TOMBOL MY PROGRESS (DENGAN TEXT) */}
          <Link href="/progress">
             <motion.div 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-300 hover:text-teal-400 transition-colors cursor-pointer flex items-center gap-2"
               title="My Progress"
             >
                <BarChart3 className="w-5 h-5" />
                <span className="font-bold text-sm">My Progress</span>
             </motion.div>
          </Link>

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
          {/* STREAK BADGE DIHAPUS DARI SINI */}
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto mt-6 mb-12">
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

      {/* CONTENT AREA */}
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* CUE CARD GLASS PANEL */}
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative glass-panel rounded-[2rem] p-8 md:p-12 overflow-hidden">
             {/* Header Card */}
             <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    {CUE_CARDS.indexOf(dailyCue) >= 30 ? (
                       <Crown className="w-6 h-6 text-yellow-400" /> 
                    ) : (
                       <BookOpen className="w-6 h-6 text-teal-400" />
                    )}
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
                
                <button 
                  onClick={randomizeCue}
                  className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all group"
                  title="Ganti Soal"
                >
                  <RefreshCw className={`w-5 h-5 ${isRotating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                </button>
             </div>

             {/* Content Card */}
             <div className="text-center mb-10">
                <p className="text-2xl md:text-4xl font-bold text-white leading-tight mb-8">
                  "{dailyCue.topic}"
                </p>
                
                <div className="inline-block text-left bg-black/20 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <p className="text-teal-400 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" /> You can say:
                  </p>
                  <ul className="space-y-3">
                    {dailyCue.points?.map((point, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-300 text-sm md:text-base">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 shrink-0"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
             </div>
             
             {/* Recorder Component */}
             <Recorder 
               cueCard={dailyCue.topic} 
               onAnalysisComplete={handleAnalysisComplete}
               maxDuration={isPremium ? 120 : 60} 
             />
          </div>
        </motion.div>

        {/* RESULT SECTION */}
        {analysisResult && (
          <div id="result-section">
            <ScoreCard 
              result={analysisResult} 
              cue={dailyCue.topic}
              isPremiumExternal={isPremium}
              onOpenUpgradeModal={() => setShowUpgradeModal(true)}
            />
          </div>
        )}

      </div>
      
      {/* --- MODAL PEMBAYARAN RESPONSIVE + NOTE --- */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden relative max-h-[85vh] overflow-y-auto"
          >
             <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-2 bg-black/20 rounded-full"><X className="w-5 h-5"/></button>
             
             <div className="bg-gradient-to-br from-amber-500/10 to-purple-600/10 p-6 md:p-8 text-center border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-600"></div>
                <Crown className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                <h3 className="text-xl md:text-2xl font-bold text-white">Upgrade to Premium</h3>
                <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xs mx-auto">Investasi kecil untuk masa depan dan skor IELTS impianmu.</p>
             </div>

             <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                {/* Comparison Table */}
                <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                   <div className="grid grid-cols-3 p-3 md:p-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest text-center bg-black/20">
                      <div className="text-left">Feature</div>
                      <div>Free</div>
                      <div className="text-yellow-400">Pro</div>
                   </div>
                   <div className="divide-y divide-white/5 text-sm">
                      <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                        <div className="text-left text-slate-300 text-xs md:text-sm">Duration</div>
                        <div className="text-slate-500 text-xs md:text-sm">60s</div>
                        <div className="font-bold text-white text-xs md:text-sm">2 Mins</div>
                      </div>
                      <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                        <div className="text-left text-slate-300 text-xs md:text-sm">Answer</div>
                        <div className="text-slate-500 flex justify-center"><Lock className="w-3 h-3 md:w-4 md:h-4"/></div>
                        <div className="font-bold text-emerald-400 flex justify-center"><Check className="w-3 h-3 md:w-4 md:h-4"/></div>
                      </div>
                      <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                        <div className="text-left text-slate-300 text-xs md:text-sm">Grammar</div>
                        <div className="text-slate-500 text-xs md:text-sm">Partial</div>
                        <div className="font-bold text-emerald-400 text-xs md:text-sm">Full</div>
                      </div>
                   </div>
                </div>

                {/* Steps Section */}
                <div className="space-y-5">
                  {/* Step 1: Transfer */}
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

                  {/* AMBER ALERT */}
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex gap-3 items-start text-left">
                     <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                     <div className="text-xs text-yellow-200/90 leading-relaxed">
                        <span className="font-bold text-yellow-400">PENTING:</span> Kirim bukti bayar via WhatsApp/Email. Pastikan foto menampilkan <span className="font-bold text-yellow-400">Tanggal & Jam</span> transaksi. Admin akan mengirim Token setelah verifikasi.
                     </div>
                  </div>

                  {/* Step 2: Confirm */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <button onClick={confirmViaWA} className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 group">
                       <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform"/> Konfirmasi WA
                    </button>
                    <a href={`mailto:${BANK_INFO.email}`} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10">
                       Via Email
                    </a>
                  </div>

                  {/* Step 3: Input */}
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

      <footer className="text-center mt-24 text-slate-600 text-xs md:text-sm">
        <p>&copy; 2025 Ielts4our. Built for IELTS fighters.</p>
      </footer>
    </main>
  );
}