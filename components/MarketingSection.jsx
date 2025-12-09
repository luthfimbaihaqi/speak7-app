"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Mic2, Users, Zap, Crown, 
  Activity, BookOpen, Layers, Ear 
} from "lucide-react";

export default function MarketingSection() {
  return (
    <section className="max-w-5xl mx-auto mt-24 mb-12 relative z-10">
        
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Practice with <span className="text-teal-400">IELTS4our</span>?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Kami merancang dua mode latihan khusus untuk membantu Speaking Anda mencapai Band 8.0, baik untuk pemula maupun tingkat lanjut.
          </p>
        </div>

        {/* 2 Main Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          
          {/* Card 1: FREE MODE (Cue Card) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mic2 className="w-32 h-32 text-teal-500" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-widest mb-6 border border-teal-500/20">
                <Zap className="w-3 h-3" /> Free Feature
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Daily Cue Card</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Mode <span className="text-white font-bold">Monolog</span> untuk membangun kebiasaan. Cocok untuk pemanasan harian dan melatih kelancaran berbicara.
              </p>

              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-teal-400 font-bold text-xs">1</div>
                  <span>Dapatkan topik acak (Part 2) setiap hari.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-teal-400 font-bold text-xs">2</div>
                  <span>Rekam suaramu selama 1-2 menit.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-teal-400 font-bold text-xs">3</div>
                  <span>AI memberikan skor instan & perbaikan grammar.</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Card 2: PREMIUM MODE (Mock Interview) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/80 to-purple-900/20 border border-purple-500/30 relative overflow-hidden group shadow-2xl shadow-purple-900/20"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-32 h-32 text-purple-500" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                <Crown className="w-3 h-3" /> Premium Feature
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">AI Mock Interview</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Mode <span className="text-white font-bold">Dialog Interaktif</span>. Sesi Tanya Jawab Terstruktur, Jawab rangkaian pertanyaan dan bandingkan jawabanmu dengan Model Answer Band 8.0
              </p>

              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30 text-purple-300 font-bold text-xs">1</div>
                  <span>AI membacakan pertanyaan (Part 3) via suara.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30 text-purple-300 font-bold text-xs">2</div>
                  <span>Jawab pertanyaan, lalu AI akan menyimak dan memberikan pertanyaan lanjutan.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30 text-purple-300 font-bold text-xs">3</div>
                  <span><span className="text-amber-400 font-bold">New:</span> Dapatkan Model Answer Band 8.0+ eksklusif.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Criteria Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Activity className="w-5 h-5 text-blue-400"/>, title: "Fluency", desc: "Speak without hesitation" },
            { icon: <BookOpen className="w-5 h-5 text-pink-400"/>, title: "Lexical", desc: "Use rich vocabulary" },
            { icon: <Layers className="w-5 h-5 text-green-400"/>, title: "Grammar", desc: "Complex sentences" },
            { icon: <Ear className="w-5 h-5 text-orange-400"/>, title: "Pronunciation", desc: "Clear & natural sound" }
          ].map((item, i) => (
             <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                <div className="mb-3 p-2 bg-black/20 rounded-lg">{item.icon}</div>
                <h4 className="text-white font-bold text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
             </div>
          ))}
        </div>

      </section>
  );
}