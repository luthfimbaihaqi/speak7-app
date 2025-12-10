"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, PenTool, Headphones, Mic, XCircle, CheckCircle2, Zap } from "lucide-react";

export default function MissionPage() {
  return (
    <main className="min-h-screen bg-slate-950 pb-20 px-4 selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(at_100%_0%,rgba(45,212,191,0.1)_0px,transparent_50%)]"></div>
         <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(at_0%_100%,rgba(168,85,247,0.1)_0px,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pt-10">
        
        {/* Nav */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-10 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Practice
        </Link>

        {/* SECTION 1: THE 4 SKILLS */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
        >
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6">
                The IELTS <span className="text-teal-400">Puzzle</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                IELTS menguji kemampuan bahasa Inggris kamu melalui 4 pilar utama. Kebanyakan orang bisa belajar sendiri, TAPI ada satu yang paling sulit dilakukan sendirian.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <Headphones className="w-8 h-8 text-blue-400" />
                    <span className="font-bold text-white text-sm">Listening</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <BookOpen className="w-8 h-8 text-pink-400" />
                    <span className="font-bold text-white text-sm">Reading</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <PenTool className="w-8 h-8 text-yellow-400" />
                    <span className="font-bold text-white text-sm">Writing</span>
                </div>
                <div className="p-4 bg-teal-500/20 rounded-2xl border border-teal-500/50 flex flex-col items-center gap-3 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                    <Mic className="w-8 h-8 text-teal-400" />
                    <span className="font-bold text-white text-sm">Speaking</span>
                </div>
            </div>
        </motion.div>

        {/* SECTION 2: THE PROBLEM */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h2 className="text-2xl font-bold text-white mb-6">The "Speaking" Problem</h2>
            
            <div className="space-y-6">
                <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-slate-600 shrink-0" />
                    <div>
                        <h3 className="text-slate-400 font-bold mb-1">Listening & Reading</h3>
                        <p className="text-sm text-slate-500">Gampang. Bisa latihan lewat YouTube, Netflix, atau buku Cambridge. Jawabannya pasti A, B, C, atau D.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-slate-600 shrink-0" />
                    <div>
                        <h3 className="text-slate-400 font-bold mb-1">Writing</h3>
                        <p className="text-sm text-slate-500">Bisa dicek pakai Grammarly atau ChatGPT. Masih bisa dipelajari polanya sendiri.</p>
                    </div>
                </div>
                <div className="flex gap-4 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                    <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                    <div>
                        <h3 className="text-white font-bold mb-1">Speaking?</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Latihan depan cermin? <span className="text-red-400">Gak ada yang koreksi.</span><br/>
                            Sewa tutor Native Speaker? <span className="text-red-400">Mahal ($20/jam).</span><br/>
                            Cari partner latihan? <span className="text-red-400">Jadwal gak cocok & malu kalau salah.</span>
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* SECTION 3: THE SOLUTION */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" /> The Solution
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Why IELTS4our exists.</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Kami membangun platform ini untuk memecahkan satu masalah spesifik: <br/>
                <strong className="text-white">Akses Latihan Speaking Mandiri yang Terukur.</strong>
            </p>

            <div className="bg-gradient-to-br from-teal-900/20 to-slate-900 border border-teal-500/20 rounded-3xl p-8 text-left grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-white font-bold text-lg mb-2">Simulasi Tanpa Rasa Takut</h3>
                    <p className="text-slate-400 text-sm">
                        Ngomong sama AI gak perlu malu. Salah grammar? Gak ada yang nge-judge. Ulangi 100x sampai lancar.
                    </p>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-2">Feedback Instan</h3>
                    <p className="text-slate-400 text-sm">
                        Selesai ngomong, detik itu juga tau skornya. Gak perlu nunggu tutor meriksa besok pagi.
                    </p>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-2">Sesuai Standar Resmi</h3>
                    <p className="text-slate-400 text-sm">
                        AI kami dilatih untuk menilai berdasarkan Fluency, Lexical, Grammar, dan Pronunciation.
                    </p>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-2">Hemat Biaya</h3>
                    <p className="text-slate-400 text-sm">
                        Biaya sekali ngopi untuk akses latihan sepuasnya. Jauh lebih hemat dari satu sesi kursus.
                    </p>
                </div>
            </div>

            <div className="mt-12">
                <Link href="/">
                    <button className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full transition-all shadow-[0_0_30px_rgba(45,212,191,0.3)]">
                        Mulai Latihan Sekarang
                    </button>
                </Link>
            </div>

        </motion.div>

        <footer className="text-center mt-20 text-slate-600 text-xs">
             <p>&copy; 2025 IELTS4our. Your Speaking Partner.</p>
        </footer>

      </div>
    </main>
  );
}