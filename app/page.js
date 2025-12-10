"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { motion } from "framer-motion";
import { BookOpen, Sparkles, RefreshCw, Crown, ArrowRight, Lock, BarChart3, ChevronRight, Mic2, Users, Volume2, Unlock } from "lucide-react";
import { supabase } from "@/utils/supabaseClient"; 
import Image from "next/image";
import { CUE_CARDS, PART3_TOPICS, GUILT_MESSAGES } from "@/utils/constants";
import MarketingSection from "@/components/MarketingSection";
import UpgradeModal from "@/components/UpgradeModal";
import AlertModal from "@/components/AlertModal"; 

import Recorder from "@/components/Recorder";
import ScoreCard from "@/components/ScoreCard";

export default function Home() {
  const router = useRouter(); 
  
  // --- REF UNTUK AUTO SCROLL ---
  const heroRef = useRef(null); 

  const [dailyCue, setDailyCue] = useState(CUE_CARDS[0]);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [isRotating, setIsRotating] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [freeQuota, setFreeQuota] = useState(0); 

  const [practiceMode, setPracticeMode] = useState("cue-card"); 
  const [part3Topic, setPart3Topic] = useState(PART3_TOPICS[0]);
  
  const [interviewQuestion, setInterviewQuestion] = useState(""); 
  const accumulatedScoresRef = useRef([]); 
  const [accumulatedScoresState, setAccumulatedScoresState] = useState([]); 
  
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  
  // MODALS STATE
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [guiltMessage, setGuiltMessage] = useState(GUILT_MESSAGES[0]);
  
  // STATE ALERT KEREN
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success", 
    title: "",
    message: "",
    actionLabel: "",
    onAction: null
  });
  
  const [userProfile, setUserProfile] = useState(null); 

  const randomizeCue = () => {
    setIsRotating(true);
    
    if (practiceMode === 'cue-card') {
        const maxIndex = isPremium ? CUE_CARDS.length : 30;
        const randomIndex = Math.floor(Math.random() * maxIndex);
        setDailyCue(CUE_CARDS[randomIndex]);
    } else {
        const randomIndex = Math.floor(Math.random() * PART3_TOPICS.length);
        const newTopic = PART3_TOPICS[randomIndex];
        setPart3Topic(newTopic);
        setInterviewQuestion(newTopic.startQ);
        
        accumulatedScoresRef.current = []; 
        setAccumulatedScoresState([]);     
        
        setAnalysisResult(null); 
    }

    setTimeout(() => setIsRotating(false), 500);
  };

  useEffect(() => {
    async function checkUserStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            setUserProfile(user);
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_premium, premium_expiry, free_mock_quota')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                const isStillValid = profile.is_premium && (profile.premium_expiry > Date.now());
                setIsPremium(isStillValid);
                setFreeQuota(profile.free_mock_quota || 0); 
            }
        } else {
            const expiryStr = localStorage.getItem("ielts4our_premium_expiry");
            if (expiryStr && Date.now() < parseInt(expiryStr)) {
                setIsPremium(true);
            } else {
                setIsPremium(false);
            }
        }
    }

    checkUserStatus();
  }, []);

  useEffect(() => {
      if (practiceMode === 'mock-interview') {
          setInterviewQuestion(part3Topic.startQ);
          accumulatedScoresRef.current = [];
          setAccumulatedScoresState([]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]); 

  useEffect(() => {
    if (analysisResult) {
      const resultSection = document.getElementById("result-section");
      if (resultSection) {
        setTimeout(() => {
          resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [analysisResult]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; 
        utterance.rate = 1.0; 
        utterance.onstart = () => setIsSpeakingAI(true);
        utterance.onend = () => setIsSpeakingAI(false);
        window.speechSynthesis.speak(utterance);
    }
  };

  const burnFreeQuota = async () => {
    if (userProfile && !isPremium && freeQuota > 0) {
        await supabase
            .from('profiles')
            .update({ free_mock_quota: 0 })
            .eq('id', userProfile.id);
        
        setFreeQuota(0);
    }
  };

  const handleAnalysisComplete = async (data) => {
    const todayStr = new Date().toDateString();
    
    // --- STREAK LOGIC ---
    const lastPracticeDate = localStorage.getItem("ielts4our_last_date");
    let currentStreak = parseInt(localStorage.getItem("ielts4our_streak") || "0");

    if (lastPracticeDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastPracticeDate === yesterday.toDateString()) currentStreak += 1;
      else currentStreak = 1; 
      localStorage.setItem("ielts4our_streak", currentStreak);
      localStorage.setItem("ielts4our_last_date", todayStr);
    }

    const saveData = async (finalResult) => {
        try {
            if (userProfile) {
                const { error } = await supabase.from('practice_history').insert({
                    user_id: userProfile.id,
                    topic: finalResult.topic,
                    overall_score: finalResult.overall,
                    fluency: finalResult.fluency,
                    lexical: finalResult.lexical,
                    grammar: finalResult.grammar,
                    pronunciation: finalResult.pronunciation,
                    full_feedback: finalResult
                });
            } else {
                const historyItem = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }), 
                    ...finalResult 
                };
                const existingHistory = JSON.parse(localStorage.getItem("ielts4our_history") || "[]");
                const updatedHistory = [...existingHistory, historyItem].slice(-30); 
                localStorage.setItem("ielts4our_history", JSON.stringify(updatedHistory));
            }
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    if (practiceMode === 'mock-interview') {
        accumulatedScoresRef.current.push(data);
        setAccumulatedScoresState([...accumulatedScoresRef.current]);

        const currentCount = accumulatedScoresRef.current.length;

        if (currentCount < 3) {
            if (data.nextQuestion) {
                setInterviewQuestion(data.nextQuestion);
            }
        } else {
            // --- FINAL RESULT PART 3 ---
            if (!isPremium) {
                await burnFreeQuota();
            }

            const allScores = accumulatedScoresRef.current; 
            const avgOverall = allScores.reduce((acc, curr) => acc + (curr.overall || 0), 0) / 3;
            const avgFluency = allScores.reduce((acc, curr) => acc + (curr.fluency || 0), 0) / 3;
            const avgLexical = allScores.reduce((acc, curr) => acc + (curr.lexical || 0), 0) / 3;
            const avgGrammar = allScores.reduce((acc, curr) => acc + (curr.grammar || 0), 0) / 3;
            const avgPronunc = allScores.reduce((acc, curr) => acc + (curr.pronunciation || 0), 0) / 3;

            const finalScore = Math.round(avgOverall * 2) / 2;

            let stitchedTranscript = "";
            let stitchedModelAnswer = "";

            allScores.forEach((round, index) => {
                stitchedTranscript += `❓ Q${index + 1}: ${round.transcript}\n\n`;
                if(round.modelAnswer) {
                    stitchedModelAnswer += `💡 Q${index + 1} Suggestion:\n${round.modelAnswer}\n\n`;
                }
            });

            const allGrammar = allScores.flatMap(s => s.grammarCorrection || []).slice(0, 5);

            const finalResult = {
                topic: `Mock Interview: ${part3Topic.topic}`,
                overall: finalScore,
                fluency: Math.round(avgFluency * 2) / 2,
                lexical: Math.round(avgLexical * 2) / 2,
                grammar: Math.round(avgGrammar * 2) / 2,
                pronunciation: Math.round(avgPronunc * 2) / 2,
                feedback: allScores[2].feedback, 
                improvement: allScores[2].improvement, 
                grammarCorrection: allGrammar,
                transcript: stitchedTranscript, 
                modelAnswer: stitchedModelAnswer 
            };

            setAnalysisResult(finalResult);
            saveData(finalResult); 
        }

    } else {
        setAnalysisResult(data);
        const resultToSave = {
            ...data,
            topic: data.topic || dailyCue.topic 
        };
        saveData(resultToSave);
    }
  };

  const handleLogoutClick = () => {
    const randomMsg = GUILT_MESSAGES[Math.floor(Math.random() * GUILT_MESSAGES.length)];
    setGuiltMessage(randomMsg);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const handleModeSwitch = (mode) => {
    if (mode === "mock-interview") {
        if (!userProfile) {
            setAlertConfig({
                isOpen: true,
                type: "lock",
                title: "Login Required",
                message: "Fitur ini khusus member. Login sekarang untuk mendapatkan akses 1x Free Trial Mock Interview.",
                actionLabel: "Login Sekarang",
                onAction: () => router.push("/auth") 
            });
            return;
        }

        if (!isPremium && freeQuota <= 0) {
            setShowUpgradeModal(true); 
            return;
        }

        if (!isPremium && freeQuota > 0) {
            setAlertConfig({
                isOpen: true,
                type: "success",
                title: "Free Trial Activated!",
                message: "Mode Mock Interview aktif! Kamu punya 1x kesempatan gratis. Manfaatkan sebaik mungkin ya!",
                actionLabel: "Let's Start!",
                onAction: null 
            });
        }
    }

    setPracticeMode(mode);
    setAnalysisResult(null); 
    
    accumulatedScoresRef.current = [];
    setAccumulatedScoresState([]);
    
    if (mode === "mock-interview") {
        setInterviewQuestion(part3Topic.startQ);
    }
  };

  // --- FUNGSI UNTUK MARKETING CLICK (AUTO SCROLL) ---
  const handleMarketingCardClick = (mode) => {
    handleModeSwitch(mode);
    // Scroll smooth ke Hero Section
    if (heroRef.current) {
        heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="min-h-screen pb-20 px-4 selection:bg-teal-500/30 selection:text-teal-200">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center py-8 max-w-5xl mx-auto gap-4">
        
        <div className="flex items-center gap-3">
          <div className="relative w-32 h-10 md:w-40 md:h-12">
             <Image 
               src="/logo-white.png"
               alt="IELTS4our Logo"
               fill
               className="object-contain object-center md:object-left"
               priority
             />
          </div>
          
          <Link href="/about" className="hidden md:block ml-2 text-sm font-medium text-slate-400 hover:text-white transition-colors tracking-wide">
            Meet the Creator
          </Link>

          {isPremium && (
            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-yellow-500/20">
              Pro
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/progress">
             <motion.div 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
               title="View Learning Progress"
             >
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold">My Progress</span>
             </motion.div>
          </Link>

          {userProfile ? (
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleLogoutClick}
               className="px-4 py-2.5 bg-teal-500/10 hover:bg-red-500/10 border border-teal-500/20 hover:border-red-500/20 rounded-full text-teal-300 hover:text-red-400 transition-all text-xs font-bold flex items-center gap-2"
               title="Click to Logout"
            >
                {userProfile.email?.split('@')[0]}
            </motion.button>
          ) : (
            <Link href="/auth">
                <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-300 hover:text-white transition-colors text-xs font-bold"
                >
                Login
                </motion.button>
            </Link>
          )}

          {!isPremium && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpgradeModal(true)}
              className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-medium rounded-full text-sm flex items-center gap-2 transition-all shadow-lg"
            >
              <Crown className="w-4 h-4 text-yellow-400" />
              Upgrade Pro
            </motion.button>
          )}
        </div>
      </header>

      {/* HERO SECTION (Diberi REF untuk scroll target) */}
      <div ref={heroRef} className="text-center max-w-3xl mx-auto mt-6 mb-12 scroll-mt-24">
        <div className="md:hidden mb-6">
           <Link href="/about" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-0.5 hover:border-white transition-all">
             ✨ Meet the Creator <ChevronRight className="w-3 h-3" />
           </Link>
        </div>

        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-widest mb-6"
        >
          <Sparkles className="w-3 h-3" />
          {isPremium ? "Premium Mode Unlocked" : "Daily Speaking Practice"}
        </motion.div>
        
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
          Master Your Speaking <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-purple-200">
            With IELTS4OUR
          </span>
        </h2>
        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
          {isPremium 
            ? "Nikmati akses tanpa batas, durasi lebih panjang, dan jawaban Band 8.0."
            : "Latihan setiap hari, dapatkan skor instan, dan perbaiki grammar secara otomatis."}
        </p>
      </div>

      {/* UI TAB SWITCHER */}
      <div className="max-w-xs mx-auto mb-8 bg-slate-900/50 backdrop-blur-md p-1 rounded-full border border-white/10 flex relative shadow-inner">
         <button 
            onClick={() => handleModeSwitch("cue-card")}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "cue-card" ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-slate-500 hover:text-slate-300"}`}
         >
            <Mic2 className="w-3.5 h-3.5" />
            Cue Card Practice
         </button>
         <button 
            onClick={() => handleModeSwitch("mock-interview")}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${practiceMode === "mock-interview" ? "bg-teal-500/20 text-teal-300 shadow-lg border border-teal-500/30" : "text-slate-500 hover:text-slate-300"}`}
         >
            <Users className="w-3.5 h-3.5" />
            Mock Interview
            {/* Logic Ikon Gembok / Buka Gembok */}
            {!isPremium && (
                <>
                  {userProfile && freeQuota > 0 ? (
                    <span className="ml-1 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">1x Free</span>
                  ) : (
                    <Lock className="w-3 h-3 text-yellow-500 ml-1" />
                  )}
                </>
            )}
         </button>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          <div className={`absolute -inset-1 bg-gradient-to-r ${practiceMode === 'cue-card' ? 'from-teal-500 to-purple-600' : 'from-blue-500 to-teal-400'} rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}></div>
          
          <div className="relative glass-panel rounded-[2rem] p-8 md:p-12 overflow-hidden min-h-[500px] flex flex-col justify-center">
              
              {/* MODE 1: CUE CARD */}
              {practiceMode === "cue-card" && !analysisResult && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                            {CUE_CARDS.indexOf(dailyCue) >= 30 ? <Crown className="w-6 h-6 text-yellow-400" /> : <BookOpen className="w-6 h-6 text-teal-400" />}
                        </div>
                        <div>
                            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                            {CUE_CARDS.indexOf(dailyCue) >= 30 ? "Premium Topic" : "Todays Topic"}
                            </h3>
                            <div className="text-white font-bold flex items-center gap-2">
                            IELTS Cue Card
                            </div>
                        </div>
                        </div>
                        <button onClick={randomizeCue} className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all group" title="Ganti Soal"><RefreshCw className={`w-5 h-5 ${isRotating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} /></button>
                    </div>
                    <div className="text-center mb-10">
                        <p className="text-2xl md:text-4xl font-bold text-white leading-tight mb-8">"{dailyCue.topic}"</p>
                        <div className="inline-block text-left bg-black/20 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                           <p className="text-teal-400 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2"><ArrowRight className="w-4 h-4" /> You can say:</p>
                           <ul className="space-y-3">{dailyCue.points?.map((point, index) => (<li key={index} className="flex items-start gap-3 text-slate-300 text-sm md:text-base"><span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 shrink-0"></span>{point}</li>))}</ul>
                        </div>
                    </div>
                    <Recorder cueCard={dailyCue.topic} onAnalysisComplete={handleAnalysisComplete} maxDuration={isPremium ? 120 : 60} mode={practiceMode} />
                 </motion.div>
              )}

              {/* MODE 2: MOCK INTERVIEW */}
              {practiceMode === "mock-interview" && !analysisResult && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                        <div>
                           <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest text-left">Discussion Topic</h3>
                           <h2 className="text-xl md:text-2xl font-bold text-white text-left">{part3Topic.topic}</h2>
                        </div>
                        <button onClick={randomizeCue} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all group" title="Ganti Topik"><RefreshCw className={`w-5 h-5 ${isRotating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} /></button>
                    </div>
                    
                    <div className="flex justify-center gap-2 mb-6 items-center">
                        <span className="text-xs text-slate-400 mr-2 uppercase font-bold tracking-wider">Question {accumulatedScoresState.length + 1} of 3</span>
                        {[0, 1, 2].map(step => (
                            <div key={step} className={`h-2 w-8 rounded-full transition-all ${accumulatedScoresState.length >= step ? 'bg-teal-400' : 'bg-white/10'}`}></div>
                        ))}
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 max-w-lg mx-auto mb-10 text-left relative transition-all min-h-[120px] flex flex-col justify-center">
                        <div className="absolute -top-3 left-6 px-2 bg-slate-900 text-teal-400 text-[10px] font-bold uppercase tracking-wider border border-white/10 rounded flex items-center gap-1">AI Examiner</div>
                        <div className="flex gap-4 items-start">
                            <p className="text-lg text-slate-200 italic leading-relaxed flex-1">"{interviewQuestion}"</p>
                            <button 
                                onClick={() => speakText(interviewQuestion)}
                                className="p-2 rounded-full bg-white/5 hover:bg-teal-500/20 text-slate-400 hover:text-teal-400 transition-all shrink-0 border border-white/10"
                                title="Play Audio"
                            >
                                {isSpeakingAI ? <Volume2 className="w-5 h-5 animate-pulse text-teal-400"/> : <Volume2 className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    <Recorder cueCard={part3Topic.topic} onAnalysisComplete={handleAnalysisComplete} maxDuration={60} mode={practiceMode} />
                 </motion.div>
              )}

              {/* RESULT / SCORECARD */}
              {analysisResult && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Analysis Result</h2>
                        <button 
                            onClick={() => { 
                                setAnalysisResult(null); 
                                accumulatedScoresRef.current = []; 
                                setAccumulatedScoresState([]);     
                                handleModeSwitch(practiceMode); 
                            }} 
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white font-bold transition-all"
                        >
                            Try Another Topic
                        </button>
                    </div>
                    <ScoreCard 
                        result={analysisResult} 
                        cue={analysisResult.topic || dailyCue.topic} 
                        isPremiumExternal={isPremium}
                        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                    />
                 </motion.div>
              )}

          </div>
        </motion.div>
      </div>
      
      {/* MODAL PEMBAYARAN */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        userProfile={userProfile}
        onUpgradeSuccess={() => {
            setIsPremium(true);
            setShowUpgradeModal(false);
            randomizeCue();
        }}
      />

      {/* ALERT MODAL */}
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        {...alertConfig}
      />

      {/* GUILT TRIP MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl relative"
            >
                <div className="text-6xl mb-4 animate-bounce">{guiltMessage.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{guiltMessage.title}</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    {guiltMessage.text}
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => setShowLogoutModal(false)}
                        className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-teal-500/20"
                    >
                        NO, I WANT BAND 8.0!
                    </button>
                    <button 
                        onClick={confirmLogout}
                        className="text-xs text-slate-500 hover:text-red-400 mt-2 transition-colors"
                    >
                        I give up, let me sleep...
                    </button>
                </div>
            </motion.div>
        </div>
      )}

      {/* --- MARKETING SECTION (Dengan Props onSelectMode) --- */}
      <MarketingSection onSelectMode={handleMarketingCardClick} />

      <footer className="text-center mt-24 pb-10 text-slate-600 text-xs md:text-sm">
        <p className="mb-4">&copy; 2025 Ielts4our. Created with ❤️ by <Link href="/about" className="hover:text-teal-400 transition-colors">Luthfi Baihaqi</Link>.</p>
      </footer>
    </main>
  );
}