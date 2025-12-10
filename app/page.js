"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Sparkles, RefreshCw, Crown, ArrowRight, Lock, 
  BarChart3, ChevronRight, Mic2, Users, Volume2, Unlock, 
  Filter, AlertTriangle, LogIn, ChevronDown, LogOut, User, Info 
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient"; 
import Image from "next/image";
import { CUE_CARDS, PART3_TOPICS, GUILT_MESSAGES } from "@/utils/constants";
import MarketingSection from "@/components/MarketingSection";
import UpgradeModal from "@/components/UpgradeModal";
import AlertModal from "@/components/AlertModal"; 
import FAQSection from "@/components/FAQSection"; 

import Recorder from "@/components/Recorder";
import ScoreCard from "@/components/ScoreCard";

export default function Home() {
  const router = useRouter(); 
  const heroRef = useRef(null); 
  
  // --- REF UNTUK DROPDOWN MENU USER ---
  const userMenuRef = useRef(null);

  const [dailyCue, setDailyCue] = useState(CUE_CARDS[0]);
  const [part3Topic, setPart3Topic] = useState(PART3_TOPICS[0]);

  const [difficultyFilter, setDifficultyFilter] = useState("any");

  const dailyCueRef = useRef(dailyCue);
  const part3TopicRef = useRef(part3Topic);

  useEffect(() => { dailyCueRef.current = dailyCue; }, [dailyCue]);
  useEffect(() => { part3TopicRef.current = part3Topic; }, [part3Topic]);

  const [analysisResult, setAnalysisResult] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  
  const [userProfile, setUserProfile] = useState(null); 
  const [isPremium, setIsPremium] = useState(false);
  const [freeMockQuota, setFreeMockQuota] = useState(0); 
  
  const [dailyCueQuotaStatus, setDailyCueQuotaStatus] = useState('allowed'); 

  // --- STATE MENU DROPDOWN ---
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [practiceMode, setPracticeMode] = useState("cue-card"); 
  const [interviewQuestion, setInterviewQuestion] = useState(""); 
  
  const accumulatedScoresRef = useRef([]); 
  const [accumulatedScoresState, setAccumulatedScoresState] = useState([]); 
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [guiltMessage, setGuiltMessage] = useState(GUILT_MESSAGES[0]);
  
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false, type: "success", title: "", message: "", actionLabel: "", onAction: null
  });

  // --- 1. CEK STATUS USER & CLICK OUTSIDE LISTENER ---
  useEffect(() => {
    async function checkUserStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            setUserProfile(user);
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_premium, premium_expiry, free_mock_quota, daily_usage_count, last_usage_date')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                const isStillValid = profile.is_premium && (profile.premium_expiry > Date.now());
                setIsPremium(isStillValid);
                setFreeMockQuota(profile.free_mock_quota || 0);

                if (!isStillValid) { 
                    const todayStr = new Date().toISOString().split('T')[0]; 
                    const lastDate = profile.last_usage_date;
                    const count = profile.daily_usage_count || 0;

                    if (lastDate === todayStr && count >= 2) {
                        setDailyCueQuotaStatus('daily_limit');
                    } else {
                        setDailyCueQuotaStatus('allowed');
                    }
                }
            }
        } else {
            const guestUsed = localStorage.getItem("ielts4our_guest_usage");
            if (guestUsed) setDailyCueQuotaStatus('guest_limit');
            else setDailyCueQuotaStatus('allowed');
        }
    }

    checkUserStatus();

    // Event Listener untuk menutup dropdown saat klik di luar
    function handleClickOutside(event) {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
            setIsUserMenuOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  const randomizeCue = () => {
    setIsRotating(true);
    if (practiceMode === 'cue-card') {
        const maxIndex = isPremium ? CUE_CARDS.length : 30;
        const randomIndex = Math.floor(Math.random() * maxIndex);
        setDailyCue(CUE_CARDS[randomIndex]);
    } else {
        let pool = PART3_TOPICS;
        if (isPremium && difficultyFilter !== "any") {
            pool = PART3_TOPICS.filter(t => t.difficulty === difficultyFilter);
        }
        if (pool.length === 0) pool = PART3_TOPICS;

        const randomIndex = Math.floor(Math.random() * pool.length);
        const newTopic = pool[randomIndex];
        
        setPart3Topic(newTopic);
        setInterviewQuestion(newTopic.startQ);
        accumulatedScoresRef.current = []; 
        setAccumulatedScoresState([]);     
        setAnalysisResult(null); 
    }
    setTimeout(() => setIsRotating(false), 500);
  };

  useEffect(() => {
      if (practiceMode === 'mock-interview') {
          if (difficultyFilter !== 'any') randomizeCue(); 
          else setInterviewQuestion(part3Topic.startQ);
          accumulatedScoresRef.current = [];
          setAccumulatedScoresState([]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficultyFilter]);

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

  const handleQuotaConsumption = async (mode) => {
    if (isPremium) return; 

    if (mode === 'cue-card') {
        if (userProfile) {
            const todayStr = new Date().toISOString().split('T')[0];
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('daily_usage_count, last_usage_date')
                .eq('id', userProfile.id)
                .single();
            
            let newCount = 1;
            if (currentProfile.last_usage_date === todayStr) {
                newCount = (currentProfile.daily_usage_count || 0) + 1;
            }

            await supabase.from('profiles').update({ daily_usage_count: newCount, last_usage_date: todayStr }).eq('id', userProfile.id);
            if (newCount >= 2) setDailyCueQuotaStatus('daily_limit');

        } else {
            localStorage.setItem("ielts4our_guest_usage", "true");
            setDailyCueQuotaStatus('guest_limit');
        }
    } else if (mode === 'mock-interview') {
        if (userProfile && freeMockQuota > 0) {
            await supabase.from('profiles').update({ free_mock_quota: 0 }).eq('id', userProfile.id);
            setFreeMockQuota(0);
        }
    }
  };

  const handleAnalysisComplete = async (data) => {
    const todayStr = new Date().toDateString();
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
            if (data.nextQuestion) setInterviewQuestion(data.nextQuestion);
        } else {
            if (!isPremium) await handleQuotaConsumption('mock-interview');

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
                if(round.modelAnswer) stitchedModelAnswer += `💡 Q${index + 1} Suggestion:\n${round.modelAnswer}\n\n`;
            });
            const allGrammar = allScores.flatMap(s => s.grammarCorrection || []).slice(0, 5);
            const currentTopicObj = part3TopicRef.current;

            const finalResult = {
                topic: `Mock Interview: ${currentTopicObj.topic}`,
                difficulty: currentTopicObj.difficulty, 
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
        if (!isPremium) await handleQuotaConsumption('cue-card');

        setAnalysisResult(data);
        const currentCueTitle = dailyCueRef.current.topic;
        const resultToSave = {
            ...data,
            topic: data.topic || currentCueTitle 
        };
        saveData(resultToSave);
    }
  };

  const handleLogoutClick = () => {
    // Tutup menu dulu biar rapi
    setIsUserMenuOpen(false);
    const randomMsg = GUILT_MESSAGES[Math.floor(Math.random() * GUILT_MESSAGES.length)];
    setGuiltMessage(randomMsg);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const handleModeSwitch = (mode) => {
    if (mode === "mock-interview") {
        if (!userProfile) {
            setAlertConfig({
                isOpen: true, type: "lock", title: "Login Required",
                message: "Fitur ini khusus member. Login sekarang untuk mendapatkan akses 1x Free Trial Mock Interview.",
                actionLabel: "Login Sekarang", onAction: () => router.push("/auth") 
            });
            return;
        }
        if (!isPremium && freeMockQuota <= 0) {
            setShowUpgradeModal(true); return;
        }
        if (!isPremium && freeMockQuota > 0) {
            setAlertConfig({
                isOpen: true, type: "success", title: "Free Trial Activated!",
                message: "Mode Mock Interview aktif! Kamu punya 1x kesempatan gratis. Manfaatkan sebaik mungkin ya!",
                actionLabel: "Let's Start!", onAction: null 
            });
        }
    }
    setPracticeMode(mode);
    setAnalysisResult(null); 
    accumulatedScoresRef.current = [];
    setAccumulatedScoresState([]);
    if (mode === "mock-interview") setInterviewQuestion(part3TopicRef.current.startQ);
  };

  const handleMarketingCardClick = (mode) => {
    handleModeSwitch(mode);
    if (heroRef.current) heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
        case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
        default: return 'bg-slate-700 text-slate-400';
    }
  };

  const getDifficultyLabel = (diff) => {
    switch(diff) {
        case 'easy': return '☘️ Easy';
        case 'medium': return '⚡ Medium';
        case 'hard': return '🔥 Hard';
        default: return '';
    }
  };

  const LimitReachedView = ({ type }) => (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
            {type === 'guest_limit' ? "Trial Quota Exceeded" : "Daily Limit Reached"}
        </h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
            {type === 'guest_limit' 
                ? "You've used your 1x free guest trial. Login now to get 2x free practice sessions every day!" 
                : "You've used your 2x free daily limit. Upgrade to Pro for unlimited practice or come back tomorrow!"}
        </p>
        
        {type === 'guest_limit' ? (
            <Link href="/auth">
                <button className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full transition-all flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Login for Free
                </button>
            </Link>
        ) : (
            <button 
                onClick={() => setShowUpgradeModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-900 font-bold rounded-full transition-all flex items-center gap-2 shadow-lg"
            >
                <Crown className="w-4 h-4" /> Upgrade Unlimited
            </button>
        )}
    </div>
  );

  return (
    <main className="min-h-screen pb-20 px-4 selection:bg-teal-500/30 selection:text-teal-200">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center py-8 max-w-5xl mx-auto gap-4 relative z-50">
        
        <div className="flex items-center gap-3">
          <div className="relative w-32 h-10 md:w-40 md:h-12">
             <Image src="/logo-white.png" alt="IELTS4our Logo" fill className="object-contain object-center md:object-left" priority />
          </div>
          
          {/* LINK INI TETAP DIPERTAHANKAN SESUAI REQUEST */}
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
          {/* Tombol My Progress sudah dihapus dari sini */}

          {userProfile ? (
            // --- NEW: USER DROPDOWN MENU ---
            <div className="relative" ref={userMenuRef}>
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-200 transition-all text-sm font-bold flex items-center gap-2"
                >
                    <User className="w-4 h-4 text-teal-400" />
                    <span className="max-w-[100px] truncate">{userProfile.email?.split('@')[0]}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </motion.button>

                {/* Dropdown Content */}
                <AnimatePresence>
                    {isUserMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            // 🔥 FIX: w-48 (HP) dan md:w-56 (Laptop)
                            className="absolute right-0 mt-2 w-48 md:w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-50"
                        >
                            {/* Status Header */}
                            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Status</p>
                                {isPremium ? (
                                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                                        <Crown className="w-3 h-3" /> Pro Member
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs">
                                        <User className="w-3 h-3" /> Free Plan
                                    </div>
                                )}
                            </div>

                            {/* Menu Items */}
                            <Link href="/progress" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors">
                                <BarChart3 className="w-4 h-4 text-teal-400" /> My Progress
                            </Link>
                            
                            <Link href="/mission" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors">
                                <span className="text-yellow-400">💡</span> Why Speaking?
                            </Link>

                            <div className="h-px bg-white/5 my-1"></div>

                            <button 
                                onClick={handleLogoutClick}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-sm text-slate-400 hover:text-red-400 transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          ) : (
            <Link href="/auth">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-300 hover:text-white transition-colors text-xs font-bold">
                Login
                </motion.button>
            </Link>
          )}

          {!isPremium && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowUpgradeModal(true)} className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-medium rounded-full text-sm flex items-center gap-2 transition-all shadow-lg">
              <Crown className="w-4 h-4 text-yellow-400" />
              Upgrade Pro
            </motion.button>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <div ref={heroRef} className="text-center max-w-3xl mx-auto mt-6 mb-12 scroll-mt-24">
        
        {/* Link Mobile "Meet Creator" (Tetap Ada) */}
        <div className="md:hidden mb-6">
           <Link href="/about" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-0.5 hover:border-white transition-all">
             ✨ Meet the Creator <ChevronRight className="w-3 h-3" />
           </Link>
        </div>

        {/* 🔥 NEW PILL BADGE: Link ke Mission 🔥 */}
        <Link href="/mission">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-teal-500/30 hover:border-teal-400 text-teal-300 text-xs font-bold uppercase tracking-widest mb-6 cursor-pointer transition-all shadow-[0_0_15px_rgba(45,212,191,0.1)] hover:shadow-[0_0_25px_rgba(45,212,191,0.3)] group"
          >
            <span className="group-hover:animate-pulse">💡</span> 
            <span className="text-slate-200 group-hover:text-white transition-colors">Why is Speaking the hardest skill?</span>
            <ArrowRight className="w-3 h-3 text-teal-500 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </Link>
        
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
          Master Your Speaking <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-purple-200">
            With IELTS4our
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
         <button onClick={() => handleModeSwitch("cue-card")} className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "cue-card" ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-slate-500 hover:text-slate-300"}`}>
            <Mic2 className="w-3.5 h-3.5" />
            Cue Card Practice
         </button>
         <button onClick={() => handleModeSwitch("mock-interview")} className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "mock-interview" ? "bg-teal-500/20 text-teal-300 shadow-lg border border-teal-500/30" : "text-slate-500 hover:text-slate-300"}`}>
            <Users className="w-3.5 h-3.5" />
            Mock Interview
            {!isPremium && (
                <>
                  {userProfile && freeMockQuota > 0 ? (
                    <span className="ml-1 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">1x Free</span>
                  ) : (
                    <Lock className="w-3 h-3 text-yellow-500 ml-1" />
                  )}
                </>
            )}
         </button>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative group">
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
                    
                    {dailyCueQuotaStatus === 'allowed' ? (
                        <Recorder cueCard={dailyCue.topic} onAnalysisComplete={handleAnalysisComplete} maxDuration={isPremium ? 120 : 60} mode={practiceMode} />
                    ) : (
                        <LimitReachedView type={dailyCueQuotaStatus} />
                    )}

                 </motion.div>
              )}

              {/* MODE 2: MOCK INTERVIEW */}
              {practiceMode === "mock-interview" && !analysisResult && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/5 pb-4 gap-4">
                        <div className="text-left">
                           <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Discussion Topic</h3>
                           <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl md:text-2xl font-bold text-white">{part3Topic.topic}</h2>
                                {part3Topic.difficulty && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(part3Topic.difficulty)}`}>
                                        {getDifficultyLabel(part3Topic.difficulty)}
                                    </span>
                                )}
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative">
                                <select 
                                    value={difficultyFilter}
                                    onChange={(e) => setDifficultyFilter(e.target.value)}
                                    disabled={!isPremium} 
                                    className={`appearance-none pl-8 pr-8 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500
                                        ${!isPremium 
                                            ? "bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed opacity-70" 
                                            : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                                        }
                                    `}
                                >
                                    <option value="any" className="bg-slate-900 text-slate-200">Any Level</option>
                                    <option value="easy" className="bg-slate-900 text-slate-200">Easy</option>
                                    <option value="medium" className="bg-slate-900 text-slate-200">Medium</option>
                                    <option value="hard" className="bg-slate-900 text-slate-200">Hard</option>
                                </select>
                                <Filter className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                {!isPremium && (
                                    <Lock className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                                )}
                            </div>

                            <button onClick={randomizeCue} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all group shrink-0" title="Ganti Topik">
                                <RefreshCw className={`w-5 h-5 ${isRotating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                            </button>
                        </div>
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
      
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        userProfile={userProfile}
        onUpgradeSuccess={() => {
            setIsPremium(true);
            setShowUpgradeModal(false);
            randomizeCue();
        }}
      />

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        {...alertConfig}
      />

      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl relative">
                <div className="text-6xl mb-4 animate-bounce">{guiltMessage.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{guiltMessage.title}</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">{guiltMessage.text}</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => setShowLogoutModal(false)} className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-teal-500/20">NO, I WANT BAND 8.0!</button>
                    <button onClick={confirmLogout} className="text-xs text-slate-500 hover:text-red-400 mt-2 transition-colors">I give up, let me sleep...</button>
                </div>
            </motion.div>
        </div>
      )}

      <MarketingSection onSelectMode={handleMarketingCardClick} />
      <FAQSection isTeaser={true} />

      <footer className="text-center mt-24 pb-10 text-slate-600 text-xs md:text-sm">
        <p className="mb-4">
          &copy; 2025 Ielts4our. Created with ❤️ by <Link href="/about" className="hover:text-teal-400 transition-colors">Luthfi Baihaqi</Link>.
        </p>
        <p>
            <Link href="/terms" className="underline decoration-slate-700 hover:decoration-teal-400 hover:text-teal-400 transition-all">
                Terms & Conditions
            </Link>
        </p>
      </footer>
    </main>
  );
}