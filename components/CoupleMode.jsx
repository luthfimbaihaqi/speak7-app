"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CoupleMode({ onPartnerSet }) {
  const [isOpen, setIsOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [savedPartner, setSavedPartner] = useState(null);

  useEffect(() => {
    // Cek apakah sudah ada nama pasangan tersimpan
    const saved = localStorage.getItem("speak7_partner");
    if (saved) {
      setSavedPartner(saved);
      onPartnerSet(saved);
    }
  }, []);

  const handleSave = () => {
    if (partnerName.trim()) {
      localStorage.setItem("speak7_partner", partnerName);
      setSavedPartner(partnerName);
      onPartnerSet(partnerName);
      setIsOpen(false);
    }
  };

  const handleRemove = () => {
    localStorage.removeItem("speak7_partner");
    setSavedPartner(null);
    onPartnerSet(null);
  };

  return (
    <>
      {/* Tombol Pemicu di Pojok Kanan Atas (Desktop) atau Bawah (Mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700"
      >
        <Users className="w-4 h-4" />
        {savedPartner ? `With: ${savedPartner}` : "Couple Mode"}
      </button>

      {/* Modal Input */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm relative"
            >
              <button 
                onClick={() => setIsOpen(false)} 
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 text-teal-400">
                <UserPlus className="w-6 h-6" />
                <h3 className="text-lg font-bold">Couple Mode</h3>
              </div>

              {savedPartner ? (
                <div className="text-center py-4">
                  <p className="text-slate-400 mb-4">Current Partner:</p>
                  <div className="text-2xl font-bold text-white mb-6">{savedPartner}</div>
                  <button
                    onClick={handleRemove}
                    className="w-full py-2 bg-red-500/10 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/20"
                  >
                    Remove Partner
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-slate-400 text-sm mb-4">
                    Belajar bareng lebih seru. Masukkan nama pasangan/teman belajarmu.
                  </p>
                  <input
                    type="text"
                    placeholder="Nama Pasangan (e.g. Mimi)"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl mb-4 focus:outline-none focus:border-teal-500"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                  />
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl"
                  >
                    Simpan & Mulai
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}