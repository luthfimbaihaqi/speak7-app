"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Calendar, BarChart3, ChevronRight, X, Crown, Loader2, Trash2, 
  Filter, Flame, Sparkles, Zap, Trophy, Star, Target, Plus, LogIn, TrendingUp, TrendingDown, Minus, ArrowRight,
  PenLine, FileEdit, Lock
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import ScoreCard from "@/components/ScoreCard";
import WritingScoreCard from "@/components/writing/WritingScoreCard";
import UpgradeModal from "@/components/UpgradeModal"; 
import TestimonialModal from "@/components/TestimonialModal";

// 🎨 ABSTRACT GEOMETRIC SHAPES — Reduced density untuk data-heavy page
const AbstractShapes = () => (
  <>
    {/* Top-left organic blob */}
    <svg 
      className="absolute top-[3%] left-[3%] w-12 h-12 md:w-20 md:h-20 opacity-80 -rotate-12"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <path 
        d="M 50 10 Q 80 15 85 45 Q 90 75 60 85 Q 25 90 15 60 Q 10 30 50 10 Z"
        fill="#D17A5C"
      />
    </svg>

    {/* Top-right diagonal dashed line */}
    <svg 
      className="hidden md:block absolute top-[5%] right-[5%] w-28 h-12 opacity-65 rotate-[15deg]"
      viewBox="0 0 200 50"
      aria-hidden
    >
      <line 
        x1="10" y1="25" x2="190" y2="25" 
        stroke="#4A6B8F" 
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
      />
    </svg>

    {/* Mid-left plus signs cluster */}
    <svg 
      className="hidden md:block absolute top-[30%] left-[2%] w-16 h-16 opacity-60"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <g stroke="#C9974C" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="32" />
        <line x1="14" y1="26" x2="26" y2="26" />
        <line x1="70" y1="55" x2="70" y2="67" />
        <line x1="64" y1="61" x2="76" y2="61" />
      </g>
    </svg>

    {/* Mid-right wavy line */}
    <svg 
      className="hidden md:block absolute top-[40%] right-[3%] w-28 h-10 opacity-55 -rotate-6"
      viewBox="0 0 200 50"
      aria-hidden
    >
      <path 
        d="M 5 25 Q 30 5 55 25 T 105 25 T 155 25 T 195 25"
        fill="none"
        stroke="#8FA68E"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>

    {/* Mid-left tally marks */}
    <svg 
      className="hidden md:block absolute top-[55%] left-[3%] w-14 h-14 opacity-55 rotate-[10deg]"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <g stroke="#D17A5C" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="80" />
        <line x1="35" y1="20" x2="35" y2="80" />
        <line x1="50" y1="20" x2="50" y2="80" />
        <line x1="10" y1="50" x2="60" y2="50" />
      </g>
    </svg>

    {/* Mid-right small organic blob */}
    <svg 
      className="absolute top-[65%] right-[2%] w-10 h-10 md:w-12 md:h-12 opacity-75 rotate-45"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <path 
        d="M 50 15 Q 75 20 80 50 Q 85 80 50 85 Q 20 80 20 50 Q 25 20 50 15 Z"
        fill="#8FA68E"
      />
    </svg>

    {/* Bottom-left dashed circle */}
    <svg 
      className="hidden md:block absolute bottom-[10%] left-[5%] w-14 h-14 opacity-60"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <circle 
        cx="50" cy="50" r="40" 
        fill="none" 
        stroke="#4A6B8F" 
        strokeWidth="3"
        strokeDasharray="8 6"
      />
    </svg>

    {/* Bottom-right small triangle */}
    <svg 
      className="absolute bottom-[8%] right-[5%] w-10 h-10 md:w-14 md:h-14 opacity-70 rotate-[20deg]"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <path 
        d="M 50 15 L 85 80 L 15 80 Z"
        fill="#C9974C"
      />
    </svg>
  </>
);

