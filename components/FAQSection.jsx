"use client";

import React, { useState } from "react";
import Link from "next/link"; 
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle, Mic, ShieldCheck, Smartphone, ArrowRight } from "lucide-react";

const FAQ_DATA = [
  {
    category: "AI & Accuracy",
    icon: <ShieldCheck className="w-5 h-5 text-[#4A6B8F]" />,
    items: [
      {
        q: "Seberapa akurat penilaian IELTS4our?",
        a: "Sangat mendekati penguji asli. Kami menggunakan teknologi Speech-to-Text tercanggih (Whisper) untuk 'mendengar' ucapan Kamu, dan IELTS4our dilatih dengan ribuan transkrip IELTS untuk memberikan skor objektif berdasarkan rubrik resmi: Fluency, Lexical, Grammar, dan Pronunciation."
      },
      {
        q: "Apakah IELTS4our bisa mendeteksi aksen saya?",
        a: "Tentu. kami fokus pada 'Intelligibility' (keterpahaman), bukan aksen. Selama pengucapan Kamu jelas, pelafalannya benar, dan mudah dipahami, Kamu akan mendapatkan skor Pronunciation yang baik, apapun aksen daerah Kamu."
      },
      {
        q: "Apa yang harus saya lakukan jika skor awal saya masih rendah?",
        a: "Jangan khawatir! Gunakan fitur 'Grammar Clinic' dan pelajari 'Model Answer' yang diberikan ielts4our di setiap akhir simulasi. Dengan rutin berlatih minimal 15 menit sehari menggunakan struktur kalimat tersebut, kelancaran dan skor Kamu akan meningkat secara bertahap."
      }
    ]
  },
  {
    category: "Features & Practice",
    icon: <Mic className="w-5 h-5 text-[#D17A5C]" />,
    items: [
      {
        q: "Apa bedanya 'Daily Cue Card' dan 'Quick/Full Test'?",
        a: "Daily Cue Card fokus pada monolog (Part 2). Quick Test adalah simulasi diskusi interaktif langsung ke Part 3 (cocok untuk latihan cepat). Sedangkan Full Test adalah simulasi ujian lengkap dari Part 1 hingga Part 3."
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
    icon: <Smartphone className="w-5 h-5 text-[#C9974C]" />,
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
      
      {/* HEADER */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF6EC] border border-[#1A1A1A]/10 text-[#525252] text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <HelpCircle className="w-4 h-4" /> Got Questions?
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4 font-display tracking-tight">
          Frequently Asked <span className="text-[#D17A5C]">Questions</span>
        </h2>
        <p className="text-[#525252] max-w-xl mx-auto">
          Semua yang perlu Kamu ketahui tentang cara kerja IELTS4our dan bagaimana kami membantu Kamu mencapai target skor.
        </p>
      </div>

      {isTeaser ? (
        <div className="text-center">
            <Link href="/faq">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A1A1A] hover:bg-black text-white rounded-full font-bold transition-all shadow-lg"
                >
                    Read Full FAQ <ArrowRight className="w-4 h-4" />
                </motion.button>
            </Link>
        </div>
      ) : (
        <>
            <div className="space-y-10">
                {FAQ_DATA.map((cat, catIdx) => (
                    <div key={catIdx}>
                        {/* Category Header */}
                        <div className="flex items-center gap-3 mb-6 border-b border-[#1A1A1A]/10 pb-2">
                            {cat.icon}
                            <h3 className="text-lg font-bold text-[#1A1A1A] uppercase tracking-wider font-display">{cat.category}</h3>
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-4">
                            {cat.items.map((item, itemIdx) => {
                                const uniqueId = `${catIdx}-${itemIdx}`;
                                const isOpen = openIndex === uniqueId;

                                return (
                                    <div 
                                        key={itemIdx} 
                                        className={`rounded-2xl border transition-all duration-300 ${isOpen ? "bg-[#FAF6EC] border-[#D17A5C]/30 shadow-sm" : "bg-[#FAF6EC] border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20"}`}
                                    >
                                        <button 
                                            onClick={() => toggleFAQ(uniqueId)}
                                            className="w-full flex items-center justify-between p-5 text-left"
                                        >
                                            <span className={`font-bold text-sm md:text-base ${isOpen ? "text-[#D17A5C]" : "text-[#1A1A1A]"}`}>
                                                {item.q}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 text-[#525252] transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180 text-[#D17A5C]" : ""}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-5 pt-0 text-[#525252] text-sm leading-relaxed border-t border-[#1A1A1A]/10 mt-2">
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

            {/* Contact Footer */}
            <div className="text-center mt-16 p-8 bg-[#FAF6EC] rounded-3xl border border-[#1A1A1A]/10 shadow-sm">
                <p className="text-[#525252] mb-4 text-sm">Masih punya pertanyaan lain?</p>
                <a 
                    href="mailto:luthfibaihaqi851@gmail.com" 
                    className="inline-flex items-center gap-2 text-[#1A1A1A] font-bold hover:text-[#D17A5C] transition-colors border-b border-transparent hover:border-[#D17A5C] pb-0.5"
                >
                    <MessageCircle className="w-4 h-4" /> Hubungi Support
                </a>
            </div>
        </>
      )}

    </section>
  );
}