"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Referensi dan state untuk interaksi gulir
  const scrollRef = useRef(null);
  const scrollAccumulator = useRef(0); // "Celengan" untuk menyimpan nilai desimal (Sub-pixel rendering)
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        console.error("Error fetching testimonials:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  // Logika putaran otomatis (Auto-scroll Marquee)
  useEffect(() => {
    let animationFrameId;
    const scrollContainer = scrollRef.current;

    const scroll = () => {
      // Hanya berjalan jika tidak sedang di-hover, tidak di-drag, dan pada layar desktop
      if (scrollContainer && !isHovered && !isDragging && window.innerWidth >= 768) {
        
        // Tambahkan kecepatan ke dalam "celengan"
        scrollAccumulator.current += 0.5; // Kecepatan gulir
        
        // Jika celengan sudah mencapai angka bulat 1 piksel atau lebih
        if (scrollAccumulator.current >= 1) {
          const scrollAmount = Math.floor(scrollAccumulator.current);
          scrollContainer.scrollLeft += scrollAmount; // Geser layar
          scrollAccumulator.current -= scrollAmount; // Kurangi celengan
        }
        
        // Reset posisi ke 0 saat mencapai persis setengah jalan untuk ilusi putaran tanpa batas
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft -= scrollContainer.scrollWidth / 2;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging, testimonials]);

  // Logika interaksi seret (Drag-to-scroll)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Sensitivitas tarikan
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <section className="py-24 relative overflow-hidden bg-[#0B0D14]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Memuat cerita...</p>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  // --- LOGIKA PENGGANDAAN DATA DINAMIS ---
  // Pastikan minimal ada 6 kartu agar bisa memicu scroll, lalu digandakan 2x lipat 
  // agar titik reset (scrollWidth / 2) benar-benar simetris sempurna.
  let baseData = [...testimonials];
  if (baseData.length > 0) {
    while (baseData.length < 6) {
      baseData = [...baseData, ...testimonials];
    }
  }
  const displayData = [...baseData, ...baseData];

  return (
    <section className="py-24 relative overflow-hidden bg-[#0B0D14] border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Why They Choose <span className="text-blue-500">ielts4our</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Real stories from learners who have transformed their speaking scores and are on their way to their dream universities.
        </p>
      </div>

      {/* Kontainer Gulir */}
      <div 
        className="w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-6 px-4 md:px-8 overflow-x-auto snap-x snap-mandatory md:snap-none select-none transition-cursor duration-200 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch"
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            div::-webkit-scrollbar { display: none; }
          `}} />

          {displayData.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="bg-[#1A1D26]/60 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8 hover:border-blue-500/30 transition-colors duration-300 relative group flex-none w-[85vw] md:w-[420px] snap-center"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-700/50 rotate-180 group-hover:text-blue-500/20 transition-colors duration-300" />
              
              <div className="flex items-center gap-4 mb-6">
                {item.avatar_url ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 pointer-events-none">
                    <Image src={item.avatar_url} alt={item.user_name || "User Avatar"} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-bold text-lg border border-slate-700 flex-shrink-0">
                    {item.user_name ? item.user_name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                
                <div className="overflow-hidden">
                  <h4 className="text-white font-bold text-base truncate pointer-events-none">{item.user_name || "IELTS Achiever"}</h4>
                  <p className="text-blue-400 text-xs font-medium tracking-wide truncate pointer-events-none">
                    Target: {item.target}
                  </p>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed whitespace-normal break-words pointer-events-none">
                "{item.experience}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}