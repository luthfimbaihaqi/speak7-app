"use client";

import React, { useState, useEffect, useRef, Suspense } from "react"; 
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Sparkles, RefreshCw, Crown, ArrowRight, Lock, 
  BarChart3, ChevronRight, Mic2, Users, Volume2, Unlock, 
  Filter, AlertTriangle, LogIn, ChevronDown, LogOut, User, Zap, Clock, Plus, Menu, X, Gift, Quote,
  PenLine, FileText, Info
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient"; 
import Image from "next/image";
import { CUE_CARDS, PART3_TOPICS, GUILT_MESSAGES } from "@/utils/constants";
import UniversityBanner from "@/components/UniversityBanner";
import TestimonialSection from "@/components/TestimonialSection";
import MarketingSection from "@/components/MarketingSection";
import BlogLatestSection from "@/components/BlogLatestSection";
import UpgradeModal from "@/components/UpgradeModal";
import AlertModal from "@/components/AlertModal"; 
import FAQSection from "@/components/FAQSection"; 
import TestimonialModal from "@/components/TestimonialModal";
import Confetti from "react-confetti"; 

import Recorder from "@/components/Recorder";
import ScoreCard from "@/components/ScoreCard";

function WelcomeListener({ setShowWelcomeModal }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
        setShowWelcomeModal(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, setShowWelcomeModal]);

  return null;
}

// 🎨 V3: ABSTRACT GEOMETRIC SHAPES — Mix of blobs + line-based shapes
const AbstractShapes = () => (
  <>
    {/* === ORGANIC BLOBS (existing, kept) === */}
    
    {/* Top-left organic blob */}
    <svg 
      className="absolute top-[8%] left-[5%] w-16 h-16 md:w-24 md:h-24 opacity-90 -rotate-12"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <path 
        d="M 50 10 Q 80 15 85 45 Q 90 75 60 85 Q 25 90 15 60 Q 10 30 50 10 Z"
        fill="#D17A5C"
      />
    </svg>

    {/* 🔥 V3 REPLACED: Was blue star, now diagonal dashed line */}
    <svg 
      className="absolute top-[10%] right-[6%] w-24 h-24 md:w-32 md:h-32 opacity-70 rotate-[25deg]"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <line 
        x1="10" y1="50" x2="90" y2="50" 
        stroke="#4A6B8F" 
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
      />
    </svg>

    {/* Top-center small dashed circle */}
    <svg 
      className="hidden md:block absolute top-[18%] left-[20%] w-14 h-14 opacity-70"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <circle 
        cx="50" cy="50" r="40" 
        fill="none" 
        stroke="#8FA68E" 
        strokeWidth="3"
        strokeDasharray="8 6"
      />
    </svg>

    {/* Mid-right wavy line */}
    <svg 
      className="hidden md:block absolute top-[35%] right-[5%] w-32 h-12 opacity-60 -rotate-6"
      viewBox="0 0 200 50"
      aria-hidden
    >
      <path 
        d="M 5 25 Q 30 5 55 25 T 105 25 T 155 25 T 195 25"
        fill="none"
        stroke="#C9974C"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>

    {/* Mid-left plus signs cluster */}
    <svg 
      className="hidden md:block absolute top-[40%] left-[3%] w-20 h-20 opacity-70"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <g stroke="#D17A5C" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="32" />
        <line x1="14" y1="26" x2="26" y2="26" />
        <line x1="70" y1="50" x2="70" y2="64" />
        <line x1="63" y1="57" x2="77" y2="57" />
        <line x1="35" y1="75" x2="35" y2="85" />
        <line x1="30" y1="80" x2="40" y2="80" />
      </g>
    </svg>

    {/* Mid-right small organic blob */}
    <svg 
      className="absolute top-[50%] right-[10%] w-10 h-10 md:w-14 md:h-14 opacity-85 rotate-45"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <path 
        d="M 50 15 Q 75 20 80 50 Q 85 80 50 85 Q 20 80 20 50 Q 25 20 50 15 Z"
        fill="#8FA68E"
      />
    </svg>

    {/* Bottom-left arrow accent */}
    <svg 
      className="hidden md:block absolute bottom-[15%] left-[8%] w-16 h-16 opacity-70 -rotate-12"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <g stroke="#4A6B8F" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="20" y1="80" x2="80" y2="20" />
        <polyline points="50,20 80,20 80,50" />
      </g>
    </svg>

    {/* Bottom-right triangle */}
    <svg 
      className="absolute bottom-[20%] right-[4%] w-12 h-12 md:w-20 md:h-20 opacity-75 rotate-[20deg]"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <path 
        d="M 50 15 L 85 80 L 15 80 Z"
        fill="#C9974C"
      />
    </svg>

    {/* Far left tiny dashed shape */}
    <svg 
      className="absolute top-[60%] left-[2%] w-8 h-8 md:w-10 md:h-10 opacity-60 rotate-45"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <rect 
        x="20" y="20" width="60" height="60" 
        fill="none" 
        stroke="#8FA68E" 
        strokeWidth="3"
        strokeDasharray="6 4"
      />
    </svg>

    {/* === V3 NEW LINE-BASED SHAPES === */}

    {/* 🔥 NEW 1: Long curved squiggle (top-center) */}
    <svg 
      className="hidden md:block absolute top-[5%] left-[35%] w-40 h-16 opacity-55 rotate-[8deg]"
      viewBox="0 0 200 60"
      aria-hidden
    >
      <path 
        d="M 10 30 Q 35 5 60 30 T 110 30 T 160 30 T 195 25"
        fill="none"
        stroke="#D17A5C"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
    </svg>

    {/* 🔥 NEW 2: Concentric arcs (mid-left, below hero) */}
    <svg 
      className="hidden md:block absolute top-[55%] left-[12%] w-20 h-20 opacity-60"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <g fill="none" stroke="#4A6B8F" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 30 50 Q 50 30 70 50" />
        <path d="M 25 55 Q 50 25 75 55" />
        <path d="M 20 60 Q 50 20 80 60" />
      </g>
    </svg>

    {/* 🔥 NEW 3: Tally marks / parallel lines (bottom-center) */}
    <svg 
      className="hidden md:block absolute bottom-[35%] right-[25%] w-16 h-16 opacity-65 rotate-[15deg]"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <g stroke="#8FA68E" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="80" />
        <line x1="35" y1="20" x2="35" y2="80" />
        <line x1="50" y1="20" x2="50" y2="80" />
        <line x1="65" y1="20" x2="65" y2="80" />
        <line x1="10" y1="50" x2="75" y2="50" />
      </g>
    </svg>

    {/* 🔥 NEW 4: Crossed strokes / X mark (bottom-left, near footer area) */}
    <svg 
      className="absolute bottom-[8%] right-[15%] w-12 h-12 md:w-16 md:h-16 opacity-55 -rotate-[8deg]"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <g stroke="#D17A5C" strokeWidth="3" strokeLinecap="round">
        <line x1="25" y1="25" x2="75" y2="75" />
        <line x1="75" y1="25" x2="25" y2="75" />
        <line x1="50" y1="15" x2="50" y2="85" />
      </g>
    </svg>

    {/* 🔥 NEW 5: Small curved lines / brackets (mid area, right side) */}
    <svg 
      className="hidden md:block absolute top-[28%] right-[20%] w-12 h-12 opacity-60 rotate-[12deg]"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <g fill="none" stroke="#C9974C" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 30 20 Q 20 50 30 80" />
        <path d="M 70 20 Q 80 50 70 80" />
      </g>
    </svg>

  </>
);

