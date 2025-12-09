"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  // STATE MODE: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState("login"); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // STATE UI KHUSUS
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [resetEmailSent, setResetEmailSent] = useState(false); 
  const [errorMsg, setErrorMsg] = useState(""); 

  const router = useRouter();

  // --- PASSWORD VALIDATION STATE ---
  const [validations, setValidations] = useState({
    minLength: false,
    hasNumber: false,
    hasSymbol: false
  });

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setValidations({
        minLength: val.length >= 8,
        hasNumber: /\d/.test(val),
        hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(val)
    });
  };

  const isPasswordValid = validations.minLength && validations.hasNumber && validations.hasSymbol;

  // --- 1. HANDLE LOGIN & REGISTER ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (mode === "register" && !isPasswordValid) return;

    setLoading(true);

    try {
      let result;
      if (mode === "register") {
        result = await supabase.auth.signUp({ email, password });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) throw result.error;

      setShowSuccessModal(true);
      
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE FORGOT PASSWORD (HARDCODED VERSION) ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // -----------------------------------------------------------
      // LOGIKA "PRIMITIF" ANTI-GAGAL
      // Kita tidak mengandalkan deteksi otomatis yang sering salah.
      // Kita tembak langsung alamat Production yang sudah di-whitelist.
      // -----------------------------------------------------------
      
      const hardcodedUrl = "https://www.ielts4our.net/auth/callback?next=/update-password";

      console.log("🔥 MEMAKSA Redirect ke:", hardcodedUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: hardcodedUrl,
      });

      if (error) throw error;

      setResetEmailSent(true); 
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    router.push("/");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg("");
    setResetEmailSent(false);
    setPassword("");
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(45,212,191,0.15)_0px,transparent_50%)]"></div>
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(at_100%_100%,rgba(168,85,247,0.15)_0px,transparent_50%)]"></div>
      </div>

      {/* --- FORM CONTAINER --- */}
      {!showSuccessModal && (
        <div className="relative z-10 w-full max-w-md">
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode} 
                    initial={{ opacity: 0, x: mode === "register" ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === "register" ? -50 : 50 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4"/> Back to Home
                    </Link>

                    {/* DYNAMIC TITLE */}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {mode === "register" && "Create Account"}
                        {mode === "login" && "Welcome Back"}
                        {mode === "forgot" && "Reset Password"}
                    </h1>
                    <p className="text-slate-400 mb-6 text-sm">
                        {mode === "register" && "Join the elite Band 8.0 club."}
                        {mode === "login" && "Login to resume your training."}
                        {mode === "forgot" && "Don't panic. We'll send you a recovery link."}
                    </p>

                    {/* ERROR MESSAGE ALERT */}
                    {errorMsg && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
                        </div>
                    )}

                    {/* KHUSUS MODE FORGOT PASSWORD: JIKA SUKSES KIRIM EMAIL */}
                    {mode === "forgot" && resetEmailSent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-white font-bold text-xl mb-2">Check Your Email</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                We have sent a password recovery link to <strong>{email}</strong>.
                            </p>
                            <button onClick={() => switchMode("login")} className="text-teal-400 font-bold hover:underline text-sm">
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        /* --- FORM AREA --- */
                        <form onSubmit={mode === "forgot" ? handleResetPassword : handleAuth} className="space-y-4">
                            
                            {/* EMAIL INPUT */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors"/>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 transition-all"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* PASSWORD INPUT */}
                            {mode !== "forgot" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors"/>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className={`w-full bg-black/20 border rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none transition-all ${mode === "register" && !isPasswordValid && password.length > 0 ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-teal-500'}`}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* FORGOT PASSWORD LINK */}
                            {mode === "login" && (
                                <div className="flex justify-end">
                                    <button 
                                        type="button"
                                        onClick={() => switchMode("forgot")}
                                        className="text-xs text-slate-400 hover:text-white transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            {/* LIVE CHECKLIST */}
                            {mode === "register" && (
                                <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2 mt-2">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Password Requirements:</p>
                                    <RequirementItem isValid={validations.minLength} text="Min. 8 characters" />
                                    <RequirementItem isValid={validations.hasNumber} text="Contains a number (0-9)" />
                                    <RequirementItem isValid={validations.hasSymbol} text="Contains a symbol (!@#$%)" />
                                </div>
                            )}

                            {/* SUBMIT BUTTON */}
                            <button 
                                disabled={loading || (mode === "register" && !isPasswordValid)}
                                className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 
                                    ${loading || (mode === "register" && !isPasswordValid) 
                                        ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5" 
                                        : mode === "register" 
                                            ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-purple-500/20" 
                                            : "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-teal-500/20"
                                    }
                                `}
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin"/>}
                                {mode === "register" ? "Create Account" : mode === "login" ? "Sign In" : "Send Recovery Link"}
                            </button>
                        </form>
                    )}

                    {/* FOOTER SWITCHER */}
                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm">
                            {mode === "login" && "Don't have an account?"}
                            {mode === "register" && "Already have an account?"}
                            {mode === "forgot" && "Remembered your password?"}
                        </p>
                        <button 
                            onClick={() => {
                                if (mode === "login") switchMode("register");
                                else switchMode("login");
                            }}
                            className="text-white font-bold mt-2 hover:text-teal-400 transition-colors uppercase text-xs tracking-widest border-b border-transparent hover:border-teal-400 pb-0.5"
                        >
                            {mode === "login" && "Register New Account"}
                            {mode === "register" && "Login Instead"}
                            {mode === "forgot" && "Login Instead"}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      )}

      {/* --- THE ROYAL STANDARD MODAL (SUCCESS) --- */}
      {showSuccessModal && (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-50 bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl"
        >
            <div className="text-6xl mb-4 animate-bounce">🧐</div>
            <h3 className="text-2xl font-bold text-white mb-2">Oh, Look Who's Here.</h3>
            <p className="text-slate-400 mb-8 leading-relaxed italic">
                "Please tell me you didn't forget your grammar while you were gone. We have standards to maintain here!"
            </p>

            <button 
                onClick={handleProceed}
                className="w-full py-3 bg-gradient-to-r from-amber-200 to-yellow-400 hover:from-amber-100 hover:to-yellow-300 text-amber-900 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
            >
                Indubitably 🎩
            </button>
        </motion.div>
      )}

    </main>
  );
}

// Component Kecil untuk Item Checklist
function RequirementItem({ isValid, text }) {
    return (
        <div className="flex items-center gap-2 transition-all">
            <div className={`p-0.5 rounded-full ${isValid ? 'bg-green-500 text-slate-900' : 'bg-white/10 text-slate-500'}`}>
                {isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </div>
            <span className={`text-xs ${isValid ? 'text-green-400 font-medium' : 'text-slate-500'}`}>{text}</span>
        </div>
    )
}