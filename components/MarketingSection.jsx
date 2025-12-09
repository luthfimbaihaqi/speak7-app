"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic2, Users, Zap, Crown, 
  Activity, BookOpen, Layers, Ear, 
  X, CheckCircle2, XCircle, Sparkles
} from "lucide-react";

// --- DATA KONTEN EDUKASI ---
const CRITERIA_CONTENT = {
  fluency: {
    title: "Fluency & Coherence",
    icon: <Activity className="w-6 h-6 text-blue-400" />,
    color: "bg-blue-500",
    textColor: "text-blue-400",
    desc: "Speak without hesitation",
    definition: "Bukan bicara 'cepat', tapi bicara mengalir tanpa jeda diam (mikor) yang panjang dan mampu menghubungkan ide antar kalimat.",
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
    icon: <Layers className="w-6 h-6 text-green-400" />,
    color: "bg-green-500",
    textColor: "text-green-400",
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
    icon: <Ear className="w-6 h-6 text-orange-400" />,
    color: "bg-orange-500",
    textColor: "text-orange-400",
    desc: "Clear & natural sound",
    definition: "Kejelasan suara (Clarity) dan Intonasi. Bukan soal meniru aksen bule, tapi soal mudah dipahami.",
    vs: {
      band6: "(Bergumam/Tidak Jelas) -> Penguji bingung apa yang diucapkan.",
      band8: "(Artikulasi Tegas) -> Setiap kata terdengar jelas dan intonasi hidup."
    },
    // OPSI 2: INTELLIGIBILITY CHECK
    aiFeature: "Mengukur tingkat 'Intelligibility' (Keterpahaman). AI mendeteksi kata-kata yang 'tertelan' atau gumaman (mumbling) yang berpotensi menurunkan skormu."
  }
};

export default function MarketingSection() {
  const [selectedCriteria, setSelectedCriteria] = useState(null);

  return (
    <section className="max-w-5xl mx-auto mt-24 mb-12 relative z-10 px-4">
        
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Practice with <span className="text-teal-400">IELTS4our</span>?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Kami merancang dua mode latihan khusus untuk membantu Speaking Anda mencapai Band 8.0, baik untuk pemula maupun tingkat lanjut.
          </p>
        </div>

        {/* 2 Main Cards (TETAP SAMA) */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          
          {/* Card 1: FREE MODE */}
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

          {/* Card 2: PREMIUM MODE */}
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

        {/* Criteria Strip (INTERACTIVE) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(CRITERIA_CONTENT).map(([key, item]) => (
             <motion.button 
                key={key}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCriteria(item)}
                className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center transition-colors cursor-pointer group"
             >
                <div className="mb-3 p-2 bg-black/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                </div>
                <h4 className="text-white font-bold text-sm flex items-center gap-1">
                    {item.title} 
                    <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">ⓘ</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
             </motion.button>
          ))}
        </div>

        {/* --- EDUCATION MODAL --- */}
        <AnimatePresence>
            {selectedCriteria && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedCriteria(null)}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
                    >
                        {/* Decorative Gradient Background */}
                        <div className={`absolute top-0 left-0 w-full h-2 ${selectedCriteria.color}`}></div>
                        <div className={`absolute -top-20 -right-20 w-40 h-40 ${selectedCriteria.color} opacity-20 blur-[50px] rounded-full`}></div>

                        <button 
                            onClick={() => setSelectedCriteria(null)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 bg-black/30 rounded-xl border border-white/10 ${selectedCriteria.textColor}`}>
                                {selectedCriteria.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedCriteria.title}</h3>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">IELTS Assessment Criteria</p>
                            </div>
                        </div>

                        {/* Definition */}
                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                            {selectedCriteria.definition}
                        </p>

                        {/* VS Battle Box */}
                        <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-6 space-y-3">
                            <div className="flex gap-3">
                                <div className="mt-0.5">
                                    <XCircle className="w-4 h-4 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-red-400 font-bold uppercase mb-0.5">Band 6.0 (Average)</p>
                                    <p className="text-xs text-slate-400 italic">"{selectedCriteria.vs.band6}"</p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-white/5"></div>
                            <div className="flex gap-3">
                                <div className="mt-0.5">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-green-400 font-bold uppercase mb-0.5">Band 8.0 (Target)</p>
                                    <p className="text-xs text-white font-medium">"{selectedCriteria.vs.band8}"</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Feature Footer */}
                        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 flex gap-3 items-start">
                            <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-teal-400 mb-1 uppercase">How We Help</p>
                                <p className="text-xs text-teal-100/80 leading-relaxed">
                                    {selectedCriteria.aiFeature}
                                </p>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </section>
  );
}