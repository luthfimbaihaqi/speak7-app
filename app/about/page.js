"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram, Linkedin, GraduationCap, Briefcase, Code, Rocket, Mail } from "lucide-react";

export default function AboutPage() {
  const milestones = [
    {
      year: "Education",
      title: "English Literature Graduate",
      desc: "Memahami fundamental bahasa dan linguistik secara mendalam.",
      icon: <GraduationCap className="w-4 h-4 text-teal-400" />
    },
    {
      year: "Experience",
      title: "IELTS Executive at IDP Education",
      desc: "1 tahun di industri edukasi. Berinteraksi langsung dengan ribuan calon test-taker dan memahami struggle mereka.",
      icon: <Briefcase className="w-4 h-4 text-blue-400" />
    },
    {
      year: "Pivot",
      title: "Self-Taught Developer",
      desc: "Menggabungkan wawasan edukasi dengan teknologi modern untuk menciptakan solusi yang scalable.",
      icon: <Code className="w-4 h-4 text-purple-400" />
    },
    {
      year: "2025",
      title: "Founder IELTS4OUR",
      desc: "Membangun platform latihan IELTS yang demokratis, terjangkau, dan efektif.",
      icon: <Rocket className="w-4 h-4 text-amber-400" />
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 pb-20 px-4 selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Background Mesh (Subtle & Elegant) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_50%_0%,rgba(45,212,191,0.1)_0px,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pt-10">
        
        {/* Nav */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-10 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* MAIN CARD */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl relative"
        >
            {/* Dekorasi Garis Atas */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-purple-500 to-amber-500 opacity-50"></div>

            {/* HEADER: PHOTO & INTRO */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
                <div className="relative shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-xl">
                        {/* FOTO: Full Color & Zoom on Hover */}
                        <div className="w-full h-full rounded-full overflow-hidden relative transition-transform duration-500 hover:scale-110">
                            <Image 
                                src="/luthfi-profile-idp.jpg" 
                                alt="Luthfi Muhammad Baihaqi"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    {/* Status Dot */}
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-teal-500 border-4 border-slate-900 rounded-full" title="Building features..."></div>
                </div>

                <div className="text-center md:text-left space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        Luthfi Muhammad <span className="text-slate-500">Baihaqi</span>.
                    </h1>
                    
                    {/* Tag kosong dihapus di sini */}

                    <p className="text-slate-400 leading-relaxed max-w-lg">
                        "Building the IELTS tool I wish I had."
                    </p>
                    
                    {/* Socials dengan Warna Asli saat Hover */}
                    <div className="flex gap-4 justify-center md:justify-start pt-2">
                        <a href="https://www.instagram.com/luthfimbaihaqi/" target="_blank" className="text-slate-500 hover:text-pink-500 transition-colors"><Instagram className="w-5 h-5"/></a>
                        <a href="https://www.linkedin.com/in/luthfimbaihaqi/" target="_blank" className="text-slate-500 hover:text-blue-500 transition-colors"><Linkedin className="w-5 h-5"/></a>
                        <a href="mailto:luthfibaihaqi851@gmail.com" className="text-slate-500 hover:text-teal-400 transition-colors"><Mail className="w-5 h-5"/></a>
                    </div>
                </div>
            </div>

            {/* CONTENT: STORY & TIMELINE */}
            <div className="grid md:grid-cols-2 gap-12 border-t border-white/5 pt-10">
                
                {/* Left: The Story */}
                <div className="space-y-6 text-slate-300 text-sm md:text-base leading-relaxed">
                    <h3 className="text-white font-bold text-lg uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-teal-500"></span> The Story
                    </h3>
                    <p>
                        Halo, saya Luthfi. <strong className="text-white">IELTS4OUR</strong> lahir dari keresahan pribadi saat saya mempersiapkan tes IELTS.
                    </p>
                    <p>
                        Saya menyadari bahwa akses untuk latihan Speaking yang konsisten, terukur, dan terjangkau itu sangat langka. Partner latihan seringkali tidak stabil, dan tutor profesional memakan biaya yang tidak sedikit.
                    </p>
                    <p>
                        Dengan bekal pengalaman di dunia edukasi (lulusan English Literature & bekerja di IDP Education) dan skill pemrograman, saya memutuskan untuk membangun solusi ini sendiri. 
                    </p>
                    <p>
                        Visi saya sederhana: <strong>Mendemokratisasi akses persiapan IELTS.</strong> Setiap orang berhak mendapatkan alat latihan berkualitas tinggi tanpa harus terhalang biaya mahal.
                    </p>

                    <p>
                        Cheers,
                    </p>
                    
                    {/* Tanda Tangan Simpel */}
                    <div className="pt-1">
                        <p className="font-handwriting text-slate-500 text-lg">Luthfi M.B.</p>
                    </div>
                </div>

                {/* Right: The Timeline */}
                <div>
                    <h3 className="text-white font-bold text-lg uppercase tracking-widest mb-8 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-teal-500"></span> The Journey
                    </h3>
                    
                    <div className="space-y-8 pl-2">
                        {milestones.map((item, i) => (
                            <div key={i} className="relative pl-8 border-l border-white/10 last:border-0 pb-1">
                                {/* Dot Icon */}
                                <div className="absolute -left-3 top-0 p-1.5 bg-slate-900 border border-white/10 rounded-full">
                                    {item.icon}
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.year}</span>
                                    <h4 className="text-white font-bold text-sm">{item.title}</h4>
                                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </motion.div>

        <footer className="text-center mt-16 text-slate-600 text-xs">
             <p>&copy; 2025 IELTS4our. All rights reserved.</p>
        </footer>

      </div>
    </main>
  );
}