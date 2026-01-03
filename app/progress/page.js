"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, BarChart3, ChevronRight, X, Crown, Loader2, Trash2, Filter, Flame, Sparkles, Zap } from "lucide-react";
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
                .select('is_premium, premium_expiry')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                const isStillValid = profile.is_premium && (profile.premium_expiry > Date.now());
                setIsPremium(isStillValid); 
            }
        }
        fetchHistory(userId);
    }
    checkUserStatus();
  }, []);

  // --- UPDATE LOGIC FILTER (SUPPORT QUICK TEST & LEGACY MOCK) ---
  useEffect(() => {
    if (filterType === "all") {
        setFilteredHistory(history);
    } else if (filterType === "cue-card") {
        // Exclude Mock, Quick Test & Full Exam
        setFilteredHistory(history.filter(item => 
            !item.topic.includes("Mock Interview") && 
            !item.topic.includes("QUICK TEST") && 
            !item.topic.includes("FULL EXAM")
        ));
    } else if (filterType === "quick-test") {
        // Gabungkan "Quick Test" (Baru) dan "Mock Interview" (Lama)
        setFilteredHistory(history.filter(item => 
            item.topic.includes("QUICK TEST") || item.topic.includes("Mock Interview")
        ));
    } else if (filterType === "full-exam") {
        // Filter khusus Full Exam
        setFilteredHistory(history.filter(item => item.topic.includes("FULL EXAM")));
    }
  }, [filterType, history]);

  const fetchHistory = async (userId) => {
    try {
        let combinedData = [];

        // A. DATA CLOUD
        if (userId) {
            const { data, error } = await supabase
                .from('practice_history')
                .select('*')
                .eq('user_id', userId);

            if (!error && data) combinedData = [...data];
        }

        // B. DATA LOKAL
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
            combinedData = [...combinedData, ...normalizedLocal];
        }

        combinedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setHistory(combinedData);
    } catch (err) {
        console.error("Error fetching history:", err);
    } finally {
        setLoading(false);
    }
  };

  // --- STEP 1: BUKA MODAL DELETE ---
  const promptDelete = (e, item) => {
    e.stopPropagation(); 
    setDeleteTarget(item);
  };

  // --- STEP 2: EKSEKUSI HAPUS ---
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
            const { error } = await supabase
                .from('practice_history')
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
  const averageScore = history.length > 0 
    ? (Math.round(rawAvg * 2) / 2).toFixed(1) 
    : "0.0";

  const renderDifficultyBadge = (item) => {
    const diff = item.full_feedback?.difficulty; 
    if (!diff) return null; 

    const styles = {
        easy: "bg-green-500/20 text-green-400 border-green-500/30",
        medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        hard: "bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
    };

    const labels = { easy: "Easy", medium: "Medium", hard: "Hard 🔥" };

    return (
        <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[diff] || 'bg-slate-700'}`}>
            {labels[diff] || diff}
        </span>
    );
  };

  // --- HELPER UNTUK BADGE TIPE LATIHAN (UPDATED) ---
  const getBadgeStyle = (topic) => {
      if (topic.includes("FULL EXAM")) {
          return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]";
      } else if (topic.includes("QUICK TEST") || topic.includes("Mock Interview")) {
          // Ungu untuk Quick Test (Consistent with Dashboard)
          return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      } else {
          // Teal untuk Cue Card
          return "bg-teal-500/20 text-teal-300 border border-teal-500/30";
      }
  };

  const getBadgeLabel = (topic) => {
      if (topic.includes("FULL EXAM")) return "Full Simulation";
      if (topic.includes("QUICK TEST") || topic.includes("Mock Interview")) return "Quick Test";
      return "Cue Card";
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* HEADER */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Back to Practice
        </Link>
        {isPremium && (
            <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-yellow-500/20 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Pro Member
            </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Your Progress 📈</h1>
        <p className="text-slate-400 mb-8">Lacak perkembangan Speaking IELTS kamu dari waktu ke waktu.</p>

        {loading ? (
             <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
             </div>
        ) : history.length === 0 ? (
             <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-slate-400 mb-4">Belum ada riwayat latihan. Yuk mulai latihan sekarang!</p>
                <Link href="/" className="px-6 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full">Start Practice</Link>
             </div>
        ) : (
            <>
                {/* STATS CARDS */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 text-center">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Practices</p>
                        <p className="text-3xl font-black text-white">{history.length}</p>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 text-center">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Average Band</p>
                        <p className="text-3xl font-black text-teal-400">{averageScore}</p>
                    </div>
                </div>

                {/* FILTER TABS (UPDATED) */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'all', label: 'All History' },
                        { id: 'cue-card', label: 'Cue Cards' },
                        { id: 'quick-test', label: 'Quick Tests' }, // Renamed & Updated Logic
                        { id: 'full-exam', label: 'Full Simulation' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterType(tab.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                                filterType === tab.id 
                                    ? "bg-white text-slate-900 border-white" 
                                    : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* HISTORY LIST */}
                <div className="space-y-4">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm">No history found for this filter.</div>
                    ) : filteredHistory.map((item, index) => (
                        <motion.div 
                            key={item.id || index}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedItem(item)}
                            className={`bg-white/5 hover:bg-white/10 border p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors group relative ${item.topic.includes("FULL EXAM") ? "border-indigo-500/30 bg-indigo-900/10" : "border-white/5"}`}
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${getBadgeStyle(item.topic)}`}>
                                        {item.topic.includes("FULL EXAM") && <Sparkles className="w-3 h-3" />}
                                        {item.topic.includes("QUICK TEST") && <Zap className="w-3 h-3" />}
                                        {getBadgeLabel(item.topic)}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-1">
                                    <h3 className="text-white font-bold truncate max-w-[150px] md:max-w-sm">
                                        {/* Clean Topic Name */}
                                        {item.topic
                                            .replace("Mock Interview: ", "")
                                            .replace("FULL EXAM: ", "")
                                            .replace("QUICK TEST: ", "")}
                                    </h3>
                                    {renderDifficultyBadge(item)}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Band</p>
                                    <p className={`text-xl font-black ${item.topic.includes("FULL EXAM") ? "text-indigo-400" : "text-white"}`}>{item.overall_score}</p>
                                </div>
                                
                                {/* DELETE BUTTON */}
                                <button 
                                    onClick={(e) => promptDelete(e, item)}
                                    className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/30"
                                    title="Delete Result"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-900 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </>
        )}
      </div>

      {/* DETAIL MODAL */}
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