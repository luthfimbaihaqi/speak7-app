"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Mic, Clock, MessageSquare, Brain, 
  CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Lightbulb, AlertTriangle, Sparkles, BookOpen
} from "lucide-react";

// --- DATA: CONTOH PERBANDINGAN BAND ---
const PART1_EXAMPLES = [
    {
        question: "Do you enjoy cooking?",
        bad: "Yes, I like cooking.",
        badBand: "5.0",
        good: "Yes, I really enjoy cooking. I usually try new recipes on weekends because it helps me relax after a long week. For example, last Sunday I made Thai green curry for the first time and it turned out great.",
        goodBand: "7.0+",
        tip: "Gunakan teknik Answer + Reason + Example. Jangan berhenti di satu kalimat."
    },
    {
        question: "Do you prefer mornings or evenings?",
        bad: "I prefer evenings.",
        badBand: "5.0",
        good: "I'd say I'm more of an evening person. I tend to feel more productive after 7 PM, probably because the house is quieter and I can focus better. Having said that, I do enjoy the occasional early morning walk.",
        goodBand: "7.0+",
        tip: "Tambahkan nuansa dengan 'Having said that...' atau 'Although...' untuk menunjukkan range."
    }
];

const PART2_EXAMPLES = [
    {
        topic: "Describe a memorable trip you took.",
        bad: "I went to Bali last year. It was very beautiful. I visited the beach and temples. The food was good. I want to go again.",
        badBand: "5.0",
        good: "I'd like to talk about a trip I took to Bali last December. The reason I went was to celebrate finishing my final exams. What made it truly memorable was visiting Uluwatu Temple at sunset — the view was absolutely breathtaking, with the cliff dropping straight into the ocean. I also tried surfing for the first time in Kuta, which was both terrifying and exhilarating. Looking back, that trip taught me the importance of taking a break and appreciating nature.",
        goodBand: "7.0+",
        tip: "Gunakan struktur: Kapan & Kenapa → Detail spesifik → Perasaan & Refleksi."
    }
];

const PART3_EXAMPLES = [
    {
        question: "Do you think technology has made traveling better?",
        bad: "Yes, because we can use Google Maps and book hotels online. Technology is very helpful.",
        badBand: "5.0",
        good: "That's an interesting question. On one hand, technology has undeniably made travel more convenient — apps like Google Maps eliminate the fear of getting lost, and platforms like Airbnb have opened up affordable accommodation options. On the other hand, some argue that over-reliance on technology takes away the spirit of adventure and spontaneity that made traveling exciting in the past. Personally, I believe the benefits outweigh the drawbacks, but it's important to occasionally disconnect and experience a place without a screen.",
        goodBand: "7.5+",
        tip: "Gunakan 'On one hand... On the other hand...' lalu tutup dengan opini personal."
    }
];

const FILLER_PHRASES = [
    { phrase: "Well, let me think about that...", usage: "Saat butuh waktu berpikir" },
    { phrase: "That's an interesting question.", usage: "Pembuka Part 3 yang natural" },
    { phrase: "To be honest...", usage: "Saat mau memberikan opini jujur" },
    { phrase: "What I mean is...", usage: "Saat ingin memperjelas poin" },
    { phrase: "I suppose...", usage: "Saat tidak 100% yakin" },
    { phrase: "As far as I'm concerned...", usage: "Saat mau tegas dengan opini" },
];

const COMMON_MISTAKES = [
    { wrong: "I am agree with you.", correct: "I agree with you.", reason: "'Agree' adalah verb, tidak butuh 'am'." },
    { wrong: "It make us easier.", correct: "It makes it easier for us.", reason: "Subject-verb agreement + struktur kalimat." },
    { wrong: "I have go to Bali.", correct: "I have been to Bali.", reason: "Present perfect pakai past participle." },
    { wrong: "The technology is very important.", correct: "Technology is very important.", reason: "Kata benda umum (general noun) tidak pakai 'the'." },
    { wrong: "I very like music.", correct: "I really like music.", reason: "'Very' tidak bisa langsung sebelum verb." },
    { wrong: "Nowadays, people is more busy.", correct: "Nowadays, people are busier.", reason: "'People' adalah plural + gunakan comparative." },
];

