"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Rocket, AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export default function AlertModal({ isOpen, onClose, type, title, message, onAction, actionLabel }) {
  if (!isOpen) return null;

  // Tentukan Ikon & Warna berdasarkan Tipe
  let Icon = AlertTriangle;
  let colorClass = "text-yellow-400";
  let bgClass = "bg-yellow-500/10 border-yellow-500/20";
  let btnClass = "bg-yellow-500 hover:bg-yellow-400 text-black";

  if (type === "lock") {
    Icon = Lock;
    colorClass = "text-red-400";
    bgClass = "bg-red-500/10 border-red-500/20";
    btnClass = "bg-red-500 hover:bg-red-400 text-white";
  } else if (type === "success") {
    Icon = Rocket;
    colorClass = "text-teal-400";
    bgClass = "bg-teal-500/10 border-teal-500/20";
    btnClass = "bg-teal-500 hover:bg-teal-400 text-slate-900";
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Tombol Close Pojok Kanan */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
            {/* Icon Circle */}
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${bgClass} border`}>
                <Icon className={`w-10 h-10 ${colorClass}`} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {message}
            </p>

            <button 
                onClick={() => {
                    if (onAction) onAction();
                    onClose();
                }}
                className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-transform active:scale-95 ${btnClass}`}
            >
                {actionLabel || "OK, Got it"}
            </button>
        </div>
      </motion.div>
    </div>
  );
}