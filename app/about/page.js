"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabaseClient";
import {
  ArrowLeft, ArrowRight, Mail, Twitter, Instagram, Linkedin,
  BookOpen, Sparkles, BarChart3, LogOut, User, Plus,
  Menu, X, LogIn, ChevronDown, Crown, Gift,
  Coffee,
  PenLine, Mic2,
} from "lucide-react";

// Abstract shapes — reduced density for content-heavy page
const AbstractShapes = () => (
  <>
    <svg className="absolute top-[3%] left-[3%] w-14 h-14 md:w-20 md:h-20 opacity-80 -rotate-12" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 10 Q 80 15 85 45 Q 90 75 60 85 Q 25 90 15 60 Q 10 30 50 10 Z" fill="#D17A5C" />
    </svg>
    <svg className="hidden md:block absolute top-[5%] right-[5%] w-28 h-12 opacity-60 rotate-[15deg]" viewBox="0 0 200 50" aria-hidden>
      <line x1="10" y1="25" x2="190" y2="25" stroke="#4A6B8F" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />
    </svg>
    <svg className="hidden md:block absolute top-[25%] left-[2%] w-16 h-16 opacity-55" viewBox="0 0 100 100" aria-hidden>
      <g stroke="#C9974C" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="32" /><line x1="14" y1="26" x2="26" y2="26" />
        <line x1="65" y1="55" x2="65" y2="67" /><line x1="59" y1="61" x2="71" y2="61" />
      </g>
    </svg>
    <svg className="hidden md:block absolute top-[45%] right-[3%] w-28 h-10 opacity-50 -rotate-6" viewBox="0 0 200 50" aria-hidden>
      <path d="M 5 25 Q 30 5 55 25 T 105 25 T 155 25 T 195 25" fill="none" stroke="#8FA68E" strokeWidth="3" strokeLinecap="round" />
    </svg>
    <svg className="absolute top-[60%] right-[4%] w-10 h-10 md:w-12 md:h-12 opacity-75 rotate-45" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 15 Q 75 20 80 50 Q 85 80 50 85 Q 20 80 20 50 Q 25 20 50 15 Z" fill="#8FA68E" />
    </svg>
    <svg className="hidden md:block absolute bottom-[15%] left-[4%] w-14 h-14 opacity-55" viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#4A6B8F" strokeWidth="3" strokeDasharray="8 6" />
    </svg>
    <svg className="absolute bottom-[5%] right-[6%] w-10 h-10 md:w-14 md:h-14 opacity-65 rotate-[20deg]" viewBox="0 0 100 100" aria-hidden>
      <path d="M 50 15 L 85 80 L 15 80 Z" fill="#C9974C" />
    </svg>
    <svg className="hidden md:block absolute top-[75%] left-[8%] w-14 h-14 opacity-50 rotate-[10deg]" viewBox="0 0 100 100" aria-hidden>
      <g stroke="#D17A5C" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="80" /><line x1="35" y1="20" x2="35" y2="80" />
        <line x1="50" y1="20" x2="50" y2="80" /><line x1="10" y1="50" x2="60" y2="50" />
      </g>
    </svg>
  </>
);

