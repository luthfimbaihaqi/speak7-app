"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, AlertTriangle, Lock, Unlock, BookOpen,
  Sparkles, TrendingUp, Award, Clock, Eye, EyeOff, ChevronDown,
  ChevronUp, ArrowRight, Loader2, Star, MessageCircle, Coins,
  FileText, Target, Lightbulb, Edit3, Quote, X
} from "lucide-react";
import {
  TOKEN_COST_UNLOCK_SINGLE_TASK,
  TOKEN_COST_UNLOCK_FULL_TEST,
  formatTimeSpent,
} from "@/utils/writingConfig";

/**
 * WritingScoreCard — Display IELTS Writing evaluation results.
 *
 * Props:
 *   - data: Object — full result object from completionResult
 *     For single_task: { type, evaluation, historyId, timeSpentSeconds, isUnlocked }
 *     For full_test: { type, task1Evaluation, task2Evaluation, combinedBand, pairCode, module, historyId, totalTimeSpentSeconds, isUnlocked }
 *   - userTokenBalance: number (current token balance)
 *   - isLoggedIn: boolean
 *   - onUnlock: async function (historyType, historyId) — handler for unlock action
 *   - onTryAnother: function — navigate to question bank
 *   - onViewProgress: function — navigate to progress page
 */
export default function WritingScoreCard({
  data,
  userTokenBalance = 0,
  isLoggedIn = true,
  onUnlock,
  onTryAnother,
  onViewProgress,
}) {
  if (!data) return null;

  const isFullTest = data.type === "full_test";

  // Tab state for Full Test (default: Overall)
  const [activeTab, setActiveTab] = useState("overall");

  // Unlock state
  const [isUnlocked, setIsUnlocked] = useState(data.isUnlocked || false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState(null);

  // Confetti trigger (band >= 7.0, fire once on mount)
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTriggeredRef = useRef(false);

  useEffect(() => {
    if (confettiTriggeredRef.current) return;

    const heroBand = isFullTest ? data.combinedBand : data.evaluation?.overall_band;
    if (heroBand >= 7.0) {
      setShowConfetti(true);
      confettiTriggeredRef.current = true;
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [data, isFullTest]);

  // ═══════════════════════════════════════════
  // UNLOCK HANDLER (Optimistic Update)
  // ═══════════════════════════════════════════
  const handleUnlock = async () => {
    const historyType = isFullTest ? "full_test" : "single_task";
    const cost = isFullTest ? TOKEN_COST_UNLOCK_FULL_TEST : TOKEN_COST_UNLOCK_SINGLE_TASK;

    if (userTokenBalance < cost) {
      setUnlockError(`Token tidak cukup. Butuh ${cost}, kamu punya ${userTokenBalance}.`);
      setTimeout(() => setUnlockError(null), 5000);
      return;
    }

    setIsUnlocking(true);
    setUnlockError(null);

    // Optimistic update
    setIsUnlocked(true);

    try {
      const result = await onUnlock(historyType, data.historyId);
      if (!result || !result.success) {
        // Rollback
        setIsUnlocked(false);
        setUnlockError(result?.error || "Gagal unlock. Coba lagi.");
        setTimeout(() => setUnlockError(null), 5000);
      }
    } catch (err) {
      setIsUnlocked(false);
      setUnlockError(err.message || "Network error. Coba lagi.");
      setTimeout(() => setUnlockError(null), 5000);
    } finally {
      setIsUnlocking(false);
    }
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#151824] px-4 py-8 selection:bg-emerald-500/30 selection:text-emerald-200">

      {/* CONFETTI */}
      <AnimatePresence>
        {showConfetti && <ConfettiBurst />}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
            {isFullTest ? "Full Test Selesai!" : "Essay Submitted!"}
          </h1>
          <p className="text-slate-400 text-sm">
            {data.autoSubmitted
              ? "Waktu habis, essay otomatis di-submit."
              : "Berikut hasil evaluasi essay kamu."}
          </p>
        </div>

        {/* MAIN CONTENT */}
        {isFullTest ? (
          <FullTestVariant
            data={data}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isUnlocked={isUnlocked}
            isUnlocking={isUnlocking}
            unlockError={unlockError}
            userTokenBalance={userTokenBalance}
            onUnlock={handleUnlock}
          />
        ) : (
          <SingleTaskVariant
            data={data}
            isUnlocked={isUnlocked}
            isUnlocking={isUnlocking}
            unlockError={unlockError}
            userTokenBalance={userTokenBalance}
            onUnlock={handleUnlock}
          />
        )}

        {/* SHARE WHATSAPP */}
        <ShareWhatsApp data={data} isFullTest={isFullTest} />

        {/* ACTION FOOTER */}
        <div className="flex flex-col md:flex-row gap-3 mt-8">
          <button
            onClick={onTryAnother}
            className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Try Another Topic</span>
          </button>
          <button
            onClick={onViewProgress}
            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <span>View My Progress</span>
          </button>
        </div>
      </div>
    </main>
  );
}


// ═══════════════════════════════════════════════════════════════
// VARIANT: Single Task
// ═══════════════════════════════════════════════════════════════

function SingleTaskVariant({ data, isUnlocked, isUnlocking, unlockError, userTokenBalance, onUnlock }) {
  const evaluation = data.evaluation;
  const fullFeedback = evaluation?.full_feedback || {};

  return (
    <div className="space-y-6">
      <HeroSection
        overallBand={evaluation?.overall_band}
        criteria={{
          task: evaluation?.task_achievement,
          coherence: evaluation?.coherence_cohesion,
          lexical: evaluation?.lexical_resource,
          grammar: evaluation?.grammatical_range,
        }}
        timeSpentSeconds={data.timeSpentSeconds}
      />

      <EssayViewer
        text={data.essayText || fullFeedback?.essay_text || ""}
        wordCount={data.wordCount || 0}
      />

      <FreeFeedbackSection feedback={fullFeedback} />

      {!isUnlocked ? (
        <LockedSection
          isFullTest={false}
          isUnlocking={isUnlocking}
          unlockError={unlockError}
          userTokenBalance={userTokenBalance}
          onUnlock={onUnlock}
        />
      ) : (
        <UnlockedFeedback feedback={fullFeedback} />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// VARIANT: Full Test (3 tabs)
// ═══════════════════════════════════════════════════════════════

function FullTestVariant({
  data, activeTab, setActiveTab, isUnlocked, isUnlocking, unlockError, userTokenBalance, onUnlock
}) {
  const t1 = data.task1Evaluation;
  const t2 = data.task2Evaluation;
  const t1Feedback = t1?.full_feedback || {};
  const t2Feedback = t2?.full_feedback || {};

  return (
    <div className="space-y-6">

      {/* TABS */}
      <div className="bg-[#1A1D26] p-1 rounded-full border border-slate-800 flex max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("overall")}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all ${
            activeTab === "overall" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Overall
        </button>
        <button
          onClick={() => setActiveTab("task1")}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all ${
            activeTab === "task1" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Task 1
        </button>
        <button
          onClick={() => setActiveTab("task2")}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all ${
            activeTab === "task2" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Task 2
        </button>
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === "overall" && (
          <motion.div
            key="overall"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <OverallTab data={data} />

            {!isUnlocked ? (
              <LockedSection
                isFullTest={true}
                isUnlocking={isUnlocking}
                unlockError={unlockError}
                userTokenBalance={userTokenBalance}
                onUnlock={onUnlock}
              />
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 text-center">
                <Unlock className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-emerald-300 font-bold mb-1">Detailed Feedback Unlocked</p>
                <p className="text-xs text-slate-400">Klik tab Task 1 atau Task 2 untuk lihat detail.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "task1" && (
          <motion.div
            key="task1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <HeroSection
              overallBand={t1?.overall_band}
              criteria={{
                task: t1?.task_achievement,
                coherence: t1?.coherence_cohesion,
                lexical: t1?.lexical_resource,
                grammar: t1?.grammatical_range,
              }}
              timeSpentSeconds={null}
              taskLabel="Task 1"
            />
            <EssayViewer text={data.task1Text || t1Feedback?.essay_text || ""} wordCount={t1?.word_count || 0} />
            <FreeFeedbackSection feedback={t1Feedback} />
            {!isUnlocked ? (
              <LockedSection
                isFullTest={true}
                isUnlocking={isUnlocking}
                unlockError={unlockError}
                userTokenBalance={userTokenBalance}
                onUnlock={onUnlock}
              />
            ) : (
              <UnlockedFeedback feedback={t1Feedback} />
            )}
          </motion.div>
        )}

        {activeTab === "task2" && (
          <motion.div
            key="task2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <HeroSection
              overallBand={t2?.overall_band}
              criteria={{
                task: t2?.task_achievement,
                coherence: t2?.coherence_cohesion,
                lexical: t2?.lexical_resource,
                grammar: t2?.grammatical_range,
              }}
              timeSpentSeconds={null}
              taskLabel="Task 2"
            />
            <EssayViewer text={data.task2Text || t2Feedback?.essay_text || ""} wordCount={t2?.word_count || 0} />
            <FreeFeedbackSection feedback={t2Feedback} />
            {!isUnlocked ? (
              <LockedSection
                isFullTest={true}
                isUnlocking={isUnlocking}
                unlockError={unlockError}
                userTokenBalance={userTokenBalance}
                onUnlock={onUnlock}
              />
            ) : (
              <UnlockedFeedback feedback={t2Feedback} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: OverallTab (Full Test)
// ═══════════════════════════════════════════════════════════════

function OverallTab({ data }) {
  const t1 = data.task1Evaluation;
  const t2 = data.task2Evaluation;

  return (
    <div className="space-y-5">

      {/* COMBINED HERO */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">
          Combined Band Score
        </p>
        <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 tabular-nums leading-none my-4">
          {data.combinedBand?.toFixed(1)}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Pair {data.pairCode} • {data.module === "academic" ? "Academic" : "General Training"}
        </p>
        {data.totalTimeSpentSeconds && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimeSpent(data.totalTimeSpentSeconds)}</span>
          </div>
        )}
      </div>

      {/* TASK COMPARISON */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#1A1D26] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Task 1</p>
            <span className="text-xs text-slate-600 font-mono">×1</span>
          </div>
          <div className="text-4xl md:text-5xl font-black text-white tabular-nums mb-2">
            {t1?.overall_band?.toFixed(1)}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div><span className="text-slate-500">Task: </span><strong className="text-white">{t1?.task_achievement?.toFixed(1)}</strong></div>
            <div><span className="text-slate-500">Coh: </span><strong className="text-white">{t1?.coherence_cohesion?.toFixed(1)}</strong></div>
            <div><span className="text-slate-500">Lex: </span><strong className="text-white">{t1?.lexical_resource?.toFixed(1)}</strong></div>
            <div><span className="text-slate-500">Gram: </span><strong className="text-white">{t1?.grammatical_range?.toFixed(1)}</strong></div>
          </div>
        </div>

        <div className="bg-[#1A1D26] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Task 2</p>
            <span className="text-xs text-emerald-500 font-mono font-bold">×2 (weighted)</span>
          </div>
          <div className="text-4xl md:text-5xl font-black text-white tabular-nums mb-2">
            {t2?.overall_band?.toFixed(1)}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div><span className="text-slate-500">Task: </span><strong className="text-white">{t2?.task_achievement?.toFixed(1)}</strong></div>
            <div><span className="text-slate-500">Coh: </span><strong className="text-white">{t2?.coherence_cohesion?.toFixed(1)}</strong></div>
            <div><span className="text-slate-500">Lex: </span><strong className="text-white">{t2?.lexical_resource?.toFixed(1)}</strong></div>
            <div><span className="text-slate-500">Gram: </span><strong className="text-white">{t2?.grammatical_range?.toFixed(1)}</strong></div>
          </div>
        </div>
      </div>

      {/* IELTS FORMULA NOTE */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 text-center">
        <p className="text-xs text-slate-500">
          Combined band = (Task 1 × 1 + Task 2 × 2) ÷ 3 — sesuai standar IELTS
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: HeroSection
// ═══════════════════════════════════════════════════════════════

function HeroSection({ overallBand, criteria, timeSpentSeconds, taskLabel }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
      {taskLabel && (
        <p className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-2 text-center">
          {taskLabel}
        </p>
      )}
      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 text-center">
        Overall Band
      </p>
      <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 tabular-nums leading-none text-center my-4">
        {overallBand?.toFixed(1) || "—"}
      </div>

      {timeSpentSeconds !== null && timeSpentSeconds !== undefined && (
        <div className="mt-3 mb-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimeSpent(timeSpentSeconds)}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <CriteriaCard label="Task" value={criteria.task} />
        <CriteriaCard label="Coherence" value={criteria.coherence} />
        <CriteriaCard label="Lexical" value={criteria.lexical} />
        <CriteriaCard label="Grammar" value={criteria.grammar} />
      </div>
    </div>
  );
}

function CriteriaCard({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums">{value?.toFixed(1) || "—"}</p>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: EssayViewer (Collapsible)
// ═══════════════════════════════════════════════════════════════

function EssayViewer({ text, wordCount }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  return (
    <div className="bg-[#1A1D26] border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-sm">Your Essay</p>
            <p className="text-xs text-slate-500">{wordCount} words</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/30">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: FreeFeedbackSection (Always Visible)
// ═══════════════════════════════════════════════════════════════

function FreeFeedbackSection({ feedback }) {
  // 1-line teasers per criteria
  const teasers = {
    task: feedback?.task_achievement_summary || "Evaluation on how well the task was addressed.",
    coherence: feedback?.coherence_cohesion_summary || "How clearly ideas flow and connect.",
    lexical: feedback?.lexical_resource_summary || "Vocabulary range and accuracy used.",
    grammar: feedback?.grammatical_range_summary || "Grammatical structures and accuracy.",
  };

  // V2 schema returns full descriptive paragraph; older schema returned key name.
  // Map old key names to readable text for backward compatibility.
  const biggestAreaRaw = feedback?.biggest_improvement_area;
  const legacyMap = {
    'task_achievement': 'Task Achievement — focus on directly addressing the prompt with relevant ideas, clear position, and well-developed examples throughout.',
    'coherence_cohesion': 'Coherence & Cohesion — improve logical flow with clear paragraphing and effective linking between ideas.',
    'lexical_resource': 'Lexical Resource — expand vocabulary range with topic-specific terms and less common expressions.',
    'grammatical_range': 'Grammatical Range — practice using complex sentence structures with consistent accuracy.',
  };
  const biggestArea = legacyMap[biggestAreaRaw] || biggestAreaRaw;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          Quick Summary
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <TeaserCard label="Task Achievement" text={teasers.task} icon="task" />
          <TeaserCard label="Coherence & Cohesion" text={teasers.coherence} icon="coherence" />
          <TeaserCard label="Lexical Resource" text={teasers.lexical} icon="lexical" />
          <TeaserCard label="Grammar" text={teasers.grammar} icon="grammar" />
        </div>
      </div>

      {biggestArea && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-amber-400 uppercase tracking-widest font-bold mb-1">
                Biggest Area to Improve
              </p>
              <p className="text-sm text-slate-200 leading-relaxed">{biggestArea}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeaserCard({ label, text, icon }) {
  return (
    <div className="bg-[#1A1D26] border border-slate-800 rounded-xl p-4">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">{label}</p>
      <p className="text-xs text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: LockedSection (Ghosted Preview + CTA)
// ═══════════════════════════════════════════════════════════════

function LockedSection({ isFullTest, isUnlocking, unlockError, userTokenBalance, onUnlock }) {
  const cost = isFullTest ? TOKEN_COST_UNLOCK_FULL_TEST : TOKEN_COST_UNLOCK_SINGLE_TASK;
  const hasBalance = userTokenBalance >= cost;

  return (
    <div className="relative">
      {/* Ghosted preview */}
      <div className="space-y-4 opacity-30 blur-[2px] pointer-events-none select-none">
        <div className="bg-[#1A1D26] border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-emerald-400 uppercase tracking-wider font-bold mb-3">Strengths</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            <li>• Vivamus lacinia odio vitae vestibulum vestibulum.</li>
            <li>• Sed do eiusmod tempor incididunt ut labore.</li>
          </ul>
        </div>
        <div className="bg-[#1A1D26] border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-rose-400 uppercase tracking-wider font-bold mb-3">Weaknesses</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Lorem ipsum dolor sit amet placeholder.</li>
            <li>• Vivamus lacinia odio placeholder.</li>
          </ul>
        </div>
      </div>

      {/* Unlock CTA Overlay */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="bg-[#1A1D26] border border-emerald-500/30 rounded-2xl p-6 md:p-7 max-w-md w-full shadow-2xl shadow-emerald-500/10 text-center">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white mb-2">
            Unlock Detailed Feedback
          </h3>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            {isFullTest
              ? "Lihat strengths, weaknesses, grammar clinic, dan model answer untuk Task 1 dan Task 2."
              : "Lihat strengths, weaknesses, grammar clinic, dan band 8.0 model answer."}
          </p>

          <div className="bg-slate-800/50 rounded-xl p-3 mb-5 flex items-center justify-between text-sm border border-slate-700/50">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Cost:</span>
              <strong className="text-white">{cost} tokens</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Balance:</span>
              <strong className={hasBalance ? "text-white" : "text-rose-400"}>
                {userTokenBalance}
              </strong>
            </div>
          </div>

          {unlockError && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-rose-300">{unlockError}</p>
            </div>
          )}

          <button
            onClick={onUnlock}
            disabled={!hasBalance || isUnlocking}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isUnlocking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Unlocking...</span>
              </>
            ) : !hasBalance ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Token tidak cukup</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Unlock Now</span>
              </>
            )}
          </button>

          {!hasBalance && (
            <Link href="/topup" className="block mt-3">
              <button className="w-full text-xs text-emerald-400 hover:text-emerald-300 font-bold underline">
                Top up tokens →
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: UnlockedFeedback
// ═══════════════════════════════════════════════════════════════

function UnlockedFeedback({ feedback }) {
  return (
    <div className="space-y-5">
      <StrengthsSection items={feedback?.strengths || []} />
      <WeaknessesSection items={feedback?.weaknesses || []} />
      <GrammarClinicSection items={feedback?.grammar_clinic || []} />
      <VocabularySuggestionsSection items={feedback?.vocabulary_suggestions || []} />
      <ModelAnswerSection text={feedback?.model_answer || ""} />
    </div>
  );
}

function StrengthsSection({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-emerald-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <CheckCircle className="w-4 h-4" />
        Strengths ({items.length})
      </h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-200 leading-relaxed">
            <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
            <div className="flex-1">
              {typeof item === "string" ? (
                <p>{item}</p>
              ) : (
                <>
                  <p className="font-medium">{item.point}</p>
                  {item.quote && (
                    <p className="mt-1 text-xs text-slate-400 italic border-l-2 border-emerald-500/30 pl-3">
                      "{item.quote}"
                    </p>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeaknessesSection({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-rose-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <AlertTriangle className="w-4 h-4" />
        Areas to Improve ({items.length})
      </h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-200 leading-relaxed">
            <span className="text-rose-400 shrink-0 mt-0.5">!</span>
            <div className="flex-1">
              {typeof item === "string" ? (
                <p>{item}</p>
              ) : (
                <>
                  <p className="font-medium">{item.point}</p>
                  {item.quote && (
                    <p className="mt-1 text-xs text-slate-400 italic border-l-2 border-rose-500/30 pl-3">
                      "{item.quote}"
                    </p>
                  )}
                  {item.suggestion && (
                    <p className="mt-1 text-xs text-emerald-300">
                      💡 {item.suggestion}
                    </p>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrammarClinicSection({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-[#1A1D26] border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
        <Edit3 className="w-4 h-4 text-amber-400" />
        Grammar Clinic ({items.length})
      </h3>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border-l-2 border-amber-500/30 pl-4 py-1">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-mono text-xs uppercase mt-0.5 shrink-0">Before</span>
                <p className="text-slate-300 italic">"{item.original || item.before}"</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono text-xs uppercase mt-0.5 shrink-0">After</span>
                <p className="text-slate-200 font-medium">"{item.corrected || item.after}"</p>
              </div>
              {item.explanation && (
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {item.explanation}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VocabularySuggestionsSection({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
      <h3 className="text-base font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4" />
        Vocabulary Upgrade ({items.length})
      </h3>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 shrink-0 w-16">
                  Original
                </span>
                <span className="text-sm text-slate-300">"{item.original}"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 shrink-0 w-16">
                  Try
                </span>
                <span className="text-sm text-slate-100 font-medium">"{item.suggestion}"</span>
              </div>
              {item.context && (
                <div className="flex items-start gap-2 mt-1 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0 w-16">
                    Context
                  </span>
                  <span className="text-xs text-slate-400 italic">{item.context}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelAnswerSection({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  return (
    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-indigo-500/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-sm">Band 8.0 Model Answer</p>
            <p className="text-xs text-slate-500">Reference essay untuk topik ini</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-t border-indigo-500/10 bg-slate-900/30">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: ShareWhatsApp
// ═══════════════════════════════════════════════════════════════

function ShareWhatsApp({ data, isFullTest }) {
  const heroBand = isFullTest ? data.combinedBand : data.evaluation?.overall_band;
  if (!heroBand) return null;

  const message = isFullTest
    ? `Just completed IELTS Writing Full Test! 🎯\n\nCombined Band: ${heroBand.toFixed(1)}\nTask 1: ${data.task1Evaluation?.overall_band?.toFixed(1)}\nTask 2: ${data.task2Evaluation?.overall_band?.toFixed(1)}\n\nLatihan di IELTS4our.net 📝`
    : `Just submitted my IELTS Writing essay! 🎯\n\nBand Score: ${heroBand.toFixed(1)}\n\nLatihan di IELTS4our.net 📝`;

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="mt-6">
      
        <a href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <button className="w-full px-6 py-3 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span>Share to WhatsApp</span>
        </button>
      </a>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: ConfettiBurst (Pure CSS, no library)
// ═══════════════════════════════════════════════════════════════

function ConfettiBurst() {
  const colors = ["#2dd4bf", "#a855f7", "#fbbf24", "#34d399", "#60a5fa"];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 1.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.left}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: "110vh",
            rotate: 720,
            opacity: 0,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
          className="absolute w-2 h-3 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}