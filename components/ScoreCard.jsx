"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertOctagon, Lock, Star, FileText, ChevronDown, ChevronUp, Share2, ArrowRight, XCircle } from "lucide-react";
import Confetti from "react-confetti";

export default function ScoreCard({ result, cue, isPremiumExternal, onOpenUpgradeModal }) {
  const [showTranscript, setShowTranscript] = useState(false); 

  if (!result) return null;

  const isHighScore = result.overall >= 7.0;

  const shareToWA = () => {
    const text = `🔥 I scored Band ${result.overall} on Ielts4our!\nTopic: "${cue}"\n\nTry it: https://ielts4our.vercel.app`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full mt-12 space-y-8">
      {isHighScore && <Confetti recycle={false} numberOfPieces={600} colors={['#2dd4bf', '#a855f7', '#fbbf24']} />}

      {/* --- SCORE HERO CARD (GLASS) --- */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-purple-500 to-blue-500" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Score Circle */}
            <div className="text-center md:text-left">
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Overall Band Score</h2>
                <div className="flex items-baseline gap-4 justify-center md:justify-start">
                    <span className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-400 tracking-tighter">
                        {result.overall}
                    </span>
                    <div className="flex flex-col gap-1">
                         <div className="flex">
                            {[...Array(Math.floor(result.overall))].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            ))}
                         </div>
                         <span className="text-sm font-bold text-teal-400">{result.overall >= 7 ? "Excellent!" : "Keep Going!"}</span>
                    </div>
                </div>
            </div>

            {/* Right: Sub-scores Grid */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <ScoreItem label="Fluency" score={result.fluency} delay={0.1} />
                <ScoreItem label="Lexical" score={result.lexical} delay={0.2} />
                <ScoreItem label="Grammar" score={result.grammar} delay={0.3} />
                <ScoreItem label="Pronunc." score={result.pronunciation} delay={0.4} />
            </div>
        </div>
      </motion.div>

      {/* --- TRANSCRIPT ACCORDION --- */}
      {result.transcript && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <button 
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3 text-slate-300 font-medium">
              <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400 group-hover:text-teal-300 transition-colors">
                  <FileText className="w-5 h-5" />
              </div>
              View Transcription
            </div>
            {showTranscript ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          <AnimatePresence>
            {showTranscript && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="p-6 pt-0 text-slate-400 leading-relaxed text-sm border-t border-white/5">
                  "{result.transcript}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* --- FEEDBACK SPLIT --- */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-500/5 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/10">
          <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 text-sm uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5" /> Strengths
          </h3>
          <ul className="space-y-3">
            {result.feedback?.map((point, i) => (
              <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"/>
                {point}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-rose-500/5 backdrop-blur-md p-6 rounded-2xl border border-rose-500/10">
          <h3 className="flex items-center gap-2 text-rose-400 font-bold mb-4 text-sm uppercase tracking-wider">
            <AlertOctagon className="w-5 h-5" /> Area to Improve
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {result.improvement}
          </p>
        </div>
      </div>

      {/* --- GRAMMAR CLINIC (TEASER) --- */}
      {result.grammarCorrection && result.grammarCorrection.length > 0 && (
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="text-lg">🛠️</span> Grammar Clinic
            </h3>
            {!isPremiumExternal && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-white/10">PREVIEW MODE</span>}
          </div>
          
          <div className="divide-y divide-white/5">
            {/* ITEM 1 (FREE) */}
            <div className="p-5 hover:bg-white/5 transition-colors">
              <div className="flex flex-col md:flex-row gap-4 md:items-center text-sm mb-2">
                <div className="text-rose-400 line-through decoration-rose-500/50 md:w-1/2 opacity-80 flex gap-2">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5"/> "{result.grammarCorrection[0].original}"
                </div>
                <div className="hidden md:block text-slate-600"><ArrowRight className="w-4 h-4"/></div>
                <div className="text-emerald-400 font-bold md:w-1/2 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5"/> "{result.grammarCorrection[0].correction}"
                </div>
              </div>
              <p className="text-xs text-slate-500 pl-6 border-l-2 border-slate-700 ml-1">💡 {result.grammarCorrection[0].reason}</p>
            </div>

            {/* LOCKED ITEMS */}
            {result.grammarCorrection.slice(1).map((item, i) => (
              <div key={i} className={`p-5 relative ${!isPremiumExternal ? "blur-[6px] select-none opacity-50" : "hover:bg-white/5"}`}>
                <div className="flex flex-col md:flex-row gap-4 md:items-center text-sm mb-2">
                  <div className="text-rose-400 line-through md:w-1/2">"{item.original}"</div>
                  <div className="hidden md:block text-slate-600"><ArrowRight className="w-4 h-4"/></div>
                  <div className="text-emerald-400 font-bold md:w-1/2">"{item.correction}"</div>
                </div>
                <p className="text-xs text-slate-500">💡 {item.reason}</p>
              </div>
            ))}
          </div>

          {/* OVERLAY */}
          {!isPremiumExternal && result.grammarCorrection.length > 1 && (
            <div className="absolute top-[120px] left-0 w-full h-full flex flex-col items-center pt-8 z-10 bg-gradient-to-b from-transparent to-slate-950/90">
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-white/10 shadow-2xl text-center transform hover:scale-105 transition-transform duration-300">
                <Lock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-white font-bold text-sm mb-1">Unlock {result.grammarCorrection.length - 1} More Corrections</p>
                <button 
                  onClick={onOpenUpgradeModal}
                  className="mt-2 px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold rounded-full text-xs shadow-lg"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODEL ANSWER --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-indigo-900/10 backdrop-blur-md rounded-2xl p-6 border border-indigo-500/20 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-bold text-indigo-300 flex items-center gap-2">
            <Star className="w-4 h-4 fill-indigo-300"/> Band 8.0 Model Answer
          </h3>
          {isPremiumExternal && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">UNLOCKED</span>}
        </div>

        <div className={`relative ${!isPremiumExternal ? "blur-md select-none h-32 overflow-hidden opacity-60" : ""}`}>
          <p className="text-slate-200 italic leading-relaxed whitespace-pre-line text-sm md:text-base">
            "{result.modelAnswer}"
          </p>
        </div>

        {!isPremiumExternal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <button 
              onClick={onOpenUpgradeModal}
              className="px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold shadow-xl text-sm flex items-center gap-2 transform hover:scale-105 transition-all"
            >
              <Lock className="w-4 h-4 text-indigo-600" />
              Unlock Model Answer
            </button>
          </div>
        )}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
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
      className="bg-white/5 p-4 rounded-xl border border-white/10 text-center flex flex-col items-center justify-center h-full"
    >
      <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{score}</div>
    </motion.div>
  );
}