"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, RefreshCw, Crown, MessageCircle, X, AlertCircle } from "lucide-react";

import Recorder from "@/components/Recorder";
import ScoreCard from "@/components/ScoreCard";
import StreakBadge from "@/components/StreakBadge";

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

// --- BANK SOAL IELTS ASLI (PERBAIKAN: FORMAT OBJECT) ---
const CUE_CARDS = [
  // === LEVEL 1: FREE (0 - 29) ===
  {
    topic: "Describe a book you read that you found useful.",
    points: ["What the book is", "When you read it", "Why you found it useful", "And explain how it helped you"]
  },
  {
    topic: "Describe a time when you helped someone.",
    points: ["Who you helped", "Why they needed help", "How you helped them", "And explain how you felt about it"]
  },
  {
    topic: "Describe a popular place for sports in your city.",
    points: ["Where it is", "What sports people play there", "How often you go there", "And explain why it is popular"]
  },
  {
    topic: "Describe an invention that changed the world.",
    points: ["What the invention is", "Who invented it", "How it changed our lives", "And explain why you think it is important"]
  },
  {
    topic: "Describe a famous person you would like to meet.",
    points: ["Who this person is", "Why they are famous", "What you would talk about", "And explain why you want to meet them"]
  },
  {
    topic: "Describe a movie you watched recently.",
    points: ["What the movie was", "When and where you watched it", "Who you watched it with", "And explain why you liked or disliked it"]
  },
  {
    topic: "Describe a gift you gave to someone.",
    points: ["What the gift was", "Who you gave it to", "Why you chose that gift", "And explain how the person reacted"]
  },
  {
    topic: "Describe a difficult decision you made.",
    points: ["What the decision was", "When you made it", "Why it was difficult", "And explain the result of the decision"]
  },
  {
    topic: "Describe a website you visit often.",
    points: ["What the website is", "How you found it", "What you use it for", "And explain why you visit it often"]
  },
  {
    topic: "Describe a traditional festival in your country.",
    points: ["What the festival is", "When and where it happens", "What people do during it", "And explain why it is important"]
  },
  {
    topic: "Describe a crowded place you have visited.",
    points: ["Where it was", "When you went there", "Who you were with", "And explain how you felt being there"]
  },
  {
    topic: "Describe a family member you admire.",
    points: ["Who they are", "What they do", "Why you admire them", "And explain your relationship with them"]
  },
  {
    topic: "Describe a goal you want to achieve.",
    points: ["What the goal is", "Why you want to achieve it", "How you plan to achieve it", "And explain why it is important to you"]
  },
  {
    topic: "Describe a piece of art you like.",
    points: ["What it is", "Where you saw it", "What it looks like", "And explain why you like it"]
  },
  {
    topic: "Describe a time you were late for something.",
    points: ["What you were late for", "Why you were late", "What happened as a result", "And explain how you felt about it"]
  },
  {
    topic: "Describe a technological device you use daily.",
    points: ["What the device is", "How long you have used it", "What you use it for", "And explain why it is important to you"]
  },
  {
    topic: "Describe a trip you plan to take.",
    points: ["Where you want to go", "Who you would go with", "What you would do there", "And explain why you want to take this trip"]
  },
  {
    topic: "Describe a wild animal you have seen.",
    points: ["What animal it was", "Where you saw it", "What it was doing", "And explain how you felt when you saw it"]
  },
  {
    topic: "Describe a teacher who influenced you.",
    points: ["Who the teacher was", "What subject they taught", "How they influenced you", "And explain why you remember them"]
  },
  {
    topic: "Describe a song that means a lot to you.",
    points: ["What the song is", "When you first heard it", "What the lyrics are about", "And explain why it is special to you"]
  },
  {
    topic: "Describe a historical building in your town.",
    points: ["Where it is", "What it looks like", "What it is used for now", "And explain why it is important"]
  },
  {
    topic: "Describe a time you complained about something.",
    points: ["What you complained about", "Who you complained to", "What the result was", "And explain how you felt about the situation"]
  },
  {
    topic: "Describe a job you would not like to do.",
    points: ["What the job is", "What tasks it involves", "Why you think it is difficult", "And explain why you would not like to do it"]
  },
  {
    topic: "Describe a skill you want to learn.",
    points: ["What the skill is", "Why you want to learn it", "How you would learn it", "And explain how it would help you"]
  },
  {
    topic: "Describe a time you saved money for something.",
    points: ["What you saved for", "How long it took you", "How you saved the money", "And explain how you felt when you bought it"]
  },
  {
    topic: "Describe a business person you admire.",
    points: ["Who they are", "What business they run", "Why they are successful", "And explain why you admire them"]
  },
  {
    topic: "Describe a quiet place you like to go to.",
    points: ["Where it is", "How often you go there", "What you do there", "And explain why you like it"]
  },
  {
    topic: "Describe a time you received good news.",
    points: ["What the news was", "How you received it", "Who you shared it with", "And explain why it was good news"]
  },
  {
    topic: "Describe a change that would improve your local area.",
    points: ["What the change would be", "How it would be done", "Who it would benefit", "And explain why this change is necessary"]
  },
  {
    topic: "Describe a competition you would like to take part in.",
    points: ["What the competition is", "What you would need to do", "Why you want to participate", "And explain what prize you would like to win"]
  },

  // === LEVEL 2: PREMIUM (30 - 59) ===
  {
    topic: "Describe a piece of advice you received that was helpful.",
    points: ["Who gave it to you", "What the advice was", "In what situation you received it", "And explain how it helped you"]
  },
  {
    topic: "Describe a risk you took that you do not regret.",
    points: ["What the risk was", "Why you took it", "What the result was", "And explain why you do not regret it"]
  },
  {
    topic: "Describe a family business you know and admire.",
    points: ["What the business is", "Who runs it", "How you know about it", "And explain why you admire it"]
  },
  {
    topic: "Describe a rule at your school or work that you did not like.",
    points: ["What the rule was", "Why it was implemented", "Why you did not like it", "And explain if you followed it or not"]
  },
  {
    topic: "Describe a time you used a map to find your way.",
    points: ["Where you were going", "Why you needed a map", "How easy or difficult it was", "And explain if you found the place successfully"]
  },
  {
    topic: "Describe a creative person whose work you like.",
    points: ["Who the person is", "What kind of creative work they do", "How you know about them", "And explain why you like their work"]
  },
  {
    topic: "Describe a party that you enjoyed.",
    points: ["Whose party it was", "When and where it was held", "What happened during the party", "And explain why you enjoyed it"]
  },
  {
    topic: "Describe an old object which your family has kept for a long time.",
    points: ["What the object is", "Where it came from", "How long your family has kept it", "And explain why it is important to your family"]
  },
  {
    topic: "Describe a disagreement you had with a friend.",
    points: ["Who the friend was", "What the disagreement was about", "How you resolved it", "And explain how it affected your friendship"]
  },
  {
    topic: "Describe a uniform you wear (or wore) at school or work.",
    points: ["What it looks like", "When you wear it", "Who bought it for you", "And explain how you feel about wearing it"]
  },
  {
    topic: "Describe a speech or talk that you found interesting.",
    points: ["Who gave the speech", "What it was about", "Where you heard it", "And explain why you found it interesting"]
  },
  {
    topic: "Describe a time you got lost in a place you didn't know.",
    points: ["Where you were", "Why you were there", "How you got lost", "And explain how you found your way back"]
  },
  {
    topic: "Describe a science subject that you are interested in.",
    points: ["What subject it is", "How you learned about it", "Why you find it interesting", "And explain how it affects our lives"]
  },
  {
    topic: "Describe a noise that bothers you in your daily life.",
    points: ["What the noise is", "Where it comes from", "When it happens", "And explain why it bothers you"]
  },
  {
    topic: "Describe a place near water you enjoyed visiting.",
    points: ["Where this place is", "What you did there", "Who you went with", "And explain why you liked it"]
  },
  {
    topic: "Describe a toy you liked in your childhood.",
    points: ["What the toy was", "Who gave it to you", "How you played with it", "And explain why it was special to you"]
  },
  {
    topic: "Describe a photo of yourself that you like.",
    points: ["When it was taken", "Where it was taken", "Who took it", "And explain why you like this photo"]
  },
  {
    topic: "Describe a surprise that made you happy.",
    points: ["What the surprise was", "Who surprised you", "How you reacted", "And explain why it made you happy"]
  },
  {
    topic: "Describe a time you had to wait for something for a long time.",
    points: ["What you were waiting for", "How long you waited", "What you did while waiting", "And explain how you felt about waiting"]
  },
  {
    topic: "Describe a foreign culture that you are interested in learning about.",
    points: ["Which culture it is", "How you know about it", "What specific aspect interests you", "And explain why you want to learn more"]
  },
  {
    topic: "Describe a sport you enjoyed watching.",
    points: ["What sport it was", "When and where you watched it", "Who you watched it with", "And explain why you enjoyed watching it"]
  },
  {
    topic: "Describe a house or apartment you would like to live in.",
    points: ["Where it would be", "What it would look like", "Who you would live with", "And explain why you would like to live there"]
  },
  {
    topic: "Describe a time you were friendly to someone you didn't like.",
    points: ["Who the person was", "When it happened", "Why you didn't like them", "And explain why you were friendly to them"]
  },
  {
    topic: "Describe an advertisement that persuaded you to buy something.",
    points: ["What the advertisement was for", "Where you saw it", "What it showed", "And explain why it persuaded you"]
  },
  {
    topic: "Describe a small business you would like to open.",
    points: ["What kind of business it would be", "Where you would open it", "Who your customers would be", "And explain why you want to open this business"]
  },
  {
    topic: "Describe a time you moved to a new home or school.",
    points: ["When you moved", "Where you moved to", "Why you moved", "And explain how you felt about moving"]
  },
  {
    topic: "Describe a person who is good at apologizing.",
    points: ["Who this person is", "How you know them", "When they apologized to you", "And explain why you think they are good at it"]
  },
  {
    topic: "Describe a day when you woke up very early.",
    points: ["When it was", "Why you woke up early", "What you did that day", "And explain how you felt by the end of the day"]
  },
  {
    topic: "Describe a character from a film that you felt connected to.",
    points: ["Who the character is", "Which film they are in", "What their personality is like", "And explain why you felt connected to them"]
  },
  {
    topic: "Describe a traditional product from your country that is popular.",
    points: ["What the product is", "How it is made", "Where it is popular", "And explain why it is important to your culture"]
  }
];

