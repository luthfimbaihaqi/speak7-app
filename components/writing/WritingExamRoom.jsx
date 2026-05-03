"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Clock, FileText, Lock, AlertTriangle,
  CheckCircle, BookOpen, Save, Edit3, Layers, ArrowRight,
  X, BarChart3, LineChart, PieChart, Mail, Send, Award, Star
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { 
  DAILY_LIMIT_SINGLE_TASK, 
  DAILY_LIMIT_FULL_TEST,
  MIN_WORDS_TO_SUBMIT,
  AUTOSAVE_LOCALSTORAGE_DEBOUNCE_MS,
  AUTOSAVE_SUPABASE_INTERVAL_MS,
  TIMER_WARNING_SECONDS,
  TIMER_CRITICAL_SECONDS,
  formatTimeSpent,
  formatCountdown,
  getTimerStatus,
} from "@/utils/writingConfig";
import WritingScoreCard from "./WritingScoreCard";
import ChartRenderer from "./ChartRenderer";

const FULL_TEST_DURATION = 3600; // 60 minutes

// Friendly paste detection alerts (random rotation)
const PASTE_ALERTS = [
  {
    emoji: "📋",
    title: "Eh, kamu paste ya?",
    body: "Gak masalah kok, IELTS4our gak bakal buat nilai turun karena ini.\n\nTapi kalau kamu lagi latihan beneran buat IELTS, coba tulis sendiri. Otak kamu butuh dilatih, bukan cuma tangan kamu yang copy-paste 😅",
    cta: "Yu lanjut!",
  },
  {
    emoji: "🤔",
    title: "Hmm, kayanya kamu paste deh",
    body: "Tenang, kamu masih bisa lanjut. IELTS4our tetap akan nilai sesuai kualitas tulisan.\n\nCuma reminder: di IELTS asli kamu gak bisa paste. Better latihan kondisi sebenarnya dari sekarang ya. Tapi keputusan ada di tangan kamu kok.",
    cta: "Oke, semangat!",
  },
  {
    emoji: "✋",
    title: "Tertangkap basah!",
    body: "Wkwk just kidding, gak ada hukuman. IELTS4our tetap akan nilai sesuai jawaban kamu.\n\nTapi kita berdua tau, di IELTS asli kamu gak akan punya copy-paste superpower. So... tantang diri kamu nulis sendiri ya 💪",
    cta: "Lanjut yuuu!",
  },
];