export default function ProgressPage() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filterType, setFilterType] = useState("all"); 

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  const [isPremium, setIsPremium] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);

  useEffect(() => {
    async function checkUserStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        let userId = null;

        if (user) {
            setUserProfile(user);
            userId = user.id;
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_premium, premium_expiry, token_balance')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                setUserProfile(prev => ({ ...prev, ...profile }));
                const isStillValid = profile.is_premium && (profile.premium_expiry > Date.now());
                setIsPremium(isStillValid); 
            }
        }
        fetchHistory(userId);
    }
    checkUserStatus();
  }, []);

  useEffect(() => {
    if (filterType === "all") {
        setFilteredHistory(history);
    } else if (filterType === "cue-card") {
        setFilteredHistory(history.filter(item => item.source_type === "speaking-cue"));
    } else if (filterType === "quick-test") {
        setFilteredHistory(history.filter(item => item.source_type === "speaking-quick"));
    } else if (filterType === "full-exam") {
        setFilteredHistory(history.filter(item => item.source_type === "speaking-full"));
    } else if (filterType === "writing-single") {
        setFilteredHistory(history.filter(item => item.source_type === "writing-single"));
    } else if (filterType === "writing-full") {
        setFilteredHistory(history.filter(item => item.source_type === "writing-full"));
    }
  }, [filterType, history]);

  const fetchHistory = async (userId) => {
    try {
        let combinedData = [];

        if (userId) {
            const practicePromise = supabase
                .from('practice_history')
                .select('*')
                .eq('user_id', userId);

            const sessionPromise = supabase
                .from('exam_sessions')
                .select('*')
                .eq('user_id', userId)
                .not('score_data', 'is', null);

            const writingSinglePromise = supabase
                .from('writing_history')
                .select('*')
                .eq('user_id', userId);

            const writingFullPromise = supabase
                .from('writing_full_test_history')
                .select('*')
                .eq('user_id', userId);

            const [practiceRes, sessionRes, writingSingleRes, writingFullRes] = await Promise.all([
                practicePromise, sessionPromise, writingSinglePromise, writingFullPromise
            ]);

            const practiceData = (practiceRes.data || []).map(item => ({
                ...item,
                source_table: 'practice_history',
                source_type: 'speaking-cue',
            }));

            const sessionData = (sessionRes.data || []).map(session => {
                const scores = session.score_data || {};
                let topicLabel = "Mock Interview";
                let sourceType = "speaking-quick";
                if (session.mode === 'full') {
                    topicLabel = "FULL EXAM: Complete Simulation";
                    sourceType = "speaking-full";
                }
                else if (session.mode === 'quick') {
                    topicLabel = "QUICK TEST: Part 3 Mock";
                    sourceType = "speaking-quick";
                }

                return {
                    id: session.id,
                    user_id: session.user_id,
                    topic: topicLabel,
                    overall_score: scores.overallBand || scores.overall || 0,
                    full_feedback: {
                        ...scores,
                        overall: scores.overallBand || scores.overall,
                        transcript: session.transcript_data ? JSON.stringify(session.transcript_data) : null
                    },
                    created_at: session.created_at,
                    source_table: 'exam_sessions',
                    source_type: sourceType,
                };
            });

            const writingSingleData = (writingSingleRes.data || []).map(item => {
                const taskTypeLabel = item.task_type === "task_1_academic" ? "Task 1 Chart"
                    : item.task_type === "task_1_general" ? "Task 1 Letter"
                    : "Task 2 Essay";
                
                return {
                    id: item.id,
                    user_id: item.user_id,
                    topic: `WRITING SINGLE: ${taskTypeLabel} - ${item.prompt_code || 'N/A'}`,
                    overall_score: parseFloat(item.overall_band) || 0,
                    full_feedback: item.full_feedback || {},
                    created_at: item.created_at,
                    source_table: 'writing_history',
                    source_type: 'writing-single',
                    writing_data: {
                        type: 'single_task',
                        evaluation: {
                            overall_band: parseFloat(item.overall_band),
                            task_achievement: parseFloat(item.task_achievement),
                            coherence_cohesion: parseFloat(item.coherence_cohesion),
                            lexical_resource: parseFloat(item.lexical_resource),
                            grammatical_range: parseFloat(item.grammatical_range),
                            full_feedback: item.full_feedback || {},
                        },
                        historyId: item.id,
                        timeSpentSeconds: item.time_spent_seconds,
                        essayText: item.essay_text,
                        wordCount: item.word_count,
                        isUnlocked: item.is_feedback_unlocked || false,
                    },
                    prompt_id: item.prompt_id,
                    prompt_code: item.prompt_code,
                    task_type: item.task_type,
                    is_feedback_unlocked: item.is_feedback_unlocked || false,
                };
            });

            const writingFullData = (writingFullRes.data || []).map(item => {
                const moduleLabel = item.module === "academic" ? "Academic" : "General Training";
                
                return {
                    id: item.id,
                    user_id: item.user_id,
                    topic: `WRITING FULL: ${moduleLabel} - Pair ${item.pair_code || 'N/A'}`,
                    overall_score: parseFloat(item.combined_overall_band) || 0,
                    full_feedback: {
                        task_1: item.task_1_full_feedback || {},
                        task_2: item.task_2_full_feedback || {},
                    },
                    created_at: item.created_at,
                    source_table: 'writing_full_test_history',
                    source_type: 'writing-full',
                    writing_data: {
                        type: 'full_test',
                        task1Evaluation: {
                            overall_band: parseFloat(item.task_1_overall_band),
                            task_achievement: parseFloat(item.task_1_task_achievement),
                            coherence_cohesion: parseFloat(item.task_1_coherence_cohesion),
                            lexical_resource: parseFloat(item.task_1_lexical_resource),
                            grammatical_range: parseFloat(item.task_1_grammatical_range),
                            full_feedback: item.task_1_full_feedback || {},
                            word_count: item.task_1_word_count,
                        },
                        task2Evaluation: {
                            overall_band: parseFloat(item.task_2_overall_band),
                            task_achievement: parseFloat(item.task_2_task_achievement),
                            coherence_cohesion: parseFloat(item.task_2_coherence_cohesion),
                            lexical_resource: parseFloat(item.task_2_lexical_resource),
                            grammatical_range: parseFloat(item.task_2_grammatical_range),
                            full_feedback: item.task_2_full_feedback || {},
                            word_count: item.task_2_word_count,
                        },
                        combinedBand: parseFloat(item.combined_overall_band),
                        pairCode: item.pair_code,
                        module: item.module,
                        historyId: item.id,
                        totalTimeSpentSeconds: item.total_time_spent_seconds,
                        task1Text: item.task_1_essay_text,
                        task2Text: item.task_2_essay_text,
                        isUnlocked: item.is_feedback_unlocked || false,
                    },
                    pair_id: item.pair_id,
                    pair_code: item.pair_code,
                    module: item.module,
                    is_feedback_unlocked: item.is_feedback_unlocked || false,
                };
            });

            combinedData = [...practiceData, ...sessionData, ...writingSingleData, ...writingFullData];

        } else {
            const localRaw = localStorage.getItem("ielts4our_history");
            if (localRaw) {
                const localData = JSON.parse(localRaw);
                const normalizedLocal = localData.map(item => ({
                    id: item.id, 
                    user_id: 'local_device',
                    topic: item.topic,
                    overall_score: item.overall, 
                    created_at: new Date(item.id).toISOString(), 
                    full_feedback: item, 
                    is_local: true,
                    source_type: 'speaking-cue',
                }));
                combinedData = [...normalizedLocal];
            }
        }

        combinedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setHistory(combinedData);
    } catch (err) {
        console.error("Error fetching history:", err);
    } finally {
        setLoading(false);
    }
  };

  const promptDelete = (e, item) => {
    e.stopPropagation(); 
    setDeleteTarget(item);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const item = deleteTarget;

    try {
        if (item.is_local) {
            const localRaw = localStorage.getItem("ielts4our_history");
            if (localRaw) {
                const localData = JSON.parse(localRaw);
                const newData = localData.filter(d => d.id !== item.id);
                localStorage.setItem("ielts4our_history", JSON.stringify(newData));
            }
        } else {
            const tableName = item.source_table || 'practice_history';

            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', item.id);
            
            if (error) throw error;
        }
        setHistory(prev => prev.filter(h => h.id !== item.id));
        setDeleteTarget(null); 
    } catch (err) {
        console.error("Failed to delete:", err);
        alert("Failed to delete item. Please try again.");
    }
  };

  const statsSource = filterType === "all" ? history : filteredHistory;
  
  const rawSum = statsSource.reduce((acc, curr) => acc + (curr.overall_score || 0), 0);
  const rawAvg = statsSource.length > 0 ? rawSum / statsSource.length : 0;
  const averageScore = statsSource.length > 0 ? (Math.round(rawAvg * 2) / 2).toFixed(1) : "0.0";
  
  const highestScore = statsSource.length > 0 
    ? Math.max(...statsSource.map(item => item.overall_score || 0)) 
    : 0;

  const getTrend = () => {
      if (statsSource.length < 4) return { direction: "neutral", diff: 0 };
      
      const splitPoint = Math.min(5, Math.floor(statsSource.length / 2));
      const recent = statsSource.slice(0, splitPoint);
      const older = statsSource.slice(splitPoint, splitPoint * 2);
      
      if (older.length === 0) return { direction: "neutral", diff: 0 };
      
      const recentAvg = recent.reduce((sum, item) => sum + (item.overall_score || 0), 0) / recent.length;
      const olderAvg = older.reduce((sum, item) => sum + (item.overall_score || 0), 0) / older.length;
      const diff = recentAvg - olderAvg;
      
      if (diff > 0.3) return { direction: "up", diff: diff.toFixed(1) };
      if (diff < -0.3) return { direction: "down", diff: Math.abs(diff).toFixed(1) };
      return { direction: "neutral", diff: 0 };
  };

  const trend = getTrend();

  const getPracticeAgainUrl = (item) => {
      if (item.source_type === "writing-single") {
          return `/writing/exam?mode=single_task&promptId=${item.prompt_id}`;
      }
      if (item.source_type === "writing-full") {
          return `/writing/exam?mode=full_test&pairId=${item.pair_id}`;
      }
      if (item.source_type === "speaking-full" || item.topic?.includes("FULL EXAM")) return "/simulation?mode=full";
      if (item.source_type === "speaking-quick" || item.topic?.includes("QUICK TEST") || item.topic?.includes("Mock Interview")) return "/simulation?mode=quick";
      return "/";
  };

  const getPracticeAgainLabel = (item) => {
      if (item.source_type === "writing-single") return "Try Again";
      if (item.source_type === "writing-full") return "Try Again";
      if (item.source_type === "speaking-full" || item.topic?.includes("FULL EXAM")) return "Start Full Exam";
      if (item.source_type === "speaking-quick" || item.topic?.includes("QUICK TEST") || item.topic?.includes("Mock Interview")) return "Start Quick Test";
      return "Practice Cue Card";
  };

  const getCleanTitle = (item) => {
      if (item.source_type === "writing-single") {
          const taskTypeLabel = item.task_type === "task_1_academic" ? "Task 1 Chart"
              : item.task_type === "task_1_general" ? "Task 1 Letter"
              : "Task 2 Essay";
          return `${taskTypeLabel} — Code ${item.prompt_code || 'N/A'}`;
      }
      if (item.source_type === "writing-full") {
          const moduleLabel = item.module === "academic" ? "Academic" : "General Training";
          return `Full Test — ${moduleLabel} Pair ${item.pair_code || 'N/A'}`;
      }
      return (item.topic || "")
          .replace("Mock Interview: ", "")
          .replace("FULL EXAM: ", "")
          .replace("QUICK TEST: ", "")
          .replace("Cue Card: ", "");
  };

  // 🎨 Updated label colors untuk light mode dengan V3 palette
  const getTopicTypeLabel = (item) => {
      if (item.source_type === "writing-single") {
          return { 
            label: "Writing Single", 
            icon: <PenLine className="w-3 h-3" />, 
            color: "text-[#8FA68E] bg-[#8FA68E]/10 border-[#8FA68E]/30" 
          };
      }
      if (item.source_type === "writing-full") {
          return { 
            label: "Writing Full", 
            icon: <FileEdit className="w-3 h-3" />, 
            color: "text-[#8FA68E] bg-[#8FA68E]/10 border-[#8FA68E]/30" 
          };
      }
      if (item.source_type === "speaking-full" || item.topic?.includes("FULL EXAM")) {
          return { 
            label: "Full Simulation", 
            icon: <Sparkles className="w-3 h-3" />, 
            color: "text-[#1A1A1A] bg-[#1A1A1A]/10 border-[#1A1A1A]/30" 
          };
      }
      if (item.source_type === "speaking-quick" || item.topic?.includes("QUICK TEST") || item.topic?.includes("Mock Interview")) {
          return { 
            label: "Quick Test", 
            icon: <Zap className="w-3 h-3" />, 
            color: "text-[#4A6B8F] bg-[#4A6B8F]/10 border-[#4A6B8F]/30" 
          };
      }
      return { 
        label: "Daily Cue Card", 
        icon: <Target className="w-3 h-3" />, 
        color: "text-[#D17A5C] bg-[#D17A5C]/10 border-[#D17A5C]/30" 
      };
  };

  // 🎨 Score colors — clean, no glowing shadows
  const getScoreColor = (score) => {
      if (score >= 7.0) return "bg-[#8FA68E] text-white";
      if (score >= 5.5) return "bg-[#C9974C] text-white";
      return "bg-[#525252] text-white";
  };

  const handleWritingUnlock = async (historyType, historyId) => {
      if (!userProfile) return { success: false, error: "Not logged in" };
      try {
          const res = await fetch("/api/writing/unlock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  userId: userProfile.id,
                  historyId,
                  historyType,
              }),
          });

          const data = await res.json();
          if (!res.ok) {
              return { success: false, error: data.error || "Failed to unlock" };
          }

          if (data.newTokenBalance !== undefined) {
              setUserProfile((prev) => ({ ...prev, token_balance: data.newTokenBalance }));
          }

          setHistory((prev) => prev.map((h) => {
              if (h.id === historyId) {
                  return {
                      ...h,
                      is_feedback_unlocked: true,
                      writing_data: { ...h.writing_data, isUnlocked: true },
                  };
              }
              return h;
          }));

          if (selectedItem && selectedItem.id === historyId) {
              setSelectedItem((prev) => ({
                  ...prev,
                  is_feedback_unlocked: true,
                  writing_data: { ...prev.writing_data, isUnlocked: true },
              }));
          }

          return { success: true };
      } catch (err) {
          console.error("Unlock error:", err);
          return { success: false, error: err.message || "Network error" };
      }
  };

  const isWritingItem = (item) => {
      return item?.source_type === "writing-single" || item?.source_type === "writing-full";
  };

  return (
    <>
      {/* Lexend font import */}
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

      <main className="min-h-screen bg-[#F8F5EE] px-4 py-8 selection:bg-[#D17A5C]/30 selection:text-[#1A1A1A] relative overflow-hidden">
        
        {/* Abstract geometric shapes scattered */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AbstractShapes />
        </div>
        
        {/* Content Wrapper */}
        <div className="relative z-10">
          
          {/* HEADER */}
          <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-[#525252] hover:text-[#1A1A1A] transition-colors text-sm font-bold uppercase tracking-wider group">
                <div className="p-1.5 bg-[#1A1A1A]/5 rounded-full group-hover:bg-[#1A1A1A]/10 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> 
                </div>
                Back to Practice
            </Link>
            
            {userProfile && (
                <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF6EC] border border-[#1A1A1A]/10 hover:border-[#D17A5C]/40 rounded-full transition-all group shadow-sm"
                >
                    <span className="text-[#C9974C] text-sm">🪙</span>
                    <span className="text-[#1A1A1A] text-xs font-bold tabular-nums">
                        {userProfile.token_balance || 0} Tokens
                    </span>
                    <div className="w-px h-3 bg-[#1A1A1A]/20 mx-1"></div>
                    <Plus className="w-3 h-3 text-[#525252] group-hover:text-[#D17A5C]" />
                </button>
            )}
          </div>

          <div className="max-w-4xl mx-auto">
            {/* 🎨 V1: Page title — emoji 📈 dihilangkan, font-display Lexend */}
            <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-3 font-display tracking-tight">
                    Your Progress
                </h1>
                <p className="text-[#525252] text-base md:text-lg">
                    Lacak perkembangan Speaking & Writing IELTS kamu dari waktu ke waktu.
                </p>
            </div>

            {loading ? (
                 <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[#D17A5C] animate-spin" />
                 </div>
            ) : history.length === 0 ? (
                 <div className="text-center py-20 bg-[#FAF6EC] rounded-3xl border border-[#1A1A1A]/10 shadow-sm">
                    <div className="w-16 h-16 bg-[#F8F5EE] border border-[#1A1A1A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-[#525252]" />
                    </div>
                    
                    {userProfile ? (
                        <>
                            <p className="text-[#525252] mb-6">Belum ada riwayat latihan di Cloud. Yuk mulai sekarang!</p>
                            <Link href="/" className="px-8 py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full transition-all shadow-lg">
                                Start Practice
                            </Link>
                        </>
                    ) : (
                        <>
                            <p className="text-[#525252] mb-6">
                                Belum ada riwayat latihan di perangkat ini.<br/>
                                <span className="text-[#C9974C] text-sm font-medium">Login untuk menyimpan & melihat history kamu di semua device.</span>
                            </p>
                            <div className="flex justify-center gap-4 flex-wrap">
                                <Link href="/" className="px-6 py-3 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] font-bold rounded-full transition-all border border-[#1A1A1A]/10">
                                    Try as Guest
                                </Link>
                                <Link href="/auth" className="px-8 py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg">
                                    <LogIn className="w-4 h-4" /> Login Now
                                </Link>
                            </div>
                        </>
                    )}
                 </div>
            ) : (
                <>
                    {/* 🎨 STATS CARDS — Clean light mode design */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
                        {/* Card 1: Total */}
                        <div className="bg-[#FAF6EC] p-5 rounded-2xl border border-[#1A1A1A]/10 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                <Target className="w-16 h-16 text-[#1A1A1A]" />
                            </div>
                            <p className="text-[10px] md:text-xs text-[#525252] font-bold uppercase tracking-widest mb-1">Total</p>
                            <p className="text-2xl md:text-4xl font-black text-[#1A1A1A] font-display">{statsSource.length}</p>
                            <p className="text-[10px] text-[#525252] mt-1">Practices</p>
                        </div>

                        {/* Card 2: Average + Trend */}
                        <div className="bg-[#FAF6EC] p-5 rounded-2xl border border-[#1A1A1A]/10 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                <BarChart3 className="w-16 h-16 text-[#4A6B8F]" />
                            </div>
                            <p className="text-[10px] md:text-xs text-[#4A6B8F] font-bold uppercase tracking-widest mb-1">Average</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl md:text-4xl font-black text-[#1A1A1A] font-display">{averageScore}</p>
                                {trend.direction === "up" && (
                                    <span className="flex items-center gap-0.5 text-[#8FA68E] text-[10px] font-bold">
                                        <TrendingUp className="w-3 h-3" /> +{trend.diff}
                                    </span>
                                )}
                                {trend.direction === "down" && (
                                    <span className="flex items-center gap-0.5 text-[#D17A5C] text-[10px] font-bold">
                                        <TrendingDown className="w-3 h-3" /> -{trend.diff}
                                    </span>
                                )}
                                {trend.direction === "neutral" && statsSource.length >= 4 && (
                                    <span className="flex items-center gap-0.5 text-[#525252] text-[10px] font-bold">
                                        <Minus className="w-3 h-3" /> Stable
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-[#525252] mt-1">Band Score</p>
                        </div>

                        {/* Card 3: Best */}
                        <div className="bg-[#FAF6EC] p-5 rounded-2xl border border-[#C9974C]/30 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute right-2 top-2 opacity-15 group-hover:opacity-25 transition-opacity transform group-hover:scale-110 duration-500">
                                <Trophy className="w-16 h-16 text-[#C9974C]" />
                            </div>
                            <p className="text-[10px] md:text-xs text-[#C9974C] font-bold uppercase tracking-widest mb-1">Best</p>
                            <p className="text-2xl md:text-4xl font-black text-[#1A1A1A] font-display">{highestScore}</p>
                            <p className="text-[10px] text-[#525252] mt-1">Highest Band</p>
                        </div>
                    </div>

                    {/* 🎨 FILTER TABS — Light mode */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: 'all', label: 'All History' },
                            { id: 'cue-card', label: 'Cue Cards' },
                            { id: 'quick-test', label: 'Quick Tests' }, 
                            { id: 'full-exam', label: 'Full Simulation' },
                            { id: 'writing-single', label: 'Writing Single' },
                            { id: 'writing-full', label: 'Writing Full' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterType(tab.id)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                                    filterType === tab.id 
                                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md" 
                                        : "bg-[#FAF6EC] text-[#525252] border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* 🎨 HISTORY LIST — Light mode cards */}
                    <div className="space-y-3">
                        {filteredHistory.length === 0 ? (
                            <div className="text-center py-10 text-[#525252] text-sm italic bg-[#FAF6EC] rounded-2xl border border-dashed border-[#1A1A1A]/20">
                                No history found for this filter.
                            </div>
                        ) : filteredHistory.map((item, index) => {
                            const typeInfo = getTopicTypeLabel(item);
                            const cleanTitle = getCleanTitle(item);
                            const isWriting = isWritingItem(item);
                            
                            return (
                                <motion.div 
                                    key={item.id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedItem(item)}
                                    className={`bg-[#FAF6EC] hover:bg-[#FFFBF0] border p-4 md:p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all group relative shadow-sm hover:shadow-md ${
                                        item.source_type === "speaking-full" ? "border-[#1A1A1A]/20" : 
                                        isWriting ? "border-[#8FA68E]/30" :
                                        "border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20"
                                    }`}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${typeInfo.color}`}>
                                                {typeInfo.icon} {typeInfo.label}
                                            </span>
                                            <span className="text-[10px] text-[#525252] flex items-center gap-1 font-medium">
                                                • {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                                            </span>
                                            {/* 🔒 Locked indicator — FUNCTIONAL emoji, kept */}
                                            {isWriting && !item.is_feedback_unlocked && (
                                                <span className="text-[10px] text-[#C9974C] font-bold flex items-center gap-1">
                                                    • <Lock className="w-3 h-3" /> Locked
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-[#1A1A1A] font-bold truncate max-w-[200px] md:max-w-md text-base md:text-lg group-hover:text-[#D17A5C] transition-colors font-display">
                                            {cleanTitle}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${getScoreColor(item.overall_score)} shadow-sm`}>
                                            <span className="text-[9px] font-bold opacity-80 uppercase leading-none">Band</span>
                                            <span className="text-lg font-black leading-none">{item.overall_score}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => promptDelete(e, item)}
                                                className="p-2 rounded-full text-[#525252] hover:text-[#D17A5C] hover:bg-[#D17A5C]/10 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="p-2 rounded-full text-[#525252] group-hover:text-[#1A1A1A] transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}
          </div>

          {/* 🎨 DETAIL MODAL — Light mode */}
          <AnimatePresence>
            {selectedItem && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed inset-0 z-50 bg-[#F8F5EE] overflow-y-auto"
                >
                    <div className="max-w-4xl mx-auto p-4 py-8">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#F8F5EE]/95 backdrop-blur-md py-4 z-10 border-b border-[#1A1A1A]/10 rounded-b-2xl px-4 -mx-4 md:mx-0 md:px-0">
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="flex items-center gap-2 text-[#525252] hover:text-[#1A1A1A] font-bold uppercase text-sm tracking-widest"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to List
                            </button>
                            <h2 className="text-[#1A1A1A] font-bold hidden md:block font-display">
                                {isWritingItem(selectedItem) 
                                    ? (selectedItem.source_type === "writing-full" ? "Full Test Result" : "Writing Result")
                                    : selectedItem.topic?.includes("FULL EXAM") ? "Full Exam Result" : "Result Details"
                                }
                            </h2>
                            <button onClick={() => setSelectedItem(null)} className="p-2 bg-[#1A1A1A]/5 rounded-full hover:bg-[#1A1A1A]/10 text-[#1A1A1A] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="pb-20">
                            {isWritingItem(selectedItem) ? (
                                <WritingScoreCard
                                    data={selectedItem.writing_data}
                                    userTokenBalance={userProfile?.token_balance || 0}
                                    isLoggedIn={!!userProfile}
                                    onUnlock={handleWritingUnlock}
                                    onTryAnother={() => {
                                        setSelectedItem(null);
                                        const url = getPracticeAgainUrl(selectedItem);
                                        window.location.href = url;
                                    }}
                                    onViewProgress={() => setSelectedItem(null)}
                                />
                            ) : (
                                <>
                                    <ScoreCard 
                                        result={selectedItem.full_feedback} 
                                        cue={selectedItem.topic}
                                        onOpenTestimonial={() => setShowTestimonialModal(true)}
                                        isLoggedIn={!!userProfile}
                                    />

                                    <div className="mt-8 text-center">
                                        <Link href={getPracticeAgainUrl(selectedItem)}>
                                            <button className="px-8 py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full transition-all shadow-lg flex items-center gap-2 mx-auto">
                                                <span>{getPracticeAgainLabel(selectedItem)}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* 🎨 DELETE MODAL — Light mode, emoji 🔥 dihilangkan dari title */}
          <AnimatePresence>
            {deleteTarget && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-[#1A1A1A]/40 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-[#FAF6EC] border border-[#1A1A1A]/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#D17A5C]" />
                        
                        <div className="w-16 h-16 bg-[#D17A5C]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D17A5C]/30">
                            <Flame className="w-8 h-8 text-[#D17A5C] animate-pulse" />
                        </div>
                        
                        <h3 className="text-xl font-black text-[#1A1A1A] mb-2 font-display">Burning the evidence?</h3>
                        <p className="text-[#525252] text-sm leading-relaxed mb-8">
                            Are you sure you want to delete this? Don't worry, I won't tell anyone about that score. 
                            <br/><span className="text-[#525252]/70 text-xs italic mt-2 block">(But remember, mistakes make you stronger!)</span>
                        </p>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={executeDelete}
                                className="w-full py-3 bg-[#D17A5C] hover:bg-[#B8654A] text-white font-bold rounded-xl shadow-lg transition-all"
                            >
                                Yes, Burn It
                            </button>
                            <button 
                                onClick={() => setDeleteTarget(null)}
                                className="w-full py-3 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] font-bold rounded-xl transition-all border border-[#1A1A1A]/10"
                            >
                                Keep It (I'm brave)
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

          <UpgradeModal 
            isOpen={showUpgradeModal} 
            onClose={() => setShowUpgradeModal(false)}
            userProfile={userProfile}
            onUpgradeSuccess={() => {
                setIsPremium(true);
                setShowUpgradeModal(false);
            }}
          />

          <TestimonialModal 
            isOpen={showTestimonialModal} 
            onClose={() => setShowTestimonialModal(false)} 
            userProfile={userProfile} 
          />

        </div>

      </main>
    </>
  );
}