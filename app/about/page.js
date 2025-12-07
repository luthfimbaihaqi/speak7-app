"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram, Linkedin, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 pb-20 px-4 selection:bg-teal-500/30">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(45,212,191,0.15)_0px,transparent_50%)]"></div>
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(at_100%_100%,rgba(168,85,247,0.15)_0px,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-8">
        
        {/* Header (Back Button) */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Meet the Creator</h1>
        </div>

        {/* GLASS PANEL CONTAINER */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-12 overflow-hidden shadow-2xl"
        >
            <div className="flex flex-col md:grid md:grid-cols-[300px_1fr] gap-8 md:gap-12">
                
                {/* --- KOLOM KIRI (Desktop) / ATAS (Mobile): PROFILE --- */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    {/* Foto Utama */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64 mb-6 group">
                        <div className="absolute -inset-1 bg-gradient-to-br from-teal-500 to-purple-600 rounded-[2rem] blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
                        <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl">
                             <Image 
                                src="/luthfi-profile.jpg" 
                                alt="Luthfi Muhammad Baihaqi"
                                fill
                                className="object-cover"
                             />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1">Luthfi Muhammad Baihaqi</h2>
                    <p className="text-teal-400 font-medium text-sm mb-6">Founder IELTS4OUR</p>

                    {/* Social Links */}
                    <div className="flex gap-3">
                        <a 
                            href="https://www.instagram.com/luthfimbaihaqi/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-white/5 hover:bg-pink-600/20 hover:text-pink-500 rounded-xl border border-white/10 text-slate-400 transition-all"
                        >
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a 
                            href="https://www.linkedin.com/in/luthfimbaihaqi/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-white/5 hover:bg-blue-600/20 hover:text-blue-500 rounded-xl border border-white/10 text-slate-400 transition-all"
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* --- KOLOM KANAN (Desktop) / BAWAH (Mobile): STORY TEXT --- */}
                <div className="text-slate-300 leading-relaxed text-base md:text-lg space-y-6">
                    <p>
                        Halo, gue <strong className="text-white">Luthfi Muhammad Baihaqi</strong>.
                    </p>
                    <p>
                        Gue lulusan S1 Sastra Inggris, pernah ngajar selama 9 bulan di International Language Program, dan saat ini bekerja sebagai <span className="text-teal-400 font-bold">IELTS Executive di IDP Education</span>. Setiap hari gue ketemu berbagai macam kebutuhan siswa, standar penilaian, dan perjalanan orang-orang yang sedang berjuang mencapai skor IELTS tertentu. Dari situ, gue belajar banyak tentang apa yang sebenarnya dibutuhkan calon test-taker.
                    </p>

                    <p>
                        Selain dunia bahasa Inggris, gue juga punya ketertarikan di dunia ngoding dan pengembangan web. Dari hobi itu, gue mulai sering bikin proyek kecil-kecilan, dan lama-lama gue sadar kalau kemampuan ini bisa gue manfaatin buat ngebangun ruang belajar yang lebih berguna untuk banyak orang.
                    </p>

                    {/* --- POLAROID INSERT (Candid Photo) --- */}
                    <div className="py-4 flex justify-center md:float-right md:ml-6 md:mb-2">
                        <div className="relative bg-white p-3 pb-8 shadow-xl transform rotate-2 hover:-rotate-2 transition-transform duration-500 max-w-[200px]">
                            <div className="relative w-[180px] h-[220px] bg-slate-200 overflow-hidden">
                                <Image 
                                    src="/luthfi-fun.jpg" 
                                    alt="Luthfi Coding"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <p className="absolute bottom-2 left-0 w-full text-center text-slate-600 font-handwriting text-xs font-bold font-mono">
                                biasa dipanggil "ufo"
                            </p>
                        </div>
                    </div>

                    <p>
                        <strong className="text-white">IELTS4OUR</strong> lahir dari pengalaman pribadi gue waktu mempersiapkan tes. Waktu itu, gue merasa akses untuk latihan Speaking yang konsisten dan terarah cukup terbatas. Cari partner sering tidak stabil, sementara layanan profesional tidak selalu terjangkau.
                    </p>

                    <p>
                        Dari keresahan itu, gue mulai berpikir bahwa harusnya ada ruang belajar yang lebih sederhana, mudah diakses, dan realistis untuk siapa pun.
                    </p>

                    <p>
                        Akhirnya gue memutuskan untuk membangun IELTS4OUR ini. Tujuannya jelas: menyediakan tempat latihan yang bisa bantu orang berkembang tanpa harus terhalang biaya mahal atau waktu. Gue percaya bahwa proses belajar yang baik dimulai dari kesempatan, dan kesempatan itu seharusnya bisa dijangkau semua orang dengan mudah.
                    </p>

                    <p>
                        Semoga IELTS4OUR bisa bantu lo mencapai target skor lo, mempersiapkan langkah berikutnya, dan membuat proses belajar lo jadi lebih terarah.
                    </p>

                    <div className="pt-8 mt-8 border-t border-white/5">
                        <p className="mb-2">Cheers,</p>
                        {/* Tanda Tangan Font Caveat */}
                        <p className="text-4xl md:text-5xl text-teal-400 font-caveat transform -rotate-2 origin-left">
                            Luthfi Muhammad Baihaqi
                        </p>
                    </div>

                </div>
            </div>
        </motion.div>

        {/* Footer Credit */}
        <footer className="text-center mt-20 text-slate-600 text-sm">
             <p>Built with ❤️ & lots of BAKSO.</p>
        </footer>
      </div>
    </main>
  );
}