"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  
  const scrollRef = useRef(null);
  const scrollAccumulator = useRef(0); 
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const [isInteracting, setIsInteracting] = useState(false); 

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    async function fetchTestimonials() {
      try {
        timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            setLoading(false);
            setFetchError(true);
          }
        }, 8000);

        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        console.error("Error fetching testimonials:", error.message);
        if (isMounted) setFetchError(true);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
      }
    }

    fetchTestimonials();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;

    let animationFrameId;
    const scrollContainer = scrollRef.current;

    const scroll = () => {
      if (scrollContainer && !isInteracting && !isDragging) {
        const speed = window.innerWidth < 768 ? 1.0 : 1.0;
        scrollAccumulator.current += speed; 
        
        if (scrollAccumulator.current >= 1) {
          const scrollAmount = Math.floor(scrollAccumulator.current);
          scrollContainer.scrollLeft += scrollAmount; 
          scrollAccumulator.current -= scrollAmount; 
        }
        
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft -= scrollContainer.scrollWidth / 2;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isInteracting, isDragging, testimonials]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsInteracting(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <section className="py-24 relative overflow-hidden bg-[#F8F5EE]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-[#D17A5C]/30 border-t-[#D17A5C] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#525252] text-sm">Memuat cerita...</p>
        </div>
      </section>
    );
  }

  if (fetchError || testimonials.length === 0) {
    return null;
  }

  let baseData = [...testimonials];
  if (baseData.length > 0) {
    while (baseData.length < 6) {
      baseData = [...baseData, ...testimonials];
    }
  }
  const displayData = [...baseData, ...baseData];

  return (
    <section className="py-24 relative overflow-hidden bg-[#F8F5EE] border-t border-[#1A1A1A]/10">

      <div className="max-w-7xl mx-auto px-4 relative z-10 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-6 tracking-tight font-display">
          Why They Choose <span className="text-[#D17A5C]">ielts4our</span>
        </h2>
        <p className="text-[#525252] text-lg max-w-2xl mx-auto">
          Real stories from learners who have transformed their speaking scores and are on their way to their dream universities.
        </p>
      </div>

      <div 
        className="w-full overflow-hidden"
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => setIsInteracting(false)}
        onTouchCancel={() => setIsInteracting(false)}
      >
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-6 px-4 md:px-8 overflow-x-auto select-none transition-cursor duration-200 ${
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
              className="bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-2xl p-8 hover:border-[#D17A5C]/30 transition-colors duration-300 relative group flex-none w-[85vw] md:w-[420px] shadow-sm"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-[#1A1A1A]/5 rotate-180 group-hover:text-[#D17A5C]/15 transition-colors duration-300" />
              
              <div className="flex items-center gap-4 mb-6">
                {item.avatar_url ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#1A1A1A]/15 flex-shrink-0 pointer-events-none">
                    <Image src={item.avatar_url} alt={item.user_name || "User Avatar"} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-[#F8F5EE] rounded-full flex items-center justify-center text-[#1A1A1A] font-bold text-lg border border-[#1A1A1A]/15 flex-shrink-0">
                    {item.user_name ? item.user_name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                
                <div className="overflow-hidden">
                  <h4 className="text-[#1A1A1A] font-bold text-base truncate pointer-events-none">{item.user_name || "IELTS Achiever"}</h4>
                  <p className="text-[#D17A5C] text-xs font-medium tracking-wide truncate pointer-events-none">
                    Target: {item.target}
                  </p>
                </div>
              </div>
              
              <p className="text-[#525252] text-sm leading-relaxed whitespace-normal break-words pointer-events-none">
                "{item.experience}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}