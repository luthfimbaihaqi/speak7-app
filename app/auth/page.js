"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff, Check, X, AlertCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AbstractShapes = () => (
  <>
    <svg className="absolute top-[6%] left-[4%] w-14 h-14 md:w-20 md:h-20 opacity-75 -rotate-12" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 10 Q 80 15 85 45 Q 90 75 60 85 Q 25 90 15 60 Q 10 30 50 10 Z" fill="#D17A5C" />
    </svg>
    <svg className="hidden md:block absolute top-[8%] right-[6%] w-24 h-10 opacity-55 rotate-[15deg]" viewBox="0 0 200 50" aria-hidden>
      <line x1="10" y1="25" x2="190" y2="25" stroke="#4A6B8F" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />
    </svg>
    <svg className="hidden md:block absolute bottom-[20%] left-[6%] w-12 h-12 opacity-50" viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#8FA68E" strokeWidth="3" strokeDasharray="8 6" />
    </svg>
    <svg className="absolute bottom-[12%] right-[5%] w-10 h-10 md:w-14 md:h-14 opacity-60 rotate-[20deg]" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 15 L 85 80 L 15 80 Z" fill="#C9974C" />
    </svg>
    <svg className="hidden md:block absolute top-[45%] left-[3%] w-14 h-14 opacity-45" viewBox="0 0 100 100" aria-hidden>
      <g stroke="#C9974C" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="32" /><line x1="14" y1="26" x2="26" y2="26" />
        <line x1="60" y1="60" x2="60" y2="72" /><line x1="54" y1="66" x2="66" y2="66" />
      </g>
    </svg>
    <svg className="hidden md:block absolute top-[50%] right-[4%] w-10 h-10 opacity-50 rotate-45" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 15 Q 75 20 80 50 Q 85 80 50 85 Q 20 80 20 50 Q 25 20 50 15 Z" fill="#8FA68E" />
    </svg>
  </>
);