export default function Home() {
  const router = useRouter(); 
  const heroRef = useRef(null); 
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
  
  const [dailyCueQuotaStatus, setDailyCueQuotaStatus] = useState('allowed'); 

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  const [selectedSkill, setSelectedSkill] = useState("speaking");
  const [practiceMode, setPracticeMode] = useState("full"); 
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); 
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [guiltMessage, setGuiltMessage] = useState(GUILT_MESSAGES[0]);
  
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false, type: "success", title: "", message: "", actionLabel: "", onAction: null
  });

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
    setIsMobileMenuOpen(false); 
    setGuiltMessage(GUILT_MESSAGES[Math.floor(Math.random() * GUILT_MESSAGES.length)]);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const handleModeSwitch = (mode) => {
    setPracticeMode(mode);
    setAnalysisResult(null); 
  };

  const handleSkillSwitch = (skill) => {
    setSelectedSkill(skill);
    setAnalysisResult(null);
    if (skill === "speaking") {
      setPracticeMode("full");
    } else {
      setPracticeMode("writing-single");
    }
  };

  const handleMarketingCardClick = (mode) => {
    if (mode === 'full') {
        setSelectedSkill("speaking");
        handleModeSwitch('full');
    } else if (mode === 'quick' || mode === 'quick-test') {
        setSelectedSkill("speaking");
        handleModeSwitch('quick'); 
    } else {
        setSelectedSkill("speaking");
        handleModeSwitch(mode);
    }
    if (heroRef.current) heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- MODE CARDS (preserved structure) ---
  const QuickTestHeroCard = () => (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 min-h-[450px] flex flex-col justify-center items-center text-center border border-[#1A1A1A]/10 shadow-sm bg-[#D17A5C]">
        <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1A]/10 border border-[#1A1A1A]/20 text-[#1A1A1A] text-xs font-bold uppercase tracking-widest mb-2">
                 Quick Test
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight leading-tight font-display">
                Interactive <br/> Quick Test
            </h2>
            <p className="text-[#1A1A1A]/80 text-lg leading-relaxed">
                Short on time? Jump straight to <strong>Part 3 (Discussion)</strong>. <br/>
                Experience a realistic dialogue in just 5 minutes.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left my-8">
                {[
                    { val: "3-5m", lbl: "Duration" },
                    { val: "Part 3", lbl: "Focus" },
                    { val: "Detailed", lbl: "Feedback" },
                    { val: "1 🪙", lbl: "Cost" }
                ].map((item, i) => (
                      <div key={i} className="bg-[#FAF6EC] p-4 rounded-xl border border-[#1A1A1A]/10">
                        <div className="text-[#1A1A1A] font-bold text-xl mb-1">{item.val}</div>
                        <div className="text-[#525252] text-xs uppercase font-bold">{item.lbl}</div>
                    </div>
                ))}
            </div>
            <Link href="/simulation?mode=quick">
                <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] hover:bg-[#000000] text-white rounded-full font-bold text-lg transition-all shadow-lg hover:-translate-y-0.5">
                    <span>Start Quick Test</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
            <p className="text-xs text-[#1A1A1A]/70 mt-4">Requires 1 Token per session.</p>
        </div>
    </div>
  );

  const PremiumHeroCard = () => (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 min-h-[450px] flex flex-col justify-center items-center text-center border border-[#1A1A1A]/10 shadow-sm bg-[#4A6B8F]">
        <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest mb-2">
                 Full Test
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight font-display">
                Full IELTS Speaking <br/> Simulation Test
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
                Experience the real exam format. Complete Part 1, 2, and 3 in one go. Get a comprehensive Band 8.0 analysis.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left my-8">
                {[
                    { val: "15m", lbl: "Duration" },
                    { val: "3 Parts", lbl: "Format" },
                    { val: "Detailed", lbl: "Feedback" },
                    { val: "3 🪙", lbl: "Cost" }
                ].map((item, i) => (
                      <div key={i} className="bg-[#FAF6EC] p-4 rounded-xl border border-[#1A1A1A]/10">
                        <div className="text-[#1A1A1A] font-bold text-xl mb-1">{item.val}</div>
                        <div className="text-[#525252] text-xs uppercase font-bold">{item.lbl}</div>
                    </div>
                ))}
            </div>
            <Link href="/simulation?mode=full">
                <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] hover:bg-[#000000] text-white rounded-full font-bold text-lg transition-all shadow-lg hover:-translate-y-0.5">
                    <span>Enter Exam Room</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
            <p className="text-xs text-white/80 mt-4">Requires 3 Tokens per session.</p>
        </div>
    </div>
  );

  const WritingSingleTaskCard = () => (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 min-h-[450px] flex flex-col justify-center items-center text-center border border-[#1A1A1A]/10 shadow-sm bg-[#8FA68E]">
        <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest mb-2">
                 Writing Practice
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight font-display">
                Single Task <br/> Practice Mode
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
                Focus on one task. No time pressure. <br/>
                Perfect for learning and gradual improvement.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left my-8">
                {[
                    { val: "No Limit", lbl: "Duration" },
                    { val: "1 Task", lbl: "Focus" },
                    { val: "Detailed", lbl: "Feedback" },
                    { val: "Free", lbl: "Cost" }
                ].map((item, i) => (
                      <div key={i} className="bg-[#FAF6EC] p-4 rounded-xl border border-[#1A1A1A]/10">
                        <div className="text-[#1A1A1A] font-bold text-xl mb-1">{item.val}</div>
                        <div className="text-[#525252] text-xs uppercase font-bold">{item.lbl}</div>
                    </div>
                ))}
            </div>
            <Link href="/writing/academic">
                <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] hover:bg-[#000000] text-white rounded-full font-bold text-lg transition-all shadow-lg hover:-translate-y-0.5">
                    <span>Explore Practice</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
            <p className="text-xs text-white/80 mt-4">Pick from Academic or General Training topics.</p>
        </div>
    </div>
  );

  const WritingFullTestCard = () => (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 min-h-[450px] flex flex-col justify-center items-center text-center border border-[#1A1A1A]/10 shadow-sm bg-[#C9974C]">
        <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1A]/10 border border-[#1A1A1A]/20 text-[#1A1A1A] text-xs font-bold uppercase tracking-widest mb-2">
                 Writing Full Test
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight leading-tight font-display">
                Full IELTS Writing <br/> Simulation Test
            </h2>
            <p className="text-[#1A1A1A]/80 text-lg leading-relaxed">
                60 minutes. Task 1 + Task 2. <br/>
                Real exam conditions. Test your time management.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left my-8">
                {[
                    { val: "60m", lbl: "Duration" },
                    { val: "2 Tasks", lbl: "Format" },
                    { val: "Detailed", lbl: "Feedback" },
                    { val: "Free", lbl: "Cost" }
                ].map((item, i) => (
                      <div key={i} className="bg-[#FAF6EC] p-4 rounded-xl border border-[#1A1A1A]/10">
                        <div className="text-[#1A1A1A] font-bold text-xl mb-1">{item.val}</div>
                        <div className="text-[#525252] text-xs uppercase font-bold">{item.lbl}</div>
                    </div>
                ))}
            </div>
            <Link href="/writing/academic">
                <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] hover:bg-[#000000] text-white rounded-full font-bold text-lg transition-all shadow-lg hover:-translate-y-0.5">
                    <span>Start Full Test</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
            <p className="text-xs text-[#1A1A1A]/70 mt-4">Pick from Academic or General Training topics.</p>
        </div>
    </div>
  );

  const LimitReachedView = ({ type }) => (
    <div className="bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-16 h-16 bg-[#D17A5C]/10 rounded-full flex items-center justify-center mb-4 border border-[#D17A5C]/30">
            <div className="text-[#D17A5C]"><AlertTriangle className="w-8 h-8" /></div>
        </div>
        <h3 className="text-xl font-black text-[#1A1A1A] mb-2 font-display">
            {type === 'guest_limit' ? "Trial Quota Exceeded" : "Daily Limit Reached"}
        </h3>
        <p className="text-[#525252] text-sm mb-6 max-w-xs leading-relaxed">
            {type === 'guest_limit' ? "You've used your 1x free guest trial." : "You've used your 2x free daily limit."}
        </p>
        {type === 'guest_limit' ? (
            <Link href="/auth">
                <button className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full transition-all flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Login for Free
                </button>
            </Link>
        ) : (
            <button onClick={() => setShowUpgradeModal(true)} className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg">
                <Crown className="w-4 h-4" /> Upgrade Unlimited
            </button>
        )}
    </div>
  );

  return (
    <>
      {/* 🎨 Lexend font import + custom font-display class */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        
        body, html {
          font-family: 'Lexend', system-ui, -apple-system, sans-serif;
        }
        
        .font-display {
          font-family: 'Lexend', system-ui, -apple-system, sans-serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <main className="min-h-screen pb-20 px-4 bg-[#F8F5EE] selection:bg-[#D17A5C]/30 selection:text-[#1A1A1A] relative overflow-hidden">
        
        {/* Abstract geometric shapes scattered (decorative background) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AbstractShapes />
        </div>
        
        {/* Content Wrapper */}
        <div className="relative z-10">

          <Suspense fallback={null}>
              <WelcomeListener setShowWelcomeModal={setShowWelcomeModal} />
          </Suspense>

          {/* --- HEADER --- */}
          <header className="flex flex-col md:flex-row justify-between items-center py-8 max-w-5xl mx-auto gap-4 relative">
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                  <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-[#1A1A1A] hover:bg-[#1A1A1A]/5 rounded-lg">
                      <Menu className="w-6 h-6" />
                  </button>
                  
                  {/* 🔥 V3: Logo bigger + CSS filter invert untuk dark version */}
                  <div className="relative w-20 h-16 md:w-24 md:h-20">
                      <Image 
                        src="/logo-white.png" 
                        alt="IELTS4our Logo" 
                        fill 
                        className="object-contain object-center md:object-left invert" 
                        priority 
                      />
                  </div>

                  <Link href="/about" className="hidden md:block">
                      <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-5 py-2.5 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 border border-[#1A1A1A]/10 rounded-full transition-colors text-xs font-bold cursor-pointer ml-2"
                      >
                          <span className="text-[#1A1A1A]">About</span>
                          <span className="text-[#D17A5C] ml-1">IELTS4our</span>
                      </motion.div>
                  </Link>

                  <Link href="/blog" className="hidden md:block">
                      <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-5 py-2.5 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 border border-[#1A1A1A]/10 rounded-full transition-colors text-xs font-bold cursor-pointer ml-1"
                      >
                          <span className="text-[#1A1A1A]">Blog</span>
                      </motion.div>
                  </Link>

                  <div className="w-8 md:hidden"></div> 
              </div>

              <div className="hidden md:flex items-center gap-3">
                  {userProfile ? (
                      <>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 rounded-full mr-1">
                              <span className="text-[#C9974C] text-sm">🪙</span>
                              <span className="text-[#1A1A1A] text-xs font-bold tabular-nums">{userProfile.token_balance || 0}</span>
                          </div>
                          <motion.button 
                              whileHover={{ scale: 1.05 }} 
                              whileTap={{ scale: 0.95 }} 
                              onClick={() => setShowUpgradeModal(true)} 
                              className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full text-xs md:text-sm flex items-center gap-1 transition-all shadow-md"
                          >
                              <Plus className="w-4 h-4" /> Top Up
                          </motion.button>
                          <div className="relative" ref={userMenuRef}>
                              <motion.button 
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                  className="px-3 py-2 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 border border-[#1A1A1A]/10 rounded-full text-[#1A1A1A] transition-all text-sm font-medium flex items-center gap-2"
                              >
                                  {userProfile?.user_metadata?.avatar_url ? (
                                      <div className="relative w-5 h-5 rounded-full overflow-hidden border border-[#1A1A1A]/20">
                                          <Image src={userProfile.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                                      </div>
                                  ) : (
                                      <User className="w-4 h-4 text-[#D17A5C]" />
                                  )}
                                  <span className="max-w-[80px] truncate">{userProfile.email?.split('@')[0]}</span>
                                  <ChevronDown className={`w-4 h-4 text-[#525252] transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                              </motion.button>
                              <AnimatePresence>
                                  {isUserMenuOpen && (
                                      <motion.div 
                                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                          className="absolute right-0 mt-2 w-56 bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-2xl shadow-xl overflow-hidden py-1 z-50"
                                      >
                                          <div className="px-4 py-3 border-b border-[#1A1A1A]/10">
                                              <p className="text-[10px] text-[#525252] uppercase font-bold tracking-widest mb-1">My Wallet</p>
                                              <div className="flex justify-between items-center">
                                                  <p className="text-xs font-bold text-[#1A1A1A]">Token Balance</p>
                                                  <p className="text-sm font-bold text-[#C9974C]">{userProfile.token_balance || 0} 🪙</p>
                                              </div>
                                          </div>
                                          <Link href="/progress" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A]/5 text-sm text-[#1A1A1A] transition-colors">
                                              <BarChart3 className="w-4 h-4 text-[#4A6B8F]" /> My Progress
                                          </Link>
                                          <Link href="/mission" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A]/5 text-sm text-[#1A1A1A] transition-colors">
                                              <BookOpen className="w-4 h-4 text-[#8FA68E]" /> Speaking Guide
                                          </Link>
                                          <div className="h-px bg-[#1A1A1A]/10 my-1"></div>
                                          <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#D17A5C]/10 text-sm text-[#525252] hover:text-[#D17A5C] transition-colors text-left">
                                              <LogOut className="w-4 h-4" /> Logout
                                          </button>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      </>
                  ) : (
                      <Link href="/auth">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white rounded-full transition-colors text-xs font-bold">Login</motion.button>
                      </Link>
                  )}
              </div>
          </header>

          {/* --- MOBILE DRAWER MENU --- */}
          <AnimatePresence>
              {isMobileMenuOpen && (
                  <>
                      <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm z-40 md:hidden"
                      />
                      
                      <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: 0 }}
                          exit={{ x: "-100%" }}
                          transition={{ type: "spring", damping: 25, stiffness: 200 }}
                          className="fixed inset-y-0 left-0 w-[280px] bg-[#FAF6EC] border-r border-[#1A1A1A]/10 z-50 p-6 flex flex-col md:hidden"
                      >
                          <div className="flex items-center justify-between mb-8">
                              {/* 🔥 V3: Mobile drawer logo dengan invert filter */}
                              <div className="relative w-16 h-12">
                                  <Image 
                                    src="/logo-white.png" 
                                    alt="Logo" 
                                    fill 
                                    className="object-contain object-left invert" 
                                  />
                              </div>
                              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#525252] hover:text-[#1A1A1A] bg-[#1A1A1A]/5 rounded-full">
                                  <X className="w-5 h-5" />
                              </button>
                          </div>

                          <div className="flex-1 space-y-6 overflow-y-auto">
                              {userProfile ? (
                                  <>
                                      <div className="bg-[#F8F5EE] p-4 rounded-2xl border border-[#1A1A1A]/10">
                                          <div className="flex items-center gap-3 mb-3">
                                              {userProfile?.user_metadata?.avatar_url ? (
                                                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#1A1A1A]/20">
                                                      <Image src={userProfile.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                                                  </div>
                                              ) : (
                                                  <div className="w-10 h-10 bg-[#4A6B8F] rounded-full flex items-center justify-center text-white font-bold">
                                                      {userProfile.email?.charAt(0).toUpperCase()}
                                                  </div>
                                              )}
                                              <div>
                                                  <p className="text-sm font-bold text-[#1A1A1A] truncate max-w-[140px]">{userProfile.email?.split('@')[0]}</p>
                                              </div>
                                          </div>
                                          <div className="flex justify-between items-center bg-[#FAF6EC] p-3 rounded-lg">
                                              <span className="text-xs text-[#525252]">Balance</span>
                                              <span className="text-sm font-bold text-[#C9974C]">{userProfile.token_balance || 0} Tokens</span>
                                          </div>
                                          <button 
                                              onClick={() => { setShowUpgradeModal(true); setIsMobileMenuOpen(false); }}
                                              className="w-full mt-3 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2"
                                          >
                                              <Plus className="w-3 h-3" /> Top Up Tokens
                                          </button>
                                      </div>

                                      <nav className="space-y-2">
                                          <Link href="/progress" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">
                                              My Progress
                                          </Link>
                                          <Link href="/about" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">
                                              About IELTS4our
                                          </Link>
                                          <Link href="/blog" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">
                                              Blog
                                          </Link>
                                          <Link href="/faq" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">
                                              FAQ
                                          </Link>
                                      </nav>
                                  </>
                              ) : (
                                  <div className="flex flex-col h-full">
                                      <div className="bg-[#F8F5EE] p-5 rounded-2xl border border-[#1A1A1A]/10 text-center mb-6">
                                          <div className="w-12 h-12 bg-[#D17A5C]/15 text-[#D17A5C] rounded-full flex items-center justify-center mx-auto mb-3">
                                              <LogIn className="w-6 h-6" />
                                          </div>
                                          <h3 className="text-[#1A1A1A] font-bold mb-1">Guest User</h3>
                                          <p className="text-[#525252] text-xs mb-4">Login to save progress & get 4 free tokens.</p>
                                          
                                          <Link href="/auth">
                                              <button className="w-full py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-lg transition-all shadow-md">
                                                  Login / Register
                                              </button>
                                          </Link>
                                          <p className="text-[10px] text-[#525252] mt-2">
                                              New? Get <span className="text-[#C9974C] font-bold">4 Free Tokens</span>
                                          </p>
                                      </div>

                                      <div className="h-px bg-[#1A1A1A]/10 mb-6"></div>

                                      <nav className="space-y-2">
                                          <Link href="/about" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">
                                              About IELTS4our
                                          </Link>
                                          <Link href="/blog" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">
                                              Blog
                                          </Link>
                                          <Link href="/faq" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">
                                              FAQ
                                          </Link>
                                      </nav>
                                  </div>
                              )}
                          </div>

                          {userProfile && (
                              <div className="pt-6 border-t border-[#1A1A1A]/10">
                                  <button onClick={handleLogoutClick} className="w-full flex items-center justify-center gap-2 py-3 text-[#D17A5C] hover:bg-[#D17A5C]/10 rounded-xl transition-colors font-medium">
                                      <LogOut className="w-5 h-5" /> Sign Out
                                  </button>
                              </div>
                          )}
                      </motion.div>
                  </>
              )}
          </AnimatePresence>

          {/* HERO */}
          <div ref={heroRef} className="text-center max-w-3xl mx-auto mt-6 mb-12 scroll-mt-24 relative">

              {/* Speaking Guide CTA */}
              <div className="flex flex-col items-center gap-2 mb-8 md:mb-8 md:gap-0">
                  
                  <Link href="/mission" className="hidden md:inline-block">
                      <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                          className="inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-[#FAF6EC] border border-[#1A1A1A]/10 hover:border-[#8FA68E]/40 text-[#1A1A1A] text-xs font-medium cursor-pointer transition-all group shadow-sm"
                      >
                          <div className="flex flex-col items-start">
                              <span className="font-bold text-[#1A1A1A] text-xs">Speaking Guide</span>
                              <span className="text-[10px] text-[#525252]">Strategi per Part + contoh jawaban Band 7+</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#525252] group-hover:text-[#8FA68E] group-hover:translate-x-1.5 transition-all" />
                      </motion.div>
                  </Link>

                  <Link href="/about" className="w-full md:hidden">
                      <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                          className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-[#FAF6EC] border border-[#1A1A1A]/10 hover:border-[#D17A5C]/40 text-[#1A1A1A] text-xs font-medium cursor-pointer transition-all group shadow-sm"
                      >
                          <div className="flex flex-col items-start">
                              <span className="font-bold text-xs">
                                  <span className="text-[#1A1A1A]">About</span>
                                  <span className="text-[#D17A5C] ml-1">IELTS4our</span>
                              </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#525252] group-hover:text-[#D17A5C] group-hover:translate-x-1.5 transition-all" />
                      </motion.div>
                  </Link>

                  <Link href="/blog" className="w-full md:hidden">
                      <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-[#FAF6EC] border border-[#1A1A1A]/10 hover:border-[#D17A5C]/40 text-[#1A1A1A] text-xs font-medium cursor-pointer transition-all group shadow-sm"
                      >
                          <div className="flex flex-col items-start">
                              <span className="font-bold text-[#1A1A1A] text-xs">Blog</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#525252] group-hover:text-[#D17A5C] group-hover:translate-x-1.5 transition-all" />
                      </motion.div>
                  </Link>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-[#1A1A1A] mb-8 leading-[1.05] tracking-tight font-display">
              Master Your IELTS <br/>
              <span className="text-[#D17A5C]">With IELTS4our</span>
              </h2>
              <p className="text-[#525252] text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
              {isPremium ? "Nikmati akses tanpa batas, durasi lebih panjang, dan jawaban Band 8.0." : "Latihan setiap hari, dapatkan skor instan, dan feedback detail dari IELTS4our."}
              </p>
          </div>

          {/* LEVEL 1 — SKILL TAB */}
          <div className="max-w-xs mx-auto mb-4 bg-[#FAF6EC] p-1 rounded-full border border-[#1A1A1A]/10 flex relative shadow-sm">
              <button 
                  onClick={() => handleSkillSwitch("speaking")} 
                  className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedSkill === "speaking" ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#525252] hover:text-[#1A1A1A]"
                  }`}
              >
                   Speaking
              </button>
              <button 
                  onClick={() => handleSkillSwitch("writing")} 
                  className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedSkill === "writing" ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#525252] hover:text-[#1A1A1A]"
                  }`}
              >
                   Writing
              </button>
          </div>

          {/* LEVEL 2 — MODE TAB */}
          {selectedSkill === "speaking" ? (
              <div className="max-w-md mx-auto mb-8 bg-[#FAF6EC] p-1 rounded-full border border-[#1A1A1A]/10 flex relative shadow-sm">
                  <button onClick={() => handleModeSwitch("full")} className={`flex-1 py-2 px-3 rounded-full text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "full" ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#525252] hover:text-[#1A1A1A]"}`}>
                      Full Test
                  </button>
                  <button onClick={() => handleModeSwitch("quick")} className={`flex-1 py-2 px-3 rounded-full text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "quick" ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#525252] hover:text-[#1A1A1A]"}`}>
                      Quick Test
                  </button>
                  <button onClick={() => handleModeSwitch("cue-card")} className={`flex-1 py-2 px-3 rounded-full text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${practiceMode === "cue-card" ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#525252] hover:text-[#1A1A1A]"}`}>
                      Cue Card
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${practiceMode === "cue-card" ? "bg-white/20 text-white" : "bg-[#8FA68E]/15 text-[#8FA68E]"}`}>FREE</span>
                  </button>
              </div>
          ) : (
              <div className="max-w-sm mx-auto mb-8 bg-[#FAF6EC] p-1 rounded-full border border-[#1A1A1A]/10 flex relative shadow-sm">
                  <button onClick={() => handleModeSwitch("writing-single")} className={`flex-1 py-2 px-3 rounded-full text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "writing-single" ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#525252] hover:text-[#1A1A1A]"}`}>
                      Single Task
                  </button>
                  <button onClick={() => handleModeSwitch("writing-full")} className={`flex-1 py-2 px-3 rounded-full text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "writing-full" ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#525252] hover:text-[#1A1A1A]"}`}>
                      Full Test
                  </button>
              </div>
          )}

          {/* GUEST CTA BANNER */}
          {!userProfile && (
              <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-2xl mx-auto mb-10"
              >
                  <Link href="/auth">
                      <div className="relative bg-[#FAF6EC] border border-[#C9974C]/30 rounded-2xl p-4 md:p-5 flex items-center gap-4 hover:border-[#C9974C]/60 transition-all cursor-pointer group overflow-hidden shadow-sm">
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9974C]/40 to-transparent" />
                          
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#C9974C]/15 rounded-xl flex items-center justify-center border border-[#C9974C]/30 shrink-0 group-hover:scale-105 transition-transform">
                              <Gift className="w-5 h-5 md:w-6 md:h-6 text-[#C9974C]" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-bold text-[#1A1A1A] leading-snug">
                                  Buat akun gratis, dapatkan <span className="text-[#C9974C]">4 Tokens</span>
                              </p>
                              <p className="text-[11px] md:text-xs text-[#525252] mt-0.5">
                                  Cukup untuk 1x Full Simulation + 1x Quick Test
                              </p>
                          </div>
                          
                          <div className="shrink-0 px-4 py-2 bg-[#1A1A1A] rounded-xl text-white text-xs font-bold group-hover:bg-black transition-colors hidden md:block">
                              Claim Now
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#525252] group-hover:text-[#C9974C] group-hover:translate-x-0.5 transition-all shrink-0 md:hidden" />
                      </div>
                  </Link>
              </motion.div>
          )}

          <div className="max-w-4xl mx-auto space-y-12">
              <motion.div initial={{ scale: 0.99, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
              
              {practiceMode === "full" && <PremiumHeroCard />}
              {practiceMode === "quick" && <QuickTestHeroCard />}

              {practiceMode === "cue-card" && (
                  <div className="relative bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-3xl p-8 md:p-12 overflow-hidden min-h-[500px] flex flex-col justify-center shadow-sm">
                  
                  {!analysisResult && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <div className="flex justify-between items-start mb-8 border-b border-[#1A1A1A]/10 pb-6">
                              <div className="flex items-center gap-4">
                                  <div className="p-3 bg-[#F8F5EE] rounded-2xl border border-[#1A1A1A]/10">
                                      {CUE_CARDS.indexOf(dailyCue) >= 30 ? <Crown className="w-6 h-6 text-[#D17A5C]" /> : <BookOpen className="w-6 h-6 text-[#D17A5C]" />}
                                  </div>
                                  <div>
                                      <h3 className="text-[#525252] text-xs font-bold uppercase tracking-widest mb-1">
                                      {CUE_CARDS.indexOf(dailyCue) >= 30 ? "Premium Topic" : "Todays Topic"}
                                      </h3>
                                      <div className="text-[#1A1A1A] font-bold flex items-center gap-2">IELTS Cue Card</div>
                                  </div>
                              </div>
                              <button onClick={randomizeCue} className="p-3 rounded-full hover:bg-[#1A1A1A]/5 text-[#525252] hover:text-[#1A1A1A] transition-all group">
                                  <RefreshCw className={`w-5 h-5 ${isRotating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                              </button>
                          </div>
                          <div className="text-center mb-10">
                              <p className="text-2xl md:text-3xl font-black text-[#1A1A1A] leading-snug mb-8 font-display">"{dailyCue.topic}"</p>
                              <div className="inline-block text-left bg-[#F8F5EE] p-6 md:p-8 rounded-2xl border border-[#1A1A1A]/10">
                              <p className="text-[#D17A5C] text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2"><ArrowRight className="w-4 h-4" /> You can say:</p>
                              <ul className="space-y-3">{dailyCue.points?.map((point, index) => (<li key={index} className="flex items-start gap-3 text-[#1A1A1A] text-sm md:text-base"><span className="w-1.5 h-1.5 bg-[#525252] rounded-full mt-2 shrink-0"></span>{point}</li>))}</ul>
                              </div>
                          </div>
                          
                          {dailyCueQuotaStatus === 'allowed' ? (
                              <Recorder 
                                  cueCard={dailyCue.topic} 
                                  onAnalysisComplete={handleAnalysisComplete} 
                                  maxDuration={120} 
                                  mode={practiceMode} 
                                  difficulty="medium" 
                              />
                          ) : (
                              <LimitReachedView type={dailyCueQuotaStatus} />
                          )}
                      </motion.div>
                  )}

                  {analysisResult && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <div className="flex justify-between items-center mb-6">
                              <h2 className="text-2xl font-black text-[#1A1A1A] font-display">Analysis Result</h2>
                              <button 
                                  onClick={() => { setAnalysisResult(null); handleModeSwitch(practiceMode); }} 
                                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-black rounded-full text-sm text-white font-medium transition-all"
                              >
                                  Try Another Topic
                              </button>
                          </div>
                          <ScoreCard 
                              result={analysisResult} 
                              cue={analysisResult.topic || dailyCue.topic} 
                              isPremiumExternal={isPremium}
                              onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                              onOpenTestimonial={() => setShowTestimonialModal(true)}
                              isLoggedIn={!!userProfile}
                          />
                      </motion.div>
                  )}

              </div>
              )}

              {practiceMode === "writing-single" && <WritingSingleTaskCard />}
              {practiceMode === "writing-full" && <WritingFullTestCard />}
              
              </motion.div>
          </div>
        
          <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} userProfile={userProfile} onUpgradeSuccess={() => { setIsPremium(true); setShowUpgradeModal(false); randomizeCue(); }} />
          <AlertModal isOpen={alertConfig.isOpen} onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} {...alertConfig} />
          
          <TestimonialModal 
              isOpen={showTestimonialModal} 
              onClose={() => setShowTestimonialModal(false)} 
              userProfile={userProfile} 
          />

          {showWelcomeModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
                  <Confetti recycle={false} numberOfPieces={500} colors={['#D17A5C', '#8FA68E', '#C9974C', '#4A6B8F']} />
                  <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="bg-[#FAF6EC] border border-[#C9974C]/30 p-8 rounded-3xl max-w-sm text-center shadow-2xl relative overflow-hidden"
                  >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D17A5C] via-[#C9974C] to-[#D17A5C]" />
                      <div className="absolute top-0 right-0 p-3 opacity-20">
                          <Sparkles className="w-20 h-20 text-[#C9974C]" />
                      </div>

                      <div className="w-20 h-20 bg-[#C9974C]/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C9974C]/30">
                          <div className="text-4xl">🎁</div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 font-display">Welcome Gift!</h3>
                      <p className="text-[#525252] mb-8 leading-relaxed text-sm">
                          Account created successfully.<br/>
                          We've added <strong className="text-[#C9974C]">4 Free Tokens</strong> to your wallet to start your journey.
                      </p>
                      
                      <button 
                          onClick={() => setShowWelcomeModal(false)} 
                          className="w-full py-3.5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                          <span>Claim & Start Practice</span>
                          <ArrowRight className="w-4 h-4" />
                      </button>
                  </motion.div>
              </div>
          )}

          {showLogoutModal && (
              <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FAF6EC] border border-[#1A1A1A]/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl relative">
                      <div className="text-6xl mb-4 animate-bounce">{guiltMessage.icon}</div>
                      <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 font-display">{guiltMessage.title}</h3>
                      <p className="text-[#525252] mb-8 leading-relaxed">{guiltMessage.text}</p>
                      <div className="flex flex-col gap-3">
                          <button onClick={() => setShowLogoutModal(false)} className="w-full py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl transition-all">NO, I WANT BAND 8.0!</button>
                          <button onClick={confirmLogout} className="text-xs text-[#525252] hover:text-[#D17A5C] mt-2 transition-colors">I give up, let me sleep...</button>
                      </div>
                  </motion.div>
              </div>
          )}

          <UniversityBanner />
          <TestimonialSection />

          {userProfile && (
              <div className="flex justify-center -mt-8 mb-20 relative z-20">
                  <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={() => setIsUserMenuOpen(false)}
                      onClick={() => setShowTestimonialModal(true)} 
                      className="group px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full shadow-lg transition-all flex items-center gap-2.5"
                  >
                      <motion.div
                        variants={{
                          hover: { rotate: 180, x: -2 },
                          idle: { rotate: 0, x: 0 }
                        }}
                        initial="idle"
                        whileHover="hover"
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-white/80 transition-colors group-hover:text-white flex items-center"
                      >
                        <Quote className="w-5 h-5 flex-shrink-0" />
                      </motion.div>
                      
                      <span>Share Your Story</span>
                  </motion.button>
              </div>
          )}

          
          <MarketingSection onSelectMode={handleMarketingCardClick} />

          <BlogLatestSection />

          <FAQSection isTeaser={true} />

          <footer className="text-center mt-24 pb-10 text-[#525252] text-xs md:text-sm border-t border-[#1A1A1A]/10 pt-8">
              <p className="mb-4">&copy; 2025 IELTS4our. Made with ❤️ by <Link href="/about" className="hover:text-[#D17A5C] transition-colors">IELTS4our</Link>.</p>
              <p>
                  <Link href="/blog" className="underline decoration-[#525252]/30 hover:decoration-[#D17A5C] hover:text-[#D17A5C] transition-all">Blog</Link>
                  <span className="mx-2 text-[#525252]/40">·</span>
                  <Link href="/terms" className="underline decoration-[#525252]/30 hover:decoration-[#D17A5C] hover:text-[#D17A5C] transition-all">Terms & Conditions</Link>
              </p>
          </footer>
        </div>

      </main>
    </>
  );
}