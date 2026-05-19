"use client";

import { useState } from "react";
import { createBrowserClient } from '@supabase/ssr'; 
import { useRouter } from "next/navigation";
import { Loader2, Lock, Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const AbstractShapes = () => (
  <>
    <svg className="absolute top-[8%] left-[5%] w-14 h-14 md:w-20 md:h-20 opacity-75 -rotate-12" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 10 Q 80 15 85 45 Q 90 75 60 85 Q 25 90 15 60 Q 10 30 50 10 Z" fill="#D17A5C" />
    </svg>
    <svg className="hidden md:block absolute top-[10%] right-[8%] w-24 h-10 opacity-55 rotate-[15deg]" viewBox="0 0 200 50" aria-hidden>
      <line x1="10" y1="25" x2="190" y2="25" stroke="#4A6B8F" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />
    </svg>
    <svg className="hidden md:block absolute bottom-[15%] left-[8%] w-12 h-12 opacity-50" viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#8FA68E" strokeWidth="3" strokeDasharray="8 6" />
    </svg>
    <svg className="absolute bottom-[10%] right-[6%] w-10 h-10 md:w-14 md:h-14 opacity-60 rotate-[20deg]" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 15 L 85 80 L 15 80 Z" fill="#C9974C" />
    </svg>
    <svg className="hidden md:block absolute top-[50%] right-[4%] w-16 h-16 opacity-45" viewBox="0 0 100 100" aria-hidden>
      <g stroke="#D17A5C" strokeWidth="3" strokeLinecap="round">
        <line x1="25" y1="25" x2="75" y2="75" /><line x1="75" y1="25" x2="25" y2="75" />
      </g>
    </svg>
  </>
);

export default function UpdatePasswordPage() {
  const router = useRouter();

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
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        body, html { font-family: 'Lexend', system-ui, -apple-system, sans-serif; }
        .font-display { font-family: 'Lexend', system-ui, -apple-system, sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <main className="min-h-screen bg-[#F8F5EE] flex items-center justify-center p-4 overflow-hidden relative">
        
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AbstractShapes />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FAF6EC] border border-[#1A1A1A]/10 p-8 rounded-3xl shadow-lg"
          >
              <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#4A6B8F]/10 text-[#4A6B8F] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4A6B8F]/20">
                      <Lock className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-black text-[#1A1A1A] mb-2 font-display">Set New Password</h1>
                  <p className="text-[#525252] text-sm">
                      Enter your new password below to recover your account.
                  </p>
              </div>

              {errorMsg && (
                  <div className="mb-6 bg-[#D17A5C]/10 border border-[#D17A5C]/20 text-[#D17A5C] px-4 py-3 rounded-xl text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
                  </div>
              )}

              {success ? (
                  <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-4"
                  >
                      <div className="text-[#8FA68E] text-5xl mb-4 flex justify-center">
                          <Check className="w-16 h-16 bg-[#8FA68E]/15 p-2 rounded-full border border-[#8FA68E]/40" />
                      </div>
                      <h3 className="text-[#1A1A1A] font-black text-lg font-display">Password Updated!</h3>
                      <p className="text-[#525252] text-sm mt-2">Redirecting you to dashboard...</p>
                  </motion.div>
              ) : (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-[#525252] uppercase tracking-wider">New Password</label>
                          <div className="relative group">
                              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[#525252] group-focus-within:text-[#4A6B8F] transition-colors"/>
                              <input 
                                  type={showPassword ? "text" : "password"} 
                                  value={password}
                                  onChange={handlePasswordChange}
                                  className={`w-full bg-[#F8F5EE] border rounded-xl py-3 pl-10 pr-12 text-[#1A1A1A] focus:outline-none transition-all placeholder:text-[#525252]/40 ${!isPasswordValid && password.length > 0 ? 'border-[#D17A5C]/50 focus:border-[#D17A5C]' : 'border-[#1A1A1A]/15 focus:border-[#4A6B8F]'}`}
                                  placeholder="••••••••"
                                  required
                              />
                              <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-3 text-[#525252] hover:text-[#1A1A1A] transition-colors"
                              >
                                  {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                              </button>
                          </div>
                      </div>

                      {/* LIVE CHECKLIST */}
                      <div className="bg-[#F8F5EE] p-3 rounded-lg border border-[#1A1A1A]/10 space-y-2 mt-2">
                          <p className="text-[10px] text-[#525252] uppercase font-bold mb-1">Password Requirements:</p>
                          <RequirementItem isValid={validations.minLength} text="Min. 8 characters" />
                          <RequirementItem isValid={validations.hasNumber} text="Contains a number (0-9)" />
                          <RequirementItem isValid={validations.hasSymbol} text="Contains a symbol (!@#$%)" />
                      </div>

                      <button 
                          disabled={loading || !isPasswordValid}
                          className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 
                              ${loading || !isPasswordValid
                                  ? "bg-[#1A1A1A]/5 text-[#525252] cursor-not-allowed border border-[#1A1A1A]/10" 
                                  : "bg-[#1A1A1A] hover:bg-black text-white"
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
    </>
  );
}

function RequirementItem({ isValid, text }) {
    return (
        <div className="flex items-center gap-2 transition-all">
            <div className={`p-0.5 rounded-full ${isValid ? 'bg-[#8FA68E] text-white' : 'bg-[#1A1A1A]/10 text-[#525252]'}`}>
                {isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </div>
            <span className={`text-xs ${isValid ? 'text-[#8FA68E] font-medium' : 'text-[#525252]'}`}>{text}</span>
        </div>
    )
}