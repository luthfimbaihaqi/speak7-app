"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const UNIVERSITIES = [
  { id: 'southampton', src: '/univ-logos/southampton.png', alt: 'University of Southampton' },
  { id: 'glasgow', src: '/univ-logos/glasgow.png', alt: 'University of Glasgow' },
  { id: 'sheffield', src: '/univ-logos/sheffield.png', alt: 'The University of Sheffield' },
  { id: 'queensland', src: '/univ-logos/queensland.png', alt: 'The University of Queensland' },
  { id: 'monash', src: '/univ-logos/monash.png', alt: 'Monash University' },
  { id: 'uts', src: '/univ-logos/UTS.png', alt: 'UTS Sydney' }
];

export default function UniversityBanner() {
  // Duplikasi array agar animasi infinity loop berjalan mulus
  const duplicatedLogos = [...UNIVERSITIES, ...UNIVERSITIES];

  return (
    <section className="py-16 border-y border-white/5 bg-[#1A1D26]/40 relative overflow-hidden mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-12">
          The platform of choice for students aiming for top universities
        </p>
        
        {/* Gradient Mask: Efek pudar transparan di ujung kiri dan kanan */}
        <div 
          className="relative w-full overflow-hidden" 
          style={{ 
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', 
            WebkitMaskImage: '-webkit-linear-gradient(left, transparent, black 10%, black 90%, transparent)' 
          }}
        >
          <motion.div
            className="flex w-max items-center py-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 45, // Sangat lambat dan elegan
            }}
          >
            {duplicatedLogos.map((univ, index) => (
              <div 
                key={`${univ.id}-${index}`} 
                // 🔥 JUMBO PREMIUM CARDS:
                // w-72 & h-32 = Ukuran super besar (Desktop)
                // rounded-3xl = Sudut sangat membulat kekinian
                // bg-white = Menyembunyikan background JPG bawaan gambar
                // p-6 md:p-8 = Padding super lega agar logo tidak mentok ke pinggir kartu
                // hover:-translate-y-2 = Efek kartu terangkat naik saat di-hover
                className="flex-shrink-0 w-52 md:w-72 h-24 md:h-32 mx-4 md:mx-6 flex items-center justify-center bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] cursor-pointer"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={univ.src}
                    alt={univ.alt}
                    fill
                    sizes="(max-width: 768px) 208px, 288px"
                    // FULL COLOR, Murni bawaan asli gambar
                    className="object-contain scale-[1.3] md:scale-[1.5]"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}