export default function WritingExamRoom({ mode, promptId, pairId }) {
  const router = useRouter();

  // ═══════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState(null);

  const [userProfile, setUserProfile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [promptData, setPromptData] = useState(null);
  const [pairData, setPairData] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);

  // Single Task state
  const [essayText, setEssayText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // Full Test state
  const [task1Text, setTask1Text] = useState("");
  const [task1WordCount, setTask1WordCount] = useState(0);
  const [task2Text, setTask2Text] = useState("");
  const [task2WordCount, setTask2WordCount] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(FULL_TEST_DURATION);
  const [activeTaskTab, setActiveTaskTab] = useState(1); // mobile only: 1 or 2

  // Common
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showPasteToast, setShowPasteToast] = useState(false);
  const [showPasteAlert, setShowPasteAlert] = useState(false);
  const [pasteAlertVariant, setPasteAlertVariant] = useState(0);

  // Completion state
  const [completionResult, setCompletionResult] = useState(null);

  // Refs
  const stopwatchRef = useRef(null);
  const countdownRef = useRef(null);
  const localStorageDebounceRef = useRef(null);
  const supabaseSaveIntervalRef = useRef(null);
  const essayTextRef = useRef(essayText);
  const task1TextRef = useRef(task1Text);
  const task2TextRef = useRef(task2Text);
  const autoSubmitTriggeredRef = useRef(false);
  const initSessionTriggeredRef = useRef(false);

  useEffect(() => { essayTextRef.current = essayText; }, [essayText]);
  useEffect(() => { task1TextRef.current = task1Text; }, [task1Text]);
  useEffect(() => { task2TextRef.current = task2Text; }, [task2Text]);

  // ═══════════════════════════════════════════
  // INITIAL FETCH
  // ═══════════════════════════════════════════
  useEffect(() => {
    // Prevent double-call from React Strict Mode (dev) or rapid re-mounts
    if (initSessionTriggeredRef.current) return;
    initSessionTriggeredRef.current = true;
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("Kamu harus login untuk akses fitur Writing.");
        setStatus("error");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("token_balance")
        .eq("id", user.id)
        .single();

      const fullProfile = { ...user, ...profile };
      setUserProfile(fullProfile);

      if (!mode || (mode === "single_task" && !promptId) || (mode === "full_test" && !pairId)) {
        setErrorMessage("Parameter tidak lengkap. Kembali ke Question Bank.");
        setStatus("error");
        return;
      }

      const startBody = {
        userId: user.id,
        mode,
        ...(mode === "single_task" ? { promptId } : { pairId }),
      };

      const res = await fetch("/api/writing/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(startBody),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMessage(data.message || "Daily limit reached. Try again tomorrow.");
          setStatus("error");
          return;
        }
        throw new Error(data.error || "Failed to start session");
      }

      setSessionId(data.sessionId);
      setPromptData(data.promptData);
      setPairData(data.pairData);
      setQuotaInfo(data.quotaInfo);

      // Restore drafts from localStorage
      const draftKey = `writing_draft_${data.sessionId}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (mode === "single_task" && parsed.text) {
            setEssayText(parsed.text);
            setWordCount(countWords(parsed.text));
          } else if (mode === "full_test") {
            if (parsed.task1) {
              setTask1Text(parsed.task1);
              setTask1WordCount(countWords(parsed.task1));
            }
            if (parsed.task2) {
              setTask2Text(parsed.task2);
              setTask2WordCount(countWords(parsed.task2));
            }
          }
        } catch (e) { /* ignore */ }
      }

      if (mode === "single_task") {
        setStatus("writing");
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error("[WritingExamRoom] Init error:", err);
      setErrorMessage(err.message || "Terjadi kesalahan saat memuat soal.");
      setStatus("error");
    }
  };

  // ═══════════════════════════════════════════
  // STOPWATCH (Single Task)
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (status === "writing" && mode === "single_task") {
      stopwatchRef.current = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [status, mode]);

  // ═══════════════════════════════════════════
  // COUNTDOWN (Full Test)
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (status === "writing" && mode === "full_test") {
      countdownRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          const next = prev - 1;
          if (next <= 0 && !autoSubmitTriggeredRef.current) {
            autoSubmitTriggeredRef.current = true;
            // Trigger auto-submit
            setTimeout(() => handleSubmitFullTest(true), 100);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, mode]);

  // ═══════════════════════════════════════════
  // AUTOSAVE — localStorage (500ms debounce)
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (status !== "writing" || !sessionId) return;

    if (localStorageDebounceRef.current) {
      clearTimeout(localStorageDebounceRef.current);
    }

    localStorageDebounceRef.current = setTimeout(() => {
      try {
        const draftKey = `writing_draft_${sessionId}`;
        const payload = mode === "single_task"
          ? { text: essayText, wordCount, savedAt: Date.now() }
          : { task1: task1Text, task2: task2Text, savedAt: Date.now() };
        localStorage.setItem(draftKey, JSON.stringify(payload));
      } catch (e) {
        console.error("localStorage save failed:", e);
      }
    }, AUTOSAVE_LOCALSTORAGE_DEBOUNCE_MS);

    return () => {
      if (localStorageDebounceRef.current) {
        clearTimeout(localStorageDebounceRef.current);
      }
    };
  }, [essayText, wordCount, task1Text, task2Text, sessionId, status, mode]);

  // ═══════════════════════════════════════════
  // AUTOSAVE — Supabase (30s interval)
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (status !== "writing" || !sessionId || !userProfile) return;

    supabaseSaveIntervalRef.current = setInterval(async () => {
      if (mode === "single_task") {
        const currentText = essayTextRef.current;
        if (!currentText || currentText.length === 0) return;

        setSaveStatus("saving");
        try {
          const res = await fetch("/api/writing/save-draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              userId: userProfile.id,
              draft: currentText,
              wordCount: countWords(currentText),
            }),
          });
          if (res.ok) {
            setSaveStatus("saved");
            setLastSavedAt(new Date());
          } else {
            setSaveStatus("error");
          }
        } catch (e) {
          setSaveStatus("error");
        }
      } else {
        // Full test: save both tasks
        const t1 = task1TextRef.current;
        const t2 = task2TextRef.current;
        if (!t1 && !t2) return;

        setSaveStatus("saving");
        try {
          // Save task 1
          if (t1 && t1.length > 0) {
            await fetch("/api/writing/save-draft", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                userId: userProfile.id,
                draft: t1,
                wordCount: countWords(t1),
                taskNumber: 1,
              }),
            });
          }
          // Save task 2
          if (t2 && t2.length > 0) {
            await fetch("/api/writing/save-draft", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                userId: userProfile.id,
                draft: t2,
                wordCount: countWords(t2),
                taskNumber: 2,
              }),
            });
          }
          setSaveStatus("saved");
          setLastSavedAt(new Date());
        } catch (e) {
          setSaveStatus("error");
        }
      }
    }, AUTOSAVE_SUPABASE_INTERVAL_MS);

    return () => {
      if (supabaseSaveIntervalRef.current) {
        clearInterval(supabaseSaveIntervalRef.current);
      }
    };
  }, [status, sessionId, userProfile, mode]);

  // ═══════════════════════════════════════════
  // EXIT CONFIRMATION
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (status !== "writing") return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    window.history.pushState(null, "", window.location.href);
    const handlePopState = (e) => {
      const confirmLeave = window.confirm(
        "Essay kamu belum di-submit. Yakin keluar? Draft akan di-reset."
      );
      if (!confirmLeave) {
        window.history.pushState(null, "", window.location.href);
      } else {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.history.back();
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [status]);

  // ═══════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════

  const countWords = (text) => {
    if (!text || text.trim().length === 0) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleSingleTaskChange = (e) => {
    const newText = e.target.value;
    setEssayText(newText);
    setWordCount(countWords(newText));
  };

  const handleTask1Change = (e) => {
    const newText = e.target.value;
    setTask1Text(newText);
    setTask1WordCount(countWords(newText));
  };

  const handleTask2Change = (e) => {
    const newText = e.target.value;
    setTask2Text(newText);
    setTask2WordCount(countWords(newText));
  };

  const handlePaste = (e) => {
    // Allow paste, show friendly alert with random variant
    setPasteAlertVariant(Math.floor(Math.random() * PASTE_ALERTS.length));
    setShowPasteAlert(true);
  };

  const handleDrop = (e) => {
    // Allow drop, show friendly alert with random variant
    setPasteAlertVariant(Math.floor(Math.random() * PASTE_ALERTS.length));
    setShowPasteAlert(true);
  };

  const handleStartFullTest = () => {
    setStatus("writing");
  };

  const handleExit = () => {
    if (status === "writing" || status === "submitting") {
      const confirmed = window.confirm(
        "Essay kamu belum di-submit. Yakin keluar? Draft akan di-reset."
      );
      if (!confirmed) return;
    }
    if (mode === "full_test") {
      router.push("/writing/academic");
    } else {
      router.push("/writing/academic");
    }
  };

  const handleUnlock = async (historyType, historyId) => {
    try {
      const res = await fetch("/api/writing/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.id,
          historyId,
          historyType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Failed to unlock" };
      }

      // Refresh user token balance after successful unlock
      if (data.newTokenBalance !== undefined) {
        setUserProfile((prev) => ({ ...prev, token_balance: data.newTokenBalance }));
      }

      return { success: true };
    } catch (err) {
      console.error("Unlock error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  };

  const handleSubmitSingleTask = async () => {
    if (wordCount < MIN_WORDS_TO_SUBMIT) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/writing/evaluate-single-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userId: userProfile.id,
          essayText,
          wordCount,
          timeSpentSeconds: stopwatchSeconds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit essay");
      }

      try {
        localStorage.removeItem(`writing_draft_${sessionId}`);
      } catch (e) { /* ignore */ }

      setCompletionResult({
  type: "single_task",
  evaluation: {
    ...data.evaluation,
    full_feedback: data.evaluation,
  },
  historyId: data.historyId,
  timeSpentSeconds: stopwatchSeconds,
  essayText: essayText,
  wordCount: wordCount,
});

      setStatus("completed");
    } catch (err) {
      console.error("Submit error:", err);
      alert(`Submission failed: ${err.message}`);
      setStatus("writing");
    }
  };

  const handleSubmitFullTest = async (isAutoSubmit = false) => {
    // Use refs to get latest values (critical for auto-submit timeout case)
    const t1 = task1TextRef.current;
    const t2 = task2TextRef.current;
    const t1WordCount = countWords(t1);
    const t2WordCount = countWords(t2);

    // Validate min words (skip if auto-submit due to timeout)
    if (!isAutoSubmit) {
      if (t1WordCount < MIN_WORDS_TO_SUBMIT || t2WordCount < MIN_WORDS_TO_SUBMIT) {
        alert(`Kedua task harus minimal ${MIN_WORDS_TO_SUBMIT} kata.\n\nTask 1: ${t1WordCount} kata\nTask 2: ${t2WordCount} kata`);
        return;
      }
    }

    setStatus("submitting");

    try {
      const totalTimeSpent = FULL_TEST_DURATION - countdownSeconds;

      const res = await fetch("/api/writing/evaluate-full-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userId: userProfile.id,
          task1EssayText: t1 || "(empty)",
          task1WordCount: t1WordCount,
          task2EssayText: t2 || "(empty)",
          task2WordCount: t2WordCount,
          totalTimeSpentSeconds: totalTimeSpent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit Full Test");
      }

      try {
        localStorage.removeItem(`writing_draft_${sessionId}`);
      } catch (e) { /* ignore */ }

      setCompletionResult({
  type: "full_test",
  task1Evaluation: {
    ...data.task1Evaluation,
    full_feedback: data.task1Evaluation,
  },
  task2Evaluation: {
    ...data.task2Evaluation,
    full_feedback: data.task2Evaluation,
  },
  combinedBand: data.combinedBand,
  pairCode: data.pairCode,
  module: data.module,
  historyId: data.historyId,
  totalTimeSpentSeconds: totalTimeSpent,
  autoSubmitted: isAutoSubmit,
  task1Text: t1,
  task2Text: t2,
});
      setStatus("completed");
    } catch (err) {
      console.error("Submit error:", err);
      alert(`Submission failed: ${err.message}`);
      setStatus("writing");
    }
  };

  const formatStopwatch = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSaveStatusDisplay = () => {
    if (saveStatus === "saving") return { text: "Saving...", color: "text-amber-400" };
    if (saveStatus === "error") return { text: "Save error", color: "text-rose-400" };
    if (saveStatus === "saved" && lastSavedAt) {
      const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      if (seconds < 5) return { text: "✓ Saved", color: "text-emerald-400" };
      return { text: `✓ Saved ${seconds}s ago`, color: "text-slate-500" };
    }
    return { text: "", color: "text-slate-500" };
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#151824] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 font-medium tracking-wide">Memuat soal...</p>
          <p className="text-slate-500 text-xs mt-2">Menyiapkan ruang latihan kamu</p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#151824] flex items-center justify-center px-4">
        <div className="bg-[#1A1D26] border border-slate-800 rounded-2xl p-8 max-w-md text-center">
          <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Tidak Dapat Memuat</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">{errorMessage}</p>
          <Link href="/writing/academic">
            <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-all">
              Kembali ke Question Bank
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (status === "idle" && mode === "full_test") {
    return <PreFlightFullTest 
      pairData={pairData}
      quotaInfo={quotaInfo}
      onStart={handleStartFullTest}
      onExit={handleExit}
    />;
  }

  if (status === "submitting") {
    return <SubmittingScreen mode={mode} />;
  }

  if (status === "writing" && mode === "single_task") {
    return (
      <>
        <ActiveWritingSingleTask
          promptData={promptData}
          essayText={essayText}
          wordCount={wordCount}
          stopwatchSeconds={stopwatchSeconds}
          saveStatusDisplay={getSaveStatusDisplay()}
          onChange={handleSingleTaskChange}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onSubmit={handleSubmitSingleTask}
          onExit={handleExit}
          formatStopwatch={formatStopwatch}
        />
        <PasteAlertModal 
          show={showPasteAlert}
          variant={pasteAlertVariant}
          onClose={() => setShowPasteAlert(false)}
        />
      </>
    );
  }

  if (status === "writing" && mode === "full_test") {
    return (
      <>
        <ActiveWritingFullTest
          pairData={pairData}
          task1Text={task1Text}
          task1WordCount={task1WordCount}
          task2Text={task2Text}
          task2WordCount={task2WordCount}
          countdownSeconds={countdownSeconds}
          activeTaskTab={activeTaskTab}
          saveStatusDisplay={getSaveStatusDisplay()}
          onTask1Change={handleTask1Change}
          onTask2Change={handleTask2Change}
          onTabChange={setActiveTaskTab}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onSubmit={() => handleSubmitFullTest(false)}
          onExit={handleExit}
        />
        <PasteAlertModal 
          show={showPasteAlert}
          variant={pasteAlertVariant}
          onClose={() => setShowPasteAlert(false)}
        />
      </>
    );
  }

if (status === "completed") {
    return (
      <>
        <WritingScoreCard
          data={completionResult}
          userTokenBalance={userProfile?.token_balance || 0}
          isLoggedIn={!!userProfile}
          onUnlock={handleUnlock}
          onTryAnother={() => {
            const targetModule = pairData?.module || promptData?.module || "academic";
            router.push(`/writing/${targetModule}`);
          }}
          onViewProgress={() => router.push("/progress")}
        />
        <PasteAlertModal 
          show={showPasteAlert}
          variant={pasteAlertVariant}
          onClose={() => setShowPasteAlert(false)}
        />
      </>
    );
  }

  return null;
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: PreFlightFullTest
// ═══════════════════════════════════════════════════════════════

function PreFlightFullTest({ pairData, quotaInfo, onStart, onExit }) {
  const task1 = pairData?.task_1_prompt;

  const t1TypeLabel = task1?.task_type === "task_1_academic"
    ? "Chart Description"
    : "Letter Writing";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#151824] px-4 py-8">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <button 
          onClick={onExit}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider group"
        >
          <div className="p-1.5 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Kembali
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Full Writing Test
          </h1>
          <div className="inline-flex items-center justify-center gap-2 text-slate-400 text-base mb-6">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Durasi: <strong className="text-white">60 menit</strong></span>
          </div>

          <div className="flex items-center justify-center gap-3 text-sm font-medium text-slate-400 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span className="hidden md:inline">Task 1 ({t1TypeLabel})</span>
              <span className="md:hidden">Task 1</span>
            </div>
            <div className="w-12 h-[1px] bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span className="hidden md:inline">Task 2 (Essay)</span>
              <span className="md:hidden">Task 2</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Cara Kerja
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-200">Timer 60 menit ketat</p>
                  <p className="text-xs text-slate-400">Auto-submit saat waktu habis.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Save className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-200">Auto-save aktif</p>
                  <p className="text-xs text-slate-400">Essay tersimpan setiap 30 detik.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-200">Paste tidak diizinkan</p>
                  <p className="text-xs text-slate-400">Tulis sendiri untuk hasil maksimal.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Tips Strategis
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-slate-300">
                  <strong className="text-white">Bagi waktu:</strong> Task 1 (~20 menit), Task 2 (~40 menit). Task 2 weighted 2x.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-slate-300">
                  <strong className="text-white">Plan dulu:</strong> 2-3 menit outline sebelum nulis.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-slate-300">
                  <strong className="text-white">Min words:</strong> Task 1 = 150, Task 2 = 250.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-1"
          >
            <span>Mulai Full Test</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {quotaInfo && (
            <p className="mt-4 text-xs text-slate-500">
              Quota hari ini: <span className="text-white font-bold">{quotaInfo.fullTestUsedToday || 0} / {quotaInfo.fullTestLimit || DAILY_LIMIT_FULL_TEST}</span> Full Test
            </p>
          )}
          <p className="mt-2 text-xs text-slate-600">
            Pair Code: <span className="text-slate-400 font-mono">{pairData?.pair_code}</span> • {pairData?.module === "academic" ? "Academic" : "General Training"}
          </p>
        </div>
      </div>
    </main>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: ActiveWritingSingleTask
// ═══════════════════════════════════════════════════════════════

function ActiveWritingSingleTask({
  promptData, essayText, wordCount, stopwatchSeconds, saveStatusDisplay, onChange, onPaste, onDrop, onSubmit, onExit, formatStopwatch,
}) {
  const minWords = promptData?.word_count_min || 250;
  const isSubmitDisabled = wordCount < MIN_WORDS_TO_SUBMIT;
  const isMinWordsMet = wordCount >= minWords;

  const wordCountColor = (() => {
    const percent = (wordCount / minWords) * 100;
    if (percent >= 100) return "text-emerald-400";
    if (percent >= 50) return "text-amber-400";
    return "text-rose-400";
  })();

  const taskTypeLabel = (() => {
    if (promptData?.task_type === "task_1_academic") return "Task 1 — Chart Description";
    if (promptData?.task_type === "task_1_general") return "Task 1 — Letter Writing";
    return "Task 2 — Essay";
  })();

  const renderChartPreview = () => {
    if (promptData?.task_type !== "task_1_academic") return null;
    if (!promptData?.chart_data) return null;
    return <ChartRenderer chartData={promptData.chart_data} />;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#151824] flex flex-col">
      <header className="bg-[#1A1D26]/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs md:text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Exit</span>
        </button>

        <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <span className="font-mono text-slate-500">Code:</span>
            <span className="text-white font-bold">{promptData?.code}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-slate-200 tabular-nums">
              {formatStopwatch(stopwatchSeconds)}
            </span>
          </div>

          <div className={`text-xs ${saveStatusDisplay.color} hidden md:block`}>
            {saveStatusDisplay.text}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 md:px-6 py-6 gap-5">
        <aside className="w-full md:w-2/5 lg:w-2/5 bg-[#1A1D26] border border-slate-800 rounded-2xl p-5 md:p-6 overflow-y-auto md:max-h-[calc(100vh-160px)] md:sticky md:top-20">
          <div className="mb-4">
            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {taskTypeLabel}
            </span>
          </div>
          
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 leading-snug">
            {promptData?.topic_label}
          </h2>

          <div className="prose prose-invert prose-sm max-w-none mb-4">
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {promptData?.prompt_text}
            </p>
          </div>

          {renderChartPreview()}

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
            <FileText className="w-3.5 h-3.5" />
            <span>Min words: <strong className="text-slate-300">{minWords}</strong></span>
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-[#1A1D26] border border-slate-800 rounded-2xl overflow-hidden">
          <textarea
            value={essayText}
            onChange={onChange}
            onPaste={onPaste}
            onDrop={onDrop}
            placeholder="Mulai menulis essay kamu di sini..."
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="flex-1 w-full bg-transparent text-slate-200 text-sm md:text-base leading-relaxed p-5 md:p-6 resize-none focus:outline-none placeholder:text-slate-600 min-h-[400px] md:min-h-[500px]"
          />

          <div className="border-t border-slate-800 px-5 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4 bg-slate-900/30">
            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Words:</span>
                <span className={`${wordCountColor} font-bold tabular-nums text-base`}>
                  {wordCount}
                </span>
                <span className="text-slate-600">/ {minWords} min</span>
              </div>
              {isMinWordsMet && (
                <span className="hidden md:inline-flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Target met
                </span>
              )}
            </div>

            <button
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              className="px-6 md:px-8 py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Send className="w-4 h-4" />
              <span>Submit Essay</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: ActiveWritingFullTest (NEW in 10.3)
// ═══════════════════════════════════════════════════════════════

function ActiveWritingFullTest({
  pairData, task1Text, task1WordCount, task2Text, task2WordCount,
  countdownSeconds, activeTaskTab, saveStatusDisplay,
  onTask1Change, onTask2Change, onTabChange, onPaste, onDrop, onSubmit, onExit,
}) {
  const task1Prompt = pairData?.task_1_prompt;
  const task2Prompt = pairData?.task_2_prompt;

  const task1MinWords = task1Prompt?.word_count_min || 150;
  const task2MinWords = task2Prompt?.word_count_min || 250;

  const isSubmitDisabled = task1WordCount < MIN_WORDS_TO_SUBMIT || task2WordCount < MIN_WORDS_TO_SUBMIT;

  // Timer status
  const timerStatus = getTimerStatus(countdownSeconds);
  const timerColors = {
    normal: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
    critical: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400 animate-pulse" },
  };
  const timerColor = timerColors[timerStatus];

  // Task 1 type label
  const task1TypeLabel = task1Prompt?.task_type === "task_1_academic"
    ? "Task 1 — Chart Description"
    : "Task 1 — Letter Writing";

  // Word count color helper
  const getWordCountColor = (count, min) => {
    const percent = (count / min) * 100;
    if (percent >= 100) return "text-emerald-400";
    if (percent >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  // Render chart preview for Task 1 Academic
  // Render chart for Task 1 Academic
  const renderChartPreview = () => {
    if (task1Prompt?.task_type !== "task_1_academic") return null;
    if (!task1Prompt?.chart_data) return null;
    return <ChartRenderer chartData={task1Prompt.chart_data} />;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#151824] flex flex-col">
      
      {/* TOP BAR */}
      <header className="bg-[#1A1D26]/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs md:text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Exit</span>
        </button>

        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <span className="font-mono text-slate-500">Pair:</span>
            <span className="text-white font-bold">{pairData?.pair_code}</span>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1 ${timerColor.bg} rounded-full border ${timerColor.border}`}>
            <Clock className={`w-3.5 h-3.5 ${timerColor.text}`} />
            <span className={`font-mono font-bold tabular-nums ${timerColor.text} text-sm md:text-base`}>
              {formatCountdown(countdownSeconds)}
            </span>
          </div>

          <div className={`text-xs ${saveStatusDisplay.color} hidden md:block`}>
            {saveStatusDisplay.text}
          </div>
        </div>
      </header>

      {/* MOBILE TAB TOGGLE */}
      <div className="md:hidden flex bg-[#1A1D26] border-b border-slate-800 px-4 py-2 gap-2 sticky top-[57px] z-10">
        <button
          onClick={() => onTabChange(1)}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTaskTab === 1 ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
          }`}
        >
          Task 1 ({task1WordCount}/{task1MinWords})
        </button>
        <button
          onClick={() => onTabChange(2)}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTaskTab === 2 ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
          }`}
        >
          Task 2 ({task2WordCount}/{task2MinWords})
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* TASK 1 SECTION (always visible on desktop, conditional on mobile) */}
        <div className={`${activeTaskTab === 1 ? "block" : "hidden md:block"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
              {task1TypeLabel}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            {/* Task 1 Prompt Panel */}
            <aside className="w-full md:w-2/5 bg-[#1A1D26] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-base md:text-lg font-bold text-white mb-3 leading-snug">
                {task1Prompt?.topic_label}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {task1Prompt?.prompt_text}
              </p>
              {renderChartPreview()}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                <FileText className="w-3.5 h-3.5" />
                <span>Min words: <strong className="text-slate-300">{task1MinWords}</strong></span>
              </div>
            </aside>

            {/* Task 1 Textarea */}
            <section className="flex-1 flex flex-col bg-[#1A1D26] border border-slate-800 rounded-2xl overflow-hidden">
              <textarea
                value={task1Text}
                onChange={onTask1Change}
                onPaste={onPaste}
                onDrop={onDrop}
                placeholder="Mulai menulis Task 1 di sini..."
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="flex-1 w-full bg-transparent text-slate-200 text-sm md:text-base leading-relaxed p-5 resize-none focus:outline-none placeholder:text-slate-600 min-h-[300px]"
              />
              <div className="border-t border-slate-800 px-5 py-3 bg-slate-900/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Words:</span>
                  <span className={`${getWordCountColor(task1WordCount, task1MinWords)} font-bold tabular-nums text-base`}>
                    {task1WordCount}
                  </span>
                  <span className="text-slate-600">/ {task1MinWords}</span>
                </div>
                {task1WordCount >= task1MinWords && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Target met
                  </span>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* TASK 2 SECTION */}
        <div className={`${activeTaskTab === 2 ? "block" : "hidden md:block"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
              Task 2 — Essay
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            {/* Task 2 Prompt Panel */}
            <aside className="w-full md:w-2/5 bg-[#1A1D26] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-base md:text-lg font-bold text-white mb-3 leading-snug">
                {task2Prompt?.topic_label}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {task2Prompt?.prompt_text}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                <FileText className="w-3.5 h-3.5" />
                <span>Min words: <strong className="text-slate-300">{task2MinWords}</strong></span>
              </div>
            </aside>

            {/* Task 2 Textarea */}
            <section className="flex-1 flex flex-col bg-[#1A1D26] border border-slate-800 rounded-2xl overflow-hidden">
              <textarea
                value={task2Text}
                onChange={onTask2Change}
                onPaste={onPaste}
                onDrop={onDrop}
                placeholder="Mulai menulis Task 2 di sini..."
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="flex-1 w-full bg-transparent text-slate-200 text-sm md:text-base leading-relaxed p-5 resize-none focus:outline-none placeholder:text-slate-600 min-h-[300px]"
              />
              <div className="border-t border-slate-800 px-5 py-3 bg-slate-900/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Words:</span>
                  <span className={`${getWordCountColor(task2WordCount, task2MinWords)} font-bold tabular-nums text-base`}>
                    {task2WordCount}
                  </span>
                  <span className="text-slate-600">/ {task2MinWords}</span>
                </div>
                {task2WordCount >= task2MinWords && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Target met
                  </span>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* SUBMIT BAR */}
        <div className="bg-[#1A1D26] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="text-xs md:text-sm text-slate-400">
            <p>
              <strong className="text-white">Status:</strong>{" "}
              Task 1 ({task1WordCount}/{task1MinWords}) • Task 2 ({task2WordCount}/{task2MinWords})
            </p>
            {isSubmitDisabled && (
              <p className="text-rose-400 text-xs mt-1">
                Kedua task harus minimal {MIN_WORDS_TO_SUBMIT} kata sebelum submit.
              </p>
            )}
          </div>
          <button
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Send className="w-4 h-4" />
            <span>Submit Full Test</span>
          </button>
        </div>
      </div>
    </main>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: SubmittingScreen
// ═══════════════════════════════════════════════════════════════

function SubmittingScreen({ mode }) {
  const [step, setStep] = useState(0);
  const steps = mode === "full_test" ? [
    "Membaca Task 1 dan Task 2",
    "Mengevaluasi grammar dan struktur",
    "Menghitung band score",
    "Menyusun feedback detail",
  ] : [
    "Membaca essay kamu",
    "Mengevaluasi grammar dan struktur",
    "Menghitung band score",
    "Menyusun feedback detail",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#151824] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">Menganalisis Essay</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Examiner sedang membaca essay kamu dengan teliti.
          <br />Biasanya butuh 15-30 detik.
        </p>

        <div className="space-y-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                i < step ? "bg-emerald-500/10 border border-emerald-500/20" :
                i === step ? "bg-emerald-500/20 border border-emerald-500/30 shadow-lg" :
                "bg-slate-800/30 border border-slate-700/30 opacity-50"
              }`}
            >
              {i < step ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : i === step ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
              )}
              <span className={`text-sm text-left ${
                i <= step ? "text-slate-200" : "text-slate-500"
              }`}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: PasteAlertModal
// ═══════════════════════════════════════════════════════════════

function PasteAlertModal({ show, variant, onClose }) {
  const alert = PASTE_ALERTS[variant] || PASTE_ALERTS[0];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1D26] border border-emerald-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">{alert.emoji}</div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                {alert.title}
              </h3>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
                {alert.body}
              </p>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                {alert.cta}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