export default function AboutPage() {
  const router = useRouter();
  const userMenuRef = useRef(null);

  const [userProfile, setUserProfile] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Easter egg console message
  useEffect(() => {
    const styles = [
      "color: #D17A5C",
      "font-size: 14px",
      "font-weight: bold",
      "padding: 8px 12px",
      "background: #FAF6EC",
      "border-left: 3px solid #D17A5C",
    ].join(";");

    console.log("%cHi there, curious dev!", styles);
    console.log(
      "%cYes, I built ielts4our myself. Solo. From scratch.\n" +
      "Thanks for poking around the code.\n\n" +
      "Got feedback? luthfibaihaqi851@gmail.com\n" +
      "— Luthfi",
      "color: #525252; font-size: 12px; line-height: 1.6;"
    );
  }, []);

  useEffect(() => {
    async function checkUserStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('token_balance')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserProfile(prev => ({ ...prev, ...profile }));
        }
      }
    }
    checkUserStatus();

    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Section divider — light mode
  const SectionDivider = () => (
    <div className="flex items-center justify-center my-20 max-w-md mx-auto">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#1A1A1A]/15"></div>
      <div className="mx-4 w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/20"></div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#1A1A1A]/15"></div>
    </div>
  );

  // Section header — light mode with V3 palette
  const SectionHeader = ({ number, title, accent = "blue" }) => {
    const accentClasses = {
      blue: "text-[#4A6B8F]",
      emerald: "text-[#8FA68E]",
      purple: "text-[#4A6B8F]",
      amber: "text-[#C9974C]",
      pink: "text-[#D17A5C]",
    };
    return (
      <div className="flex items-baseline gap-3 mb-8">
        <span className={`text-xs font-black ${accentClasses[accent]} tracking-widest tabular-nums`}>
          {number}.
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight font-display">
          {title}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#1A1A1A]/15 to-transparent ml-4"></div>
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        body, html { font-family: 'Lexend', system-ui, -apple-system, sans-serif; }
        .font-display { font-family: 'Lexend', system-ui, -apple-system, sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <main className="min-h-screen pb-20 px-4 bg-[#F8F5EE] selection:bg-[#D17A5C]/30 selection:text-[#1A1A1A] relative overflow-hidden">

        {/* Abstract shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AbstractShapes />
        </div>

        <div className="relative z-10">

          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-center py-8 max-w-5xl mx-auto gap-4 relative">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-[#1A1A1A] hover:bg-[#1A1A1A]/5 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/">
                <div className="relative w-20 h-16 md:w-24 md:h-20 cursor-pointer">
                  <Image src="/logo-white.png" alt="IELTS4our Logo" fill className="object-contain object-center md:object-left invert" priority />
                </div>
              </Link>
              <div className="w-8 md:hidden"></div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {userProfile ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 rounded-full mr-1">
                    <span className="text-[#C9974C] text-sm">🪙</span>
                    <span className="text-[#1A1A1A] text-xs font-bold tabular-nums">{userProfile.token_balance || 0}</span>
                  </div>
                  <div className="relative" ref={userMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="px-3 py-2 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 border border-[#1A1A1A]/10 rounded-full text-[#1A1A1A] transition-all text-sm font-medium flex items-center gap-2"
                    >
                      {userProfile?.user_metadata?.avatar_url ? (
                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-[#1A1A1A]/20">
                          <Image src={userProfile.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                        </div>
                      ) : (
                        <User className="w-4 h-4 text-[#D17A5C]" />
                      )}
                      <span className="max-w-[80px] truncate">{userProfile.email?.split('@')[0]}</span>
                      <ChevronDown className={`w-4 h-4 text-[#525252] transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                    </motion.button>
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-2xl shadow-xl overflow-hidden py-1 z-50"
                        >
                          <Link href="/progress" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A]/5 text-sm text-[#1A1A1A] transition-colors">
                            <BarChart3 className="w-4 h-4 text-[#4A6B8F]" /> My Progress
                          </Link>
                          <Link href="/mission" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A]/5 text-sm text-[#1A1A1A] transition-colors">
                            <BookOpen className="w-4 h-4 text-[#8FA68E]" /> Speaking Guide
                          </Link>
                          <div className="h-px bg-[#1A1A1A]/10 my-1"></div>
                          <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#D17A5C]/10 text-sm text-[#525252] hover:text-[#D17A5C] transition-colors text-left">
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <Link href="/auth">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white rounded-full transition-colors text-xs font-bold">Login</motion.button>
                </Link>
              )}
            </div>
          </header>

          {/* MOBILE DRAWER */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm z-40 md:hidden" />
                <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-[280px] bg-[#FAF6EC] border-r border-[#1A1A1A]/10 z-50 p-6 flex flex-col md:hidden">
                  <div className="flex items-center justify-between mb-8">
                    <Link href="/">
                      <div className="relative w-16 h-12">
                        <Image src="/logo-white.png" alt="Logo" fill className="object-contain object-left invert" />
                      </div>
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#525252] hover:text-[#1A1A1A] bg-[#1A1A1A]/5 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-6 overflow-y-auto">
                    {userProfile ? (
                      <>
                        <div className="bg-[#F8F5EE] p-4 rounded-2xl border border-[#1A1A1A]/10">
                          <div className="flex items-center gap-3 mb-3">
                            {userProfile?.user_metadata?.avatar_url ? (
                              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#1A1A1A]/20">
                                <Image src={userProfile.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-[#4A6B8F] rounded-full flex items-center justify-center text-white font-bold">
                                {userProfile.email?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-[#1A1A1A] truncate max-w-[140px]">{userProfile.email?.split('@')[0]}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center bg-[#FAF6EC] p-3 rounded-lg">
                            <span className="text-xs text-[#525252]">Balance</span>
                            <span className="text-sm font-bold text-[#C9974C]">{userProfile.token_balance || 0} Tokens</span>
                          </div>
                        </div>
                        <nav className="space-y-2">
                          <Link href="/progress" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">My Progress</Link>
                          <Link href="/mission" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">Speaking Guide</Link>
                          <Link href="/faq" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">FAQ</Link>
                        </nav>
                      </>
                    ) : (
                      <div className="flex flex-col h-full">
                        <div className="bg-[#F8F5EE] p-5 rounded-2xl border border-[#1A1A1A]/10 text-center mb-6">
                          <div className="w-12 h-12 bg-[#D17A5C]/15 text-[#D17A5C] rounded-full flex items-center justify-center mx-auto mb-3">
                            <LogIn className="w-6 h-6" />
                          </div>
                          <h3 className="text-[#1A1A1A] font-bold mb-1">Guest User</h3>
                          <p className="text-[#525252] text-xs mb-4">Login to save progress & get 4 free tokens.</p>
                          <Link href="/auth">
                            <button className="w-full py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-lg transition-all shadow-md">Login / Register</button>
                          </Link>
                        </div>
                        <nav className="space-y-2">
                          <Link href="/mission" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">Speaking Guide</Link>
                          <Link href="/faq" className="flex items-center px-4 py-3 bg-[#1A1A1A]/5 rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A]/10 transition-colors">FAQ</Link>
                        </nav>
                      </div>
                    )}
                  </div>
                  {userProfile && (
                    <div className="pt-6 border-t border-[#1A1A1A]/10">
                      <button onClick={handleLogoutClick} className="w-full flex items-center justify-center gap-2 py-3 text-[#D17A5C] hover:bg-[#D17A5C]/10 rounded-xl transition-colors font-medium">
                        <LogOut className="w-5 h-5" /> Sign Out
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* BACK NAV */}
          <div className="max-w-3xl mx-auto pt-4 mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-[#525252] hover:text-[#1A1A1A] transition-colors text-xs font-bold uppercase tracking-widest group">
              <div className="p-1.5 rounded-full bg-[#1A1A1A]/5 group-hover:bg-[#1A1A1A]/10 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              Back to Home
            </Link>
          </div>

          {/* HERO SECTION */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              {/* Foto */}
              <div className="relative shrink-0 group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D17A5C]/20 via-[#8FA68E]/20 to-[#C9974C]/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-3xl p-[2px] bg-gradient-to-br from-[#D17A5C]/40 via-[#8FA68E]/40 to-[#C9974C]/40">
                  <div className="w-full h-full rounded-3xl overflow-hidden bg-[#FAF6EC] relative">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                      <Image
                        src="/foto-pohon-luthfi.jpg"
                        alt="Luthfi"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Text */}
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#525252] mb-3">
                    About <span className="text-[#D17A5C]">/</span> Hello
                  </p>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1A1A1A] mb-6 leading-[1.05] tracking-tight font-display">
                    Hey, I'm Luthfi.
                  </h1>
                  <p className="text-lg md:text-xl text-[#1A1A1A] leading-relaxed mb-2 font-medium">
                    I make tools that I wish existed when I needed them.
                  </p>
                  <p className="text-lg md:text-xl text-[#525252] italic font-medium">
                    ielts4our is one of them.
                  </p>
                </motion.div>

                {/* Social links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3 justify-center md:justify-start mt-8"
                >
                  <a href="mailto:luthfibaihaqi851@gmail.com" className="group p-2.5 bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-xl text-[#525252] hover:text-[#8FA68E] hover:border-[#8FA68E]/40 hover:bg-[#8FA68E]/5 transition-all" aria-label="Email">
                    <Mail className="w-4 h-4" />
                  </a>
                  <a href="https://www.linkedin.com/in/luthfimbaihaqi/" target="_blank" rel="noopener noreferrer" className="group p-2.5 bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-xl text-[#525252] hover:text-[#4A6B8F] hover:border-[#4A6B8F]/40 hover:bg-[#4A6B8F]/5 transition-all" aria-label="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="https://twitter.com/luthfimbaihaqi" target="_blank" rel="noopener noreferrer" className="group p-2.5 bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-xl text-[#525252] hover:text-[#4A6B8F] hover:border-[#4A6B8F]/40 hover:bg-[#4A6B8F]/5 transition-all" aria-label="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="https://instagram.com/luthfimbaihaqi" target="_blank" rel="noopener noreferrer" className="group p-2.5 bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-xl text-[#525252] hover:text-[#D17A5C] hover:border-[#D17A5C]/40 hover:bg-[#D17A5C]/5 transition-all" aria-label="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.section>

          <SectionDivider />

          {/* 01 — THE STORY */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto">
            <SectionHeader number="01" title="The Story" accent="blue" />
            <div className="space-y-6 text-[#525252] text-base md:text-lg leading-relaxed font-medium">
              <p>Let's be real: IELTS prep is pricey. When I was looking for ways to practice, I realized how much of a barrier the cost can be for most students. I was looking at courses and thinking, there's gotta be a cheaper way.</p>
              <p>Since I've been coding for a while, So I figured, why not build my own?</p>
              <p>The first version was pretty basic, and I only shared it with a few friends at the office. They tested it, gave me a lot of feedback, and surprisingly, they kept coming back to use it. Word spread, and soon, people I didn't even know were asking for access.</p>
              <p className="text-[#1A1A1A] font-bold text-lg md:text-xl pt-2">It's still a one-man show, but seeing students from all over the place use it to improve their scores is what keeps me going.</p>
            </div>
          </motion.section>

          <SectionDivider />

          {/* 02 — WHY IT'S FREE */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto">
            <SectionHeader number="02" title="IELTS4our is free (?)" accent="amber" />
            <div className="bg-[#FAF6EC] border border-[#C9974C]/25 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coffee className="w-24 h-24 text-[#C9974C]" />
              </div>
              <div className="relative space-y-5 text-[#525252] text-base md:text-lg leading-relaxed font-medium">
                <p>Look, I'm trying my best to keep ielts4our free for everyone. But servers cost money, and servers doesn't accept <span className="italic text-[#C9974C]">"thank you"</span> as payment.</p>
                <p>So here's the deal: most stuff is free. Detailed feedback unlocks with cheap tokens, like <span className="italic">really</span> cheap. The kind of cheap that won't make your wallet cry.</p>
                <p>If you wanna support so this thing grows bigger and helps more people prep IELTS without breaking the bank, well, you know where to find the buy button. <span className="text-[#C9974C]">;)</span></p>
              </div>
            </div>
          </motion.section>

          <SectionDivider />

          {/* 03 — WHAT'S NEXT */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto">
            <SectionHeader number="03" title="What's next?" accent="emerald" />
            <div className="space-y-4">
              {[
                {
                  letter: "R",
                  title: "IELTS4OUR Reading Practice",
                  status: "In Progress",
                  statusColor: "text-[#8FA68E] bg-[#8FA68E]/10 border-[#8FA68E]/30",
                  desc: "Multi-passage reading with comprehension questions, time tracking, and instant band score for both Academic and General Training modules.",
                  accent: "border-[#8FA68E]/30 hover:border-[#8FA68E]/50",
                  letterColor: "text-[#8FA68E]",
                },
                {
                  letter: "L",
                  title: "IELTS4OUR Listening Practice",
                  status: "In Progress",
                  statusColor: "text-[#4A6B8F] bg-[#4A6B8F]/10 border-[#4A6B8F]/30",
                  desc: "Real audio with multiple accents, section-by-section practice, and detailed performance breakdown across all four parts.",
                  accent: "border-[#4A6B8F]/30 hover:border-[#4A6B8F]/50",
                  letterColor: "text-[#4A6B8F]",
                },
                {
                  letter: "M",
                  title: "IELTS4OUR Mobile App",
                  status: "Exploring",
                  statusColor: "text-[#C9974C] bg-[#C9974C]/10 border-[#C9974C]/30",
                  desc: "Native iOS and Android app for offline practice and seamless mobile experience. Let's see what happens ;)",
                  accent: "border-[#C9974C]/30 hover:border-[#C9974C]/50",
                  letterColor: "text-[#C9974C]",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-[#FAF6EC] border ${item.accent} rounded-2xl p-5 md:p-6 transition-all cursor-default group shadow-sm`}
                >
                  <div className="flex items-start gap-4 md:gap-5">
                    <span className={`text-3xl md:text-4xl font-black font-mono leading-none ${item.letterColor} shrink-0 w-8 md:w-10 text-center select-none group-hover:scale-110 transition-transform`}>
                      {item.letter}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className="text-[#1A1A1A] font-black text-base md:text-lg tracking-tight font-display">{item.title}</h4>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${item.statusColor}`}>{item.status}</span>
                      </div>
                      <p className="text-[#525252] text-sm md:text-base leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <SectionDivider />

          {/* 04 — LET'S CONNECT */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto">
            <SectionHeader number="04" title="Let's Connect" accent="blue" />
            <p className="text-[#525252] mb-6 text-base md:text-lg font-medium">I read every message. Sometimes I even reply quickly.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              <a href="mailto:luthfibaihaqi851@gmail.com" className="bg-[#FAF6EC] border border-[#1A1A1A]/10 hover:border-[#8FA68E]/40 hover:bg-[#8FA68E]/5 rounded-2xl p-5 transition-all group flex items-center gap-3 shadow-sm">
                <div className="p-2.5 bg-[#8FA68E]/10 border border-[#8FA68E]/20 rounded-xl text-[#8FA68E] group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#525252] mb-0.5">Email</p>
                  <p className="text-[#1A1A1A] font-bold text-sm truncate">luthfibaihaqi851<span className="text-[#525252]">@gmail.com</span></p>
                </div>
              </a>
              <a href="https://www.linkedin.com/in/luthfimbaihaqi/" target="_blank" rel="noopener noreferrer" className="bg-[#FAF6EC] border border-[#1A1A1A]/10 hover:border-[#4A6B8F]/40 hover:bg-[#4A6B8F]/5 rounded-2xl p-5 transition-all group flex items-center gap-3 shadow-sm">
                <div className="p-2.5 bg-[#4A6B8F]/10 border border-[#4A6B8F]/20 rounded-xl text-[#4A6B8F] group-hover:scale-110 transition-transform">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#525252] mb-0.5">LinkedIn</p>
                  <p className="text-[#1A1A1A] font-bold text-sm truncate">@luthfimbaihaqi</p>
                </div>
              </a>
              <a href="https://twitter.com/luthfimbaihaqi" target="_blank" rel="noopener noreferrer" className="bg-[#FAF6EC] border border-[#1A1A1A]/10 hover:border-[#4A6B8F]/40 hover:bg-[#4A6B8F]/5 rounded-2xl p-5 transition-all group flex items-center gap-3 shadow-sm">
                <div className="p-2.5 bg-[#4A6B8F]/10 border border-[#4A6B8F]/20 rounded-xl text-[#4A6B8F] group-hover:scale-110 transition-transform">
                  <Twitter className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#525252] mb-0.5">Twitter</p>
                  <p className="text-[#1A1A1A] font-bold text-sm truncate">@luthfimbaihaqi</p>
                </div>
              </a>
              <a href="https://instagram.com/luthfimbaihaqi" target="_blank" rel="noopener noreferrer" className="bg-[#FAF6EC] border border-[#1A1A1A]/10 hover:border-[#D17A5C]/40 hover:bg-[#D17A5C]/5 rounded-2xl p-5 transition-all group flex items-center gap-3 shadow-sm">
                <div className="p-2.5 bg-[#D17A5C]/10 border border-[#D17A5C]/20 rounded-xl text-[#D17A5C] group-hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#525252] mb-0.5">Instagram</p>
                  <p className="text-[#1A1A1A] font-bold text-sm truncate">@luthfimbaihaqi</p>
                </div>
              </a>
            </div>
            <p className="text-[#525252] text-base md:text-lg font-medium leading-relaxed">
              Whether it's feedback, complaints, weird ideas, or just to say hi, <span className="italic text-[#4A6B8F]">slide in.</span>
            </p>
          </motion.section>

          {/* CTA: Back to Practice */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto mt-20 text-center">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] hover:bg-black text-white font-black rounded-full transition-all shadow-lg text-sm md:text-base"
              >
                <span>Back to Practice</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* FOOTER */}
          <footer className="text-center mt-24 pt-8 border-t border-[#1A1A1A]/10 max-w-3xl mx-auto">
            <p className="text-[#525252] text-xs md:text-sm">&copy; 2025 IELTS4our. Made with ❤️ in Indonesia.</p>
          </footer>

          {/* LOGOUT MODAL */}
          {showLogoutModal && (
            <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FAF6EC] border border-[#1A1A1A]/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl">
                <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 font-display">Logout?</h3>
                <p className="text-[#525252] mb-8 leading-relaxed">Are you sure you want to logout?</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setShowLogoutModal(false)} className="w-full py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl transition-all">Cancel</button>
                  <button onClick={confirmLogout} className="text-xs text-[#525252] hover:text-[#D17A5C] mt-2 transition-colors">Yes, logout</button>
                </div>
              </motion.div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}