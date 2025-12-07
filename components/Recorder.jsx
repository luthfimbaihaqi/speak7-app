"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Mic, Square, Loader2, Clock, Info } from "lucide-react";
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
    const durationSec = (recordedBlob.stopTime - recordedBlob.startTime) / 1000;

    if (durationSec < 20) {
      alert(
        "⚠️ Terlalu Singkat (Min 20 Detik)\n\n" + 
        "Coba bicara lebih panjang agar AI bisa menilai grammar dan fluency dengan akurat."
      );
      return; 
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("audio", recordedBlob.blob, "recording.webm");
    formData.append("cue_card", cueCardRef.current);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server Error: Respon bukan JSON.");
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
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto mt-8">
      
      {/* Visualizer Container (Glass Effect) */}
      <div className="relative w-full h-36 bg-black/30 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-inner mb-8 group">
        <ReactMic
          record={isRecording}
          className="w-full h-full opacity-80"
          onStop={onStop}
          strokeColor="#2dd4bf" // Teal 400 (Lebih cerah)
          backgroundColor="transparent" // Transparan agar blend dengan glass
          mimeType="audio/webm"
        />
        
        {/* Overlay Status */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
               <Clock className="w-3.5 h-3.5 text-teal-400" />
               <span className={`text-sm font-mono font-bold ${timeLeft < 10 ? "text-rose-400 animate-pulse" : "text-white"}`}>
                 {formatTime(timeLeft)}
               </span>
            </div>
          )}
          
          <div className="px-3 py-1 rounded-full bg-black/20 backdrop-blur text-xs font-bold tracking-wider border border-white/5">
            {isRecording ? (
              <span className="flex items-center text-rose-500 animate-pulse">● REC</span>
            ) : isLoading ? (
              <span className="text-yellow-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> ANALYZING</span>
            ) : (
              <span className="text-slate-400">READY</span>
            )}
          </div>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex gap-4 w-full justify-center">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            disabled={isLoading}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-teal-500/10 transition-all w-full md:w-auto ${
              isLoading
                ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                : "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white border border-white/10"
            }`}
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                {maxDuration > 60 ? "Start (2 min)" : "Start Recording"}
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white rounded-full font-bold text-lg shadow-xl shadow-rose-500/20 overflow-hidden w-full md:w-auto border border-white/10"
          >
            {/* Progress Bar Background */}
            <div 
               className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-1000 ease-linear"
               style={{ width: `${progressPercent}%` }}
            />
            
            <div className="relative z-10 flex items-center gap-2">
               <Square className="w-5 h-5 fill-current" />
               Stop & Analyze
            </div>
          </motion.button>
        )}
      </div>
      
      {/* Footer Info */}
      {!isRecording && !isLoading && (
        <p className="mt-6 text-xs text-slate-500 text-center flex items-center justify-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
          <Info className="w-3.5 h-3.5" />
          {maxDuration > 60 
             ? "Premium Mode: Max 2 mins."
             : "Free Mode: Max 60 secs."}
        </p>
      )}
    </div>
  );
}