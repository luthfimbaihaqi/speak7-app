"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Clock, Mic, Dices, Star, ShieldCheck, Loader2, Zap, MessageCircle, Copy, Wallet, Ticket, Lock } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function UpgradeModal({ isOpen, onClose, userProfile, onUpgradeSuccess }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // State Manual Token
  const [tokenInput, setTokenInput] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);

  // State Popup Login
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // --- 1. LOAD SCRIPT MIDTRANS ---
  useEffect(() => {
    const snapUrl = "https://app.midtrans.com/snap/snap.js"; 
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

  // --- Helper: Redirect ke Login ---
  const handleLoginRedirect = () => {
     onClose(); 
     router.push("/auth"); 
  };

  // --- 2. PAYMENT LOGIC ---
  const handlePayment = async () => {
    if (!userProfile) {
        setShowLoginAlert(true); // Trigger Popup
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
                setLoading(false);
                alert("Pembayaran Berhasil! Mohon tunggu sebentar, sistem sedang memproses...");
                onClose();
                window.location.reload(); 
            },
            onPending: function(result) {
                setLoading(false);
                alert("Menunggu pembayaran...");
                onClose();
            },
            onError: function(result) {
                setLoading(false);
                console.log(result); 
                alert("Pembayaran gagal/dibatalkan.");
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

  const validateToken = async () => {
    const cleanToken = tokenInput.trim().toUpperCase();
    
    if (!userProfile) {
        setShowLoginAlert(true);
        return;
    }
    if (!cleanToken) {
        alert("Masukkan kode token dulu.");
        return;
    }

    setRedeemLoading(true);
    try {
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
        alert("Terjadi kesalahan. Pastikan token benar atau hubungi admin.");
    } finally {
        setRedeemLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      
      {/* 🔥 FIX MOBILE: POPUP LOGIN DIPINDAH KESINI (OUTSIDE SCROLLABLE AREA) 
          Sekarang posisinya Fixed relative to Screen, bukan relative to Modal Content
      */}
      <AnimatePresence>
        {showLoginAlert && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4" // z-60 agar di atas modal utama
            >
                {/* Backdrop Gelap Khusus Popup Ini */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLoginAlert(false)}></div>

                {/* Box Popup */}
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-slate-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl overflow-hidden"
                >
                    {/* Background Light Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                    {/* Icon Lock */}
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/5 relative z-10 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                        <Lock className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
                    </div>

                    {/* Text */}
                    <h4 className="text-xl font-black text-white mb-2 relative z-10 tracking-tight">Who goes there?</h4>
                    <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed px-2">
                        Let&apos;s sign you in first so you can start practicing immediately.
                    </p>

                    {/* Buttons */}
                    <div className="space-y-3 relative z-10">
                        <button
                            onClick={handleLoginRedirect}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            Sign In Now
                        </button>
                        <button
                            onClick={() => setShowLoginAlert(false)}
                            className="text-slate-500 text-xs font-bold hover:text-white transition-colors py-2 uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>


      {/* --- MAIN MODAL CONTENT (SCROLLABLE) --- */}
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
                    
                    {/* BUTTON MIDTRANS */}
                    <button 
                        onClick={handlePayment} 
                        disabled={loading}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                        Instant Activation (QRIS / VA)
                    </button>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">Manual Transfer</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* BUTTON WHATSAPP */}
                    <button 
                        onClick={confirmViaWA} 
                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                    >
                        <MessageCircle className="w-5 h-5 fill-white text-white" />
                        Chat Admin via WhatsApp
                    </button>

                    {/* BANK INSTRUCTION */}
                    <div className="mt-2 bg-slate-900/60 rounded-xl p-4 border border-white/10 text-left">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1 shrink-0">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div className="space-y-2 w-full">
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Transfer <span className="text-white font-bold">Rp 30.000</span> ke rekening di bawah, lalu kirim bukti via tombol WA di atas:
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

                    {/* REDEEM TOKEN */}
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