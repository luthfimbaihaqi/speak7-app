// app/faq/page.js
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FAQSection from "@/components/FAQSection";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Background Mesh (Supaya konsisten sama Home) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(45,212,191,0.15)_0px,transparent_50%)]"></div>
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(at_100%_100%,rgba(168,85,247,0.15)_0px,transparent_50%)]"></div>
      </div>

      {/* Header Nav */}
      <div className="max-w-4xl mx-auto mb-8 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Load Full FAQ */}
      <FAQSection />

      {/* Footer Simple */}
      <footer className="relative z-10 text-center mt-20 pb-10 text-slate-600 text-xs">
        <p>&copy; 2025 Ielts4our Help Center.</p>
      </footer>

    </main>
  );
}