"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Quote, CheckCircle2 } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

export default function TestimonialModal({ isOpen, onClose, userProfile }) {
  const [target, setTarget] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState("idle"); 

  useEffect(() => {
    if (isOpen) {
      setTarget("");
      setExperience("");
      setStatus("idle");
    }
  }, [isOpen]);

  const userName = userProfile?.user_metadata?.full_name || userProfile?.email?.split('@')[0] || "IELTS Achiever";
  const avatarUrl = userProfile?.user_metadata?.avatar_url;

  const isFormValid = target.trim().length > 3 && experience.trim().length > 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setStatus("submitting");

    try {
      const userId = userProfile?.id; 
      
      if (!userId) {
        console.error("User ID tidak ditemukan. Pastikan user sudah login.");
        alert("Sesi login tidak valid. Silakan login ulang.");
        setStatus("idle");
        return;
      }

      const { error } = await supabase
        .from('testimonials')
        .insert([
          {
            user_id: userId,
            user_name: userName,
            avatar_url: avatarUrl,
            target: target.trim(),
            experience: experience.trim(),
          }
        ]);

      if (error) throw error;

      setStatus("success");
      
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      alert(`Terjadi kesalahan: ${error.message || "Gagal mengirim data"}`);
      setStatus("idle");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-xl bg-[#1A1D26] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-[#1A1D26] z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Inspire Others</h2>
                <p className="text-xs text-slate-400 mt-1">Share your story to the Wall of Achievers</p>
              </div>
              <button
                onClick={onClose}
                disabled={status === "submitting"}
                className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {status === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-slate-400 max-w-sm">
                    Your story has been submitted and is waiting for review. It will appear on the homepage soon!
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Live Preview
                    </p>
                    
                    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-blue-500/20 rounded-2xl p-5 md:p-6 relative">
                      <Quote className="absolute top-4 right-4 w-12 h-12 text-blue-500/10 rotate-180" />
                      
                      <div className="flex items-center gap-4 mb-4">
                        {avatarUrl ? (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700">
                            <Image src={avatarUrl} alt={userName} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-slate-700">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-white font-bold">{userName}</h4>
                          <p className="text-blue-400 text-xs font-medium">
                            {target.trim() ? target : "Your Target University / Goal"}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-slate-300 text-sm leading-relaxed italic">
                        "{experience.trim() ? experience : "Share how this platform helps you achieve your goals. Be honest and inspire others!"}"
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-sm font-bold text-slate-300">Dream Destination</label>
                        <span className={`text-[10px] ${target.length >= 50 ? 'text-red-400' : 'text-slate-500'}`}>
                          {target.length}/50
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={50}
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="e.g., The University of Queensland via AAS"
                        className="w-full bg-[#0F1117] border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-sm font-bold text-slate-300">Your Experience</label>
                        <span className={`text-[10px] ${experience.length >= 300 ? 'text-red-400' : 'text-slate-500'}`}>
                          {experience.length}/300
                        </span>
                      </div>
                      <textarea
                        maxLength={300}
                        rows={4}
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="What do you love most about ielts4our? How has the AI Examiner helped your speaking score?"
                        className="w-full bg-[#0F1117] border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm resize-none"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={!isFormValid || status === "submitting"}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:shadow-none"
                      >
                        {status === "submitting" ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Submitting...
                          </span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Submit Story
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}