// --- INFO BANK & KONTAK ---
const BANK_INFO = {
  bankName: "BCA",             
  accountNumber: "123-456-7890", 
  accountName: "LUTHFI BAIHAQI", 
  price: "Rp 25.000",
  email: "luthfibaihaqi851@gmail.com",
  waNumber: "6281234567890" 
};

export default function Home() {
  const [dailyCue, setDailyCue] = useState(CUE_CARDS[0]); // Default ke object pertama
  const [analysisResult, setAnalysisResult] = useState(null);
  const [streakKey, setStreakKey] = useState(0); 
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
      setStreakKey((prev) => prev + 1); 
    }
  };

  const validateToken = () => {
    const cleanToken = tokenInput.trim().toUpperCase();
    
    if (VALID_TOKENS.includes(cleanToken)) {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); 

      setIsPremium(true);
      localStorage.setItem("ielts4our_premium_expiry", expiryDate.getTime().toString());
      
      alert(`🎉 Selamat! Akun PRO aktif 30 hari (s/d ${expiryDate.toLocaleDateString()}).`);
      setShowUpgradeModal(false);
      setTokenInput("");
      randomizeCue(); 
    } else {
      alert("❌ Kode Token Salah. Cek email/WA Anda.");
    }
  };

  const confirmViaWA = () => {
    const text = `Halo Admin Ielts4our, saya sudah transfer ${BANK_INFO.price} untuk upgrade Premium.\n\nBerikut lampiran bukti transfer saya (Tanggal & Jam terlihat).\nMohon verifikasi dan kirimkan Kode Tokennya. Terima kasih.`;
    const url = `https://wa.me/${BANK_INFO.waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen pb-20 px-4">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center py-6 max-w-4xl mx-auto gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="font-black text-xl text-white">I4</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Ielts<span className="text-teal-400">4our</span>
          </h1>
          {isPremium && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded border border-yellow-500/50">
              PRO
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isPremium && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-lg shadow-lg shadow-orange-500/20 text-sm flex items-center gap-2"
            >
              <Crown className="w-4 h-4 fill-current" />
              Upgrade Pro
            </motion.button>
          )}
          <StreakBadge triggerUpdate={streakKey} />
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="text-center max-w-2xl mx-auto mt-8 mb-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-teal-400 text-xs font-bold uppercase tracking-wider mb-4"
        >
          <Sparkles className="w-3 h-3" />
          {isPremium ? "Premium Mode Active" : "✨ INSTANT IELTS FEEDBACK"}
        </motion.div>
        
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Latihan Speaking Kapan Saja Bersama <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-500">Ielts4our</span>
        </h2>
        <p className="text-slate-400 text-lg">
          {isPremium 
            ? "Unlimited Access. 2 Minutes Recording. 60 Topics."
            : "Dapatkan prediksi skor dan koreksi grammar secara instan setiap hari."}
        </p>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-3xl mx-auto space-y-8">
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl shadow-xl relative overflow-hidden group"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
          
          <div className="relative z-10 text-center">
            <div className="flex justify-center items-center relative mb-4">
              <div className="bg-slate-900 p-3 rounded-full border border-slate-700 relative z-10">
                {CUE_CARDS.indexOf(dailyCue) >= 30 ? (
                   <Crown className="w-8 h-8 text-yellow-500" /> 
                ) : (
                   <BookOpen className="w-8 h-8 text-teal-400" />
                )}
              </div>
              <button 
                onClick={randomizeCue}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-700/50 text-slate-500 hover:text-white transition-all"
                title="Ganti Soal"
              >
                <RefreshCw className={`w-5 h-5 ${isRotating ? "animate-spin" : ""}`} />
              </button>
            </div>
            
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">
               {CUE_CARDS.indexOf(dailyCue) >= 30 ? "Premium Topic" : "Practice Topic"}
            </h3>
            
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-6">
              "{dailyCue.topic}"
            </p>
            
            <div className="inline-block text-left bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">You should say:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm md:text-base">
                {dailyCue.points?.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

          </div>
        </motion.div>

        {/* Kirim dailyCue.topic (String) ke Recorder agar tidak error */}
        <Recorder 
          cueCard={dailyCue.topic} 
          onAnalysisComplete={handleAnalysisComplete}
          maxDuration={isPremium ? 120 : 60} 
        />

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
      
      {/* MODAL PEMBAYARAN & UPGRADE */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 py-10">
            <div className="bg-slate-800 p-6 rounded-2xl max-w-md w-full border border-slate-700 relative my-auto shadow-2xl">
              
              <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1"><X className="w-6 h-6"/></button>

              <h3 className="text-2xl font-bold text-white mb-4 text-center mt-2">Upgrade to Ielts<span className="text-yellow-400">4our</span> PRO</h3>

              <div className="bg-slate-900 rounded-xl overflow-hidden mb-6 border border-slate-700">
                <div className="grid grid-cols-3 bg-slate-800/50 p-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  <div className="text-left">Fitur</div>
                  <div>Free</div>
                  <div className="text-yellow-400">Pro</div>
                </div>
                <div className="divide-y divide-slate-800 text-sm">
                  <div className="grid grid-cols-3 p-3 items-center text-center">
                    <div className="text-left text-slate-300">Durasi</div>
                    <div className="text-slate-500">60 Detik</div>
                    <div className="font-bold text-white">2 Menit</div>
                  </div>
                  <div className="grid grid-cols-3 p-3 items-center text-center">
                    <div className="text-left text-slate-300">Bank Soal</div>
                    <div className="text-slate-500">30 Topik</div>
                    <div className="font-bold text-white">60+ Topik</div>
                  </div>
                  <div className="grid grid-cols-3 p-3 items-center text-center">
                    <div className="text-left text-slate-300">Model Answer</div>
                    <div className="text-slate-500">❌ Terkunci</div>
                    <div className="font-bold text-white">✅ Band 8.0</div>
                  </div>
                  <div className="grid grid-cols-3 p-3 items-center text-center">
                    <div className="text-left text-slate-300">Grammar Clinic</div>
                    <div className="text-slate-500">❌ Terkunci</div>
                    <div className="font-bold text-white">Full Access</div>
                  </div>
                  <div className="grid grid-cols-3 p-3 items-center text-center bg-yellow-500/10">
                    <div className="text-left text-yellow-200">Masa Aktif</div>
                    <div className="text-slate-500">Selamanya Free</div>
                    <div className="font-bold text-yellow-400">30 Hari</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-xl mb-4 border border-slate-800">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Langkah 1: Transfer Biaya</p>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300">Biaya Langganan</span>
                  <span className="text-teal-400 font-bold">{BANK_INFO.price} / bulan</span>
                </div>
                <div className="border-t border-slate-800 my-2 pt-2">
                  <p className="text-xs text-slate-500">{BANK_INFO.bankName} (a.n {BANK_INFO.accountName})</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono text-white select-all">{BANK_INFO.accountNumber}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Langkah 2: Konfirmasi & Dapat Token</p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mb-3 flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-200 leading-relaxed">
                     <b>Penting:</b> Kirim bukti bayar via email atau Whatsapp dan pastikan bukti transfer memperlihatkan <b>Tanggal & Jam</b> transaksi.
                  </p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={confirmViaWA}
                    className="flex-1 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                   >
                     <MessageCircle className="w-4 h-4" />
                     Konfirmasi WA
                   </button>
                   <a 
                     href={`mailto:${BANK_INFO.email}?subject=Bukti Bayar Ielts4our Premium`}
                     className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                   >
                     Via Email
                   </a>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Langkah 3: Masukkan Token</p>
                <input 
                  type="text" 
                  placeholder="Contoh: I4-ABCD"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl mb-3 focus:outline-none focus:border-teal-500 text-center font-mono tracking-widest uppercase"
                />
                <button 
                  onClick={validateToken}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20"
                >
                  Aktifkan Premium
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <footer className="text-center mt-20 text-slate-600 text-sm">
        <p>&copy; 2025 Ielts4our. Built for IELTS Fighters.</p>
      </footer>
    </main>
  );
}