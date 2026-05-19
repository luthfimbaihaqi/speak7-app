"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Loader2, Zap, MessageCircle, Copy, Wallet, Ticket, Lock, Check } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

const PACKAGES = [
    { id: 'STARTER', tokens: 10, price: 20000, label: "Starter", best: false },
    { id: 'POPULAR', tokens: 25, price: 30000, label: "Popular", best: true },
    { id: 'PRO',     tokens: 50, price: 50000, label: "Pro Value", best: false }
];

export default function UpgradeModal({ isOpen, onClose, userProfile, onUpgradeSuccess }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState('POPULAR');
  const [tokenInput, setTokenInput] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  useEffect(() => {
    const snapUrl = "https://app.midtrans.com/snap/snap.js"; 
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  if (!isOpen) return null;

  const selectedPackage = PACKAGES.find(p => p.id === selectedPkgId) || PACKAGES[1];
  const handleLoginRedirect = () => { onClose(); router.push("/auth"); };

  const handlePayment = async () => {
    if (!userProfile) { setShowLoginAlert(true); return; }
    setLoading(true);
    try {
        const response = await fetch("/api/midtrans/tokenizer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userProfile.id,
                email: userProfile.email,
                fullName: userProfile.email.split('@')[0],
                packageId: selectedPkgId
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        window.snap.pay(data.token, {
            onSuccess: function(result) {
                setLoading(false);
                alert("Pembayaran Berhasil! Sistem sedang memproses token Anda...");
                onClose();
                window.location.reload(); 
            },
            onPending: function(result) { setLoading(false); onClose(); },
            onError: function(result) { setLoading(false); alert("Pembayaran gagal/dibatalkan."); },
            onClose: function() { setLoading(false); }
        });
    } catch (error) {
        console.error("Payment Error:", error);
        alert("Gagal memuat pembayaran: " + error.message);
        setLoading(false);
    }
  };

  const confirmViaWA = () => {
    const text = `Halo Admin IELTS4our, saya mau beli paket ${selectedPackage.label} (${selectedPackage.tokens} Token) seharga Rp ${selectedPackage.price.toLocaleString('id-ID')}. Mohon info rekening.`;
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
    if (!userProfile) { setShowLoginAlert(true); return; }
    if (!cleanToken) { alert("Masukkan kode token dulu."); return; }
    setRedeemLoading(true);
    try {
        const { data, error } = await supabase.rpc('redeem_token', { code_input: cleanToken });
        if (error) throw error;
        if (data === 'SUCCESS') {
            alert("Redeem Berhasil! Token telah ditambahkan.");
            setTokenInput("");
            onUpgradeSuccess(); 
            onClose(); 
        } else {
            alert(`Gagal: ${data}`);
        }
    } catch (err) {
        console.error("Token Error:", err);
        alert("Terjadi kesalahan redeem.");
    } finally {
        setRedeemLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      
      {/* LOGIN ALERT */}
      <AnimatePresence>
        {showLoginAlert && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
                <div className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm" onClick={() => setShowLoginAlert(false)}></div>
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-[#FAF6EC] border border-[#1A1A1A]/10 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl overflow-hidden"
                >
                    <div className="w-16 h-16 bg-[#C9974C]/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#C9974C]/20 relative z-10">
                        <Lock className="w-8 h-8 text-[#C9974C]" />
                    </div>
                    <h4 className="text-xl font-black text-[#1A1A1A] mb-2 relative z-10 font-display">Who goes there?</h4>
                    <p className="text-[#525252] text-sm mb-6 relative z-10">Sign in to top up your tokens.</p>
                    <div className="space-y-3 relative z-10">
                        <button onClick={handleLoginRedirect} className="w-full py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-lg">Sign In Now</button>
                        <button onClick={() => setShowLoginAlert(false)} className="text-[#525252] text-xs font-bold hover:text-[#1A1A1A] transition-colors py-2 uppercase tracking-wider">Cancel</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN MODAL */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FAF6EC] border border-[#1A1A1A]/10 w-full max-w-lg rounded-3xl overflow-hidden relative max-h-[90vh] overflow-y-auto shadow-2xl">
         
         <button onClick={onClose} className="absolute top-4 right-4 text-[#525252] hover:text-[#1A1A1A] z-10 p-2 bg-[#1A1A1A]/5 rounded-full"><X className="w-5 h-5"/></button>
         
         {/* Header */}
         <div className="bg-[#F8F5EE] p-8 text-center border-b border-[#1A1A1A]/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#1A1A1A]"></div>
            <Wallet className="w-12 h-12 text-[#4A6B8F] mx-auto mb-4" />
            <h3 className="text-2xl font-black text-[#1A1A1A] font-display">Top Up Tokens</h3>
            <p className="text-[#525252] text-sm mt-2 max-w-xs mx-auto">
                Pay as you go. No subscription needed.
            </p>
         </div>

         <div className="p-6 md:p-8 space-y-6">
            
            {/* PRICING GRID */}
            <div className="grid grid-cols-3 gap-3">
                {PACKAGES.map((pkg) => (
                    <div 
                        key={pkg.id}
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`relative cursor-pointer rounded-xl border-2 transition-all p-3 flex flex-col items-center justify-between h-32 ${
                            selectedPkgId === pkg.id 
                            ? "border-[#1A1A1A] bg-[#1A1A1A]/5 shadow-md" 
                            : "border-[#1A1A1A]/10 bg-[#F8F5EE] hover:bg-[#1A1A1A]/5"
                        }`}
                    >
                        {pkg.best && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#C9974C] text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-lg">
                                Best Value
                            </div>
                        )}
                        <div className="mt-2 text-center">
                            <span className="text-2xl font-black text-[#1A1A1A]">{pkg.tokens}</span>
                            <span className="text-[10px] text-[#525252] block uppercase font-bold">Tokens</span>
                        </div>
                        <div className="w-full text-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${selectedPkgId === pkg.id ? 'bg-[#1A1A1A] text-white' : 'bg-[#1A1A1A]/10 text-[#525252]'}`}>
                                {pkg.price / 1000}k
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* TOTAL & CTA */}
            <div className="bg-[#F8F5EE] rounded-2xl p-6 border border-[#1A1A1A]/10 text-center space-y-4">
                <div className="flex justify-between items-center px-2">
                    <span className="text-[#525252] text-sm">Selected Package:</span>
                    <span className="text-[#1A1A1A] font-bold">{selectedPackage.label} ({selectedPackage.tokens} Tokens)</span>
                </div>
                <div className="flex justify-between items-center px-2 border-b border-[#1A1A1A]/10 pb-4">
                    <span className="text-[#525252] text-sm">Total Price:</span>
                    <span className="text-2xl font-black text-[#1A1A1A] font-display">Rp {selectedPackage.price.toLocaleString('id-ID')}</span>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                    {/* MIDTRANS */}
                    <button 
                        onClick={handlePayment} 
                        disabled={loading}
                        className="w-full py-3.5 bg-[#1A1A1A] hover:bg-black text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                        Pay Now (QRIS / VA)
                    </button>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-[#1A1A1A]/10"></div>
                        <span className="flex-shrink-0 mx-2 text-[#525252] text-[10px] uppercase font-bold tracking-widest">Or Manual</span>
                        <div className="flex-grow border-t border-[#1A1A1A]/10"></div>
                    </div>

                    {/* WHATSAPP */}
                    <button 
                        onClick={confirmViaWA} 
                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5 fill-white text-white" />
                        Chat Admin via WhatsApp
                    </button>

                    {/* BANK INFO */}
                    <div 
                        onClick={handleCopyRekening}
                        className="mt-2 bg-[#F8F5EE] hover:bg-[#1A1A1A]/5 p-3 rounded-xl border border-[#1A1A1A]/10 flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98]"
                    >
                        <div className="text-left pl-1">
                            <p className="text-[10px] text-[#525252] font-bold uppercase tracking-widest mb-0.5">BCA • LUTHFI</p>
                            <p className="text-sm font-mono font-bold text-[#1A1A1A] tracking-widest">3010166291</p>
                        </div>
                        <div className="pr-1">
                             <Copy className={`w-4 h-4 ${copied ? 'text-[#8FA68E]' : 'text-[#525252] group-hover:text-[#1A1A1A]'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* REDEEM TOKEN */}
            <div className="pt-2">
                <p className="text-[10px] text-[#525252] uppercase font-bold tracking-widest mb-2 flex items-center justify-center gap-1">
                    <Ticket className="w-3 h-3" /> Have a Promo Code?
                </p>
                <div className="flex gap-2">
                    <input 
                        type="text" placeholder="PASTE CODE HERE" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)}
                        className="flex-1 bg-[#F8F5EE] border border-[#1A1A1A]/15 text-[#1A1A1A] px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#4A6B8F] uppercase text-center tracking-widest placeholder:text-[#525252]/40"
                    />
                    <button onClick={validateToken} disabled={redeemLoading} className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold rounded-lg transition-all">
                        {redeemLoading ? "..." : "Redeem"}
                    </button>
                </div>
            </div>

            <p className="text-[10px] text-[#525252] flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Secure Payment via Midtrans
            </p>
         </div>
      </motion.div>
    </div>
  );
}