"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Crown, Clock, Mic, Dices, Star, ShieldCheck, Loader2, Zap, MessageCircle, Copy, Wallet, Ticket } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

export default function UpgradeModal({ isOpen, onClose, userProfile, onUpgradeSuccess }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // State untuk Manual Token
  const [tokenInput, setTokenInput] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);

  // --- 1. LOAD SCRIPT MIDTRANS SNAP ---
  useEffect(() => {
    const snapUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!isOpen) return null;

  // --- 2. OPS 1: ONLINE PAYMENT (MIDTRANS) ---
  const handlePayment = async () => {
    if (!userProfile) {
        alert("Please login first!");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/midtrans/tokenizer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userProfile.id,
                email: userProfile.email,
                fullName: userProfile.email.split('@')[0], 
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        window.snap.pay(data.token, {
            onSuccess: function(result) {
                alert("Pembayaran Berhasil! Mohon tunggu sebentar, sistem sedang memproses...");
                onClose();
                window.location.reload(); 
            },
            onPending: function(result) {
                alert("Menunggu pembayaran...");
                onClose();
            },
            onError: function(result) {
                alert("Pembayaran gagal!");
            },
            onClose: function() {
                setLoading(false);
            }
        });

    } catch (error) {
        console.error("Payment Error:", error);
        alert("Gagal memuat pembayaran: " + error.message);
        setLoading(false);
    }
  };

  // --- 3. OPS 2: MANUAL WHATSAPP ---
  const confirmViaWA = () => {
    const text = `Halo Admin IELTS4our, saya sudah transfer Rp 30.000 ke BCA Luthfi untuk upgrade Premium. Mohon diproses.`;
    const waNumber = "6281311364731"; 
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyRekening = () => {
      navigator.clipboard.writeText("3010166291");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // --- 4. OPS 3: REDEEM TOKEN (LOGIKA LAMA DIKEMBALIKAN) ---
  const validateToken = async () => {
    const cleanToken = tokenInput.trim().toUpperCase();
    
    if (!userProfile) {
        alert("Please login first!");
        return;
    }
    if (!cleanToken) {
        alert("Masukkan kode token dulu.");
        return;
    }

    setRedeemLoading(true);
    try {
        // Memanggil RPC 'redeem_token' di Supabase
        const { data, error } = await supabase.rpc('redeem_token', { 
            code_input: cleanToken 
        });

        if (error) throw error;

        if (data === 'SUCCESS') {
            alert(`🎉 Aktivasi Berhasil! Akun Anda sekarang PREMIUM.`);
            setTokenInput("");
            onUpgradeSuccess(); 
            onClose(); 
        } else if (data === 'INVALID_TOKEN') {
            alert("❌ Kode Token Salah/Tidak Ditemukan.");
        } else if (data === 'ALREADY_USED') {
            alert("❌ Kode Token SUDAH PERNAH DIGUNAKAN.");
        } else {
            alert(`Gagal: ${data}`);
        }

    } catch (err) {
        console.error("Token Error:", err);
        alert("Terjadi kesalahan koneksi atau Token salah.");
    } finally {
        setRedeemLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
         <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-2 bg-black/20 rounded-full"><X className="w-5 h-5"/></button>
         
         <div className="bg-gradient-to-br from-amber-500/10 to-purple-600/10 p-8 text-center border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-600"></div>
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce" />
            <h3 className="text-2xl font-black text-white">Upgrade to Premium</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                Unlock your full potential and achieve Band 8.0 with unlimited access.
            </p>
         </div>

         <div className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
               <FeatureRow icon={<Clock className="text-teal-400"/>} title="Unlimited Practice" desc="No daily limits. Practice 24/7." />
               <FeatureRow icon={<Dices className="text-purple-400"/>} title="Select Difficulty" desc="Choose Easy, Medium, or Hard modes." />
               <FeatureRow icon={<Mic className="text-blue-400"/>} title="Mock Interview" desc="Full Part 1, 2, & 3 simulations." />
               <FeatureRow icon={<Star className="text-yellow-400"/>} title="Band 8.0 Model Answers" desc="See how experts answer every question." />
            </div>

            <div className="bg-gradient-to-b from-white/5 to-transparent rounded-2xl p-6 border border-white/10 text-center space-y-6">
                <div>
                    <span className="text-slate-400 text-sm line-through decoration-red-500 decoration-2 mr-2">Rp 99.000</span>
                    <span className="text-3xl font-black text-white">Rp 30.000</span>
                    <span className="text-slate-400 text-xs block mt-1 font-bold uppercase tracking-wider">/ 30 Days Access</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    
                    {/* OPTION 1: MIDTRANS (COMING SOON) */}
                    <div className="relative group">
                        <button 
                            disabled={true} 
                            className="w-full py-3.5 bg-white/5 border border-white/10 text-slate-500 font-bold text-sm rounded-xl cursor-not-allowed flex items-center justify-center gap-2 grayscale opacity-60"
                        >
                            <Zap className="w-4 h-4 fill-slate-500" />
                            Instant Activation (QRIS / VA)
                        </button>
                        <div className="absolute -top-2 right-4 bg-yellow-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded shadow-lg border border-yellow-400">
                            COMING SOON
                        </div>
                    </div>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">Manual Transfer</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* OPTION 2: WHATSAPP */}
                    <button 
                        onClick={confirmViaWA} 
                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                    >
                        <MessageCircle className="w-5 h-5 fill-white text-white" />
                        Chat Admin via WhatsApp
                    </button>

                    {/* BANK INSTRUCTION BOX */}
                    <div className="mt-2 bg-slate-900/60 rounded-xl p-4 border border-white/10 text-left">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1 shrink-0">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div className="space-y-2 w-full">
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Transfer <span className="text-white font-bold">Rp 30.000</span> ke rekening di bawah, lalu kirim bukti bayar yang menunjukkan jam dan tanggal transaksinya via tombol WA di atas dan tunggu TOKEN untuk aktivasi dari admin:
                                </p>
                                
                                <div 
                                    onClick={handleCopyRekening}
                                    className="bg-black/40 hover:bg-black/60 p-3 rounded-lg border border-white/10 flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98]"
                                >
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">BCA • LUTHFI</p>
                                        <p className="text-sm font-mono font-bold text-white tracking-widest">3010166291</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className={`text-[10px] ${copied ? 'text-green-400' : 'text-slate-500 group-hover:text-white'} transition-colors`}>
                                            {copied ? "Copied!" : "Copy"}
                                        </span>
                                        <Copy className={`w-3.5 h-3.5 ${copied ? 'text-green-400' : 'text-slate-500 group-hover:text-white'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🔥 OPS 3: REDEEM TOKEN (RESTORED!) */}
                    <div className="pt-4 border-t border-white/10">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center justify-center gap-1">
                            <Ticket className="w-3 h-3" /> Have a Token?
                        </p>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Paste Token Here..."
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-teal-500 uppercase text-center tracking-widest placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal"
                            />
                            <button 
                                onClick={validateToken} 
                                disabled={redeemLoading}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-white/10 transition-all whitespace-nowrap"
                            >
                                {redeemLoading ? "..." : "Redeem"}
                            </button>
                        </div>
                    </div>

                </div>
                
                <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure Payment Gateway
                </p>
            </div>
         </div>
      </motion.div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }) {
    return (
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="p-3 bg-black/20 rounded-full">{React.cloneElement(icon, { className: `w-5 h-5 ${icon.props.className}` })}</div>
            <div className="text-left">
                <h4 className="text-white font-bold text-sm">{title}</h4>
                <p className="text-slate-400 text-xs">{desc}</p>
            </div>
        </div>
    )
}