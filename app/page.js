"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, RefreshCw, Crown, MessageCircle, X, AlertCircle } from "lucide-react";

import Recorder from "@/components/Recorder";
import ScoreCard from "@/components/ScoreCard";
import StreakBadge from "@/components/StreakBadge";

// --- DATABASE TOKEN BARU (I4-XXX) ---
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

const CUE_CARDS = [
  // --- LEVEL 1: FREE (0 - 29) ---
  "Describe a book you read that you found useful.",
  "Describe a time when you helped someone.",
  "Describe a popular place for sports in your city.",
  "Describe an invention that changed the world.",
  "Describe a famous person you would like to meet.",
  "Describe a movie you watched recently.",
  "Describe a gift you gave to someone.",
  "Describe a difficult decision you made.",
  "Describe a website you visit often.",
  "Describe a traditional festival in your country.",
  "Describe a crowded place you have visited.",
  "Describe a family member you admire.",
  "Describe a goal you want to achieve.",
  "Describe a piece of art you like.",
  "Describe a time you were late for something.",
  "Describe a technological device you use daily.",
  "Describe a trip you plan to take.",
  "Describe a wild animal you have seen.",
  "Describe a teacher who influenced you.",
  "Describe a song that means a lot to you.",
  "Describe a historical building in your town.",
  "Describe a time you complained about something.",
  "Describe a job you would not like to do.",
  "Describe a skill you want to learn.",
  "Describe a time you saved money for something.",
  "Describe a business person you admire.",
  "Describe a quiet place you like to go to.",
  "Describe a time you received good news.",
  "Describe a change that would improve your local area.",
  "Describe a competition you would like to take part in.",

  // --- LEVEL 2: PREMIUM (30 - 59) ---
  "Describe a piece of advice you received that was helpful.",
  "Describe a risk you took that you do not regret.",
  "Describe a family business you know and admire.",
  "Describe a rule at your school or work that you did not like.",
  "Describe a time you used a map to find your way.",
  "Describe a creative person whose work you like.",
  "Describe a party that you enjoyed.",
  "Describe an old object which your family has kept for a long time.",
  "Describe a disagreement you had with a friend.",
  "Describe a uniform you wear (or wore) at school or work.",
  "Describe a speech or talk that you found interesting.",
  "Describe a time you got lost in a place you didn't know.",
  "Describe a science subject (Biology, Robotics, etc.) that you are interested in.",
  "Describe a noise that bothers you in your daily life.",
  "Describe a place near water (like a river, lake, or ocean) you enjoyed visiting.",
  "Describe a toy you liked in your childhood.",
  "Describe a photo of yourself that you like.",
  "Describe a surprise that made you happy.",
  "Describe a time you had to wait for something for a long time.",
  "Describe a foreign culture that you are interested in learning about.",
  "Describe a sport you enjoyed watching (live or on TV).",
  "Describe a house or apartment you would like to live in.",
  "Describe a time you were friendly to someone you didn't like.",
  "Describe an advertisement that persuaded you to buy something.",
  "Describe a small business you would like to open if you had the chance.",
  "Describe a time you moved to a new home or school.",
  "Describe a person who is good at apologizing.",
  "Describe a day when you woke up very early.",
  "Describe a character from a film that you felt connected to.",
  "Describe a traditional product from your country that is popular."
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
  const [dailyCue, setDailyCue] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [streakKey, setStreakKey] = useState(0); 
  const [isRotating, setIsRotating] = useState(false);
  const [isPremium, setIsPremium] = useState(false); 
  
  // STATE MODAL PEMBAYARAN
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
    // REBRANDING: Ganti Key LocalStorage jadi ielts4our_...
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
    
    // REBRANDING: Ganti Key LocalStorage
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
      // REBRANDING: Ganti Key LocalStorage
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
    // REBRANDING: Ganti Nama di Pesan WA
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
            {/* Logo Singkatan I4 */}
            <span className="font-black text-xl text-white">I4</span>
          </div>
          {/* Judul Baru */}
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
          {/* StreakBadge otomatis baca props, tapi perlu dipastikan internalnya nanti */}
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
          Band 7 dalam <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-500">100 Hari</span>
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
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
              "{dailyCue}"
            </p>
            <p className="mt-4 text-slate-400 text-sm">
              You should say: What it is, When it happened, Why it was important, etc.
            </p>
          </div>
        </motion.div>

        <Recorder 
          cueCard={dailyCue} 
          onAnalysisComplete={handleAnalysisComplete}
          maxDuration={isPremium ? 120 : 60} 
        />

        {analysisResult && (
          <div id="result-section">
            <ScoreCard 
              result={analysisResult} 
              cue={dailyCue}
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
                  <div className="grid grid-cols-3 p-3 items-center text-center bg-yellow-500/10">
                    <div className="text-left text-yellow-200">Masa Aktif</div>
                    <div className="text-slate-500">Selamanya</div>
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
                     <b>Penting:</b> Pastikan bukti transfer memperlihatkan <b>Tanggal & Jam</b> transaksi.
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