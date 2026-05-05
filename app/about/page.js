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
  Code, Coffee, Database, Brain, Mic, Cloud, Wind,
  PenLine, Mic2,
} from "lucide-react";

export default function AboutPage() {
  const router = useRouter();
  const userMenuRef = useRef(null);

  const [userProfile, setUserProfile] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ═══════════════════════════════════════
  // EASTER EGG: Console message for curious devs
  // ═══════════════════════════════════════
  useEffect(() => {
    const styles = [
      "color: #34d399",
      "font-size: 14px",
      "font-weight: bold",
      "padding: 8px 12px",
      "background: #1A1D26",
      "border-left: 3px solid #34d399",
    ].join(";");

    console.log("%cHi there, curious dev! 👋", styles);
    console.log(
      "%cYes, I built ielts4our myself. Solo. From scratch.\n" +
      "Thanks for poking around the code.\n\n" +
      "Got feedback? luthfibaihaqi851@gmail.com\n" +
      "— Luthfi",
      "color: #94a3b8; font-size: 12px; line-height: 1.6;"
    );
  }, []);

  // ═══════════════════════════════════════
  // USER AUTH (match homepage behavior)
  // ═══════════════════════════════════════
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

  // ═══════════════════════════════════════
  // SECTION DIVIDER (reusable)
  // ═══════════════════════════════════════
  const SectionDivider = () => (
    <div className="flex items-center justify-center my-20 max-w-md mx-auto">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-700"></div>
      <div className="mx-4 w-1.5 h-1.5 rounded-full bg-slate-600"></div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-700"></div>
    </div>
  );

  // ═══════════════════════════════════════
  // SECTION HEADER (numbered, reusable)
  // ═══════════════════════════════════════
  const SectionHeader = ({ number, title, accent = "blue" }) => {
    const accentClasses = {
      blue: "text-blue-400",
      emerald: "text-emerald-400",
      purple: "text-purple-400",
      amber: "text-amber-400",
      pink: "text-pink-400",
    };
    return (
      <div className="flex items-baseline gap-3 mb-8">
        <span className={`text-xs font-black ${accentClasses[accent]} tracking-widest tabular-nums`}>
          {number}.
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-[#E6E8EE] tracking-tight">
          {title}
        </h2>
        <div className={`flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent ml-4`}></div>
      </div>
    );
  };

  return (
    <main className="min-h-screen pb-20 px-4 bg-gradient-to-b from-[#0F1117] to-[#151824] selection:bg-emerald-500/30 selection:text-emerald-200 font-sans relative overflow-hidden">

      {/* Subtle Radial Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)]"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(52,211,153,0.06)_0%,transparent_70%)]"></div>
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(168,85,247,0.05)_0%,transparent_70%)]"></div>
      </div>

      <div className="relative z-10">

        {/* ═══════════════════════════════════════ */}
        {/* HEADER (same as homepage) */}
        {/* ═══════════════════════════════════════ */}
        <header className="flex flex-col md:flex-row justify-between items-center py-8 max-w-5xl mx-auto gap-4 relative">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/">
              <div className="relative w-32 h-10 md:w-40 md:h-12 cursor-pointer">
                <Image src="/logo-white.png" alt="IELTS4our Logo" fill className="object-contain object-center md:object-left" priority />
              </div>
            </Link>
            <div className="w-8 md:hidden"></div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {userProfile ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full mr-1">
                  <span className="text-yellow-400 text-sm">🪙</span>
                  <span className="text-slate-200 text-xs font-bold tabular-nums">{userProfile.token_balance || 0}</span>
                </div>
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-200 transition-all text-sm font-medium flex items-center gap-2"
                  >
                    {userProfile?.user_metadata?.avatar_url ? (
                      <div className="relative w-5 h-5 rounded-full overflow-hidden border border-slate-600">
                        <Image src={userProfile.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                      </div>
                    ) : (
                      <User className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="max-w-[80px] truncate">{userProfile.email?.split('@')[0]}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </motion.button>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-[#1A1D26] border border-slate-800 rounded-xl shadow-xl overflow-hidden py-1 z-50"
                      >
                        <Link href="/progress" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors">
                          <BarChart3 className="w-4 h-4 text-blue-400" /> My Progress
                        </Link>
                        <Link href="/mission" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors">
                          <BookOpen className="w-4 h-4 text-teal-400" /> Speaking Guide
                        </Link>
                        <div className="h-px bg-slate-800 my-1"></div>
                        <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-sm text-slate-400 hover:text-red-400 transition-colors text-left">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link href="/auth">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-300 hover:text-white transition-colors text-xs font-bold">Login</motion.button>
              </Link>
            )}
          </div>
        </header>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-[280px] bg-[#1A1D26] border-r border-slate-800 z-50 p-6 flex flex-col md:hidden">
                <div className="flex items-center justify-between mb-8">
                  <Link href="/">
                    <div className="relative w-28 h-8">
                      <Image src="/logo-white.png" alt="Logo" fill className="object-contain object-left" />
                    </div>
                  </Link>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 space-y-6 overflow-y-auto">
                  {userProfile ? (
                    <>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3 mb-3">
                          {userProfile?.user_metadata?.avatar_url ? (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-600">
                              <Image src={userProfile.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {userProfile.email?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-white truncate max-w-[140px]">{userProfile.email?.split('@')[0]}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                          <span className="text-xs text-slate-400">Balance</span>
                          <span className="text-sm font-bold text-yellow-400">{userProfile.token_balance || 0} Tokens</span>
                        </div>
                      </div>
                      <nav className="space-y-2">
                        <Link href="/progress" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-slate-300 hover:text-white transition-colors">
                          <BarChart3 className="w-5 h-5 text-blue-400" /> My Progress
                        </Link>
                        <Link href="/mission" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-slate-300 hover:text-white transition-colors">
                          <BookOpen className="w-5 h-5 text-teal-400" /> Speaking Guide
                        </Link>
                        <Link href="/faq" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-slate-300 hover:text-white transition-colors">
                          <BookOpen className="w-5 h-5 text-blue-400" /> FAQ
                        </Link>
                      </nav>
                    </>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 text-center mb-6">
                        <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                          <LogIn className="w-6 h-6" />
                        </div>
                        <h3 className="text-white font-bold mb-1">Guest User</h3>
                        <p className="text-slate-400 text-xs mb-4">Login to save progress & get 4 free tokens.</p>
                        <Link href="/auth">
                          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20">
                            Login / Register
                          </button>
                        </Link>
                      </div>
                      <nav className="space-y-2">
                        <Link href="/mission" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-slate-300 hover:text-white transition-colors">
                          <BookOpen className="w-5 h-5 text-teal-400" /> Speaking Guide
                        </Link>
                        <Link href="/faq" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-slate-300 hover:text-white transition-colors">
                          <BookOpen className="w-5 h-5 text-blue-400" /> FAQ
                        </Link>
                      </nav>
                    </div>
                  )}
                </div>
                {userProfile && (
                  <div className="pt-6 border-t border-slate-800">
                    <button onClick={handleLogoutClick} className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════ */}
        {/* BACK NAV */}
        {/* ═══════════════════════════════════════ */}
        <div className="max-w-3xl mx-auto pt-4 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group">
            <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Back to Home
          </Link>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* HERO SECTION (clean, all-white name) */}
        {/* ═══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">

            {/* Foto */}
            <div className="relative shrink-0 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-emerald-500/20 to-amber-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-3xl p-[2px] bg-gradient-to-br from-blue-500/40 via-emerald-500/40 to-amber-500/40">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-[#1A1D26] relative">
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
              {/* Status dot */}
              <div className="absolute -bottom-1 -right-1 flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1D26] border border-emerald-500/30 rounded-full shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Online</span>
              </div>
            </div>

            {/* Hero Text — ALL WHITE, CLEAN */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                  About <span className="text-emerald-400">/</span> Hello
                </p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#E6E8EE] mb-6 leading-[1.05] tracking-tight">
                  Hey, I'm Luthfi.
                </h1>
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-2 font-medium">
                  I make tools that I wish existed when I needed them.
                </p>
                <p className="text-lg md:text-xl text-slate-400 italic font-medium">
                  ielts4our is one of them.
                </p>
              </motion.div>

              {/* Social links — added LinkedIn */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3 justify-center md:justify-start mt-8"
              >
                <a
                  href="mailto:luthfibaihaqi851@gmail.com"
                  className="group p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/luthfimbaihaqi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com/luthfimbaihaqi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/luthfimbaihaqi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════ */}
        {/* 01 — THE STORY */}
        {/* ═══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <SectionHeader number="01" title="The Story" accent="blue" />

          <div className="space-y-6 text-slate-300 text-base md:text-lg leading-relaxed font-medium">
            <p>
              Let’s be real: IELTS prep is pricey. When I was looking for ways to practice, I realized how much of a barrier the cost can be for most students. I was looking at courses and thinking, there's gotta be a cheaper way.
            </p>
            <p>
              Since I’ve been coding for a while, So I figured, why not build my own?
            </p>
            <p>
              The first version was pretty basic, and I only shared it with a few friends at the office. They tested it, gave me a lot of feedback, and surprisingly, they kept coming back to use it. Word spread, and soon, people I didn't even know were asking for access.
            </p>
            <p className="text-[#E6E8EE] font-bold text-lg md:text-xl pt-2">
              It’s still a one-man show, but seeing students from all over the place use it to improve their scores is what keeps me going.
            </p>
          </div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════ */}
        {/* 02 — CURRENTLY (minimalist arrow list) */}
        {/* ═══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <SectionHeader number="02" title="Currently" accent="emerald" />

          <ul className="space-y-4">
            {[
              "Prepping for a master's degree abroad",
              "Juggling a 9-to-5 with side projects",
              "On a Murakami marathon, currently on Norwegian Wood",
              "Building this thing you're using right now",
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 group"
              >
                <span className="text-emerald-400 font-bold mt-0.5 group-hover:translate-x-1 transition-transform">
                  →
                </span>
                <span className="text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════ */}
        {/* 03 — THE STACK */}
        {/* ═══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <SectionHeader number="03" title="The Stack" accent="purple" />

          <p className="text-slate-400 mb-6 text-sm md:text-base">
            For the curious devs out there:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Next.js 16 + React 19", desc: "the framework", icon: <Code className="w-4 h-4" /> },
              { name: "Supabase", desc: "Postgres + Auth", icon: <Database className="w-4 h-4" /> },
              { name: "OpenAI GPT-4o", desc: "the brain behind scoring", icon: <Brain className="w-4 h-4" /> },
              { name: "Whisper API", desc: "turns your voice into text", icon: <Mic className="w-4 h-4" /> },
              { name: "Vercel", desc: "where all this lives", icon: <Cloud className="w-4 h-4" /> },
              { name: "Tailwind CSS", desc: "because writing CSS by hand is pain", icon: <Wind className="w-4 h-4" /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#1A1D26] border border-slate-800 hover:border-purple-500/30 rounded-2xl p-4 transition-all group cursor-default"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500/20 transition-colors mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-bold text-sm">
                      {item.name}
                    </p>
                    <p className="text-slate-500 text-xs italic mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════ */}
        {/* 04 — WHY IT'S FREE (KEEP AS-IS) */}
        {/* ═══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <SectionHeader number="04" title="IELTS4our is free (?)" accent="amber" />

          <div className="bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Coffee className="w-24 h-24 text-amber-400" />
            </div>
            <div className="relative space-y-5 text-slate-300 text-base md:text-lg leading-relaxed font-medium">
              <p>
                Look, I'm trying my best to keep ielts4our free for everyone. But servers cost money, and OpenAI doesn't accept <span className="italic text-amber-400">"thank you"</span> as payment.
              </p>
              <p>
                So here's the deal: most stuff is free. Detailed feedback unlocks with cheap tokens, like <span className="italic">really</span> cheap. The kind of cheap that won't make your wallet cry.
              </p>
              <p>
                If you wanna support so this thing grows bigger and helps more people prep IELTS without breaking the bank, well, you know where to find the buy button. <span className="text-amber-400">;)</span>
              </p>
            </div>
          </div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════ */}
        {/* 05 — COMING SOON (detailed cards w/ IELTS4OUR prefix) */}
        {/* ═══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <SectionHeader number="05" title="What's next?" accent="emerald" />

          <div className="space-y-4">
            {[
              {
                emoji: "📖",
                title: "IELTS4OUR Reading Practice",
                status: "In Progress",
                statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                desc: "Multi-passage reading with comprehension questions, time tracking, and instant band score for both Academic and General Training modules.",
                accent: "border-emerald-500/30 hover:border-emerald-500/50",
              },
              {
                emoji: "🎧",
                title: "IELTS4OUR Listening Practice",
                status: "In Progress",
                statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                desc: "Real audio with multiple accents, section-by-section practice, and detailed performance breakdown across all four parts.",
                accent: "border-blue-500/30 hover:border-blue-500/50",
              },
              {
                emoji: "📱",
                title: "IELTS4OUR Mobile App",
                status: "Exploring",
                statusColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                desc: "Native iOS and Android app for offline practice and seamless mobile experience. Let's see what happens ;)",
                accent: "border-purple-500/30 hover:border-purple-500/50",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-[#1A1D26] border ${item.accent} rounded-2xl p-5 md:p-6 transition-all cursor-default group`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl md:text-4xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className="text-[#E6E8EE] font-black text-base md:text-lg tracking-tight">
                        {item.title}
                      </h4>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════ */}
        {/* 06 — LET'S CONNECT (4-card grid w/ LinkedIn) */}
        {/* ═══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <SectionHeader number="06" title="Let's Connect" accent="blue" />

          <p className="text-slate-300 mb-6 text-base md:text-lg font-medium">
            I read every message. Sometimes I even reply quickly.
          </p>

          {/* 2x2 grid on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <a
              href="mailto:luthfibaihaqi851@gmail.com"
              className="bg-[#1A1D26] border border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 rounded-2xl p-5 transition-all group flex items-center gap-3"
            >
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Email</p>
                <p className="text-slate-200 font-bold text-sm truncate">luthfibaihaqi851<span className="text-slate-500">@gmail.com</span></p>
              </div>
            </a>

            <a
              href="https://www.linkedin.com/in/luthfimbaihaqi/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1A1D26] border border-slate-800 hover:border-blue-500/40 hover:bg-blue-500/5 rounded-2xl p-5 transition-all group flex items-center gap-3"
            >
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                <Linkedin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">LinkedIn</p>
                <p className="text-slate-200 font-bold text-sm truncate">@luthfimbaihaqi</p>
              </div>
            </a>

            <a
              href="https://twitter.com/luthfimbaihaqi"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1A1D26] border border-slate-800 hover:border-blue-400/40 hover:bg-blue-400/5 rounded-2xl p-5 transition-all group flex items-center gap-3"
            >
              <div className="p-2.5 bg-blue-400/10 border border-blue-400/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                <Twitter className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Twitter</p>
                <p className="text-slate-200 font-bold text-sm truncate">@luthfimbaihaqi</p>
              </div>
            </a>

            <a
              href="https://instagram.com/luthfimbaihaqi"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1A1D26] border border-slate-800 hover:border-pink-500/40 hover:bg-pink-500/5 rounded-2xl p-5 transition-all group flex items-center gap-3"
            >
              <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400 group-hover:scale-110 transition-transform">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Instagram</p>
                <p className="text-slate-200 font-bold text-sm truncate">@luthfimbaihaqi</p>
              </div>
            </a>
          </div>

          <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed">
            Whether it's feedback, complaints, weird ideas, or just to say hi, <span className="italic text-blue-400">slide in.</span>
          </p>
        </motion.section>

        {/* ═══════════════════════════════════════ */}
        {/* CTA: Back to Practice */}
        {/* ═══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mt-20 text-center"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full transition-all shadow-xl shadow-blue-500/20 text-sm md:text-base"
            >
              <span>Back to Practice</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* ═══════════════════════════════════════ */}
        {/* FOOTER (simple) */}
        {/* ═══════════════════════════════════════ */}
        <footer className="text-center mt-24 pt-8 border-t border-slate-800 max-w-3xl mx-auto">
          <p className="text-slate-500 text-xs md:text-sm">
            &copy; 2025 IELTS4our. Made with ❤️ in Indonesia.
          </p>
        </footer>

        {/* LOGOUT MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1A1D26] border border-slate-800 p-8 rounded-3xl max-w-sm text-center shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">Logout?</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">Are you sure you want to logout?</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">Cancel</button>
                <button onClick={confirmLogout} className="text-xs text-slate-500 hover:text-red-400 mt-2 transition-colors">Yes, logout</button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </main>
  );
}