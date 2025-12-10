"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, BarChart3, ChevronRight, X, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import ScoreCard from "@/components/ScoreCard";
import UpgradeModal from "@/components/UpgradeModal"; 

export default function ProgressPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  const [isPremium, setIsPremium] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
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

  // --- LOGIKA BARU: RATA-RATA IELTS (PEMBULATAN 0.5) ---
  const rawSum = history.reduce((acc, curr) => acc + (curr.overall_score || 0), 0);
  const rawAvg = history.length > 0 ? rawSum / history.length : 0;
  
  const averageScore = history.length > 0 
    ? (Math.round(rawAvg * 2) / 2).toFixed(1) // Membulatkan ke 0.5 terdekat
    : "0.0";

  // --- HELPER UNTUK RENDER BADGE DIFFICULTY ---
  const renderDifficultyBadge = (item) => {
    // Kita cari data difficulty di dalam object full_feedback
    const diff = item.full_feedback?.difficulty; 

    if (!diff) return null; 

    const styles = {
        easy: "bg-green-500/20 text-green-400 border-green-500/30",
        medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        hard: "bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
    };

    const labels = {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard 🔥" 
    };

    return (
        <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[diff] || 'bg-slate-700'}`}>
            {labels[diff] || diff}
        </span>
    );
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

                {/* HISTORY LIST */}
                <div className="space-y-4">
                    {history.map((item, index) => (
                        <motion.div 
                            key={item.id || index}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedItem(item)}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors group"
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.topic.includes("Mock Interview") ? "bg-purple-500/20 text-purple-300" : "bg-teal-500/20 text-teal-300"}`}>
                                        {item.topic.includes("Mock Interview") ? "Mock Test" : "Cue Card"}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                {/* JUDUL TOPIK + BADGE DIFFICULTY */}
                                <div className="flex items-center gap-2 mt-1">
                                    <h3 className="text-white font-bold truncate max-w-[200px] md:max-w-md">
                                        {item.topic.replace("Mock Interview: ", "")}
                                    </h3>
                                    {renderDifficultyBadge(item)}
                                </div>

                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Band</p>
                                    <p className="text-xl font-black text-white">{item.overall_score}</p>
                                </div>
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
                    <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-950/90 backdrop-blur-md py-4 z-10 border-b border-white/10">
                        <button 
                            onClick={() => setSelectedItem(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white font-bold uppercase text-sm tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to List
                        </button>
                        <h2 className="text-white font-bold hidden md:block">Result Details</h2>
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