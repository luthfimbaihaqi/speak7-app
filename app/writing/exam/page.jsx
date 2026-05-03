"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import WritingExamRoom from "@/components/writing/WritingExamRoom";

/**
 * Page entry for /writing/exam
 * 
 * Query params:
 *   - mode: 'single_task' | 'full_test' (required)
 *   - promptId: uuid (required if mode=single_task)
 *   - pairId: uuid (required if mode=full_test)
 * 
 * Examples:
 *   /writing/exam?mode=single_task&promptId=abc-123
 *   /writing/exam?mode=full_test&pairId=xyz-789
 */
function WritingExamContent() {
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const promptId = searchParams.get("promptId");
  const pairId = searchParams.get("pairId");

  return (
    <WritingExamRoom 
      mode={mode}
      promptId={promptId}
      pairId={pairId}
    />
  );
}

export default function WritingExamPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#151824] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </main>
      }
    >
      <WritingExamContent />
    </Suspense>
  );
}