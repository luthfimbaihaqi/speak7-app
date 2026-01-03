"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Import createPortal
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic2, Users, Zap, Crown, 
  Activity, BookOpen, Layers, Ear, 
  X, CheckCircle2, XCircle, Sparkles, PlayCircle
} from "lucide-react";

// --- DATA KONTEN EDUKASI ---
const CRITERIA_CONTENT = {
  fluency: {
    title: "Fluency & Coherence",
    icon: <Activity className="w-6 h-6 text-blue-400" />,
    color: "bg-blue-500",
    textColor: "text-blue-400",
    desc: "Speak without hesitation",
    definition: "Bukan bicara 'cepat', tapi bicara mengalir tanpa jeda diam yang panjang dan mampu menghubungkan ide antar kalimat.",
    vs: {
      band6: "I like... umm... reading because it is... err... fun.",
      band8: "I'm really into reading, primarily because it serves as a great escape from my daily routine."
    },
    aiFeature: "AI kami mendeteksi 'Silence Duration' (durasi diam). Jika terlalu banyak jeda, skor Fluency akan turun."
  },
  lexical: {
    title: "Lexical Resource",
    icon: <BookOpen className="w-6 h-6 text-pink-400" />,
    color: "bg-pink-500",
    textColor: "text-pink-400",
    desc: "Use rich vocabulary",
    definition: "Kemampuan menggunakan variasi kata yang tidak pasaran (less common words) dan penggunaan idiom yang tepat konteks.",
    vs: {
      band6: "Traffic is bad and makes me sad.",
      band8: "Traffic congestion is detrimental to my mental well-being."
    },
    aiFeature: "AI kami akan menyarankan 'C1 Synonyms' untuk mengganti kata-kata dasar (Basic Words) yang kamu ucapkan."
  },
  grammar: {
    title: "Grammatical Range",
    icon: <Layers className="w-6 h-6 text-emerald-400" />,
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    desc: "Complex sentences",
    definition: "Menggunakan variasi struktur kalimat (Simple, Compound, Complex) dan akurasi tenses yang tepat.",
    vs: {
      band6: "I go to work. I drive a car every day.",
      band8: "When I commute to work, which usually takes an hour, I prefer driving."
    },
    aiFeature: "AI kami secara otomatis mendeteksi kesalahan grammar (Tenses, Subject-Verb Agreement) dan memperbaikinya."
  },
  pronunciation: {
    title: "Pronunciation",
    icon: <Ear className="w-6 h-6 text-amber-400" />,
    color: "bg-amber-500",
    textColor: "text-amber-400",
    desc: "Clear & natural sound",
    definition: "Kejelasan suara (Clarity) dan Intonasi. Bukan soal meniru aksen bule, tapi soal mudah dipahami.",
    vs: {
      band6: "(Bergumam/Tidak Jelas) -> Penguji bingung apa yang diucapkan.",
      band8: "(Artikulasi Tegas) -> Setiap kata terdengar jelas dan intonasi hidup."
    },
    aiFeature: "Mengukur tingkat 'Intelligibility' (Keterpahaman). AI mendeteksi kata-kata yang 'tertelan' atau gumaman (mumbling) yang berpotensi menurunkan skormu."
  }
};

