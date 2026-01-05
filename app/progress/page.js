"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Calendar, BarChart3, ChevronRight, X, Crown, Loader2, Trash2, 
  Filter, Flame, Sparkles, Zap, Trophy, Star, Target, Plus, LogIn 
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import ScoreCard from "@/components/ScoreCard";
import UpgradeModal from "@/components/UpgradeModal"; 

export default function ProgressPage() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filterType, setFilterType] = useState("all"); 

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  const [isPremium, setIsPremium] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  
  // State untuk Delete Modal Custom
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    async function checkUserStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        let userId = null;

        if (user) {
            setUserProfile(user);
            userId = user.id;
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_premium, premium_expiry, token_balance') // Ambil token_balance
                .eq('id', user.id)
                .single();
            
            if (profile) {
                // Merge token info
                setUserProfile(prev => ({ ...prev, ...profile }));
                const isStillValid = profile.is_premium && (profile.premium_expiry > Date.now());
                setIsPremium(isStillValid); 
            }
        }
        // Panggil fetchHistory dengan userId (bisa null jika guest)
        fetchHistory(userId);
    }
    checkUserStatus();
  }, []);

  // --- LOGIC FILTER ---
  useEffect(() => {
    if (filterType === "all") {
        setFilteredHistory(history);
    } else if (filterType === "cue-card") {
        setFilteredHistory(history.filter(item => 
            !item.topic.includes("QUICK TEST") && 
            !item.topic.includes("FULL EXAM") &&
            !item.topic.includes("Mock Interview")
        ));
    } else if (filterType === "quick-test") {
        setFilteredHistory(history.filter(item => 
            item.topic.includes("QUICK TEST") || item.topic.includes("Mock Interview")
        ));
    } else if (filterType === "full-exam") {
        setFilteredHistory(history.filter(item => item.topic.includes("FULL EXAM")));
    }
  }, [filterType, history]);

  // --- 🔥 UPDATED: FETCH LOGIC (NO LOCAL STORAGE FOR LOGGED IN USERS) ---
  const fetchHistory = async (userId) => {
    try {
        let combinedData = [];

        if (userId) {
            // --- SKENARIO 1: USER LOGIN (CLOUD ONLY) ---
            // Kita sengaja TIDAK mengambil localStorage di sini agar data bersih.
            
            // 1. Fetch Table Lama (Cue Cards)
            const practicePromise = supabase
                .from('practice_history')
                .select('*')
                .eq('user_id', userId);

            // 2. Fetch Table Baru (Quick/Full Tests)
            const sessionPromise = supabase
                .from('exam_sessions')
                .select('*')
                .eq('user_id', userId)
                .not('score_data', 'is', null);

            const [practiceRes, sessionRes] = await Promise.all([practicePromise, sessionPromise]);

            // Normalisasi Data Practice History
            const practiceData = (practiceRes.data || []).map(item => ({
                ...item,
                source_table: 'practice_history'
            }));

            // Normalisasi Data Exam Sessions
            const sessionData = (sessionRes.data || []).map(session => {
                const scores = session.score_data || {};
                let topicLabel = "Mock Interview";
                if (session.mode === 'full') topicLabel = "FULL EXAM: Complete Simulation";
                else if (session.mode === 'quick') topicLabel = "QUICK TEST: Part 3 Mock";

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
                    source_table: 'exam_sessions'
                };
            });

            combinedData = [...practiceData, ...sessionData];

        } else {
            // --- SKENARIO 2: GUEST (LOCAL STORAGE ONLY) ---
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
                    is_local: true 
                }));
                combinedData = [...normalizedLocal];
            }
        }

        // Sort: Terbaru di atas
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
            // Cek hapus dari tabel mana
            let tableName = 'practice_history'; // Default
            if (item.source_table === 'exam_sessions') {
                tableName = 'exam_sessions';
            }

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

  // --- STATISTIK ---
  const rawSum = history.reduce((acc, curr) => acc + (curr.overall_score || 0), 0);
  const rawAvg = history.length > 0 ? rawSum / history.length : 0;
  const averageScore = history.length > 0 ? (Math.round(rawAvg * 2) / 2).toFixed(1) : "0.0";
  
  // Highest Score Logic
  const highestScore = history.length > 0 
    ? Math.max(...history.map(item => item.overall_score || 0)) 
    : 0;

  // --- HELPER VISUAL ---
  const getCleanTitle = (topic) => {
      return topic
        .replace("Mock Interview: ", "")
        .replace("FULL EXAM: ", "")
        .replace("QUICK TEST: ", "")
        .replace("Cue Card: ", "");
  };

  const getTopicTypeLabel = (topic) => {
      if (topic.includes("FULL EXAM")) return { label: "Full Simulation", icon: <Sparkles className="w-3 h-3" />, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
      if (topic.includes("QUICK TEST") || topic.includes("Mock Interview")) return { label: "Quick Test", icon: <Zap className="w-3 h-3" />, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
      return { label: "Daily Cue Card", icon: <Target className="w-3 h-3" />, color: "text-teal-400 bg-teal-500/10 border-teal-500/20" };
  };

  const getScoreColor = (score) => {
      if (score >= 7.0) return "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]";
      if (score >= 5.5) return "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]";
      return "bg-slate-700 text-slate-300";
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider group">
            <div className="p-1.5 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-4 h-4" /> 
            </div>
            Back to Practice
        </Link>
        
        {/* REPLACED PRO BADGE WITH TOKEN BALANCE */}
        {userProfile && (
            <button 
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700 hover:border-blue-500/50 rounded-full transition-all group"
            >
                <span className="text-yellow-400 text-sm">🪙</span>
                <span className="text-white text-xs font-bold tabular-nums">
                    {userProfile.token_balance || 0} Tokens
                </span>
                <div className="w-px h-3 bg-slate-600 mx-1"></div>
                <Plus className="w-3 h-3 text-blue-400 group-hover:text-white" />
            </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Your Progress 📈</h1>
            <p className="text-slate-400">Lacak perkembangan Speaking IELTS kamu dari waktu ke waktu.</p>
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
             </div>
        ) : history.length === 0 ? (
             <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-slate-500" />
                </div>
                
                {/* --- EMPTY STATE LOGIC --- */}
                {userProfile ? (
                    <>
                        <p className="text-slate-400 mb-6">Belum ada riwayat latihan di Cloud. Yuk mulai sekarang!</p>
                        <Link href="/" className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full transition-all shadow-lg hover:shadow-teal-500/20">
                            Start Practice
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="text-slate-400 mb-6">
                            Belum ada riwayat latihan di perangkat ini.<br/>
                            <span className="text-yellow-400 text-sm">Login untuk menyimpan & melihat history kamu di semua device.</span>
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-full transition-all">
                                Try as Guest
                            </Link>
                            <Link href="/auth" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg">
                                <LogIn className="w-4 h-4" /> Login Now
                            </Link>
                        </div>
                    </>
                )}
             </div>
        ) : (
            <>
                {/* NEW STATS CARDS (3 Columns) */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
                    {/* Card 1: Total */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Target className="w-16 h-16 text-white" />
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total</p>
                        <p className="text-2xl md:text-4xl font-black text-white">{history.length}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Practices</p>
                    </div>

                    {/* Card 2: Average */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <BarChart3 className="w-16 h-16 text-blue-400" />
                        </div>
                        <p className="text-[10px] md:text-xs text-blue-400 font-bold uppercase tracking-widest mb-1">Average</p>
                        <p className="text-2xl md:text-4xl font-black text-white">{averageScore}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Band Score</p>
                    </div>

                    {/* Card 3: Best (New) */}
                    <div className="bg-gradient-to-br from-amber-900/20 to-slate-900 p-5 rounded-2xl border border-amber-500/20 relative overflow-hidden group">
                        <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                            <Trophy className="w-16 h-16 text-amber-500" />
                        </div>
                        <p className="text-[10px] md:text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">Best</p>
                        <p className="text-2xl md:text-4xl font-black text-white">{highestScore}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Highest Band</p>
                    </div>
                </div>

                {/* FILTER TABS */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'all', label: 'All History' },
                        { id: 'cue-card', label: 'Cue Cards' },
                        { id: 'quick-test', label: 'Quick Tests' }, 
                        { id: 'full-exam', label: 'Full Simulation' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterType(tab.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                                filterType === tab.id 
                                    ? "bg-white text-slate-900 border-white shadow-lg" 
                                    : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* HISTORY LIST (REDESIGNED) */}
                <div className="space-y-3">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm italic bg-white/5 rounded-2xl border border-dashed border-slate-800">
                            No history found for this filter.
                        </div>
                    ) : filteredHistory.map((item, index) => {
                        const typeInfo = getTopicTypeLabel(item.topic);
                        const cleanTitle = getCleanTitle(item.topic);
                        
                        return (
                            <motion.div 
                                key={item.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedItem(item)}
                                className={`bg-[#1A1D26] hover:bg-[#20242e] border p-4 md:p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all group relative ${item.topic.includes("FULL EXAM") ? "border-indigo-500/20" : "border-slate-800 hover:border-slate-700"}`}
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    {/* Type Badge & Date */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${typeInfo.color}`}>
                                            {typeInfo.icon} {typeInfo.label}
                                        </span>
                                        <span className="text-[10px] text-slate-600 flex items-center gap-1 font-medium">
                                            • {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    
                                    {/* Main Title */}
                                    <h3 className="text-white font-bold truncate max-w-[200px] md:max-w-md text-base md:text-lg group-hover:text-blue-400 transition-colors">
                                        {cleanTitle}
                                    </h3>
                                </div>
                                
                                <div className="flex items-center gap-4 md:gap-6">
                                    {/* Band Score Circle */}
                                    <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${getScoreColor(item.overall_score)}`}>
                                        <span className="text-xs font-bold opacity-80 uppercase leading-none">Band</span>
                                        <span className="text-lg font-black leading-none">{item.overall_score}</span>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => promptDelete(e, item)}
                                            className="p-2 rounded-full text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="p-2 rounded-full text-slate-600 group-hover:text-white transition-colors">
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

      {/* DETAIL MODAL (REUSED) */}
      <AnimatePresence>
        {selectedItem && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto"
            >
                <div className="max-w-4xl mx-auto p-4 py-8">
                    <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-900/90 backdrop-blur-md py-4 z-10 border-b border-white/10 rounded-b-2xl px-4 -mx-4 md:mx-0 md:px-0">
                        <button 
                            onClick={() => setSelectedItem(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white font-bold uppercase text-sm tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to List
                        </button>
                        <h2 className="text-white font-bold hidden md:block">
                            {selectedItem.topic.includes("FULL EXAM") ? "Full Exam Result" : "Result Details"}
                        </h2>
                        <button onClick={() => setSelectedItem(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="pb-20">
                        <ScoreCard 
                            result={selectedItem.full_feedback} 
                            cue={selectedItem.topic}
                            isPremiumExternal={isPremium}
                            onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                        />
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE MODAL */}
      <AnimatePresence>
        {deleteTarget && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                    
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <Flame className="w-8 h-8 text-red-500 animate-pulse" />
                    </div>
                    
                    <h3 className="text-xl font-black text-white mb-2">Burning the evidence? 🔥</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        Are you sure you want to delete this? Don't worry, I won't tell anyone about that score. 
                        <br/><span className="text-slate-500 text-xs italic mt-2 block">(But remember, mistakes make you stronger!)</span>
                    </p>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={executeDelete}
                            className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all"
                        >
                            Yes, Burn It
                        </button>
                        <button 
                            onClick={() => setDeleteTarget(null)}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all"
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

    </main>
  );
}