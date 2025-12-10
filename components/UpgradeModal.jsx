"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Crown, Check, Lock, AlertTriangle, MessageCircle, Dices, Target, Mic, Clock, Star } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { BANK_INFO } from "@/utils/constants"; // Pastikan BANK_INFO ada di constants

export default function UpgradeModal({ isOpen, onClose, userProfile, onUpgradeSuccess }) {
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const confirmViaWA = () => {
    const text = `Halo Admin Ielts4our, saya sudah transfer ${BANK_INFO.price} untuk upgrade Premium.`;
    const url = `https://wa.me/${BANK_INFO.waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const validateToken = async () => {
    const cleanToken = tokenInput.trim().toUpperCase();
    
    if (!userProfile) {
        alert("⚠️ Mohon LOGIN atau REGISTER terlebih dahulu untuk mengaktifkan Premium.");
        return;
    }

    setLoading(true);
    try {
        const { data, error } = await supabase.rpc('redeem_token', { 
            code_input: cleanToken 
        });

        if (error) throw error;

        if (data === 'SUCCESS') {
            alert(`🎉 Aktivasi Berhasil! Akun Anda sekarang PREMIUM.`);
            setTokenInput("");
            onUpgradeSuccess(); // Panggil fungsi sukses di parent
            onClose(); // Tutup modal
        } else if (data === 'INVALID_TOKEN') {
            alert("❌ Kode Token Salah/Tidak Ditemukan.");
        } else if (data === 'ALREADY_USED') {
            alert("❌ Kode Token SUDAH PERNAH DIGUNAKAN.");
        } else {
            alert(`Gagal: ${data}`);
        }

    } catch (err) {
        console.error("Token Error:", err);
        alert("Terjadi kesalahan koneksi.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden relative max-h-[85vh] overflow-y-auto">
         <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-2 bg-black/20 rounded-full"><X className="w-5 h-5"/></button>
         
         <div className="bg-gradient-to-br from-amber-500/10 to-purple-600/10 p-6 md:p-8 text-center border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-600"></div>
            <Crown className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h3 className="text-xl md:text-2xl font-bold text-white">Upgrade to Premium</h3>
            <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xs mx-auto">Investasi kecil untuk masa depan dan skor IELTS impianmu.</p>
         </div>

         <div className="p-5 md:p-8 space-y-6 md:space-y-8">
            {/* --- COMPARISON TABLE UPDATED --- */}
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
               <div className="grid grid-cols-3 p-3 md:p-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest text-center bg-black/20">
                  <div className="text-left">Feature</div>
                  <div>Free</div>
                  <div className="text-yellow-400 flex items-center justify-center gap-1"><Crown className="w-3 h-3"/> PRO</div>
               </div>
               <div className="divide-y divide-white/5 text-sm">
                  {/* Row 1: Daily Practice */}
                  <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                    <div className="text-left text-slate-300 text-xs md:text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500 hidden md:block"/> Daily Practice
                    </div>
                    <div className="text-slate-400 text-[10px] md:text-xs bg-slate-800/50 py-1 rounded">2x / Day ⚠️</div>
                    <div className="font-bold text-emerald-400 text-[10px] md:text-xs bg-emerald-500/10 py-1 rounded border border-emerald-500/20">UNLIMITED ♾️</div>
                  </div>

                  {/* Row 2: Difficulty */}
                  <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                    <div className="text-left text-slate-300 text-xs md:text-sm flex items-center gap-2">
                        <Dices className="w-4 h-4 text-slate-500 hidden md:block"/> Difficulty
                    </div>
                    <div className="text-slate-500 text-[10px] md:text-xs">Random 🎲</div>
                    <div className="font-bold text-white text-[10px] md:text-xs">Easy/Med/Hard 🎯</div>
                  </div>

                  {/* Row 3: Mock Interview */}
                  <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                    <div className="text-left text-slate-300 text-xs md:text-sm flex items-center gap-2">
                        <Mic className="w-4 h-4 text-slate-500 hidden md:block"/> Mock Interview
                    </div>
                    <div className="text-slate-500 text-[10px] md:text-xs flex justify-center items-center gap-1"><Lock className="w-3 h-3"/> Trial Only</div>
                    <div className="font-bold text-white text-[10px] md:text-xs flex justify-center items-center gap-1"><Check className="w-3 h-3 text-emerald-400"/> Full Access</div>
                  </div>

                  {/* Row 4: Duration */}
                  <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                    <div className="text-left text-slate-300 text-xs md:text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500 hidden md:block"/> Duration
                    </div>
                    <div className="text-slate-500 text-[10px] md:text-xs">60s</div>
                    <div className="font-bold text-white text-[10px] md:text-xs">120s ⏳</div>
                  </div>

                  {/* Row 5: Model Answer */}
                  <div className="grid grid-cols-3 p-3 items-center text-center hover:bg-white/5 transition-colors">
                    <div className="text-left text-slate-300 text-xs md:text-sm flex items-center gap-2">
                        <Star className="w-4 h-4 text-slate-500 hidden md:block"/> Model Answer
                    </div>
                    <div className="text-slate-500 flex justify-center"><X className="w-3 h-3"/></div>
                    <div className="font-bold text-yellow-400 text-[10px] md:text-xs">Band 8.0+ 🌟</div>
                  </div>
               </div>
            </div>

            <div className="space-y-5">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">1. Transfer via Bank</p>
                <div className="flex flex-col md:flex-row justify-between md:items-center text-white font-mono gap-1">
                  <span className="text-sm md:text-base text-slate-300">{BANK_INFO.bankName}</span>
                  <span className="font-bold text-lg md:text-xl tracking-wider select-all">{BANK_INFO.accountNumber}</span>
                </div>
                <p className="text-[10px] md:text-xs text-slate-500 mt-2 border-t border-white/5 pt-2 flex justify-between">
                   <span>a.n {BANK_INFO.accountName}</span>
                   <span className="text-teal-400 font-bold">{BANK_INFO.price}</span>
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex gap-3 items-start text-left">
                 <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                 <div className="text-xs text-yellow-200/90 leading-relaxed">
                    <span className="font-bold text-yellow-400">PENTING:</span> Kirim bukti bayar via WhatsApp/Email. Pastikan foto menampilkan <span className="font-bold text-yellow-400">Tanggal & Jam</span> transaksi. Admin akan mengirim Token setelah verifikasi.
                 </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <button onClick={confirmViaWA} className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 group">
                   <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform"/> Konfirmasi WA
                </button>
                <a href={`mailto:${BANK_INFO.email}`} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10">
                   Via Email
                </a>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">3. Activate Token</p>
                <div className="flex flex-col md:flex-row gap-2">
                   <input 
                     type="text" 
                     placeholder="PASTE TOKEN HERE..."
                     value={tokenInput}
                     onChange={(e) => setTokenInput(e.target.value)}
                     disabled={loading}
                     className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white/10 text-center uppercase tracking-widest text-sm placeholder:text-slate-600"
                   />
                   <button onClick={validateToken} disabled={loading} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 text-sm whitespace-nowrap disabled:opacity-50">
                     {loading ? "..." : "Aktifkan"}
                   </button>
                </div>
              </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
}