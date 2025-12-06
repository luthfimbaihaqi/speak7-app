"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Mic, Square, Loader2, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const ReactMic = dynamic(() => import("react-mic").then((mod) => mod.ReactMic), {
  ssr: false,
});

export default function Recorder({ cueCard, onAnalysisComplete, maxDuration = 60 }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(maxDuration);
  const timerRef = useRef(null);
  const cueCardRef = useRef(cueCard);

  useEffect(() => {
    cueCardRef.current = cueCard;
  }, [cueCard]);

  useEffect(() => {
    setTimeLeft(maxDuration);
  }, [maxDuration]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const startRecording = () => {
    setTimeLeft(maxDuration); 
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const onStop = async (recordedBlob) => {
    // --- FITUR MINIMUM DURATION (20 DETIK) ---
    const durationSec = (recordedBlob.stopTime - recordedBlob.startTime) / 1000;

    // Batas 20 Detik (Standar IELTS Short Turn)
    if (durationSec < 20) {
      alert(
        "⚠️ Belum Cukup Data\n\n" + 
        "Untuk penilaian IELTS yang akurat, mohon bicara minimal 20 detik.\n" +
        "Jangan menyerah, ayo coba lagi! Kamu pasti bisa cerita lebih panjang."
      );
      return; // Stop di sini, hemat kuota
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("audio", recordedBlob.blob, "recording.webm");
    console.log("Mengirim Soal ke AI:", cueCardRef.current); 
    formData.append("cue_card", cueCardRef.current);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server Response (HTML/Text):", text);
        throw new Error("Server Error: Cek Terminal VSCode untuk detail error.");
      }

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Gagal melakukan analisis.");
      }

      onAnalysisComplete(data);

    } catch (error) {
      console.error("Error uploading:", error);
      alert(`Gagal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = ((maxDuration - timeLeft) / maxDuration) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto mt-6">
      
      {/* Visualisasi Gelombang Suara */}
      <div className="relative w-full h-32 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-inner mb-6">
        <ReactMic
          record={isRecording}
          className="w-full h-full"
          onStop={onStop}
          strokeColor="#0d9488"
          backgroundColor="#1e293b"
          mimeType="audio/webm"
        />
        
        {/* Indikator Status & Waktu */}
        <div className="absolute top-2 right-3 flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-lg backdrop-blur-sm border border-white/10">
               <Clock className="w-3 h-3 text-white" />
               <span className={`text-xs font-mono font-bold ${timeLeft < 10 ? "text-red-400 animate-pulse" : "text-white"}`}>
                 {formatTime(timeLeft)}
               </span>
            </div>
          )}
          
          <div className="text-xs font-mono text-slate-400">
            {isRecording ? (
              <span className="flex items-center text-red-400 animate-pulse">● REC</span>
            ) : isLoading ? (
              <span className="text-yellow-400">ANALYZING...</span>
            ) : (
              "READY"
            )}
          </div>
        </div>
      </div>

      {/* Tombol Kontrol */}
      <div className="flex gap-4">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            disabled={isLoading}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all ${
              isLoading
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-primary hover:bg-teal-500 text-white shadow-teal-500/30"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                {maxDuration > 60 ? "Start (2 min)" : "Start (1 min)"}
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="relative flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-lg shadow-lg shadow-red-500/30 overflow-hidden"
          >
            <div 
               className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-1000 ease-linear"
               style={{ width: `${progressPercent}%` }}
            />
            
            <div className="relative z-10 flex items-center gap-2">
               <Square className="w-5 h-5 fill-current" />
               Stop & Nilai
            </div>
          </motion.button>
        )}
      </div>
      
      {/* Tips Kecil (Updated) */}
      {!isRecording && !isLoading && (
        <p className="mt-4 text-xs text-slate-500 text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {maxDuration > 60 
             ? "Premium Mode: 2 mins limit (Min 20s)."
             : "Free Mode: 60s limit (Min 20s)."}
        </p>
      )}
    </div>
  );
}