export default function AuthPage() {
  const [mode, setMode] = useState("login"); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [resetEmailSent, setResetEmailSent] = useState(false); 
  const [errorMsg, setErrorMsg] = useState(""); 

  const router = useRouter();

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

  const handleGoogleLogin = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) throw error;
    } catch (error) {
        setErrorMsg(error.message);
    }
  };

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const hardcodedUrl = "https://www.ielts4our.net/auth/callback?next=/update-password";

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

        {/* FORM CONTAINER */}
        {!showSuccessModal && (
          <div className="relative z-10 w-full max-w-md">
              <AnimatePresence mode="wait">
                  <motion.div
                      key={mode} 
                      initial={{ opacity: 0, x: mode === "register" ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: mode === "register" ? -50 : 50 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#FAF6EC] border border-[#1A1A1A]/10 p-8 rounded-3xl shadow-lg"
                  >
                      <Link href="/" className="inline-flex items-center gap-2 text-[#525252] hover:text-[#1A1A1A] mb-6 transition-colors text-sm group">
                          <div className="p-1 rounded-full bg-[#1A1A1A]/5 group-hover:bg-[#1A1A1A]/10 transition-colors">
                            <ArrowLeft className="w-4 h-4"/>
                          </div>
                          Back to Home
                      </Link>

                      {/* DYNAMIC TITLE */}
                      <h1 className="text-3xl font-black text-[#1A1A1A] mb-2 font-display">
                          {mode === "register" && "Create Account"}
                          {mode === "login" && "Welcome Back"}
                          {mode === "forgot" && "Reset Password"}
                      </h1>
                      <p className="text-[#525252] mb-6 text-sm">
                          {mode === "register" && "Join the elite Band 8.0 club."}
                          {mode === "login" && "Login to resume your training."}
                          {mode === "forgot" && "Don't panic. We'll send you a recovery link."}
                      </p>

                      {/* ERROR MESSAGE */}
                      {errorMsg && (
                          <div className="mb-4 bg-[#D17A5C]/10 border border-[#D17A5C]/20 text-[#D17A5C] px-4 py-3 rounded-xl text-xs flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
                          </div>
                      )}

                      {/* GOOGLE BUTTON (Login & Register only) */}
                      {mode !== "forgot" && (
                          <>
                              <button 
                                  onClick={handleGoogleLogin}
                                  className="w-full bg-[#1A1A1A] hover:bg-black text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all mb-3 group shadow-md"
                              >
                                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                  </svg>
                                  {mode === "register" ? "Sign up with Google" : "Continue with Google"}
                              </button>

                              {mode === "register" ? (
                                  <div className="text-center bg-[#C9974C]/10 border border-[#C9974C]/20 rounded-lg p-2 mb-6">
                                      <p className="text-[11px] text-[#525252] font-medium flex items-center justify-center gap-1.5">
                                          <Zap className="w-3.5 h-3.5 text-[#C9974C]" />
                                          <strong className="text-[#C9974C] uppercase tracking-wide">Launch Promo:</strong> 
                                          Sign up now to claim <span className="text-[#1A1A1A] font-bold">4 FREE tokens</span>.
                                      </p>
                                  </div>
                              ) : (
                                  <p className="text-center text-[10px] text-[#525252] mb-6">
                                      Don't have an account? <button onClick={() => switchMode("register")} className="text-[#D17A5C] hover:underline font-bold">Sign up here</button>
                                  </p>
                              )}

                              <div className="relative flex py-2 items-center mb-6">
                                  <div className="flex-grow border-t border-[#1A1A1A]/10"></div>
                                  <span className="flex-shrink-0 mx-4 text-[#525252] text-xs uppercase font-bold tracking-widest">Or with email</span>
                                  <div className="flex-grow border-t border-[#1A1A1A]/10"></div>
                              </div>
                          </>
                      )}

                      {/* FORGOT PASSWORD SUCCESS */}
                      {mode === "forgot" && resetEmailSent ? (
                          <div className="text-center py-8">
                              <div className="w-16 h-16 bg-[#4A6B8F]/10 text-[#4A6B8F] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4A6B8F]/20">
                                  <Mail className="w-8 h-8" />
                              </div>
                              <h3 className="text-[#1A1A1A] font-black text-xl mb-2 font-display">Check Your Email</h3>
                              <p className="text-[#525252] text-sm mb-6">
                                  We have sent a password recovery link to <strong className="text-[#1A1A1A]">{email}</strong>.
                              </p>
                              <button onClick={() => switchMode("login")} className="text-[#D17A5C] font-bold hover:underline text-sm">
                                  Back to Login
                              </button>
                          </div>
                      ) : (
                          /* FORM AREA */
                          <form onSubmit={mode === "forgot" ? handleResetPassword : handleAuth} className="space-y-4">
                              
                              {/* EMAIL INPUT */}
                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-[#525252] uppercase tracking-wider">Email</label>
                                  <div className="relative group">
                                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-[#525252] group-focus-within:text-[#4A6B8F] transition-colors"/>
                                      <input 
                                          type="email" 
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                          className="w-full bg-[#F8F5EE] border border-[#1A1A1A]/15 rounded-xl py-3 pl-10 pr-4 text-[#1A1A1A] focus:outline-none focus:border-[#4A6B8F] transition-all placeholder:text-[#525252]/40"
                                          placeholder="name@example.com"
                                          required
                                      />
                                  </div>
                              </div>

                              {/* PASSWORD INPUT */}
                              {mode !== "forgot" && (
                                  <div className="space-y-1">
                                      <label className="text-xs font-bold text-[#525252] uppercase tracking-wider">Password</label>
                                      <div className="relative group">
                                          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[#525252] group-focus-within:text-[#4A6B8F] transition-colors"/>
                                          <input 
                                              type={showPassword ? "text" : "password"} 
                                              value={password}
                                              onChange={handlePasswordChange}
                                              className={`w-full bg-[#F8F5EE] border rounded-xl py-3 pl-10 pr-12 text-[#1A1A1A] focus:outline-none transition-all placeholder:text-[#525252]/40 ${mode === "register" && !isPasswordValid && password.length > 0 ? 'border-[#D17A5C]/50 focus:border-[#D17A5C]' : 'border-[#1A1A1A]/15 focus:border-[#4A6B8F]'}`}
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
                              )}

                              {/* FORGOT PASSWORD LINK */}
                              {mode === "login" && (
                                  <div className="flex justify-end">
                                      <button 
                                          type="button"
                                          onClick={() => switchMode("forgot")}
                                          className="text-xs text-[#525252] hover:text-[#1A1A1A] transition-colors"
                                      >
                                          Forgot Password?
                                      </button>
                                  </div>
                              )}

                              {/* LIVE CHECKLIST */}
                              {mode === "register" && (
                                  <div className="bg-[#F8F5EE] p-3 rounded-lg border border-[#1A1A1A]/10 space-y-2 mt-2">
                                      <p className="text-[10px] text-[#525252] uppercase font-bold mb-1">Password Requirements:</p>
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
                                          ? "bg-[#1A1A1A]/5 text-[#525252] cursor-not-allowed border border-[#1A1A1A]/10" 
                                          : "bg-[#1A1A1A] hover:bg-black text-white"
                                      }
                                  `}
                              >
                                  {loading && <Loader2 className="w-5 h-5 animate-spin"/>}
                                  {mode === "register" ? "Create Account" : mode === "login" ? "Sign In" : "Send Recovery Link"}
                              </button>
                          </form>
                      )}

                      {/* FOOTER SWITCHER */}
                      <div className="mt-6 pt-6 border-t border-[#1A1A1A]/10 text-center">
                          <p className="text-[#525252] text-sm">
                              {mode === "login" && "Don't have an account?"}
                              {mode === "register" && "Already have an account?"}
                              {mode === "forgot" && "Remembered your password?"}
                          </p>
                          <button 
                              onClick={() => {
                                  if (mode === "login") switchMode("register");
                                  else switchMode("login");
                              }}
                              className="text-[#1A1A1A] font-bold mt-2 hover:text-[#D17A5C] transition-colors uppercase text-xs tracking-widest border-b border-transparent hover:border-[#D17A5C] pb-0.5"
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

        {/* SUCCESS MODAL */}
        {showSuccessModal && (
          <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-50 bg-[#FAF6EC] border border-[#1A1A1A]/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl"
          >
              <div className="w-20 h-20 bg-[#C9974C]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9974C]/20">
                <span className="text-5xl">🧐</span>
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 font-display">Oh, Look Who's Here.</h3>
              <p className="text-[#525252] mb-8 leading-relaxed italic">
                  "Please tell me you didn't forget your grammar while you were gone. We have standards to maintain here!"
              </p>

              <button 
                  onClick={handleProceed}
                  className="w-full py-3 bg-[#1A1A1A] hover:bg-black text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                  Indubitably
              </button>
          </motion.div>
        )}

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