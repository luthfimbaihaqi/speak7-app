"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Mic, Square, Loader2, Clock, Info, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReactMic = dynamic(() => import("react-mic").then((mod) => mod.ReactMic), {
  ssr: false,
});

export default function Recorder({ cueCard, onAnalysisComplete, maxDuration = 60, mode = "cue-card", difficulty = "medium" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(maxDuration);
  const [errorMessage, setErrorMessage] = useState(null); 

  const timerRef = useRef(null);
  const cueCardRef = useRef(cueCard);
  const modeRef = useRef(mode);
  // 🔥 NEW: Ref untuk Difficulty
  const difficultyRef = useRef(difficulty);

  useEffect(() => {
    cueCardRef.current = cueCard;
    modeRef.current = mode; 
    difficultyRef.current = difficulty; // Update ref saat props berubah
  }, [cueCard, mode, difficulty]);

  useEffect(() => {
    setTimeLeft(maxDuration);
  }, [maxDuration]);

  // Timer logic
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
  }, [isRecording]);

  // Hilangkan error message otomatis setelah 3 detik
  useEffect(() => {
    if (errorMessage) {
        const timer = setTimeout(() => setErrorMessage(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const startRecording = () => {
    setTimeLeft(maxDuration); 
    setErrorMessage(null); 
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const onStop = async (recordedBlob) => {
    const durationSec = (recordedBlob.stopTime - recordedBlob.startTime) / 1000;
    const minDuration = mode === "mock-interview" ? 5 : 10; 

    if (durationSec < minDuration) {
      setErrorMessage(`⚠️ Too short! Keep speaking for at least ${minDuration}s.`);
      return; 
    }

    if (!recordedBlob.blob || recordedBlob.blob.size < 5000) {
        setErrorMessage("⚠️ Audio Empty. Please refresh & check mic.");
        return;
    }

    setIsLoading(true);
    
    const mimeType = recordedBlob.blob.type || "audio/webm";
    const extension = mimeType.includes("mp4") ? "mp4" : "webm";
    
    const formData = new FormData();
    formData.append("audio", recordedBlob.blob, `recording.${extension}`);
    formData.append("cue_card", cueCardRef.current);
    formData.append("mode", modeRef.current); 
    // 🔥 NEW: Kirim data difficulty ke Backend
    formData.append("difficulty", difficultyRef.current); 

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

      const audioUrl = URL.createObjectURL(recordedBlob.blob);
      
      onAnalysisComplete({
          ...data,
          audioUrl: audioUrl 
      });

    } catch (error) {
      console.error("Error uploading:", error);
      setErrorMessage(`Error: ${error.message}`);
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
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto mt-8 relative">
      
      {/* Visualizer Container */}
      <div className={`relative w-full h-36 bg-black/30 backdrop-blur-md rounded-2xl overflow-hidden border transition-colors shadow-inner mb-8 group ${errorMessage ? "border-red-500/50 bg-red-500/5" : "border-white/10"}`}>
        <ReactMic
          record={isRecording}
          className="w-full h-full opacity-80"
          onStop={onStop}
          strokeColor={errorMessage ? "#f43f5e" : "#2dd4bf"} 
          backgroundColor="transparent" 
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
              <span className="text-yellow-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> AI THINKING...</span>
            ) : (
              <span className="text-slate-400">READY</span>
            )}
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE TOAST */}
      <AnimatePresence>
        {errorMessage && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-0 right-0 mx-auto text-center"
            >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-full backdrop-blur-md shadow-lg">
                    <AlertCircle className="w-3 h-3" /> {errorMessage}
                </span>
            </motion.div>
        )}
      </AnimatePresence>

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
                {mode === "mock-interview" ? "Answer (60s max)" : "Start Recording"}
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
            <div 
               className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-1000 ease-linear"
               style={{ width: `${progressPercent}%` }}
            />
            
            <div className="relative z-10 flex items-center gap-2">
               <Square className="w-5 h-5 fill-current" />
               Stop & Send
            </div>
          </motion.button>
        )}
      </div>
      
      {/* Footer Info */}
      {!isRecording && !isLoading && !errorMessage && (
        <p className="mt-6 text-xs text-slate-500 text-center flex items-center justify-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
          <Info className="w-3.5 h-3.5" />
          {mode === "mock-interview" 
             ? "Mock Interview: Speak naturally like a conversation."
             : "Duration: Max 2 mins."}
        </p>
      )}
    </div>
  );
}