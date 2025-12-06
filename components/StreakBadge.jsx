"use client";

import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export default function StreakBadge({ triggerUpdate }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Ambil data streak dari LocalStorage saat website dibuka
    const storedStreak = localStorage.getItem("speak7_streak");
    if (storedStreak) {
      setStreak(parseInt(storedStreak));
    }
  }, [triggerUpdate]); // Update tampilan jika user baru saja selesai latihan

  return (
    <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/50 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.3)]">
      <Flame className={`w-5 h-5 text-orange-500 ${streak > 0 ? "animate-pulse" : ""}`} fill={streak > 0 ? "currentColor" : "none"} />
      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold text-orange-400">{streak}</span>
        <span className="text-[10px] uppercase font-bold text-orange-500/80 tracking-wide">Day Streak</span>
      </div>
    </div>
  );
}