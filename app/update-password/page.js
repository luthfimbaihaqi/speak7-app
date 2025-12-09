"use client";

import { useState } from "react";
import { createBrowserClient } from '@supabase/ssr'; 
import { useRouter } from "next/navigation";
import { Loader2, Lock, Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function UpdatePasswordPage() {
  const router = useRouter();

  // Inisialisasi client yang sadar-session
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

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

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);

    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      
      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(45,212,191,0.15)_0px,transparent_50%)]"></div>
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(at_100%_100%,rgba(168,85,247,0.15)_0px,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
                <p className="text-slate-400 text-sm">
                    Enter your new password below to recover your account.
                </p>
            </div>

            {errorMsg && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
                </div>
            )}

            {success ? (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-4"
                >
                    <div className="text-green-400 text-5xl mb-4 flex justify-center">
                        <Check className="w-16 h-16 bg-green-500/20 p-2 rounded-full border border-green-500/50" />
                    </div>
                    <h3 className="text-white font-bold text-lg">Password Updated!</h3>
                    <p className="text-slate-400 text-sm mt-2">Redirecting you to dashboard...</p>
                </motion.div>
            ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors"/>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                onChange={handlePasswordChange}
                                className={`w-full bg-black/20 border rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none transition-all ${!isPasswordValid && password.length > 0 ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-teal-500'}`}
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

                    {/* LIVE CHECKLIST */}
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2 mt-2">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Password Requirements:</p>
                        <RequirementItem isValid={validations.minLength} text="Min. 8 characters" />
                        <RequirementItem isValid={validations.hasNumber} text="Contains a number (0-9)" />
                        <RequirementItem isValid={validations.hasSymbol} text="Contains a symbol (!@#$%)" />
                    </div>

                    <button 
                        disabled={loading || !isPasswordValid}
                        className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 
                            ${loading || !isPasswordValid
                                ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5" 
                                : "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-teal-500/20"
                            }
                        `}
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin"/>}
                        Update Password
                    </button>
                </form>
            )}
        </motion.div>
      </div>
    </main>
  );
}

// INI BAGIAN YANG TADI HILANG:
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