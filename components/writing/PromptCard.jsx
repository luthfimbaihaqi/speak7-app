"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BarChart3, LineChart, PieChart, Mail, FileText, 
  ArrowRight, Star, Lock 
} from "lucide-react";

/**
 * PromptCard — Display 1 code (Task 1 + Task 2 paired)
 * 
 * Props:
 *   - code: string (e.g. "001")
 *   - module: 'academic' | 'general'
 *   - task1Topic: string (e.g. "Tourism Trends")
 *   - task2Topic: string (e.g. "Technology Impact")
 *   - task1Type: 'task_1_academic' | 'task_1_general'
 *   - task1IconKey: string (e.g. "BarChart3")
 *   - task1PromptId: uuid (for navigation)
 *   - task2PromptId: uuid (for navigation)
 *   - pairId: uuid (for Full Test navigation)
 *   - bestT1: number | null
 *   - bestT2: number | null
 *   - bestFullTest: number | null
 *   - isLoggedIn: boolean
 */
export default function PromptCard({
  code,
  module,
  task1Topic,
  task2Topic,
  task1Type,
  task1IconKey,
  task1PromptId,
  task2PromptId,
  pairId,
  bestT1 = null,
  bestT2 = null,
  bestFullTest = null,
  isLoggedIn = false,
}) {
  // Resolve icon based on task1IconKey
  const renderTask1Icon = () => {
    const iconClass = "w-6 h-6 text-emerald-400";
    switch (task1IconKey) {
      case "BarChart3":
        return <BarChart3 className={iconClass} />;
      case "LineChart":
        return <LineChart className={iconClass} />;
      case "PieChart":
        return <PieChart className={iconClass} />;
      case "Mail":
        return <Mail className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  // Get T1 type label
  const getTask1Label = () => {
    if (task1Type === "task_1_academic") return "Chart Description";
    if (task1Type === "task_1_general") return "Letter Writing";
    return "Task 1";
  };

  // Format best score for display (or "-" if null)
  const formatBest = (score) => {
    if (score === null || score === undefined) return "-";
    return score.toFixed(1);
  };

  // Handle click for buttons (block if not logged in)
  const handleProtectedClick = (e, href) => {
    if (!isLoggedIn) {
      e.preventDefault();
      // Toast or modal could go here. For now, do nothing — button shows lock icon.
    }
  };

  // Determine module accent color
  const moduleColor = module === "academic" 
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-[#1A1D26] border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-6 flex flex-col h-full transition-all shadow-lg hover:shadow-emerald-500/5"
    >
      {/* Header: Icon + Code */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          {renderTask1Icon()}
        </div>
        <div className="text-right">
          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${moduleColor}`}>
            {module === "academic" ? "Academic" : "General"}
          </span>
          <p className="text-xs text-slate-500 font-mono mt-1.5">Code: {code}</p>
        </div>
      </div>

      {/* Topics */}
      <div className="mb-5 space-y-3 flex-1">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
            {getTask1Label()}
          </p>
          <h3 className="text-base font-bold text-[#E6E8EE] leading-snug">
            {task1Topic}
          </h3>
        </div>
        <div className="border-t border-slate-800 pt-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
            Task 2 — Essay
          </p>
          <h3 className="text-base font-bold text-[#E6E8EE] leading-snug">
            {task2Topic}
          </h3>
        </div>
      </div>

      {/* Best Stats (only if logged in) */}
      {isLoggedIn && (bestT1 !== null || bestT2 !== null || bestFullTest !== null) && (
        <div className="bg-slate-800/30 rounded-xl px-4 py-3 mb-4 border border-slate-700/30">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" /> Your Best
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-slate-500 text-[10px]">T1</p>
              <p className="text-white font-bold">{formatBest(bestT1)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px]">T2</p>
              <p className="text-white font-bold">{formatBest(bestT2)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px]">Full</p>
              <p className="text-white font-bold">{formatBest(bestFullTest)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons (Grid 2+1) */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Practice T1 */}
          {isLoggedIn ? (
            <Link href={`/writing/exam?mode=single_task&promptId=${task1PromptId}`}>
              <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700">
                <span>Practice T1</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          ) : (
            <button 
              disabled
              className="w-full py-2.5 bg-slate-800/50 text-slate-500 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/50 cursor-not-allowed"
              title="Login to practice"
            >
              <Lock className="w-3 h-3" />
              <span>Practice T1</span>
            </button>
          )}

          {/* Practice T2 */}
          {isLoggedIn ? (
            <Link href={`/writing/exam?mode=single_task&promptId=${task2PromptId}`}>
              <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700">
                <span>Practice T2</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          ) : (
            <button 
              disabled
              className="w-full py-2.5 bg-slate-800/50 text-slate-500 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/50 cursor-not-allowed"
              title="Login to practice"
            >
              <Lock className="w-3 h-3" />
              <span>Practice T2</span>
            </button>
          )}
        </div>

        {/* Full Test (Primary) */}
        {isLoggedIn ? (
          <Link href={`/writing/exam?mode=full_test&pairId=${pairId}`}>
            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2">
              <span>Full Test (T1 + T2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        ) : (
          <button 
            disabled
            className="w-full py-3 bg-emerald-600/40 text-white/60 font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
            title="Login to start Full Test"
          >
            <Lock className="w-4 h-4" />
            <span>Full Test (T1 + T2)</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}