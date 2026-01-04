"use client";

import React, { useState } from "react";
import Link from "next/link"; // Import Link
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle, Mic, ShieldCheck, Smartphone, ArrowRight } from "lucide-react";

// DATA FAQ (SUDAH DIREVISI)
const FAQ_DATA = [
  {
    category: "AI & Accuracy",
    icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
    items: [
      {
        q: "Seberapa akurat penilaian AI di sini?",
        a: "Sangat mendekati penguji asli. Kami menggunakan teknologi Speech-to-Text tercanggih (Whisper) untuk 'mendengar' ucapan Kamu, dan AI yang dilatih dengan ribuan transkrip IELTS untuk memberikan skor objektif berdasarkan rubrik resmi: Fluency, Lexical, Grammar, dan Pronunciation."
      },
      {
        q: "Apakah AI bisa mendeteksi aksen saya?",
        a: "Tentu. AI kami fokus pada 'Intelligibility' (keterpahaman), bukan aksen. Selama pengucapan Kamu jelas dan artikulasinya tegas (standar Native Speaker), Kamu akan mendapatkan skor Pronunciation yang baik, apapun aksen daerah Kamu."
      },
      {
        q: "Kenapa skor saya kadang rendah?",
        a: "Kami mendesain AI dengan mode 'Strict Examiner'. Lebih baik Kamu mendapat nilai ketat saat latihan agar terlatih mental dan siap menghadapi tes asli, daripada mendapat nilai palsu yang terlalu tinggi."
      }
    ]
  },
  {
    category: "Features & Practice",
    icon: <Mic className="w-5 h-5 text-purple-400" />,
    items: [
      {
        q: "Apa bedanya 'Daily Cue Card' dan 'Quick/Full Test'?",
        a: "Daily Cue Card (Part 2) adalah mode monolog 2 menit untuk melatih kelancaran berbicara. Quick & Full Test adalah simulasi ujian interaktif (Part 1-3) di mana AI berperan sebagai penguji yang memberikan pertanyaan dan merespon jawaban Kamu."
      },
      {
        q: "Apakah topik Daily Cue Card selalu berubah?",
        a: "Benar. Kamu bisa mengacak topik Part 2 setiap kali Kamu berlatih atau menekan tombol 'random topic' . Ini bertujuan melatih spontanitas Kamu dalam menghadapi berbagai topik tak terduga, persis seperti situasi ujian asli."
      },
      {
        q: "Apakah riwayat latihan saya tersimpan?",
        a: "Ya! Semua hasil analisis Daily Cue Card, Quick dan Full Test tersimpan otomatis di halaman 'My Progress'. Kamu bisa melihat grafik perkembangan skor Kamu dari waktu ke waktu."
      }
    ]
  },
  {
    category: "Account & Technical",
    icon: <Smartphone className="w-5 h-5 text-amber-400" />,
    items: [
      {
        q: "Apakah aplikasi ini Gratis?",
        a: "Ya! Fitur **Daily Cue Card** sepenuhnya GRATIS dan **UNLIMITED** (tanpa batas) bagi Kamu yang sudah login. Token hanya dibutuhkan jika Kamu ingin mengakses simulasi ujian penuh (Full Simulation/Quick Test)."
      },
      {
        q: "Bagaimana sistem pembayaran Token?",
        a: "Kami menggunakan sistem **Token (Top Up)** yang sangat fleksibel. Token yang Kamu beli **tidak memiliki masa kadaluarsa** (No Expiry). Beli sekali, dan gunakan kapan saja saat Kamu membutuhkan simulasi ujian, tanpa tagihan bulanan."
      },
      {
        q: "Kenapa mikrofon tidak berfungsi?",
        a: "Pastikan Kamu telah memberikan izin (permission) akses mikrofon pada browser. Jika di HP, cek pengaturan privasi browser (Chrome/Safari) Kamu."
      }
    ]
  }
];

export default function FAQSection({ isTeaser = false }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-4xl mx-auto mt-24 mb-24 px-4 relative z-10">
      
      {/* HEADER TITLE */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
            <HelpCircle className="w-4 h-4" /> Got Questions?
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Frequently Asked <span className="text-teal-400">Questions</span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Semua yang perlu Kamu ketahui tentang cara kerja IELTS4our dan bagaimana kami membantu Kamu mencapai target skor.
        </p>
      </div>

      {/* --- LOGIKA PISAHAN TEASER VS FULL --- */}
      {isTeaser ? (
        // TAMPILAN TEASER (Halaman Depan)
        <div className="text-center">
            <Link href="/faq">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white font-bold transition-all shadow-lg backdrop-blur-sm"
                >
                    Read Full FAQ <ArrowRight className="w-4 h-4" />
                </motion.button>
            </Link>
        </div>
      ) : (
        // TAMPILAN FULL (Halaman FAQ)
        <>
            <div className="space-y-10">
                {FAQ_DATA.map((cat, catIdx) => (
                    <div key={catIdx}>
                        {/* Category Header */}
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-2">
                            {cat.icon}
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">{cat.category}</h3>
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-4">
                            {cat.items.map((item, itemIdx) => {
                                const uniqueId = `${catIdx}-${itemIdx}`;
                                const isOpen = openIndex === uniqueId;

                                return (
                                    <div 
                                        key={itemIdx} 
                                        className={`rounded-2xl border transition-all duration-300 ${isOpen ? "bg-white/10 border-teal-500/30" : "bg-white/5 border-white/5 hover:border-white/10"}`}
                                    >
                                        <button 
                                            onClick={() => toggleFAQ(uniqueId)}
                                            className="w-full flex items-center justify-between p-5 text-left"
                                        >
                                            <span className={`font-bold text-sm md:text-base ${isOpen ? "text-teal-300" : "text-slate-200"}`}>
                                                {item.q}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-teal-400" : ""}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5 mt-2">
                                                        {item.a}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Footer (Hanya muncul di Full Page) */}
            <div className="text-center mt-16 p-8 bg-slate-900/50 rounded-3xl border border-white/5">
                <p className="text-slate-400 mb-4 text-sm">Masih punya pertanyaan lain?</p>
                <a 
                    href="mailto:luthfibaihaqi851@gmail.com" 
                    className="inline-flex items-center gap-2 text-white font-bold hover:text-teal-400 transition-colors border-b border-transparent hover:border-teal-400 pb-0.5"
                >
                    <MessageCircle className="w-4 h-4" /> Hubungi Support
                </a>
            </div>
        </>
      )}

    </section>
  );
}