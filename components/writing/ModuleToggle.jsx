"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Briefcase } from "lucide-react";

/**
 * ModuleToggle — Switch between Academic and General Training pages.
 * 
 * Props:
 *   - currentModule: 'academic' | 'general'
 */
export default function ModuleToggle({ currentModule }) {
  const router = useRouter();

  const handleSwitch = (module) => {
    if (module === currentModule) return; // No-op if already on this module
    router.push(`/writing/${module}`);
  };

  return (
    <div className="max-w-md mx-auto bg-[#1A1D26] p-1 rounded-full border border-slate-800 flex relative shadow-sm">
      <button
        onClick={() => handleSwitch("academic")}
        className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
          currentModule === "academic"
            ? "bg-emerald-600 text-white shadow-md"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <GraduationCap className="w-3.5 h-3.5" />
        Academic
      </button>
      <button
        onClick={() => handleSwitch("general")}
        className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
          currentModule === "general"
            ? "bg-emerald-600 text-white shadow-md"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Briefcase className="w-3.5 h-3.5" />
        General Training
      </button>
    </div>
  );
}