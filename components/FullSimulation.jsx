"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Square, User, LogOut, Loader2, CheckCircle,
  Wifi, Headphones, XCircle, Zap, Clock, Volume2, PlayCircle, BellOff
} from "lucide-react";
import { useRouter } from "next/navigation";
import ScoreCard from "@/components/ScoreCard"; 

// 🔥 COMPONENT 1: REAL-TIME MIC VISUALIZER
const MicCheckVisualizer = ({ stream }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!stream || !canvasRef.current) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                // Bar styling (Blue to Teal gradient look)
                ctx.fillStyle = `rgb(${50}, ${150 + barHeight}, ${255})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 2;
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationRef.current);
            audioContext.close();
        };
    }, [stream]);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="bg-slate-900/50 rounded-lg p-2 border border-white/10">
                <canvas ref={canvasRef} width={100} height={40} className="w-24 h-10" />
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Mic Input</p>
        </div>
    );
};

// 🔥 COMPONENT 2: TUTORIAL OVERLAY (Dipisah agar State Audio aman)
const TutorialOverlay = ({ onClose, onStart, tokenCost, audioStream }) => {
    const [isPlayingSound, setIsPlayingSound] = useState(false);

    // LOGIKA AUDIO YANG AMAN (Stop-Lock-Clean)
    const handleTestSound = () => {
        if (isPlayingSound) return; // Cegah spam klik

        // 1. Stop antrian sebelumnya (PENTING)
        window.speechSynthesis.cancel();

        // 2. Lock UI
        setIsPlayingSound(true);

        const text = "This is a sound check. If you can hear this, your speaker is working perfectly.";
        const utterance = new SpeechSynthesisUtterance(text);

        // 3. Unlock saat selesai
        utterance.onend = () => setIsPlayingSound(false);
        utterance.onerror = () => setIsPlayingSound(false);

        window.speechSynthesis.speak(utterance);
    };

    // 4. Cleanup saat komponen ditutup/unmount (PENTING)
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white"
                >
                    <XCircle className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                        <Headphones className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Pre-Flight Check</h2>
                    <p className="text-slate-400 text-sm">Follow these instructions before we begin.</p>
                </div>

                {/* Mic & Speaker Check Section */}
                <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5 space-y-4">
                    {/* 1. MIC CHECK */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${audioStream ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 animate-pulse'}`}></div>
                            <span className="text-sm font-bold text-slate-300">Microphone</span>
                        </div>
                        <MicCheckVisualizer stream={audioStream} />
                    </div>

                    {/* 2. SPEAKER CHECK (FIXED) */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                             <span className="text-sm font-bold text-slate-300">Speaker Output</span>
                        </div>
                        <button 
                            onClick={handleTestSound}
                            disabled={isPlayingSound}
                            className={`px-3 py-1.5 text-xs font-bold text-white rounded-full flex items-center gap-2 transition-all ${
                                isPlayingSound 
                                ? "bg-slate-700 cursor-wait opacity-80" 
                                : "bg-white/10 hover:bg-white/20"
                            }`}
                        >
                            {isPlayingSound ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                            {isPlayingSound ? "Playing..." : "Test Sound"}
                        </button>
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-4 mb-8">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 bg-slate-800 p-1.5 rounded-lg"><Volume2 className="w-4 h-4 text-teal-400" /></div>
                        <div>
                            <h4 className="text-white font-bold text-sm">1. Listen Carefully</h4>
                            <p className="text-xs text-slate-400">The AI Examiner will ask you questions.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 bg-slate-800 p-1.5 rounded-lg"><Mic className="w-4 h-4 text-purple-400" /></div>
                        <div>
                            <h4 className="text-white font-bold text-sm">2. Record Your Answer</h4>
                            <p className="text-xs text-slate-400">Click the microphone button to start speaking.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 bg-slate-800 p-1.5 rounded-lg"><Square className="w-4 h-4 text-rose-400" /></div>
                        <div>
                            <h4 className="text-white font-bold text-sm">3. Stop to Send</h4>
                            <p className="text-xs text-slate-400">Click stop when finished. Do not remain silent.</p>
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <button 
                    onClick={onStart}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Start Exam Now</span>
                    <span className="bg-black/20 px-2 py-1 rounded text-xs text-blue-100 font-mono group-hover:bg-black/30">
                        -{tokenCost} Tokens
                    </span>
                    <PlayCircle className="w-5 h-5 ml-1" />
                </button>
                
                <p className="text-center text-[10px] text-slate-500 mt-4">
                    Tokens will be deducted immediately after clicking Start.
                </p>
            </div>
        </motion.div>
    );
};