export default function MarketingSection({ onSelectMode }) {
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Efek untuk menandai bahwa komponen sudah di-mount di client (syarat Portal)
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <section className="max-w-6xl mx-auto mt-24 mb-12 relative z-10 px-4">
        
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#E6E8EE] mb-4">
            Why Practice with <span className="text-blue-400">IELTS4our</span>?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Kami merancang mode latihan khusus untuk membantu Speaking Anda mencapai Band 8.0, dari latihan harian hingga simulasi ujian penuh.
          </p>
        </div>

        {/* 3 Main Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          
          {/* Card 1: FREE MODE */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMode && onSelectMode('cue-card')}
            className="p-8 rounded-3xl bg-[#1A1D26] border border-slate-800 relative overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-colors flex flex-col shadow-lg"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Mic2 className="w-32 h-32 text-blue-500" />
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-500/20 w-fit">
                <Zap className="w-3 h-3" /> Free Feature
              </div>
              
              <h3 className="text-2xl font-bold text-[#E6E8EE] mb-2 group-hover:text-blue-400 transition-colors">Daily Cue Card</h3>
              <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                Mode <span className="text-slate-200 font-bold">Monolog</span> untuk membangun kebiasaan. Cocok untuk pemanasan harian.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-blue-400 font-bold text-[10px]">1</div>
                  <span>Dapatkan topik acak (Part 2) setiap hari.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-blue-400 font-bold text-[10px]">2</div>
                  <span>Rekam suaramu selama 1-2 menit.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-blue-400 font-bold text-[10px]">3</div>
                  <span>Skor instan & perbaikan grammar.</span>
                </li>
              </ul>
              
              <div className="mt-auto text-center">
                 <span className="text-blue-400 text-xs font-bold uppercase tracking-widest border-b border-blue-500/30 pb-0.5 group-hover:border-blue-500 transition-all">Try Now &rarr;</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: MOCK INTERVIEW */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMode && onSelectMode('mock-interview')}
            className="p-8 rounded-3xl bg-[#1A1D26] border border-slate-800 relative overflow-hidden group cursor-pointer hover:border-purple-500/30 transition-colors flex flex-col shadow-lg"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-32 h-32 text-purple-500" />
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6 border border-purple-500/20 w-fit">
                <Crown className="w-3 h-3" /> Pro Feature
              </div>
              
              <h3 className="text-2xl font-bold text-[#E6E8EE] mb-2 group-hover:text-purple-400 transition-colors">Quick Test</h3>
              <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                Mode <span className="text-slate-200 font-bold">Dialog Interaktif</span>. Sesi Tanya Jawab (Part 3) dengan AI Examiner.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-purple-400 font-bold text-[10px]">1</div>
                  <span>AI membacakan pertanyaan & menyimak jawabanmu.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-purple-400 font-bold text-[10px]">2</div>
                  <span>Pertanyaan lanjutan (Follow-up) dinamis.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-purple-400 font-bold text-[10px]">3</div>
                  <span>Model Answer Band 8.0+ eksklusif.</span>
                </li>
              </ul>

              <div className="mt-auto text-center">
                 <span className="text-purple-400 text-xs font-bold uppercase tracking-widest border-b border-purple-500/30 pb-0.5 group-hover:border-purple-500 transition-all">Try Now &rarr;</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: FULL SIMULATION (NEW) */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMode && onSelectMode('full-simulation')}
            className="p-8 rounded-3xl bg-[#1A1D26] border border-slate-800 relative overflow-hidden group cursor-pointer hover:border-indigo-400 transition-colors shadow-lg flex flex-col"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-32 h-32 text-indigo-400" />
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-500/20 w-fit">
                <Sparkles className="w-3 h-3" /> Ultimate Mode
              </div>
              
              <h3 className="text-2xl font-bold text-[#E6E8EE] mb-2 group-hover:text-indigo-300 transition-colors">Full Simulation</h3>
              <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                Pengalaman <span className="text-slate-200 font-bold">Ujian Nyata</span>. Selesaikan Part 1, 2, dan 3 sekaligus.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-indigo-400 font-bold text-[10px]">1</div>
                  <span>Durasi 15 menit layaknya ujian asli.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-indigo-400 font-bold text-[10px]">2</div>
                  <span>Strict Examiner Persona & Timer.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-indigo-400 font-bold text-[10px]">3</div>
                  <span>Analisis performa & prediksi skor total.</span>
                </li>
              </ul>

              <div className="mt-auto text-center">
                 <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest border-b border-indigo-500/30 pb-0.5 group-hover:border-indigo-400 transition-all">Start Exam &rarr;</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Criteria Strip (Clean Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(CRITERIA_CONTENT).map(([key, item]) => (
             <motion.button 
                key={key}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCriteria(item)}
                className="bg-[#1A1D26] border border-slate-800 p-4 rounded-2xl flex flex-col items-center text-center transition-colors cursor-pointer group shadow-sm hover:border-slate-700"
             >
                <div className="mb-3 p-2 bg-slate-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                </div>
                <h4 className="text-[#E6E8EE] font-bold text-sm flex items-center gap-1">
                    {item.title} 
                    <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">ⓘ</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
             </motion.button>
          ))}
        </div>

      </section>

      {/* --- EDUCATION MODAL (MOVED TO PORTAL) --- */}
      {/* Ini memastikan Modal dirender di document.body, di luar stacking context section di atas */}
      {mounted && createPortal(
        <AnimatePresence>
            {selectedCriteria && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedCriteria(null)}
                        className="absolute inset-0 bg-[#0F1117]/80 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-[#1A1D26] border border-slate-700 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
                    >
                        <div className={`absolute top-0 left-0 w-full h-1 ${selectedCriteria.color}`}></div>
                        <div className={`absolute -top-20 -right-20 w-40 h-40 ${selectedCriteria.color} opacity-10 blur-[50px] rounded-full`}></div>

                        <button onClick={() => setSelectedCriteria(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 bg-slate-800 rounded-xl border border-slate-700 ${selectedCriteria.textColor}`}>
                                {selectedCriteria.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#E6E8EE]">{selectedCriteria.title}</h3>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">IELTS Assessment Criteria</p>
                            </div>
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                            {selectedCriteria.definition}
                        </p>

                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6 space-y-3">
                            <div className="flex gap-3">
                                <div className="mt-0.5"><XCircle className="w-4 h-4 text-red-400" /></div>
                                <div>
                                    <p className="text-[10px] text-red-400 font-bold uppercase mb-0.5">Band 6.0 (Average)</p>
                                    <p className="text-xs text-slate-400 italic">"{selectedCriteria.vs.band6}"</p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-slate-700"></div>
                            <div className="flex gap-3">
                                <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
                                <div>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase mb-0.5">Band 8.0 (Target)</p>
                                    <p className="text-xs text-white font-medium">"{selectedCriteria.vs.band8}"</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
                            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-blue-400 mb-1 uppercase">How We Help</p>
                                <p className="text-xs text-blue-200/80 leading-relaxed">
                                    {selectedCriteria.aiFeature}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}