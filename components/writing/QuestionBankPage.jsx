"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Loader2, FileText } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import PromptCard from "./PromptCard";
import ModuleToggle from "./ModuleToggle";

export default function QuestionBankPage({ module }) {
  const [userProfile, setUserProfile] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [bestStats, setBestStats] = useState({});
  const [loading, setLoading] = useState(true);

  const moduleTitle = module === "academic" ? "Academic" : "General Training";
  const moduleSubtitle = module === "academic"
    ? "Pilih soal untuk latihan Task 1 (chart) dan Task 2 (essay)"
    : "Pilih soal untuk latihan Task 1 (letter) dan Task 2 (essay)";

  useEffect(() => {
    fetchData();
  }, [module]);

  const fetchData = async () => {
    setLoading(true);
    try {
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

      if (user && pairsData && pairsData.length > 0) {
        const promptIds = [];
        const pairIds = [];

        pairsData.forEach((pair) => {
          if (pair.task_1_prompt_id) promptIds.push(pair.task_1_prompt_id);
          if (pair.task_2_prompt_id) promptIds.push(pair.task_2_prompt_id);
          pairIds.push(pair.id);
        });

        const { data: singleHistory } = await supabase
          .from("writing_history")
          .select("prompt_id, overall_band")
          .eq("user_id", user.id)
          .in("prompt_id", promptIds);

        const { data: fullHistory } = await supabase
          .from("writing_full_test_history")
          .select("pair_id, combined_overall_band")
          .eq("user_id", user.id)
          .in("pair_id", pairIds);

        const stats = {};

        pairsData.forEach((pair) => {
          const pairCode = pair.pair_code;

          const t1Records = (singleHistory || []).filter(
            (h) => h.prompt_id === pair.task_1_prompt_id
          );
          const bestT1 = t1Records.length
            ? Math.max(...t1Records.map((r) => parseFloat(r.overall_band) || 0))
            : null;

          const t2Records = (singleHistory || []).filter(
            (h) => h.prompt_id === pair.task_2_prompt_id
          );
          const bestT2 = t2Records.length
            ? Math.max(...t2Records.map((r) => parseFloat(r.overall_band) || 0))
            : null;

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

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        body, html { font-family: 'Lexend', system-ui, -apple-system, sans-serif; }
        .font-display { font-family: 'Lexend', system-ui, -apple-system, sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <main className="min-h-screen bg-[#F8F5EE] px-4 py-8 selection:bg-[#D17A5C]/30 selection:text-[#1A1A1A]">

        {/* HEADER */}
        <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#525252] hover:text-[#1A1A1A] transition-colors text-sm font-bold uppercase tracking-wider group"
          >
            <div className="p-1.5 bg-[#1A1A1A]/5 rounded-full group-hover:bg-[#1A1A1A]/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Home
          </Link>

          {userProfile && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-full shadow-sm">
              <span className="text-[#C9974C] text-sm">🪙</span>
              <span className="text-[#1A1A1A] text-xs font-bold tabular-nums">
                {userProfile.token_balance || 0} Tokens
              </span>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto">
          {/* TITLE */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-3 font-display tracking-tight">
              Writing {moduleTitle}
            </h1>
            <p className="text-[#525252] text-base md:text-lg max-w-2xl mx-auto">
              {moduleSubtitle}
            </p>
          </div>

          {/* MODULE TOGGLE */}
          <div className="mb-10">
            <ModuleToggle currentModule={module} />
          </div>

          {/* GRID OF CARDS */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-2xl p-6 animate-pulse shadow-sm"
                >
                  <div className="flex justify-between mb-4">
                    <div className="w-12 h-12 bg-[#1A1A1A]/5 rounded-xl" />
                    <div className="space-y-2">
                      <div className="w-16 h-4 bg-[#1A1A1A]/5 rounded" />
                      <div className="w-12 h-3 bg-[#1A1A1A]/5 rounded" />
                    </div>
                  </div>
                  <div className="space-y-3 mb-5">
                    <div>
                      <div className="w-20 h-3 bg-[#1A1A1A]/5 rounded mb-2" />
                      <div className="w-full h-5 bg-[#1A1A1A]/5 rounded" />
                    </div>
                    <div className="border-t border-[#1A1A1A]/10 pt-3">
                      <div className="w-20 h-3 bg-[#1A1A1A]/5 rounded mb-2" />
                      <div className="w-3/4 h-5 bg-[#1A1A1A]/5 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-[#1A1A1A]/5 rounded-xl" />
                      <div className="h-10 bg-[#1A1A1A]/5 rounded-xl" />
                    </div>
                    <div className="h-12 bg-[#1A1A1A]/5 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : pairs.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF6EC] rounded-3xl border border-[#1A1A1A]/10 shadow-sm">
              <div className="w-16 h-16 bg-[#F8F5EE] border border-[#1A1A1A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[#525252]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 font-display">
                Coming Soon
              </h3>
              <p className="text-[#525252] max-w-sm mx-auto leading-relaxed">
                Soal {moduleTitle} akan segera tersedia. Tunggu updates dari kami ya!
              </p>
              <Link
                href="/"
                className="inline-block mt-6 px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full transition-all shadow-lg"
              >
                Back to Home
              </Link>
            </div>
          ) : (
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

          {/* LOGIN CTA (guests only) */}
          {!userProfile && !loading && pairs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <div className="bg-[#FAF6EC] border border-[#8FA68E]/25 rounded-2xl p-6 text-center shadow-sm">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 font-display">
                  Login untuk mulai latihan
                </h3>
                <p className="text-[#525252] text-sm mb-5">
                  Login gratis dan dapatkan 4 token bonus untuk feedback detail.
                </p>
                <Link href="/auth">
                  <button className="px-8 py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full transition-all shadow-lg">
                    Login / Register
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}