// 🔥 PROP: mode ("full" | "quick")
export default function FullSimulation({ userProfile, mode = "full" }) {
  const router = useRouter();

  // --- CONFIG BASED ON MODE ---
  const TOKEN_COST = mode === "quick" ? 1 : 3;
  const TITLE = mode === "quick" ? "Quick Test Simulation" : "Full Speaking Simulation";
  const SUBTITLE = mode === "quick" ? "Interactive Part 3 Discussion" : "Complete IELTS Speaking Test";
  const DURATION_TEXT = mode === "quick" ? "3-5 Mins" : "10-15 Mins";

  // --- STATE UTAMA ---
  const [status, setStatus] = useState("idle"); 
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); 
  
  // --- STATE TUTORIAL ---
  const [showTutorial, setShowTutorial] = useState(false); 

  // --- STATE AUDIO & UI ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStarting, setIsStarting] = useState(false); 
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState(""); 
  
  // STATE CUE CARD & SCORE
  const [cueCardTopic, setCueCardTopic] = useState(""); 
  const [examResult, setExamResult] = useState(null); 
  
  const hasSavedRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const stopReasonRef = useRef("answer"); 
  
  // Stream Ref untuk Mic Check
  const [audioStream, setAudioStream] = useState(null);

  // --- TIMERS ---
  const [partTimer, setPartTimer] = useState(0); 
  const [showPartTimer, setShowPartTimer] = useState(false);
  const [globalTimer, setGlobalTimer] = useState(0); 
  const [isExamActive, setIsExamActive] = useState(false);

  // 1. SETUP MIC
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          setAudioStream(stream); // Simpan stream untuk visualizer mic check
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            audioChunksRef.current = [];
            handleSendAudio(audioBlob, stopReasonRef.current); 
            stopReasonRef.current = "answer";
          };
        })
        .catch((err) => {
          console.error("Mic Error:", err);
          alert("Microphone blocked. Please allow access.");
        });
    }
  }, [sessionId]); 

  // 2. GLOBAL TIMER (COUNT UP)
  useEffect(() => {
    let interval;
    if (isExamActive) {
        interval = setInterval(() => setGlobalTimer((prev) => prev + 1), 1000);
    } 
    return () => clearInterval(interval);
  }, [isExamActive]);

  // 3. PART TIMER
  useEffect(() => {
    let interval;
    if (showPartTimer && partTimer > 0) {
      interval = setInterval(() => setPartTimer((prev) => prev - 1), 1000);
    } else if (partTimer === 0 && showPartTimer) {
      handlePartTimerFinished();
    }
    return () => clearInterval(interval);
  }, [partTimer, showPartTimer]);

  // LOGIC SAAT TIMER LOKAL HABIS
  const handlePartTimerFinished = () => {
    if (status !== "part2_prep" && status !== "part2_speak") {
        setShowPartTimer(false);
        return;
    }

    if (status === "part2_prep") {
      setShowPartTimer(false);
      setStatus("part2_speak");
      setPartTimer(120); 
      setShowPartTimer(true);
      playSystemVoice("Time is up. Please start speaking.");
      setTimeout(() => { if (!isRecording) toggleRecording(); }, 1000);
    } 
    else if (status === "part2_speak") {
      setShowPartTimer(false);
      if (isRecording && mediaRecorderRef.current) {
        stopReasonRef.current = "timeout";
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else {
        handleSendAudio(null, "timeout");
      }
    }
  };

  const handleExamFinished = () => {
      setStatus("completed");
      setIsExamActive(false);
      setShowPartTimer(false);
  };

  // --- SAVE TO HISTORY FUNCTION ---
  const saveToHistory = async (finalScore, topicName) => {
      if (!userProfile || hasSavedRef.current) return;
      hasSavedRef.current = true; 

      try {
          const payload = {
              user_id: userProfile.id,
              topic: `${mode === 'quick' ? 'QUICK TEST' : 'FULL EXAM'}: ${topicName || "Topic"}`, 
              overall_score: finalScore.overall,
              fluency: finalScore.fluency,
              lexical: finalScore.lexical,
              grammar: finalScore.grammar,
              pronunciation: finalScore.pronunciation,
              full_feedback: finalScore 
          };

          const { error } = await supabase.from('practice_history').insert(payload);
          if (error) throw error;
          console.log("Exam saved to history!");
      } catch (err) {
          console.error("Failed to save history:", err);
      }
  };

  // 4. START SIMULATION (Called AFTER Tutorial)
  const startSimulation = async () => {
    // Hide Tutorial
    setShowTutorial(false);

    if (!userProfile) return router.push('/auth');
    
    if ((userProfile.token_balance || 0) < TOKEN_COST) {
      alert("Not enough tokens. Please top up to continue.");
      return;
    }

    setMessages([]);
    setTranscript("");
    setCueCardTopic(""); 
    setExamResult(null); 
    hasSavedRef.current = false; 
    setStatus("checking_token");

    try {
        const res = await fetch("/api/interview/start", {
            method: "POST",
            body: JSON.stringify({ 
                userId: userProfile.id,
                mode: mode 
            })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            if (res.status === 402) {
                alert("Insufficient tokens! Please top up your balance.");
                setStatus("idle");
                return;
            }
            throw new Error(data.error || "Failed to start session");
        }
        
        setSessionId(data.session_id);
        
        if (mode === 'quick') {
            setStatus("part3");
        } else {
            setStatus("part1");
        }

        setIsExamActive(true);
        setGlobalTimer(0);
        triggerIntro(data.session_id);

    } catch (err) {
        alert("Error: " + err.message);
        setStatus("idle");
    }
  };

  // 5. TRIGGER INTRO (DUAL MODE)
  const triggerIntro = async (id) => {
    setIsStarting(true); 
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", new Blob([new Uint8Array(10)], { type: 'audio/webm' }), "intro.webm");
    formData.append("session_id", id); 
    formData.append("action", mode === 'quick' ? "start_quick" : "start"); 

    try {
        const res = await fetch("/api/interview", { method: "POST", body: formData });
        const data = await res.json();
        
        setMessages([{ role: "assistant", content: data.text }]);
        
        if (mode === 'quick' && data.meta?.topic) {
            setCueCardTopic(data.meta.topic);
        }

        if (data.audio) {
            setAiSpeaking(true);
            const audio = new Audio(data.audio);
            audio.onended = () => { setAiSpeaking(false); setIsStarting(false); };
            audio.play();
        } else {
            setIsStarting(false);
        }
    } catch(e) {
        console.error(e);
        setIsStarting(false);
    } finally {
        setIsProcessing(false);
    }
  };

  // 6. CORE: SEND AUDIO & HANDLE RESPONSE
  const handleSendAudio = async (audioBlob, actionType = "answer") => {
    if (!sessionId) { alert("Session lost. Please restart."); return; }

    setIsProcessing(true);
    
    const formData = new FormData();
    if (audioBlob) formData.append("audio", audioBlob, "voice.webm");
    formData.append("session_id", sessionId);
    formData.append("action", actionType); 

    try {
      const res = await fetch("/api/interview", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error === "Exam finished" || data.meta?.isFinished) {
          const finalScore = data.score || data.meta?.score;
          if (finalScore) {
              setExamResult(finalScore);
              const topicToSave = cueCardTopic || data.meta?.topic || TITLE;
              saveToHistory(finalScore, topicToSave);
          }

          handleExamFinished();
          if (data.text) {
             setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
             if (data.audio) {
                 const audio = new Audio(data.audio);
                 audio.play();
             }
          }
          return; 
      }

      if (data.error) throw new Error(data.error);

      setTranscript(data.userTranscript);

      if (data.meta) {
          const { part, step, topic, isFinished, score } = data.meta;

          if (topic) setCueCardTopic(topic);
          
          if (score) {
              setExamResult(score);
              if (isFinished) saveToHistory(score, topic || cueCardTopic);
          }
          
          if (isFinished) handleExamFinished();
          
          if (part === 2 && step === 0 && status === "part1") {
              setStatus("part2_prep");
              setPartTimer(60); 
              setShowPartTimer(true);
          }
          if (part === 2 && step > 1) setShowPartTimer(false); 
          if (part === 3) {
              setStatus("part3");
              setShowPartTimer(false); 
          }
      }

      if (data.audio) {
        setAiSpeaking(true);
        const audio = new Audio(data.audio);
        audio.onended = () => {
          setAiSpeaking(false);
          if (data.meta) {
              if (data.meta.part === 1 && data.meta.step === 7) handleSendAudio(null, "auto_next");
              if (data.meta.part === 2 && data.meta.step === 3) handleSendAudio(null, "auto_next");
          }
        };
        audio.play();
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // UI Helpers
  const toggleRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (isRecording) {
      stopReasonRef.current = "answer"; 
      mediaRecorderRef.current.stop(); 
      setIsRecording(false);
    } else {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscript("");
    }
  };

  const playSystemVoice = (text) => {
     const utterance = new SpeechSynthesisUtterance(text);
     window.speechSynthesis.speak(utterance);
  };
  
  const formatTime = (s) => {
      const mins = Math.floor(s / 60);
      const secs = s % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const AudioVisualizer = () => (
    <div className="flex items-center gap-1 h-8">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                animate={{ height: [10, 24, 10] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                className="w-1.5 bg-red-500 rounded-full"
            />
        ))}
    </div>
  );

  // --- START SCREEN (DYNAMIC) ---
  const StartScreen = () => (
    <div className="absolute inset-0 bg-slate-950 z-30 flex flex-col overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto p-6 flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tighter text-white">IELTS <span className="text-blue-500">4OUR</span></h2>
            <button onClick={() => router.back()} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Exit</button>
        </div>

        <div className="flex-1 w-full max-w-5xl mx-auto p-6 pb-24 flex flex-col justify-center">
            
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    {TITLE}
                </h1>
                {/* DURATION INDICATOR */}
                <div className="flex items-center justify-center gap-2 text-slate-400 text-lg mb-8">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span>Est. Duration: <strong className="text-white">{DURATION_TEXT}</strong></span>
                </div>
                
                {mode === 'full' ? (
                    <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-400">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                            <span>Interview</span>
                        </div>
                        <div className="w-8 h-[1px] bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                            <span>Long Turn</span>
                        </div>
                        <div className="w-8 h-[1px] bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                            <span>Discussion</span>
                        </div>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-bold uppercase tracking-widest">
                        <Zap className="w-4 h-4" /> Instant Start Mode
                    </div>
                )}
            </div>

            {/* Info Grid (System Check & Tips) */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* System Check Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          System Check
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="mt-0.5"><Mic className="w-5 h-5 text-slate-500" /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-200">Microphone Access</p>
                                <p className="text-xs text-slate-400">Ensure your browser allows microphone input.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-0.5"><Wifi className="w-5 h-5 text-slate-500" /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-200">Stable Internet</p>
                                <p className="text-xs text-slate-400">Do not refresh the page during the test.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-0.5"><BellOff className="w-5 h-5 text-amber-500" /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-200">Do Not Disturb</p>
                                <p className="text-xs text-slate-400">Calls/Notifications may interrupt audio.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Exam Tips Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          Exam Tips
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex gap-3">
                            <div className="mt-0.5"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /></div>
                            <p className="text-slate-300"><strong className="text-white">Do elaborate.</strong> Give reasons and examples. Connect ideas with 'because', 'however', or 'for example'.</p>
                        </div>
                        <div className="flex gap-3">
                             <div className="mt-0.5"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /></div>
                             <p className="text-slate-300"><strong className="text-white">Avoid dead air.</strong> Use fillers like "Let me see..." if stuck.</p>
                        </div>
                        <div className="flex gap-3">
                             <div className="mt-0.5"><XCircle className="w-5 h-5 text-rose-500 shrink-0" /></div>
                             <p className="text-slate-300"><strong className="text-rose-400">Don't memorize.</strong> Be natural.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button 
                    onClick={() => setShowTutorial(true)} 
                    disabled={!userProfile || (userProfile.token_balance || 0) < TOKEN_COST}
                    className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                >
                    <span>Start {mode === 'quick' ? "Quick Test" : "Full Exam"}</span>
                </button>
                
                {(userProfile?.token_balance || 0) < TOKEN_COST && (
                    <p className="mt-3 text-rose-400 text-sm font-medium">Insufficient tokens. Please top up to start.</p>
                )}
                <p className="mt-2 text-slate-500 text-xs">
                    Current Balance: <span className="text-white font-bold">{userProfile?.token_balance || 0} Tokens</span>
                </p>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950 pointer-events-none" />

      {status === "idle" ? <StartScreen /> : (
        <>
            {/* Bagian Active Exam tetap sama */}
            <div className="flex justify-between items-center p-6 border-b border-white/5 z-10 bg-slate-900/50 backdrop-blur-md">
                {mode === 'quick' ? (
                     <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-blue-400">
                        <Zap className="w-4 h-4" /> Quick Test Mode
                     </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                        <span className={status === 'part1' ? "text-blue-400" : "text-slate-600"}>Part 1</span>
                        <span className="text-slate-700">•</span>
                        <span className={status.includes('part2') ? "text-blue-400" : "text-slate-600"}>Part 2</span>
                        <span className="text-slate-700">•</span>
                        <span className={status === 'part3' ? "text-blue-400" : "text-slate-600"}>Part 3</span>
                    </div>
                )}

                {isExamActive && (
                    <div className="font-mono text-xl font-bold text-slate-200 tracking-wider">
                        {formatTime(globalTimer)}
                    </div>
                )}

                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <LogOut className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative p-6 overflow-y-auto">
                {status !== "completed" && (
                    <div className={`relative transition-all duration-700 ${status.includes("part2") ? "opacity-20 scale-75 blur-sm" : "opacity-100 scale-100"}`}>
                        {aiSpeaking && (
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
                        )}
                        <div className={`absolute inset-0 bg-blue-500/10 rounded-full blur-3xl transition-opacity duration-500 ${aiSpeaking ? 'opacity-100' : 'opacity-0'}`} />
                        
                        <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full bg-slate-800 border-4 flex items-center justify-center relative z-10 transition-colors duration-300 ${aiSpeaking ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'border-slate-700'}`}>
                            <User className="w-24 h-24 text-slate-500" />
                        </div>
                        
                        <div className="mt-8 text-center h-6">
                            {aiSpeaking ? <p className="text-blue-400 text-sm font-medium animate-pulse tracking-wider">MR. PAUL IS SPEAKING...</p>
                            : isRecording ? <p className="text-red-500 text-sm font-medium animate-pulse tracking-wider">LISTENING...</p>
                            : isProcessing ? <p className="text-yellow-500 text-sm font-medium animate-pulse tracking-wider">THINKING...</p>
                            : <p className="text-slate-600 text-sm font-medium">YOUR TURN</p>}
                        </div>

                        {mode === 'quick' && cueCardTopic && (
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-16 w-full text-center"
                             >
                                <span className="px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Topic: {cueCardTopic}
                                </span>
                             </motion.div>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    {status.includes("part2") && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-30 flex items-center justify-center p-4"
                        >
                            <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl border-4 border-blue-600 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
                                <h3 className="text-xl font-bold mb-6 text-blue-700 uppercase tracking-widest border-b border-blue-100 pb-4">Part 2: Topic Card</h3>
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 min-h-[140px] flex items-center justify-center shadow-inner">
                                    <p className="text-xl font-medium leading-relaxed text-slate-800">
                                        {cueCardTopic || "Please listen to the Examiner..."}
                                    </p>
                                </div>
                                {showPartTimer && (
                                    <div className={`p-4 rounded-xl flex items-center justify-between px-8 transition-colors ${status === 'part2_speak' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                        <span className="text-xs font-bold uppercase tracking-wider">{status === 'part2_prep' ? "Prep Time" : "Speaking Time"}</span>
                                        <span className="text-3xl font-mono font-bold">{formatTime(partTimer)}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {status === "completed" && (
                    <div className="absolute inset-0 bg-slate-950 z-40 flex flex-col items-center justify-start pt-10 px-4 overflow-y-auto">
                        <div className="w-full max-w-3xl pb-20">
                            <div className="text-center mb-8">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-black text-white mb-2">Simulation Completed</h2>
                                <p className="text-slate-400">Great job! Here is your performance analysis.</p>
                            </div>
                            {examResult ? (
                                <ScoreCard 
                                    result={examResult} 
                                    cue={cueCardTopic || "Full Simulation"} 
                                    isPremiumExternal={true} 
                                    onOpenUpgradeModal={() => {}} 
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-2xl border border-white/10 animate-pulse">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                    <p className="text-slate-300 font-bold">Examiner is grading your test...</p>
                                    <p className="text-slate-500 text-sm mt-2">Generating feedback for {mode === 'quick' ? "Part 3 Discussion" : "Part 1, 2, and 3"}</p>
                                </div>
                            )}
                            <div className="mt-8 text-center">
                                <button onClick={() => router.push('/dashboard')} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-white/10">Back to Dashboard</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {status !== "completed" && (
                <div className="p-8 pb-12 flex flex-col items-center gap-8 relative z-10">
                    <div className="h-8 flex items-center justify-center w-full max-w-xs">
                        {isRecording ? <AudioVisualizer /> : isProcessing ? <Loader2 className="w-5 h-5 text-blue-400 animate-spin" /> : null}
                    </div>
                    {status !== "checking_token" && status !== "part2_prep" && (
                        <button
                            onClick={toggleRecording}
                            disabled={aiSpeaking || isProcessing || isStarting}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative group ${
                                isRecording ? "bg-red-500 scale-110 shadow-red-500/50" : (aiSpeaking || isProcessing || isStarting) ? "bg-slate-800 border border-slate-700 opacity-50 cursor-not-allowed" : "bg-white hover:bg-slate-200 text-slate-900 shadow-blue-500/20"
                            }`}
                        >
                            {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />}
                            {!isRecording && !aiSpeaking && !isProcessing && (
                                <span className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20" />
                            )}
                        </button>
                    )}
                </div>
            )}
        </>
      )}

      {/* RENDER TUTORIAL OVERLAY IF ACTIVE */}
      <AnimatePresence>
          {showTutorial && (
              <TutorialOverlay 
                  onClose={() => setShowTutorial(false)}
                  onStart={startSimulation}
                  tokenCost={TOKEN_COST}
                  audioStream={audioStream}
              />
          )}
      </AnimatePresence>
    </div>
  );
}