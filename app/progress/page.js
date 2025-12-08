"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Trophy, Activity, Flame, X, Eye } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { supabase } from "@/utils/supabaseClient"; // --- IMPORT SUPABASE ---
import ScoreCard from "@/components/ScoreCard"; 

export default function ProgressPage() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0, best: 0, streak: 0 });
  const [selectedResult, setSelectedResult] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // --- LOAD DATA HYBRID (DB or LOCAL) ---
    async function loadData() {
        const currentStreak = parseInt(localStorage.getItem("ielts4our_streak") || "0");
        let parsedData = [];

        // 1. Cek User Login
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // A. JIKA LOGIN: Ambil dari Supabase
            console.log("Loading history from Supabase...");
            const { data, error } = await supabase
                .from('practice_history')
                .select('*')
                .order('created_at', { ascending: false }); // Urutkan terbaru

            if (data) {
                // Format data DB agar sama strukturnya dengan data LocalStorage
                parsedData = data.map(item => ({
                    id: item.id,
                    date: new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }),
                    topic: item.topic,
                    overall: item.overall_score,
                    fluency: item.fluency,
                    grammar: item.grammar,
                    // Spread full_feedback (detail skor) ke object utama
                    ...item.full_feedback 
                }));
            }
        } else {
            // B. JIKA GUEST: Ambil dari LocalStorage
            console.log("Loading history from LocalStorage...");
            const storedData = localStorage.getItem("ielts4our_history");
            if (storedData) parsedData = JSON.parse(storedData);
        }

        // --- HITUNG STATISTIK ---
        setHistory(parsedData);
        
        if (parsedData.length > 0) {
            const total = parsedData.length;
            const sum = parsedData.reduce((acc, curr) => acc + (curr.overall || 0), 0);
            const avg = (sum / total).toFixed(1);
            const max = Math.max(...parsedData.map(item => item.overall || 0));
            setStats({ total, average: avg, best: max, streak: currentStreak });
        } else {
            setStats(prev => ({ ...prev, streak: currentStreak }));
        }
    }

    loadData();

    // Cek Premium (Tetap via LocalStorage sementara, sampai Fase 3)
    const expiryStr = localStorage.getItem("ielts4our_premium_expiry");
    if (expiryStr && Date.now() < parseInt(expiryStr)) {
        setIsPremium(true);
    }
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          <p className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-teal-400">Band {payload[0].value}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-[150px] truncate">
            {payload[0].payload.topic}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-slate-950 pb-20 px-4 selection:bg-teal-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(45,212,191,0.15)_0px,transparent_50%)]"></div>
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(at_100%_100%,rgba(168,85,247,0.15)_0px,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pt-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">My Progress</h1>
            <p className="text-slate-400 text-sm">Track your improvement journey.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
           <StatCard icon={<Activity className="w-4 h-4 text-blue-400"/>} label="Total Practice" value={stats.total} />
           <StatCard icon={<Flame className="w-4 h-4 text-orange-500"/>} label="Day Streak" value={stats.streak} />
           <StatCard icon={<TrendingUp className="w-4 h-4 text-teal-400"/>} label="Average Score" value={stats.average} />
           <StatCard icon={<Trophy className="w-4 h-4 text-yellow-400"/>} label="Best Score" value={stats.best} />
        </div>

        {/* Chart Section */}
        {history.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md shadow-2xl"
          >
             <h3 className="text-white font-bold mb-6 flex items-center gap-2">
               <span className="w-2 h-6 bg-teal-500 rounded-full"></span>
               Score History (Last 10)
             </h3>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[...history].reverse().slice(-10)}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 9]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} hide/>
                    <Tooltip content={<CustomTooltip />} cursor={{stroke: 'white', strokeWidth: 1, strokeDasharray: '4 4'}} />
                    <Area type="monotone" dataKey="overall" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 mb-8">
            <p className="text-slate-400">Belum ada data latihan. Yuk mulai rekam!</p>
          </div>
        )}

        {/* History List */}
        <div className="space-y-4">
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest px-2">Recent Activity</h3>
          
          {history.length === 0 && <p className="text-slate-600 text-sm text-center italic">No history found.</p>}

          {history.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedResult(item)} 
              className="bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-xl flex justify-between items-center transition-all group cursor-pointer"
            >
               <div className="flex items-center gap-4 overflow-hidden">
                 <div className="p-3 bg-slate-900 rounded-lg text-slate-400 font-mono text-xs text-center min-w-[50px]">
                    <div className="font-bold text-white">{item.date.split(" ")[0]}</div>
                    <div>{item.date.split(" ")[1]}</div>
                 </div>
                 <div className="min-w-0">
                   <p className="text-white font-medium truncate pr-4 text-sm md:text-base group-hover:text-teal-300 transition-colors">
                     {item.topic}
                   </p>
                   <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400">Fluency: {item.fluency}</span>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400">Grammar: {item.grammar}</span>
                   </div>
                 </div>
               </div>

               <div className="text-right flex items-center gap-4">
                 <div>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-blue-500">
                        {item.overall}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Overall</div>
                 </div>
                 <div className="hidden md:block text-slate-600 group-hover:text-white transition-colors">
                    <Eye className="w-5 h-5" />
                 </div>
               </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* --- MODAL DETAIL POPUP --- */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex justify-end p-4 border-b border-white/5 shrink-0">
                    <button 
                        onClick={() => setSelectedResult(null)} 
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto p-2 md:p-6">
                    <ScoreCard 
                        result={selectedResult} 
                        cue={selectedResult.topic} 
                        isPremiumExternal={isPremium} 
                        onOpenUpgradeModal={() => alert("Go to Home to Upgrade!")} 
                    />
                </div>
            </motion.div>
        </div>
      )}

    </main>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl text-center hover:bg-white/10 transition-colors">
       <div className="flex justify-center mb-2 bg-white/5 w-8 h-8 items-center rounded-full mx-auto">{icon}</div>
       <div className="text-xl md:text-2xl font-bold text-white mb-1">{value}</div>
       <div className="text-[10px] text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  )
}