// --- KOMPONEN: Collapsible Example Card ---
const ExampleCard = ({ question, bad, badBand, good, goodBand, tip }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
                <p className="text-slate-200 text-sm font-medium pr-4">"{question}"</p>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-4">
                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <XCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Band {badBand} — Terlalu Pendek</span>
                                </div>
                                <p className="text-slate-400 text-sm italic">"{bad}"</p>
                            </div>
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Band {goodBand} — Elaborasi</span>
                                </div>
                                <p className="text-slate-200 text-sm leading-relaxed">"{good}"</p>
                            </div>
                            <div className="flex gap-2 items-start bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
                                <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-200/80">{tip}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- SECTION WRAPPER ---
const SectionHeader = ({ icon, label, title, subtitle, color = "teal" }) => {
    const colors = {
        teal: "bg-teal-500/10 border-teal-500/20 text-teal-300",
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-300",
        purple: "bg-purple-500/10 border-purple-500/20 text-purple-300",
        amber: "bg-amber-500/10 border-amber-500/20 text-amber-300",
        rose: "bg-rose-500/10 border-rose-500/20 text-rose-300",
    };

    return (
        <div className="mb-8">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${colors[color]} text-xs font-bold uppercase tracking-widest mb-4 border`}>
                {icon} {label}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h2>
            {subtitle && <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{subtitle}</p>}
        </div>
    );
};


export default function MissionPage() {
  return (
    <main className="min-h-screen bg-slate-950 pb-20 px-4 selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(at_100%_0%,rgba(45,212,191,0.07)_0px,transparent_50%)]"></div>
         <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(at_0%_100%,rgba(59,130,246,0.07)_0px,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pt-10">
        
        {/* Nav */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-10 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Practice
        </Link>

        {/* HERO */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-widest mb-6">
                <BookOpen className="w-3 h-3" /> Speaking Guide
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                Tips & Tricks <span className="text-teal-400">IELTS Speaking</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                Panduan praktis untuk membantu kamu mempersiapkan IELTS Speaking test. 
                Pelajari strategi per Part, filler phrases, dan kesalahan umum yang harus dihindari.
            </p>
        </motion.div>

        {/* SECTION 1: KENALI FORMAT */}
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-20"
        >
            <SectionHeader 
                icon={<Clock className="w-3 h-3" />}
                label="Kenali Formatnya"
                title="3 Part dalam 11-14 Menit"
                subtitle="IELTS Speaking test terdiri dari 3 bagian. Masing-masing menguji kemampuan yang berbeda."
                color="teal"
            />

            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</span>
                        <h3 className="text-white font-bold">Interview</h3>
                    </div>
                    <p className="text-slate-400 text-xs mb-3 leading-relaxed">Pertanyaan personal tentang diri kamu, kehidupan sehari-hari, hobi, dll.</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> 4-5 menit
                    </div>
                </div>
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">2</span>
                        <h3 className="text-white font-bold">Long Turn</h3>
                    </div>
                    <p className="text-slate-400 text-xs mb-3 leading-relaxed">Monolog 1-2 menit tentang topik tertentu. Kamu dapat 1 menit untuk persiapan.</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> 3-4 menit
                    </div>
                </div>
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold">3</span>
                        <h3 className="text-white font-bold">Discussion</h3>
                    </div>
                    <p className="text-slate-400 text-xs mb-3 leading-relaxed">Diskusi mendalam tentang topik abstrak. Penguji menguji kemampuan berpikir kritis.</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> 4-5 menit
                    </div>
                </div>
            </div>
        </motion.section>

        {/* SECTION 2: TIPS PART 1 */}
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-20"
        >
            <SectionHeader 
                icon={<Mic className="w-3 h-3" />}
                label="Part 1: Interview"
                title="Jangan Jawab Satu Kalimat"
                subtitle="Part 1 adalah pemanasan. Penguji ingin kamu bicara natural, bukan jawab singkat seperti interogasi. Gunakan teknik Answer + Reason + Example."
                color="blue"
            />

            <div className="space-y-4">
                {PART1_EXAMPLES.map((ex, i) => (
                    <ExampleCard key={i} {...ex} />
                ))}
            </div>

            <div className="mt-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
                <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    Ringkasan Part 1
                </h4>
                <div className="space-y-2 text-sm text-slate-400">
                    <p>→ Jawab minimal 2-3 kalimat untuk setiap pertanyaan.</p>
                    <p>→ Gunakan connector: <span className="text-slate-200">"because"</span>, <span className="text-slate-200">"for example"</span>, <span className="text-slate-200">"however"</span>.</p>
                    <p>→ Jangan hafalan — penguji bisa tahu dan itu menurunkan skor.</p>
                    <p>→ Santai saja, Part 1 bukan bagian tersulit.</p>
                </div>
            </div>
        </motion.section>

        {/* SECTION 3: TIPS PART 2 */}
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-20"
        >
            <SectionHeader 
                icon={<MessageSquare className="w-3 h-3" />}
                label="Part 2: Long Turn"
                title="1 Menit Persiapan = Senjata Rahasia"
                subtitle="Banyak peserta panik saat dapat topic card. Padahal 1 menit prep time itu CUKUP kalau kamu tahu cara memanfaatkannya."
                color="purple"
            />

            {/* Prep Time Strategy */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" /> Strategi 1 Menit Persiapan
                </h4>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                        <div>
                            <p className="text-slate-200 text-sm font-medium">Tulis keyword, BUKAN kalimat penuh</p>
                            <p className="text-slate-500 text-xs mt-1">Contoh: "Bali — December — sunset — Uluwatu — surfing — peaceful"</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                        <div>
                            <p className="text-slate-200 text-sm font-medium">Ikuti urutan: Kapan & Kenapa → Detail → Perasaan</p>
                            <p className="text-slate-500 text-xs mt-1">Ini membuat ceritamu mengalir natural seperti storytelling.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                        <div>
                            <p className="text-slate-200 text-sm font-medium">JANGAN berhenti sebelum penguji menghentikanmu</p>
                            <p className="text-slate-500 text-xs mt-1">Kalau kehabisan ide, tambahkan: "Looking back..." atau "What I learned from this was..."</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {PART2_EXAMPLES.map((ex, i) => (
                    <ExampleCard key={i} question={ex.topic} {...ex} />
                ))}
            </div>
        </motion.section>

        {/* SECTION 4: TIPS PART 3 */}
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-20"
        >
            <SectionHeader 
                icon={<Brain className="w-3 h-3" />}
                label="Part 3: Discussion"
                title="Tunjukkan Kemampuan Berpikir Kritis"
                subtitle="Part 3 adalah bagian tersulit. Penguji menguji kemampuanmu menganalisis, membandingkan, dan berpendapat tentang topik abstrak."
                color="amber"
            />

            {/* Strategy Cards */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-bold mb-4">Teknik Menjawab Part 3</h4>
                <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                        <span className="text-amber-400 font-bold text-sm shrink-0 mt-0.5">01</span>
                        <div>
                            <p className="text-slate-200 text-sm font-medium">Berikan opini → Alasan → Contoh</p>
                            <p className="text-slate-500 text-xs mt-1">"I believe... mainly because... For instance..."</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <span className="text-amber-400 font-bold text-sm shrink-0 mt-0.5">02</span>
                        <div>
                            <p className="text-slate-200 text-sm font-medium">Pertimbangkan dua sisi</p>
                            <p className="text-slate-500 text-xs mt-1">"On one hand... On the other hand... Personally, I think..."</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <span className="text-amber-400 font-bold text-sm shrink-0 mt-0.5">03</span>
                        <div>
                            <p className="text-slate-200 text-sm font-medium">Perluas dengan perspektif berbeda</p>
                            <p className="text-slate-500 text-xs mt-1">"From the government's perspective..." atau "Younger generations might argue that..."</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {PART3_EXAMPLES.map((ex, i) => (
                    <ExampleCard key={i} {...ex} />
                ))}
            </div>
        </motion.section>

        {/* SECTION 5: CHEAT SHEET */}
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
        >
            <SectionHeader 
                icon={<Lightbulb className="w-3 h-3" />}
                label="Cheat Sheet"
                title="Filler Phrases & Kesalahan Umum"
                subtitle="Dua senjata rahasia: filler phrases untuk menghindari dead air, dan daftar kesalahan grammar yang sering dilakukan orang Indonesia."
                color="rose"
            />

            {/* Filler Phrases */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-400" /> Filler Phrases yang Aman Dipakai
                </h4>
                <p className="text-slate-500 text-xs mb-4">Dead air (diam terlalu lama) menurunkan skor Fluency. Gunakan filler ini saat butuh waktu berpikir.</p>
                <div className="grid md:grid-cols-2 gap-3">
                    {FILLER_PHRASES.map((item, i) => (
                        <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                            <p className="text-teal-300 text-sm font-medium">"{item.phrase}"</p>
                            <p className="text-slate-500 text-[11px]">{item.usage}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Common Mistakes */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h4 className="text-white font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> Kesalahan Grammar Umum Orang Indonesia
                    </h4>
                    <p className="text-slate-500 text-xs mt-1">Perbaiki kesalahan ini dan skor Grammar kamu bisa naik signifikan.</p>
                </div>
                <div className="divide-y divide-white/5">
                    {COMMON_MISTAKES.map((item, i) => (
                        <div key={i} className="p-5 hover:bg-white/[0.02] transition-colors">
                            <div className="flex flex-col md:flex-row gap-3 md:items-center text-sm mb-2">
                                <div className="text-rose-400 line-through decoration-rose-500/50 md:w-1/2 opacity-80 flex gap-2 items-start">
                                    <XCircle className="w-4 h-4 shrink-0 mt-0.5"/> 
                                    <span>"{item.wrong}"</span>
                                </div>
                                <div className="text-emerald-400 font-bold md:w-1/2 flex gap-2 items-start">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5"/> 
                                    <span>"{item.correct}"</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 pl-6 border-l-2 border-slate-800 ml-1">💡 {item.reason}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>

        {/* CTA */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-center"
        >
            <h2 className="text-2xl font-bold text-white mb-4">Sudah Siap Latihan?</h2>
            <p className="text-slate-400 text-sm mb-8">Teori tanpa praktik tidak akan membawa hasil. Mulai latihan speaking sekarang.</p>
            <Link href="/">
                <button className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full transition-all shadow-[0_0_30px_rgba(45,212,191,0.3)]">
                    Mulai Latihan Sekarang
                </button>
            </Link>
        </motion.div>

        <footer className="text-center mt-20 text-slate-600 text-xs">
             <p>&copy; 2025 IELTS4our. Your Speaking Partner.</p>
        </footer>

      </div>
    </main>
  );
}