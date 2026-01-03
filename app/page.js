"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Sparkles, RefreshCw, Crown, ArrowRight, Lock, 
  BarChart3, ChevronRight, Mic2, Users, Volume2, Unlock, 
  Filter, AlertTriangle, LogIn, ChevronDown, LogOut, User, Info, Zap, Clock, Plus 
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
  const userMenuRef = useRef(null);

  const [dailyCue, setDailyCue] = useState(CUE_CARDS[0]);
  
  // Masih disimpan untuk kebutuhan internal state, meski UI-nya pindah
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
  
  // State quota daily cue card
  const [dailyCueQuotaStatus, setDailyCueQuotaStatus] = useState('allowed'); 

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [practiceMode, setPracticeMode] = useState("cue-card"); 
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [guiltMessage, setGuiltMessage] = useState(GUILT_MESSAGES[0]);
  
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false, type: "success", title: "", message: "", actionLabel: "", onAction: null
  });

  // --- 1. CEK STATUS USER ---
  useEffect(() => {
    async function checkUserStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            setUserProfile(user);
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_premium, premium_expiry, daily_usage_count, last_usage_date, token_balance')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                // Merge token info ke userProfile state untuk UI
                setUserProfile(prev => ({ ...prev, ...profile }));

                const isStillValid = profile.is_premium && (profile.premium_expiry > Date.now());
                setIsPremium(isStillValid);

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
    } 
    // Logic randomize untuk Quick Test sudah dipindah ke backend/simulation
    setTimeout(() => setIsRotating(false), 500);
  };

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
    } 
    // Logic konsumsi token Quick/Full Test sekarang ditangani di /app/simulation
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
            const { audioUrl, audioPlaylist, ...dataToSave } = finalResult;

            if (userProfile) {
                await supabase.from('practice_history').insert({
                    user_id: userProfile.id,
                    topic: dataToSave.topic,
                    overall_score: dataToSave.overall,
                    fluency: dataToSave.fluency,
                    lexical: dataToSave.lexical,
                    grammar: dataToSave.grammar,
                    pronunciation: dataToSave.pronunciation,
                    full_feedback: dataToSave 
                });
            } else {
                const historyItem = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }), 
                    ...dataToSave 
                };
                const existingHistory = JSON.parse(localStorage.getItem("ielts4our_history") || "[]");
                const updatedHistory = [...existingHistory, historyItem].slice(-30); 
                localStorage.setItem("ielts4our_history", JSON.stringify(updatedHistory));
            }
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    if (practiceMode === 'cue-card') {
        if (!isPremium) await handleQuotaConsumption('cue-card');
        const currentCueTitle = dailyCueRef.current.topic;
        const finalResult = { ...data, topic: data.topic || currentCueTitle };
        setAnalysisResult(finalResult);
        saveData(finalResult);
    }
  };

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setGuiltMessage(GUILT_MESSAGES[Math.floor(Math.random() * GUILT_MESSAGES.length)]);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const handleModeSwitch = (mode) => {
    // Kita longgarkan logic switch tab agar user bisa melihat Hero Card (Teaser)
    // Validasi ketat dilakukan saat user klik tombol "Start" di dalam card masing-masing
    setPracticeMode(mode);
    setAnalysisResult(null); 
  };

  const handleMarketingCardClick = (mode) => {
    if (mode === 'full-simulation') {
        handleModeSwitch('full-simulation');
    } else if (mode === 'mock-interview' || mode === 'quick-test') {
        handleModeSwitch('mock-interview'); // Maps to Quick Test UI
    } else {
        handleModeSwitch(mode);
    }
    if (heroRef.current) heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- NEW: QUICK TEST HERO CARD ---
  const QuickTestHeroCard = () => (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 min-h-[450px] flex flex-col justify-center items-center text-center border border-purple-500/30 shadow-lg bg-[#1A1D26]">
        <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">
                <Users className="w-3 h-3" /> Popular Feature
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-[#E6E8EE] tracking-tight leading-tight">
                Interactive <br/> 
                <span className="text-purple-400">Quick Test</span>
            </h2>
            
            <p className="text-slate-400 text-lg leading-relaxed">
                Short on time? Jump straight to <strong>Part 3 (Discussion)</strong>. <br/>
                Experience a realistic dialogue with AI Examiner in just 5 minutes.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left my-8">
                {[
                    { val: "3-5m", lbl: "Duration", col: "text-purple-400" },
                    { val: "Part 3", lbl: "Focus", col: "text-purple-400" },
                    { val: "AI", lbl: "Examiner", col: "text-purple-400" },
                    { val: "1 🪙", lbl: "Cost", col: "text-slate-300" }
                ].map((item, i) => (
                      <div key={i} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <div className={`${item.col} font-bold text-xl mb-1`}>{item.val}</div>
                        <div className="text-slate-500 text-xs uppercase font-bold">{item.lbl}</div>
                    </div>
                ))}
            </div>

            <Link href="/simulation?mode=quick">
                <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1">
                    <span>Start Quick Test</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
            
            <p className="text-xs text-slate-500 mt-4">Requires 1 Token per session.</p>
        </div>
    </div>
  );

  // --- PREMIUM HERO CARD (Full Test) ---
  const PremiumHeroCard = () => (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 min-h-[450px] flex flex-col justify-center items-center text-center border border-slate-700/50 shadow-lg bg-[#1A1D26]">
        <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">
                <Sparkles className="w-3 h-3" /> Premium Feature
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-[#E6E8EE] tracking-tight leading-tight">
                Full IELTS Speaking <br/> 
                <span className="text-blue-400">Simulation Test</span>
            </h2>
            
            <p className="text-slate-400 text-lg leading-relaxed">
                Experience the real exam format. Complete Part 1, 2, and 3 in one go with our AI Examiner. Get a comprehensive Band 9.0 analysis.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left my-8">
                {[
                    { val: "15m", lbl: "Duration", col: "text-blue-400" },
                    { val: "3 Parts", lbl: "Format", col: "text-blue-400" },
                    { val: "AI", lbl: "Examiner", col: "text-blue-400" },
                    { val: "3 🪙", lbl: "Cost", col: "text-slate-300" }
                ].map((item, i) => (
                      <div key={i} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <div className={`${item.col} font-bold text-xl mb-1`}>{item.val}</div>
                        <div className="text-slate-500 text-xs uppercase font-bold">{item.lbl}</div>
                    </div>
                ))}
            </div>

            <Link href="/simulation?mode=full">
                <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1">
                    <span>Enter Exam Room</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
            
            <p className="text-xs text-slate-500 mt-4">Requires 3 Tokens per session.</p>
        </div>
    </div>
  );

  const LimitReachedView = ({ type }) => (
    <div className="bg-[#1A1D26] border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <div className="text-red-400"><AlertTriangle className="w-8 h-8" /></div>
        </div>
        <h3 className="text-xl font-bold text-[#E6E8EE] mb-2">
            {type === 'guest_limit' ? "Trial Quota Exceeded" : "Daily Limit Reached"}
        </h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
            {type === 'guest_limit' ? "You've used your 1x free guest trial." : "You've used your 2x free daily limit."}
        </p>
        
        {type === 'guest_limit' ? (
            <Link href="/auth">
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Login for Free
                </button>
            </Link>
        ) : (
            <button 
                onClick={() => setShowUpgradeModal(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg"
            >
                <Crown className="w-4 h-4" /> Upgrade Unlimited
            </button>
        )}
    </div>
  );

  return (
    // ✨✨✨ BACKGROUND: CLEAN CALM DARK GRADIENT (NO GRID/NOISE) ✨✨✨
    <main className="min-h-screen pb-20 px-4 bg-gradient-to-b from-[#0F1117] to-[#151824] selection:bg-blue-500/30 selection:text-blue-200 font-sans relative overflow-hidden">
      
      {/* Content Wrapper */}
      <div className="relative z-10">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center py-8 max-w-5xl mx-auto gap-4">
            <div className="flex items-center gap-3">
            <div className="relative w-32 h-10 md:w-40 md:h-12">
                <Image src="/logo-white.png" alt="IELTS4our Logo" fill className="object-contain object-center md:object-left" priority />
            </div>
            <Link href="/about" className="hidden md:block ml-2 text-sm font-medium text-slate-400 hover:text-white transition-colors tracking-wide">Meet the Creator</Link>
            {isPremium && (
                <span className="ml-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest rounded-full">Pro</span>
            )}
            </div>

          <div className="flex items-center gap-3">
            {userProfile ? (
                <>
                    {/* 1. TOKEN BADGE (Tampilan Saldo) */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full mr-1">
                        <span className="text-yellow-400 text-sm">🪙</span>
                        <span className="text-slate-200 text-xs font-bold tabular-nums">
                            {userProfile.token_balance || 0}
                        </span>
                    </div>

                    {/* 2. TOMBOL TOP UP (Selalu Muncul untuk User Login) */}
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => setShowUpgradeModal(true)} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xs md:text-sm flex items-center gap-1 transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" /> Top Up
                    </motion.button>

                    {/* 3. USER MENU DROPDOWN (Existing) */}
                    <div className="relative" ref={userMenuRef}>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-200 transition-all text-sm font-medium flex items-center gap-2"
                        >
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="max-w-[80px] truncate hidden md:block">{userProfile.email?.split('@')[0]}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                        </motion.button>
                        
                        {/* Dropdown Content */}
                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 bg-[#1A1D26] border border-slate-800 rounded-xl shadow-xl overflow-hidden py-1 z-50"
                                >
                                    <div className="px-4 py-3 border-b border-slate-800">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">My Wallet</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-bold text-white">Token Balance</p>
                                            <p className="text-sm font-bold text-yellow-400">{userProfile.token_balance || 0} 🪙</p>
                                        </div>
                                    </div>
                                    <Link href="/progress" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors">
                                        <BarChart3 className="w-4 h-4 text-blue-400" /> My Progress
                                    </Link>
                                    <Link href="/mission" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors">
                                        <Info className="w-4 h-4 text-blue-400" /> Why Speaking?
                                    </Link>
                                    <div className="h-px bg-slate-800 my-1"></div>
                                    <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-sm text-slate-400 hover:text-red-400 transition-colors text-left">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            ) : (
                <Link href="/auth">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-300 hover:text-white transition-colors text-xs font-bold">Login</motion.button>
                </Link>
            )}
            </div>
        </header>

        {/* HERO SECTION */}
        <div ref={heroRef} className="text-center max-w-3xl mx-auto mt-6 mb-12 scroll-mt-24">
            <Link href="/mission">
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1D26] hover:bg-[#252936] border border-slate-800 text-slate-300 text-xs font-medium mb-6 cursor-pointer transition-all"
            >
                <span className="text-blue-400">💡</span> 
                <span>Why is Speaking the hardest skill?</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
            </motion.div>
            </Link>
            
            <h2 className="text-4xl md:text-6xl font-bold text-[#E6E8EE] mb-6 leading-tight tracking-tight">
            Master Your Speaking <br/>
            <span className="text-blue-400">With IELTS4our</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            {isPremium ? "Nikmati akses tanpa batas, durasi lebih panjang, dan jawaban Band 8.0." : "Latihan setiap hari, dapatkan skor instan, dan perbaiki grammar secara otomatis."}
            </p>
        </div>

        {/* UI TAB SWITCHER (Clean Solid) */}
        <div className="max-w-md mx-auto mb-12 bg-[#1A1D26] p-1 rounded-full border border-slate-800 flex relative shadow-sm">
            <button onClick={() => handleModeSwitch("cue-card")} className={`flex-1 py-2 px-3 rounded-full text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "cue-card" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}>
                <Mic2 className="w-3.5 h-3.5" /> Cue Card
            </button>
            <button onClick={() => handleModeSwitch("mock-interview")} className={`flex-1 py-2 px-3 rounded-full text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "mock-interview" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}>
                <Users className="w-3.5 h-3.5" /> Quick Test
            </button>
            <button onClick={() => handleModeSwitch("full-simulation")} className={`flex-1 py-2 px-3 rounded-full text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "full-simulation" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}>
                <Sparkles className="w-3.5 h-3.5" /> Full Test
            </button>
        </div>

        {/* CONTENT AREA */}
        <div className="max-w-4xl mx-auto space-y-12">
            <motion.div initial={{ scale: 0.99, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
            
            {/* --- DISPLAY BASED ON MODE --- */}
            
            {/* 1. FULL SIMULATION HERO */}
            {practiceMode === "full-simulation" && <PremiumHeroCard />}

            {/* 2. QUICK TEST HERO */}
            {practiceMode === "mock-interview" && <QuickTestHeroCard />}

            {/* 3. CUE CARD RECORDER (EXISTING LOGIC) */}
            {practiceMode === "cue-card" && (
                <div className="relative bg-[#1A1D26] border border-slate-800 rounded-3xl p-8 md:p-12 overflow-hidden min-h-[500px] flex flex-col justify-center shadow-xl">
                
                {/* MODE 1: CUE CARD */}
                {!analysisResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                    {CUE_CARDS.indexOf(dailyCue) >= 30 ? <Crown className="w-6 h-6 text-blue-400" /> : <BookOpen className="w-6 h-6 text-blue-400" />}
                                </div>
                                <div>
                                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                                    {CUE_CARDS.indexOf(dailyCue) >= 30 ? "Premium Topic" : "Todays Topic"}
                                    </h3>
                                    <div className="text-[#E6E8EE] font-bold flex items-center gap-2">IELTS Cue Card</div>
                                </div>
                            </div>
                            <button onClick={randomizeCue} className="p-3 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-all group"><RefreshCw className={`w-5 h-5 ${isRotating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} /></button>
                        </div>
                        <div className="text-center mb-10">
                            <p className="text-2xl md:text-3xl font-bold text-[#E6E8EE] leading-snug mb-8">"{dailyCue.topic}"</p>
                            <div className="inline-block text-left bg-slate-800/30 p-6 md:p-8 rounded-2xl border border-slate-800">
                            <p className="text-blue-400 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2"><ArrowRight className="w-4 h-4" /> You can say:</p>
                            <ul className="space-y-3">{dailyCue.points?.map((point, index) => (<li key={index} className="flex items-start gap-3 text-slate-300 text-sm md:text-base"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-2 shrink-0"></span>{point}</li>))}</ul>
                            </div>
                        </div>
                        
                        {dailyCueQuotaStatus === 'allowed' ? (
                            <Recorder 
                                cueCard={dailyCue.topic} 
                                onAnalysisComplete={handleAnalysisComplete} 
                                maxDuration={isPremium ? 120 : 60} 
                                mode={practiceMode} 
                                difficulty="medium" 
                            />
                        ) : (
                            <LimitReachedView type={dailyCueQuotaStatus} />
                        )}
                    </motion.div>
                )}

                {/* RESULT AREA FOR CUE CARD */}
                {analysisResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#E6E8EE]">Analysis Result</h2>
                            <button 
                                onClick={() => { setAnalysisResult(null); handleModeSwitch(practiceMode); }} 
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm text-white font-medium transition-all"
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
            )}
            
            </motion.div>
        </div>
      
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} userProfile={userProfile} onUpgradeSuccess={() => { setIsPremium(true); setShowUpgradeModal(false); randomizeCue(); }} />
        <AlertModal isOpen={alertConfig.isOpen} onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} {...alertConfig} />
        {showLogoutModal && (
            <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1A1D26] border border-slate-800 p-8 rounded-3xl max-w-sm text-center shadow-2xl relative">
                    <div className="text-6xl mb-4 animate-bounce">{guiltMessage.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{guiltMessage.title}</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed">{guiltMessage.text}</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => setShowLogoutModal(false)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">NO, I WANT BAND 8.0!</button>
                        <button onClick={confirmLogout} className="text-xs text-slate-500 hover:text-red-400 mt-2 transition-colors">I give up, let me sleep...</button>
                    </div>
                </motion.div>
            </div>
        )}

        <MarketingSection onSelectMode={handleMarketingCardClick} />
        <FAQSection isTeaser={true} />

        <footer className="text-center mt-24 pb-10 text-slate-500 text-xs md:text-sm border-t border-slate-800 pt-8">
            <p className="mb-4">&copy; 2025 Ielts4our. Created with ❤️ by <Link href="/about" className="hover:text-blue-400 transition-colors">Luthfi Baihaqi</Link>.</p>
            <p><Link href="/terms" className="underline decoration-slate-700 hover:decoration-blue-400 hover:text-blue-400 transition-all">Terms & Conditions</Link></p>
        </footer>
      </div>

    </main>
  );
}