"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic2, Users, Zap, Crown, 
  Activity, BookOpen, Layers, Ear, 
  X, CheckCircle2, XCircle, Sparkles, PlayCircle
} from "lucide-react";

const CRITERIA_CONTENT = {
  fluency: {
    title: "Fluency & Coherence",
    icon: <Activity className="w-6 h-6 text-[#4A6B8F]" />,
    color: "bg-[#4A6B8F]",
    textColor: "text-[#4A6B8F]",
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
    icon: <BookOpen className="w-6 h-6 text-[#D17A5C]" />,
    color: "bg-[#D17A5C]",
    textColor: "text-[#D17A5C]",
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
    icon: <Layers className="w-6 h-6 text-[#8FA68E]" />,
    color: "bg-[#8FA68E]",
    textColor: "text-[#8FA68E]",
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
    icon: <Ear className="w-6 h-6 text-[#C9974C]" />,
    color: "bg-[#C9974C]",
    textColor: "text-[#C9974C]",
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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <section className="max-w-6xl mx-auto mt-24 mb-12 relative z-10 px-4">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4 font-display tracking-tight">
            Why Practice with <span className="text-[#D17A5C]">IELTS4our</span>?
          </h2>
          <p className="text-[#525252] max-w-2xl mx-auto">
            Kami merancang mode latihan khusus untuk membantu Speaking Anda mencapai Band 8.0, dari latihan harian hingga simulasi ujian penuh.
          </p>
        </div>

        {/* 3 Main Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          
          {/* Card 1: FREE MODE */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMode && onSelectMode('cue-card')}
            className="p-8 rounded-3xl bg-[#FAF6EC] border border-[#1A1A1A]/10 relative overflow-hidden group cursor-pointer hover:border-[#D17A5C]/30 transition-colors flex flex-col shadow-sm hover:shadow-md"
          >
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D17A5C]/10 text-[#D17A5C] text-xs font-bold uppercase tracking-widest mb-6 border border-[#D17A5C]/20 w-fit">
                Free Feature
              </div>
              
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#D17A5C] transition-colors font-display">Daily Cue Card</h3>
              <p className="text-[#525252] mb-6 leading-relaxed text-sm">
                Mode <span className="text-[#1A1A1A] font-bold">Monolog</span> untuk membangun kebiasaan. Cocok untuk pemanasan harian.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-[#525252]">
                  <div className="w-5 h-5 rounded-full bg-[#F8F5EE] flex items-center justify-center shrink-0 border border-[#1A1A1A]/10 text-[#D17A5C] font-bold text-[10px]">1</div>
                  <span>Dapatkan topik acak (Part 2) setiap hari.</span>
                </li>
                <li className="flex gap-3 text-sm text-[#525252]">
                  <div className="w-5 h-5 rounded-full bg-[#F8F5EE] flex items-center justify-center shrink-0 border border-[#1A1A1A]/10 text-[#D17A5C] font-bold text-[10px]">2</div>
                  <span>Rekam suaramu selama 1-2 menit.</span>
                </li>
                <li className="flex gap-3 text-sm text-[#525252]">
                  <div className="w-5 h-5 rounded-full bg-[#F8F5EE] flex items-center justify-center shrink-0 border border-[#1A1A1A]/10 text-[#D17A5C] font-bold text-[10px]">3</div>
                  <span>Skor instan & perbaikan grammar.</span>
                </li>
              </ul>
              
              <div className="mt-auto text-center">
                 <span className="text-[#D17A5C] text-xs font-bold uppercase tracking-widest border-b border-[#D17A5C]/30 pb-0.5 group-hover:border-[#D17A5C] transition-all">Try Now &rarr;</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: QUICK TEST */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMode && onSelectMode('quick')}
            className="p-8 rounded-3xl bg-[#FAF6EC] border border-[#1A1A1A]/10 relative overflow-hidden group cursor-pointer hover:border-[#4A6B8F]/30 transition-colors flex flex-col shadow-sm hover:shadow-md"
          >
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A6B8F]/10 text-[#4A6B8F] text-xs font-bold uppercase tracking-widest mb-6 border border-[#4A6B8F]/20 w-fit">
                1 Token
              </div>
              
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#4A6B8F] transition-colors font-display">Quick Test</h3>
              <p className="text-[#525252] mb-6 leading-relaxed text-sm">
                Mode <span className="text-[#1A1A1A] font-bold">Dialog Interaktif</span>. Sesi Tanya Jawab (Part 3) dengan AI Examiner.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-[#525252]">
                  <div className="w-5 h-5 rounded-full bg-[#F8F5EE] flex items-center justify-center shrink-0 border border-[#1A1A1A]/10 text-[#4A6B8F] font-bold text-[10px]">1</div>
                  <span>AI membacakan pertanyaan & menyimak jawabanmu.</span>
                </li>
                <li className="flex gap-3 text-sm text-[#525252]">
                  <div className="w-5 h-5 rounded-full bg-[#F8F5EE] flex items-center justify-center shrink-0 border border-[#1A1A1A]/10 text-[#4A6B8F] font-bold text-[10px]">2</div>
                  <span>Pertanyaan lanjutan (Follow-up) dinamis.</span>
                </li>
                <li className="flex gap-3 text-sm text-[#525252]">
                  <div className="w-5 h-5 rounded-full bg-[#F8F5EE] flex items-center justify-center shrink-0 border border-[#1A1A1A]/10 text-[#4A6B8F] font-bold text-[10px]">3</div>
                  <span>Model Answer Band 8.0+ eksklusif.</span>
                </li>
              </ul>

              <div className="mt-auto text-center">
                 <span className="text-[#4A6B8F] text-xs font-bold uppercase tracking-widest border-b border-[#4A6B8F]/30 pb-0.5 group-hover:border-[#4A6B8F] transition-all">Try Now &rarr;</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: FULL SIMULATION */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMode && onSelectMode('full')}
            className="p-8 rounded-3xl bg-[#FAF6EC] border border-[#1A1A1A]/10 relative overflow-hidden group cursor-pointer hover:border-[#1A1A1A]/30 transition-colors shadow-sm hover:shadow-md flex flex-col"
          >
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A]/10 text-[#1A1A1A] text-xs font-bold uppercase tracking-widest mb-6 border border-[#1A1A1A]/20 w-fit">
                3 Tokens
              </div>
              
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#525252] transition-colors font-display">Full Simulation</h3>
              <p className="text-[#525252] mb-6 leading-relaxed text-sm">
                Pengalaman <span className="text-[#1A1A1A] font-bold">Ujian Nyata</span>. Selesaikan Part 1, 2, dan 3 sekaligus.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-sm text-[#525252]">
                  <div className="w-5 h-5 rounded-full bg-[#F8F5EE] flex items-center justify-center shrink-0 border border-[#1A1A1A]/10 text-[#1A1A1A] font-bold text-[10px]">1</div>
                  <span>Durasi 15 menit layaknya ujian asli.</span>
                </li>
                <li className="flex gap-3 text-sm text-[#525252]">
                  <div className="w-5 h-5 rounded-full bg-[#F8F5EE] flex items-center justify-center shrink-0 border border-[#1A1A1A]/10 text-[#1A1A1A] font-bold text-[10px]">2</div>
                  <span>Interaksi natural dengan standar penguji Native.</span>
                </li>
                <li className="flex gap-3 text-sm text-[#525252]">
                  <div className="w-5 h-5 rounded-full bg-[#F8F5EE] flex items-center justify-center shrink-0 border border-[#1A1A1A]/10 text-[#1A1A1A] font-bold text-[10px]">3</div>
                  <span>Analisis performa & prediksi skor total.</span>
                </li>
              </ul>

              <div className="mt-auto text-center">
                 <span className="text-[#1A1A1A] text-xs font-bold uppercase tracking-widest border-b border-[#1A1A1A]/30 pb-0.5 group-hover:border-[#1A1A1A] transition-all">Start Exam &rarr;</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Criteria Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(CRITERIA_CONTENT).map(([key, item]) => (
             <motion.button 
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCriteria(item)}
                className="bg-[#FAF6EC] border border-[#1A1A1A]/10 p-4 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer group shadow-sm hover:shadow-md hover:border-[#1A1A1A]/20"
             >
                <div className="mb-3 p-2 bg-[#F8F5EE] border border-[#1A1A1A]/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                </div>
                <h4 className="text-[#1A1A1A] font-bold text-sm flex items-center gap-1">
                    {item.title} 
                    <span className="text-[10px] text-[#525252] opacity-0 group-hover:opacity-100 transition-opacity">i</span>
                </h4>
                <p className="text-xs text-[#525252] mt-1">{item.desc}</p>
             </motion.button>
          ))}
        </div>

      </section>

      {/* EDUCATION MODAL (PORTAL) */}
      {mounted && createPortal(
        <AnimatePresence>
            {selectedCriteria && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedCriteria(null)}
                        className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-[#FAF6EC] border border-[#1A1A1A]/10 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
                    >
                        <div className={`absolute top-0 left-0 w-full h-1 ${selectedCriteria.color}`}></div>

                        <button onClick={() => setSelectedCriteria(null)} className="absolute top-4 right-4 text-[#525252] hover:text-[#1A1A1A] transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 bg-[#F8F5EE] rounded-xl border border-[#1A1A1A]/10 ${selectedCriteria.textColor}`}>
                                {selectedCriteria.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#1A1A1A] font-display">{selectedCriteria.title}</h3>
                                <p className="text-xs text-[#525252] uppercase font-bold tracking-wider">IELTS Assessment Criteria</p>
                            </div>
                        </div>

                        <p className="text-[#525252] text-sm leading-relaxed mb-6">
                            {selectedCriteria.definition}
                        </p>

                        <div className="bg-[#F8F5EE] rounded-xl p-4 border border-[#1A1A1A]/10 mb-6 space-y-3">
                            <div className="flex gap-3">
                                <div className="mt-0.5"><XCircle className="w-4 h-4 text-[#D17A5C]" /></div>
                                <div>
                                    <p className="text-[10px] text-[#D17A5C] font-bold uppercase mb-0.5">Band 6.0 (Average)</p>
                                    <p className="text-xs text-[#525252] italic">"{selectedCriteria.vs.band6}"</p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-[#1A1A1A]/10"></div>
                            <div className="flex gap-3">
                                <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-[#8FA68E]" /></div>
                                <div>
                                    <p className="text-[10px] text-[#8FA68E] font-bold uppercase mb-0.5">Band 8.0 (Target)</p>
                                    <p className="text-xs text-[#1A1A1A] font-medium">"{selectedCriteria.vs.band8}"</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#4A6B8F]/5 border border-[#4A6B8F]/20 rounded-xl p-4 flex gap-3 items-start">
                            <Sparkles className="w-5 h-5 text-[#4A6B8F] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-[#4A6B8F] mb-1 uppercase">How We Help</p>
                                <p className="text-xs text-[#525252] leading-relaxed">
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