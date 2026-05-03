"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Loader2, FileText } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import PromptCard from "./PromptCard";
import ModuleToggle from "./ModuleToggle";

/**
 * QuestionBankPage — Shared component for /writing/academic and /writing/general
 * 
 * Props:
 *   - module: 'academic' | 'general'
 */
export default function QuestionBankPage({ module }) {
  const [userProfile, setUserProfile] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [bestStats, setBestStats] = useState({}); // { pairCode: { bestT1, bestT2, bestFullTest } }
  const [loading, setLoading] = useState(true);

  // Module display strings
  const moduleTitle = module === "academic" ? "Academic" : "General Training";
  const moduleSubtitle = module === "academic"
    ? "Pilih soal untuk latihan Task 1 (chart) dan Task 2 (essay)"
    : "Pilih soal untuk latihan Task 1 (letter) dan Task 2 (essay)";

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, [module]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ═══════════════════════════════════════════
      // STEP 1: Get current user (if logged in)
      // ═══════════════════════════════════════════
      const { data: { user } } = await supabase.auth.getUser();
      let profileData = null;

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("token_balance, daily_usage_count, is_premium, premium_expiry")
          .eq("id", user.id)
          .single();

        profileData = { ...user, ...profile };
        setUserProfile(profileData);
      }

      // ═══════════════════════════════════════════
      // STEP 2: Fetch pairs for this module + JOIN prompts
      // ═══════════════════════════════════════════
      const { data: pairsData, error: pairsError } = await supabase
        .from("writing_full_test_pairs")
        .select(`
          id,
          pair_code,
          module,
          task_1_prompt_id,
          task_2_prompt_id,
          views_count,
          solved_count,
          task_1_prompt:task_1_prompt_id(
            id, code, task_type, topic_label, topic_icon, prompt_text
          ),
          task_2_prompt:task_2_prompt_id(
            id, code, task_type, topic_label, topic_icon, prompt_text
          )
        `)
        .eq("module", module)
        .eq("is_active", true)
        .order("pair_code", { ascending: true });

      if (pairsError) {
        console.error("Pairs fetch error:", pairsError);
        setLoading(false);
        return;
      }

      setPairs(pairsData || []);

      // ═══════════════════════════════════════════
      // STEP 3: Fetch personal best (if logged in)
      // ═══════════════════════════════════════════
      if (user && pairsData && pairsData.length > 0) {
        const promptIds = [];
        const pairIds = [];

        pairsData.forEach((pair) => {
          if (pair.task_1_prompt_id) promptIds.push(pair.task_1_prompt_id);
          if (pair.task_2_prompt_id) promptIds.push(pair.task_2_prompt_id);
          pairIds.push(pair.id);
        });

        // Fetch Single Task best per prompt
        const { data: singleHistory } = await supabase
          .from("writing_history")
          .select("prompt_id, overall_band")
          .eq("user_id", user.id)
          .in("prompt_id", promptIds);

        // Fetch Full Test best per pair
        const { data: fullHistory } = await supabase
          .from("writing_full_test_history")
          .select("pair_id, combined_overall_band")
          .eq("user_id", user.id)
          .in("pair_id", pairIds);

        // Aggregate best scores per pair_code
        const stats = {};

        pairsData.forEach((pair) => {
          const pairCode = pair.pair_code;

          // Best Single Task T1
          const t1Records = (singleHistory || []).filter(
            (h) => h.prompt_id === pair.task_1_prompt_id
          );
          const bestT1 = t1Records.length
            ? Math.max(...t1Records.map((r) => parseFloat(r.overall_band) || 0))
            : null;

          // Best Single Task T2
          const t2Records = (singleHistory || []).filter(
            (h) => h.prompt_id === pair.task_2_prompt_id
          );
          const bestT2 = t2Records.length
            ? Math.max(...t2Records.map((r) => parseFloat(r.overall_band) || 0))
            : null;

          // Best Full Test
          const fullRecords = (fullHistory || []).filter(
            (h) => h.pair_id === pair.id
          );
          const bestFullTest = fullRecords.length
            ? Math.max(...fullRecords.map((r) => parseFloat(r.combined_overall_band) || 0))
            : null;

          stats[pairCode] = { bestT1, bestT2, bestFullTest };
        });

        setBestStats(stats);
      }

      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#151824] px-4 py-8 selection:bg-emerald-500/30 selection:text-emerald-200">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider group"
        >
          <div className="p-1.5 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Home
        </Link>

        {userProfile && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-full">
            <span className="text-yellow-400 text-sm">🪙</span>
            <span className="text-white text-xs font-bold tabular-nums">
              {userProfile.token_balance || 0} Tokens
            </span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto">
        {/* TITLE */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Writing {moduleTitle}
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            {moduleSubtitle}
          </p>
        </div>

        {/* MODULE TOGGLE */}
        <div className="mb-10">
          <ModuleToggle currentModule={module} />
        </div>

        {/* GRID OF CARDS */}
        {loading ? (
          // SKELETON LOADERS (3 placeholder cards)
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#1A1D26] border border-slate-800 rounded-2xl p-6 animate-pulse"
              >
                <div className="flex justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl" />
                  <div className="space-y-2">
                    <div className="w-16 h-4 bg-slate-800 rounded" />
                    <div className="w-12 h-3 bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  <div>
                    <div className="w-20 h-3 bg-slate-800 rounded mb-2" />
                    <div className="w-full h-5 bg-slate-800 rounded" />
                  </div>
                  <div className="border-t border-slate-800 pt-3">
                    <div className="w-20 h-3 bg-slate-800 rounded mb-2" />
                    <div className="w-3/4 h-5 bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-slate-800 rounded-xl" />
                    <div className="h-10 bg-slate-800 rounded-xl" />
                  </div>
                  <div className="h-12 bg-slate-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : pairs.length === 0 ? (
          // EMPTY STATE
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
              Soal {moduleTitle} akan segera tersedia. Tunggu updates dari kami ya!
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full transition-all"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          // GRID OF PROMPT CARDS
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {pairs.map((pair) => {
              const t1 = pair.task_1_prompt;
              const t2 = pair.task_2_prompt;

              if (!t1 || !t2) return null;

              const stats = bestStats[pair.pair_code] || {};

              return (
                <PromptCard
                  key={pair.id}
                  code={pair.pair_code}
                  module={pair.module}
                  task1Topic={t1.topic_label}
                  task2Topic={t2.topic_label}
                  task1Type={t1.task_type}
                  task1IconKey={t1.topic_icon}
                  task1PromptId={t1.id}
                  task2PromptId={t2.id}
                  pairId={pair.id}
                  bestT1={stats.bestT1 || null}
                  bestT2={stats.bestT2 || null}
                  bestFullTest={stats.bestFullTest || null}
                  isLoggedIn={!!userProfile}
                />
              );
            })}
          </motion.div>
        )}

        {/* LOGIN CTA (only for guests) */}
        {!userProfile && !loading && pairs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                Login untuk mulai latihan
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                Login gratis dan dapatkan 4 token bonus untuk feedback detail.
              </p>
              <Link href="/auth">
                <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-emerald-500/20">
                  Login / Register
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}