"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Lock, Star, FileText, ChevronDown, ChevronUp, Share2, ArrowRight } from "lucide-react";
import Confetti from "react-confetti";

export default function ScoreCard({ result, cue, isPremiumExternal, onOpenUpgradeModal }) {
  const [showTranscript, setShowTranscript] = useState(false); 

  if (!result) return null;

  const isHighSchore = result.overall >= 7.0;

  const shareToWA = () => {
    const text = `🔥 I just scored Band ${result.overall} on Ielts4our!\n\nTopic: "${cue || "IELTS Practice"}"\n\nCan you beat my score? 🎯\nTry it here: https://ielts4our.vercel.app`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
      {isHighSchore && <Confetti recycle={false} numberOfPieces={500} />}

      {/* --- SCORE GRID --- */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-purple-500" />
        <h2 className="text-slate-400 uppercase text-sm tracking-widest font-bold mb-2">Overall Band</h2>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-purple-400 mb-2">
          {result.overall}
        </div>
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(Math.floor(result.overall))].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <ScoreItem label="Fluency" score={result.fluency} delay={0.1} />
          <ScoreItem label="Lexical" score={result.lexical} delay={0.2} />
          <ScoreItem label="Grammar" score={result.grammar} delay={0.3} />
          <ScoreItem label="Pronunc." score={result.pronunciation} delay={0.4} />
        </div>
      </motion.div>

      {/* --- TRANSCRIPT --- */}
      {result.transcript && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <button 
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <FileText className="w-5 h-5 text-teal-500" />
              Your Transcript
            </div>
            {showTranscript ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          <AnimatePresence>
            {showTranscript && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 bg-slate-900/30">
                  "{result.transcript}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* --- FEEDBACK --- */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-5 rounded-xl border border-teal-900/50">
          <h3 className="flex items-center gap-2 text-teal-400 font-bold mb-3">
            <CheckCircle className="w-5 h-5" /> What you did well
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {result.feedback?.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-teal-500">•</span> {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-800/50 p-5 rounded-xl border border-purple-900/50">
          <h3 className="flex items-center gap-2 text-purple-400 font-bold mb-3">
            <AlertTriangle className="w-5 h-5" /> To reach Band 8.0
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {result.improvement}
          </p>
        </div>
      </div>

      {/* --- BARU: GRAMMAR & VOCAB CLINIC (TEASER) --- */}
      {result.grammarCorrection && result.grammarCorrection.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative">
          <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="text-pink-500">🛠️</span> Grammar Clinic
            </h3>
            {!isPremiumExternal && <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded">PREVIEW MODE</span>}
          </div>
          
          <div className="divide-y divide-slate-800">
            {/* ITEM PERTAMA (GRATIS) */}
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-3 md:items-center text-sm mb-2">
                <div className="text-red-400 line-through md:w-1/2">"{result.grammarCorrection[0].original}"</div>
                <div className="hidden md:block text-slate-600"><ArrowRight className="w-4 h-4"/></div>
                <div className="text-green-400 font-bold md:w-1/2">"{result.grammarCorrection[0].correction}"</div>
              </div>
              <p className="text-xs text-slate-500 italic">💡 {result.grammarCorrection[0].reason}</p>
            </div>

            {/* SISA ITEM (BLURRED JIKA FREE) */}
            {result.grammarCorrection.slice(1).map((item, i) => (
              <div key={i} className={`p-4 relative ${!isPremiumExternal ? "blur-sm select-none" : ""}`}>
                <div className="flex flex-col md:flex-row gap-3 md:items-center text-sm mb-2">
                  <div className="text-red-400 line-through md:w-1/2">"{item.original}"</div>
                  <div className="hidden md:block text-slate-600"><ArrowRight className="w-4 h-4"/></div>
                  <div className="text-green-400 font-bold md:w-1/2">"{item.correction}"</div>
                </div>
                <p className="text-xs text-slate-500 italic">💡 {item.reason}</p>
              </div>
            ))}
          </div>

          {/* OVERLAY JIKA BELUM PREMIUM */}
          {!isPremiumExternal && result.grammarCorrection.length > 1 && (
            <div className="absolute top-[80px] left-0 w-full h-full bg-slate-900/60 backdrop-blur-[1px] flex flex-col items-center pt-10 z-10">
              <Lock className="w-8 h-8 text-pink-500 mb-2" />
              <p className="text-white font-bold mb-1">Unlock {result.grammarCorrection.length - 1} More Corrections</p>
              <p className="text-slate-300 text-xs mb-4">Lihat semua kesalahan grammar kamu dengan Premium.</p>
              <button 
                onClick={onOpenUpgradeModal}
                className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-full font-bold shadow-lg text-xs"
              >
                Unlock Premium
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- MODEL ANSWER --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-slate-900 rounded-2xl p-6 border border-slate-800 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Band 8.0 Model Answer</h3>
          {isPremiumExternal && <span className="text-xs bg-teal-900 text-teal-300 px-2 py-1 rounded">UNLOCKED</span>}
        </div>

        <div className={`relative ${!isPremiumExternal ? "blur-sm select-none h-32 overflow-hidden" : ""}`}>
          <p className="text-slate-300 italic leading-relaxed whitespace-pre-line">
            "{result.modelAnswer}"
          </p>
        </div>

        {!isPremiumExternal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 z-10">
            <Lock className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="text-white font-bold">Premium Content</h4>
            <button 
              onClick={onOpenUpgradeModal}
              className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full font-bold shadow-lg text-sm transition-all"
            >
              Unlock Answer
            </button>
          </div>
        )}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={shareToWA}
        className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all"
      >
        <Share2 className="w-5 h-5" />
        Challenge Friend via WhatsApp
      </motion.button>
    </div>
  );
}

function ScoreItem({ label, score, delay }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 text-center"
    >
      <div className="text-xs text-slate-500 uppercase mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{score}</div>
    </motion.div>
  );
}