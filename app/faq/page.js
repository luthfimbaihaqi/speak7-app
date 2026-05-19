"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FAQSection from "@/components/FAQSection";

const AbstractShapes = () => (
  <>
    <svg className="absolute top-[3%] left-[3%] w-12 h-12 md:w-16 md:h-16 opacity-70 -rotate-12" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 10 Q 80 15 85 45 Q 90 75 60 85 Q 25 90 15 60 Q 10 30 50 10 Z" fill="#D17A5C" />
    </svg>
    <svg className="hidden md:block absolute top-[4%] right-[5%] w-24 h-10 opacity-50 rotate-[15deg]" viewBox="0 0 200 50" aria-hidden>
      <line x1="10" y1="25" x2="190" y2="25" stroke="#4A6B8F" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />
    </svg>
    <svg className="hidden md:block absolute top-[40%] left-[2%] w-12 h-12 opacity-45" viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#8FA68E" strokeWidth="3" strokeDasharray="8 6" />
    </svg>
    <svg className="absolute bottom-[8%] right-[5%] w-10 h-10 md:w-12 md:h-12 opacity-55 rotate-[20deg]" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 15 L 85 80 L 15 80 Z" fill="#C9974C" />
    </svg>
  </>
);

export default function FAQPage() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        body, html { font-family: 'Lexend', system-ui, -apple-system, sans-serif; }
        .font-display { font-family: 'Lexend', system-ui, -apple-system, sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <main className="min-h-screen bg-[#F8F5EE] px-4 py-8 selection:bg-[#D17A5C]/30 selection:text-[#1A1A1A] relative overflow-hidden">
        
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AbstractShapes />
        </div>

        {/* Header Nav */}
        <div className="max-w-4xl mx-auto mb-8 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#525252] hover:text-[#1A1A1A] transition-colors text-sm font-bold uppercase tracking-wider group">
              <div className="p-1.5 rounded-full bg-[#1A1A1A]/5 group-hover:bg-[#1A1A1A]/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              Back to Home
          </Link>
        </div>

        {/* Full FAQ */}
        <FAQSection />

        {/* Footer */}
        <footer className="relative z-10 text-center mt-20 pb-10 text-[#525252] text-xs">
          <p>&copy; 2025 IELTS4our Help Center.</p>
        </footer>

      </main>
    </>
  );
}