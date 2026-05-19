"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertOctagon, Star, FileText, ChevronDown, ChevronUp, Share2, ArrowRight, XCircle, PlayCircle, ListMusic, Quote, Edit3 } from "lucide-react";
import Confetti from "react-confetti";

export default function ScoreCard({ result, cue, onOpenTestimonial, isLoggedIn }) {
  const [showTranscript, setShowTranscript] = useState(false); 

  const audioUrl = result?.audioUrl;
  const audioPlaylist = result?.audioPlaylist;

  if (!result) return null;

  const isHighScore = result.overall >= 7.0;

  const shareToWA = () => {
    const text = `I scored Band ${result.overall} on Ielts4our!\nTopic: "${cue}"\n\nTry it: https://ielts4our.net`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full mt-12 space-y-8">
      {isHighScore && <Confetti recycle={false} numberOfPieces={600} colors={['#D17A5C', '#8FA68E', '#C9974C', '#4A6B8F']} />}

      {/* SCORE HERO CARD */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-[#FAF6EC] rounded-[2rem] p-8 border border-[#1A1A1A]/10 shadow-sm overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D17A5C]/40 to-transparent" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Score */}
            <div className="text-center md:text-left">
                <h2 className="text-[#525252] text-xs font-bold uppercase tracking-widest mb-2">Overall Band Score</h2>
                <div className="flex items-baseline gap-4 justify-center md:justify-start">
                    <span className="text-7xl md:text-8xl font-black text-[#1A1A1A] tracking-tighter font-display">
                        {result.overall}
                    </span>
                    <div className="flex flex-col gap-1">
                          <div className="flex">
                            {[...Array(Math.floor(result.overall))].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-[#C9974C] fill-[#C9974C]" />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-[#8FA68E]">{result.overall >= 7 ? "Excellent!" : "Keep Going!"}</span>
                    </div>
                </div>
            </div>

            {/* Right: Sub-scores */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <ScoreItem label="Fluency" score={result.fluency} delay={0.1} />
                <ScoreItem label="Lexical" score={result.lexical} delay={0.2} />
                <ScoreItem label="Grammar" score={result.grammar} delay={0.3} />
                <ScoreItem label="Pronunc." score={result.pronunciation} delay={0.4} />
            </div>
        </div>
      </motion.div>

      {/* AUDIO SECTION */}
      {audioPlaylist && audioPlaylist.length > 0 ? (
        <div className="bg-[#FAF6EC] rounded-2xl border border-[#1A1A1A]/10 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#1A1A1A]/10">
                <ListMusic className="w-4 h-4 text-[#4A6B8F]" />
                <span className="text-xs text-[#525252] uppercase font-bold tracking-wider">Interview Recordings</span>
            </div>
            {audioPlaylist.map((url, index) => (
                <div key={index} className="flex items-center gap-3 bg-[#F8F5EE] p-2 rounded-xl border border-[#1A1A1A]/10">
                    <div className="w-8 h-8 rounded-full bg-[#8FA68E]/10 flex items-center justify-center text-[#8FA68E] text-xs font-bold border border-[#8FA68E]/20 shrink-0">
                        Q{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                        <audio controls src={url} className="w-full h-6 opacity-90" />
                    </div>
                </div>
            ))}
        </div>
      ) : audioUrl ? (
        <div className="bg-[#FAF6EC] rounded-2xl border border-[#1A1A1A]/10 p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-[#8FA68E]/10 rounded-full text-[#8FA68E]">
                <PlayCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <p className="text-xs text-[#525252] uppercase font-bold tracking-wider mb-1">Your Recording</p>
                <audio controls src={audioUrl} className="w-full h-8 opacity-80" />
            </div>
        </div>
      ) : null}

      {/* TRANSCRIPT ACCORDION */}
      {result.transcript && (
        <div className="bg-[#FAF6EC] rounded-2xl border border-[#1A1A1A]/10 overflow-hidden shadow-sm">
          <button 
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-5 hover:bg-[#F8F5EE] transition-colors group"
          >
            <div className="flex items-center gap-3 text-[#1A1A1A] font-medium">
              <div className="p-2 bg-[#8FA68E]/10 rounded-lg text-[#8FA68E] group-hover:text-[#6B8A6A] transition-colors">
                  <FileText className="w-5 h-5" />
              </div>
              View Full Interview Transcript
            </div>
            {showTranscript ? <ChevronUp className="w-5 h-5 text-[#525252]" /> : <ChevronDown className="w-5 h-5 text-[#525252]" />}
          </button>
          <AnimatePresence>
            {showTranscript && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="p-6 pt-0 text-[#525252] leading-relaxed text-sm border-t border-[#1A1A1A]/10 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono">
                  {result.transcript}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* FEEDBACK SPLIT */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#FAF6EC] border border-[#1A1A1A]/10 border-l-4 border-l-[#8FA68E] p-6 rounded-2xl shadow-sm">
          <h3 className="text-[#8FA68E] font-bold mb-4 text-sm uppercase tracking-wider">
            Strengths
          </h3>
          <ul className="space-y-3">
            {result.feedback?.map((point, i) => (
              <li key={i} className="flex gap-3 text-[#1A1A1A] text-sm leading-relaxed">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#525252] shrink-0"/>
                {point}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-[#FAF6EC] border border-[#1A1A1A]/10 border-l-4 border-l-[#D17A5C] p-6 rounded-2xl shadow-sm">
          <h3 className="text-[#D17A5C] font-bold mb-4 text-sm uppercase tracking-wider">
            Area to Improve
          </h3>
          <p className="text-[#1A1A1A] text-sm leading-relaxed">
            {result.improvement}
          </p>
        </div>
      </div>

      {/* GRAMMAR CLINIC */}
      {result.grammarCorrection && result.grammarCorrection.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 pb-1">
            <h3 className="font-bold text-[#1A1A1A] flex items-center gap-2 text-sm uppercase tracking-wider">
              <Edit3 className="w-4 h-4 text-[#525252]" /> Grammar Clinic
            </h3>
            <span className="text-xs text-[#525252] font-mono tabular-nums">
              {result.grammarCorrection.length} {result.grammarCorrection.length === 1 ? "fix" : "fixes"}
            </span>
          </div>

          <div className="space-y-3">
            {result.grammarCorrection.map((item, i) => (
              <div key={i} className="bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-xl overflow-hidden shadow-sm">
                {/* Before */}
                <div className="px-5 py-4 bg-[#D17A5C]/5 border-l-2 border-[#D17A5C]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#D17A5C] mb-1.5">Before</p>
                  <p className="text-sm text-[#525252] leading-relaxed">"{item.original}"</p>
                </div>

                {/* After */}
                <div className="px-5 py-4 bg-[#8FA68E]/5 border-l-2 border-[#8FA68E]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8FA68E] mb-1.5">After</p>
                  <p className="text-sm text-[#1A1A1A] leading-relaxed font-medium">"{item.correction}"</p>
                </div>

                {/* Reason */}
                <div className="px-5 py-3 border-t border-[#1A1A1A]/10 bg-[#F8F5EE]">
                  <p className="text-xs text-[#525252] leading-relaxed">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODEL ANSWER */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#4A6B8F]/5 rounded-2xl p-6 border border-[#4A6B8F]/20 relative overflow-hidden shadow-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-bold text-[#4A6B8F] flex items-center gap-2">
            <Star className="w-4 h-4 fill-[#4A6B8F]"/> Band 8.0 Part 2 Model Answer
          </h3>
        </div>

        <div className="relative">
          <p className="text-[#1A1A1A] italic leading-relaxed whitespace-pre-line text-sm md:text-base">
            "{result.modelAnswer}"
          </p>
        </div>
      </motion.div>

      {/* ACTION BUTTONS */}
      <div className="pt-4 flex flex-col gap-4">
        
        {/* Testimonial CTA */}
        {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-[#FAF6EC] border border-[#4A6B8F]/20 p-6 rounded-2xl text-center space-y-4 shadow-sm"
            >
              <div>
                <h4 className="text-[#1A1A1A] font-bold text-lg mb-1 font-display">Inspire Other Learners</h4>
                <p className="text-[#525252] text-sm">Help the community by sharing your IELTS journey and goals.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenTestimonial}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg w-full md:w-auto"
              >
                <motion.div
                    variants={{
                        hover: { rotate: 180, x: -2 },
                        idle: { rotate: 0, x: 0 }
                    }}
                    initial="idle"
                    whileHover="hover"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-white/80 transition-colors group-hover:text-white"
                >
                    <Quote className="w-5 h-5" />
                </motion.div>
                <span>Share Your Experience</span>
              </motion.button>
            </motion.div>
        )}

        {/* WhatsApp Share */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={shareToWA}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold shadow-lg transition-all"
        >
          <Share2 className="w-5 h-5" />
          Challenge Friend via WhatsApp
        </motion.button>
        
      </div>

    </div>
  );
}

function ScoreItem({ label, score, delay }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-[#F8F5EE] p-4 rounded-xl border border-[#1A1A1A]/10 text-center flex flex-col items-center justify-center h-full"
    >
      <div className="text-[10px] text-[#525252] uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-bold text-[#1A1A1A]">{score}</div>
    </motion.div>
  );
}