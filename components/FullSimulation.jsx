"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Square, User, LogOut, Loader2, CheckCircle,
  Wifi, Headphones, XCircle, Zap, Clock, Volume2, PlayCircle, BellOff, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient"; 
import ScoreCard from "@/components/ScoreCard"; 
import VoiceSelectionModal from "@/components/VoiceSelectionModal";

const VOICE_DISPLAY_NAMES = {
  paul: 'PAUL',
  billie: 'BILLIE',
  taylor: 'TAYLOR'
};

// MIC CHECK VISUALIZER
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
                const r = 209;
                const g = 122 + Math.floor(barHeight * 0.3);
                const b = 92;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
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
            <div className="bg-[#F8F5EE] rounded-lg p-2 border border-[#1A1A1A]/10">
                <canvas ref={canvasRef} width={100} height={40} className="w-24 h-10" />
            </div>
            <p className="text-[10px] text-[#525252] uppercase tracking-wider font-bold">Mic Input</p>
        </div>
    );
};

// TUTORIAL OVERLAY
const TutorialOverlay = ({ onClose, onStart, tokenCost, audioStream }) => {
    const [isPlayingSound, setIsPlayingSound] = useState(false);

    const handleTestSound = () => {
        if (isPlayingSound) return; 

        window.speechSynthesis.cancel();
        setIsPlayingSound(true);

        const text = "This is a sound check. If you can hear this, your speaker is working perfectly.";
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onend = () => setIsPlayingSound(false);
        utterance.onerror = () => setIsPlayingSound(false);

        window.speechSynthesis.speak(utterance);
    };

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
            className="absolute inset-0 z-50 bg-[#1A1A1A]/40 backdrop-blur-md flex items-center justify-center p-4"
        >
            <div className="bg-[#FAF6EC] border border-[#1A1A1A]/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#525252] hover:text-[#1A1A1A]"
                >
                    <XCircle className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#4A6B8F]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4A6B8F]/20">
                        <Headphones className="w-8 h-8 text-[#4A6B8F]" />
                    </div>
                    <h2 className="text-2xl font-black text-[#1A1A1A] mb-2 font-display">Pre-Flight Check</h2>
                    <p className="text-[#525252] text-sm">Follow these instructions before we begin.</p>
                </div>

                <div className="bg-[#F8F5EE] rounded-xl p-4 mb-6 border border-[#1A1A1A]/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${audioStream ? 'bg-[#8FA68E] shadow-[0_0_10px_rgba(143,166,142,0.5)]' : 'bg-[#D17A5C] animate-pulse'}`}></div>
                            <span className="text-sm font-bold text-[#1A1A1A]">Microphone</span>
                        </div>
                        <MicCheckVisualizer stream={audioStream} />
                    </div>

                    <div className="flex items-center justify-between border-t border-[#1A1A1A]/10 pt-4">
                        <div className="flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full bg-[#4A6B8F] shadow-[0_0_10px_rgba(74,107,143,0.5)]"></div>
                             <span className="text-sm font-bold text-[#1A1A1A]">Speaker Output</span>
                        </div>
                        <button 
                            onClick={handleTestSound}
                            disabled={isPlayingSound}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-2 transition-all ${
                                isPlayingSound 
                                ? "bg-[#1A1A1A]/10 text-[#525252] cursor-wait opacity-80" 
                                : "bg-[#1A1A1A]/10 hover:bg-[#1A1A1A]/20 text-[#1A1A1A]"
                            }`}
                        >
                            {isPlayingSound ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                            {isPlayingSound ? "Playing..." : "Test Sound"}
                        </button>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 bg-[#F8F5EE] border border-[#1A1A1A]/10 p-1.5 rounded-lg"><Volume2 className="w-4 h-4 text-[#8FA68E]" /></div>
                        <div>
                            <h4 className="text-[#1A1A1A] font-bold text-sm">1. Listen Carefully</h4>
                            <p className="text-xs text-[#525252]">The AI Examiner will ask you questions.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 bg-[#F8F5EE] border border-[#1A1A1A]/10 p-1.5 rounded-lg"><Mic className="w-4 h-4 text-[#4A6B8F]" /></div>
                        <div>
                            <h4 className="text-[#1A1A1A] font-bold text-sm">2. Record Your Answer</h4>
                            <p className="text-xs text-[#525252]">Click the microphone button to start speaking.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 bg-[#F8F5EE] border border-[#1A1A1A]/10 p-1.5 rounded-lg"><Square className="w-4 h-4 text-[#D17A5C]" /></div>
                        <div>
                            <h4 className="text-[#1A1A1A] font-bold text-sm">3. Stop to Send</h4>
                            <p className="text-xs text-[#525252]">Click stop when finished. Do not remain silent.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 bg-[#F8F5EE] border border-[#1A1A1A]/10 p-1.5 rounded-lg"><RefreshCw className="w-4 h-4 text-[#C9974C]" /></div>
                        <div>
                            <h4 className="text-[#1A1A1A] font-bold text-sm">4. Need to Hear Again?</h4>
                            <p className="text-xs text-[#525252]">Say <span className="font-semibold text-[#1A1A1A]">"Can you repeat the question?"</span> or <span className="font-semibold text-[#1A1A1A]">"Pardon?"</span> and the examiner will repeat.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onStart}
                    className="w-full py-4 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Start Exam Now</span>
                    <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/80 font-mono group-hover:bg-white/20">
                        -{tokenCost} Tokens
                    </span>
                    <PlayCircle className="w-5 h-5 ml-1" />
                </button>
                
                <p className="text-center text-[10px] text-[#525252] mt-4">
                    Tokens will be deducted immediately after clicking Start.
                </p>
            </div>
        </motion.div>
    );
};


// MAIN EXAM COMPONENT
export default function FullSimulation({ userProfile, mode = "full" }) {
  const router = useRouter();

  const TOKEN_COST = mode === "quick" ? 1 : 3;
  const TITLE = mode === "quick" ? "Quick Test Simulation" : "Full Speaking Simulation";
  const DURATION_TEXT = mode === "quick" ? "3-5 Mins" : "10-15 Mins";

  const [status, setStatus] = useState("idle"); 
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); 
  
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  
  const [showTutorial, setShowTutorial] = useState(false); 

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStarting, setIsStarting] = useState(false); 
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState(""); 
  
  const [cueCardTopic, setCueCardTopic] = useState(""); 
  const [cueCardSubpoints, setCueCardSubpoints] = useState([]);
  const [examResult, setExamResult] = useState(null); 
  
  const hasSavedRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const stopReasonRef = useRef("answer"); 
  const activeAudioRef = useRef(null);
  
  const [audioStream, setAudioStream] = useState(null);

  const [partTimer, setPartTimer] = useState(0); 
  const [showPartTimer, setShowPartTimer] = useState(false);
  const [globalTimer, setGlobalTimer] = useState(0); 
  const [isExamActive, setIsExamActive] = useState(false);

  const pendingPart2Ref = useRef(false);

  const getExaminerDisplayName = () => {
    return VOICE_DISPLAY_NAMES[selectedVoice] || 'EXAMINER';
  };

  // 1. SETUP MIC
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          setAudioStream(stream); 
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

  // 2. GLOBAL TIMER
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

  // MASTER DEFENSE
  useEffect(() => {
    if (!isExamActive) return;

    const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    window.history.pushState(null, '', window.location.href);
    const handlePopState = (e) => {
        const confirmLeave = window.confirm("Are you sure you want to leave? Your exam will be cancelled and tokens will be lost.");
        if (!confirmLeave) {
            window.history.pushState(null, '', window.location.href);
        } else {
            window.history.back(); 
        }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
        
        window.speechSynthesis.cancel(); 
        if (activeAudioRef.current) {
            activeAudioRef.current.pause(); 
            activeAudioRef.current.src = "";
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop(); 
        }
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop()); 
        }
    };
  }, [isExamActive, audioStream]);

  const handlePartTimerFinished = () => {
    if (status !== "part2_prep" && status !== "part2_speak") {
        setShowPartTimer(false);
        return;
    }

    if (status === "part2_prep") {
      setShowPartTimer(false);
      setStatus("part2_speak"); 
      setIsProcessing(true);
      
      playSystemVoice("Alright, your one minute preparation time is up. Please start speaking for 1 to 2 minutes.", () => {
          setIsProcessing(false);
          setPartTimer(120); 
          setShowPartTimer(true);
          if (!isRecording) toggleRecording(); 
      });
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
      } catch (err) {
          console.error("Failed to save history:", err);
      }
  };

  const activatePart2 = () => {
      pendingPart2Ref.current = false;
      setStatus("part2_prep");
      setPartTimer(60);
      setShowPartTimer(true);
  };

  const handleStartClick = () => {
    if (!userProfile) return router.push('/auth');
    
    if ((userProfile.token_balance || 0) < TOKEN_COST) {
      alert("Not enough tokens. Please top up to continue.");
      return;
    }

    setShowVoiceModal(true);
  };

  const handleVoiceSelected = (voiceId) => {
    setSelectedVoice(voiceId);
    setShowVoiceModal(false);
    setShowTutorial(true);
  };

  const handleVoiceModalClose = () => {
    setShowVoiceModal(false);
    setSelectedVoice(null);
  };

  const startSimulation = async () => {
    setShowTutorial(false);

    if (!userProfile) return router.push('/auth');
    
    if ((userProfile.token_balance || 0) < TOKEN_COST) {
      alert("Not enough tokens. Please top up to continue.");
      return;
    }

    setMessages([]);
    setTranscript("");
    setCueCardTopic(""); 
    setCueCardSubpoints([]);
    setExamResult(null); 
    hasSavedRef.current = false; 
    setStatus("checking_token");

    try {
        const res = await fetch("/api/interview/start", {
            method: "POST",
            body: JSON.stringify({ 
                userId: userProfile.id, 
                mode: mode,
                voice_choice: selectedVoice
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
        
        const newSessionId = data.session_id;
        setSessionId(newSessionId);
        
        if (mode === 'quick') {
            setStatus("part3");
        } else {
            setStatus("part1");
        }

        setIsExamActive(true);
        setGlobalTimer(0);
        triggerIntro(newSessionId);

    } catch (err) {
        console.error("Start Error:", err);
        alert("Error: " + err.message);
        setStatus("idle");
    }
  };

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
          activeAudioRef.current = new Audio(data.audio);
          activeAudioRef.current.onended = () => {
            setAiSpeaking(false);
            setIsStarting(false); 
          };
          activeAudioRef.current.play();
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
                  activeAudioRef.current = new Audio(data.audio);
                  activeAudioRef.current.play();
              }
          }
          return; 
      }

      if (data.error) throw new Error(data.error);

      setTranscript(data.userTranscript);

      if (data.meta) {
          const { part, step, topic, isFinished, score } = data.meta;

          if (topic) setCueCardTopic(topic);
          if (data.meta?.p2_subpoints) setCueCardSubpoints(data.meta.p2_subpoints);
          
          if (score) {
              setExamResult(score);
              if (isFinished) saveToHistory(score, topic || cueCardTopic);
          }
          
          if (isFinished) handleExamFinished();
          
          if (part === 2 && step === 0) {
              pendingPart2Ref.current = true;
          }
          if (part === 2 && step > 1) setShowPartTimer(false); 
          if (part === 3) {
              setStatus("part3");
              setShowPartTimer(false); 
          }
      }

      if (data.audio) {
        setAiSpeaking(true);
        activeAudioRef.current = new Audio(data.audio);
        activeAudioRef.current.onended = () => {
          setAiSpeaking(false);
          if (pendingPart2Ref.current) {
              activatePart2();
          }
        };
        activeAudioRef.current.play();
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const playSystemVoice = (text, callback = null) => {
     window.speechSynthesis.cancel(); 
     const utterance = new SpeechSynthesisUtterance(text);
     if (callback) {
         utterance.onend = callback;
         utterance.onerror = callback; 
     }
     window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    if (isRecording) {
      if (status === "part2_speak" && partTimer > 60) {
          if (mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.pause();
          }
          setIsProcessing(true); 
          
          playSystemVoice("You still have time. Please tell me more about it.", () => {
              setIsProcessing(false);
              if (mediaRecorderRef.current.state === "paused") {
                  mediaRecorderRef.current.resume();
              }
          });
          return; 
      }

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
                className="w-1.5 bg-[#D17A5C] rounded-full"
            />
        ))}
    </div>
  );

  // Determine if repeat hint should show (YOUR TURN state, not Part 2 prep/speak)
  const showRepeatHint = !aiSpeaking && !isRecording && !isProcessing && !isStarting && status !== "part2_prep" && status !== "part2_speak" && status !== "checking_token" && status !== "completed";

  // START SCREEN
  const StartScreen = () => (
    <div className="absolute inset-0 bg-[#F8F5EE] z-30 flex flex-col overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto p-6 flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tighter text-[#1A1A1A] font-display">IELTS <span className="text-[#D17A5C]">4OUR</span></h2>
            <button onClick={() => router.back()} className="text-sm font-medium text-[#525252] hover:text-[#1A1A1A] transition-colors">Exit</button>
        </div>

        <div className="flex-1 w-full max-w-5xl mx-auto p-6 pb-24 flex flex-col justify-center">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-4 tracking-tight font-display">
                    {TITLE}
                </h1>
                <div className="flex items-center justify-center gap-2 text-[#525252] text-lg mb-8">
                    <Clock className="w-5 h-5 text-[#4A6B8F]" />
                    <span>Est. Duration: <strong className="text-[#1A1A1A]">{DURATION_TEXT}</strong></span>
                </div>
                
                {mode === 'full' ? (
                    <div className="flex items-center justify-center gap-4 text-sm font-medium text-[#525252]">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold">1</span>
                            <span>Interview</span>
                        </div>
                        <div className="w-8 h-[1px] bg-[#1A1A1A]/20"></div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold">2</span>
                            <span>Long Turn</span>
                        </div>
                        <div className="w-8 h-[1px] bg-[#1A1A1A]/20"></div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold">3</span>
                            <span>Discussion</span>
                        </div>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D17A5C]/10 border border-[#D17A5C]/20 text-[#D17A5C] text-sm font-bold uppercase tracking-widest">
                        <Zap className="w-4 h-4" /> Instant Start Mode
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2 font-display">
                          System Check
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="mt-0.5"><Mic className="w-5 h-5 text-[#525252]" /></div>
                            <div>
                                <p className="text-sm font-bold text-[#1A1A1A]">Microphone Access</p>
                                <p className="text-xs text-[#525252]">Ensure your browser allows microphone input.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-0.5"><Wifi className="w-5 h-5 text-[#525252]" /></div>
                            <div>
                                <p className="text-sm font-bold text-[#1A1A1A]">Stable Internet</p>
                                <p className="text-xs text-[#525252]">Do not refresh the page during the test.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-0.5"><BellOff className="w-5 h-5 text-[#C9974C]" /></div>
                            <div>
                                <p className="text-sm font-bold text-[#1A1A1A]">Do Not Disturb</p>
                                <p className="text-xs text-[#525252]">Calls/Notifications may interrupt audio.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2 font-display">
                          Exam Tips
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex gap-3">
                            <div className="mt-0.5"><CheckCircle className="w-5 h-5 text-[#8FA68E] shrink-0" /></div>
                            <p className="text-[#525252]"><strong className="text-[#1A1A1A]">Do elaborate.</strong> Give reasons and examples. Connect ideas with 'because', 'however', or 'for example'.</p>
                        </div>
                        <div className="flex gap-3">
                             <div className="mt-0.5"><CheckCircle className="w-5 h-5 text-[#8FA68E] shrink-0" /></div>
                             <p className="text-[#525252]"><strong className="text-[#1A1A1A]">Avoid dead air.</strong> Use fillers like "Let me see..." if stuck.</p>
                        </div>
                        <div className="flex gap-3">
                             <div className="mt-0.5"><XCircle className="w-5 h-5 text-[#D17A5C] shrink-0" /></div>
                             <p className="text-[#525252]"><strong className="text-[#D17A5C]">Don't memorize.</strong> Be natural.</p>
                        </div>
                        <div className="flex gap-3">
                             <div className="mt-0.5"><RefreshCw className="w-5 h-5 text-[#C9974C] shrink-0" /></div>
                             <p className="text-[#525252]"><strong className="text-[#1A1A1A]">Missed the question?</strong> Say "Can you repeat?" and the examiner will repeat it.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button 
                    onClick={handleStartClick} 
                    disabled={!userProfile || (userProfile.token_balance || 0) < TOKEN_COST}
                    className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#1A1A1A] hover:bg-black text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    <span>Start {mode === 'quick' ? "Quick Test" : "Full Exam"}</span>
                </button>
                
                {(userProfile?.token_balance || 0) < TOKEN_COST && (
                    <p className="mt-3 text-[#D17A5C] text-sm font-medium">Insufficient tokens. Please top up to start.</p>
                )}
                <p className="mt-2 text-[#525252] text-xs">
                    Current Balance: <span className="text-[#1A1A1A] font-bold">{userProfile?.token_balance || 0} Tokens</span>
                </p>
            </div>
        </div>
    </div>
  );

  const isMicLocked = aiSpeaking || isProcessing || isStarting || status === "part2_prep";

  return (
    <div className="flex flex-col h-screen bg-[#F8F5EE] text-[#1A1A1A] overflow-hidden relative">

      {status === "idle" ? <StartScreen /> : (
        <>
            {/* EXAM HEADER */}
            <div className="flex justify-between items-center p-6 border-b border-[#1A1A1A]/10 z-10 bg-[#FAF6EC]">
                {mode === 'quick' ? (
                      <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#D17A5C]">
                        <Zap className="w-4 h-4" /> Quick Test Mode
                      </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                        <span className={status === 'part1' ? "text-[#D17A5C]" : "text-[#1A1A1A]/30"}>Part 1</span>
                        <span className="text-[#1A1A1A]/20">•</span>
                        <span className={status.includes('part2') ? "text-[#D17A5C]" : "text-[#1A1A1A]/30"}>Part 2</span>
                        <span className="text-[#1A1A1A]/20">•</span>
                        <span className={status === 'part3' ? "text-[#D17A5C]" : "text-[#1A1A1A]/30"}>Part 3</span>
                    </div>
                )}

                {isExamActive && (
                    <div className="font-mono text-xl font-bold text-[#1A1A1A] tracking-wider">
                        {formatTime(globalTimer)}
                    </div>
                )}

                <button onClick={() => router.back()} className="p-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors">
                    <LogOut className="w-5 h-5 text-[#525252] hover:text-[#1A1A1A]" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative p-6 overflow-y-auto">
                
                {status === "checking_token" && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-[#D17A5C] animate-spin" />
                        <p className="text-[#525252] text-sm font-medium animate-pulse tracking-wider">Connecting to Examiner...</p>
                    </div>
                )}

                {status !== "completed" && status !== "checking_token" && (
                    <div className={`relative transition-all duration-700 ${status.includes("part2") ? "opacity-20 scale-75 blur-sm" : "opacity-100 scale-100"}`}>
                        {aiSpeaking && (
                            <div className="absolute inset-0 rounded-full border-4 border-[#4A6B8F]/30 animate-ping" />
                        )}
                        <div className={`absolute inset-0 bg-[#4A6B8F]/10 rounded-full blur-3xl transition-opacity duration-500 ${aiSpeaking ? 'opacity-100' : 'opacity-0'}`} />
                        
                        <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#FAF6EC] border-4 flex items-center justify-center relative z-10 transition-colors duration-300 shadow-lg ${aiSpeaking ? 'border-[#4A6B8F] shadow-[0_0_30px_rgba(74,107,143,0.3)]' : 'border-[#1A1A1A]/15'}`}>
                            <User className="w-24 h-24 text-[#1A1A1A]/20" />
                        </div>
                        
                        <div className="mt-8 text-center flex flex-col items-center justify-start">
                            {status === "part2_prep" ? (
                                <p className="text-[#C9974C] text-sm font-medium animate-pulse tracking-wider">PREPARATION TIME...</p>
                            ) : aiSpeaking ? (
                                <p className="text-[#4A6B8F] text-sm font-medium animate-pulse tracking-wider">{getExaminerDisplayName()} IS SPEAKING...</p>
                            ) : isRecording ? (
                                <>
                                    <p className="text-[#D17A5C] text-sm font-medium animate-pulse tracking-wider">LISTENING...</p>
                                    <p className="text-[10px] text-[#525252] mt-1 uppercase tracking-widest font-semibold">Tap square to stop</p>
                                </>
                            ) : isProcessing ? (
                                <p className="text-[#C9974C] text-sm font-medium animate-pulse tracking-wider">{getExaminerDisplayName()} IS THINKING...</p>
                            ) : (
                                <>
                                    <p className="text-[#1A1A1A] text-sm font-bold tracking-wider">YOUR TURN</p>
                                    <p className="text-[10px] text-[#525252] mt-1 uppercase tracking-widest font-semibold">Tap the mic to speak</p>
                                    {showRepeatHint && (
                                        <p className="text-xs text-[#525252]/70 mt-3 italic">
                                            Didn't catch the question? Say "Can you repeat?"
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {mode === 'quick' && cueCardTopic && (
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-16 w-full text-center"
                             >
                                <span className="px-4 py-1.5 rounded-full bg-[#FAF6EC] border border-[#1A1A1A]/10 text-xs font-bold text-[#525252] uppercase tracking-widest shadow-sm">
                                    Topic: {cueCardTopic}
                                </span>
                             </motion.div>
                        )}
                    </div>
                )}

                {/* PART 2 CARD — with sub-points */}
                <AnimatePresence>
                    {status.includes("part2") && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-30 flex items-center justify-center p-4"
                        >
                            <div className="bg-white text-[#1A1A1A] p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl border-4 border-[#4A6B8F] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-[#4A6B8F]" />
                                <h3 className="text-xl font-bold mb-6 text-[#4A6B8F] uppercase tracking-widest border-b border-[#4A6B8F]/20 pb-4 font-display">Part 2: Topic Card</h3>
                                <div className="bg-[#F8F5EE] p-6 rounded-xl border border-[#1A1A1A]/10 mb-6 min-h-[140px]">
                                    <p className="text-xl font-medium leading-relaxed text-[#1A1A1A] text-center mb-4">
                                        {cueCardTopic || "Please listen to the Examiner..."}
                                    </p>
                                    {cueCardSubpoints.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[#1A1A1A]/10 text-left">
                                            <p className="text-xs font-bold text-[#525252] uppercase tracking-wider mb-3">You should say:</p>
                                            <ul className="space-y-2">
                                                {cueCardSubpoints.map((point, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A1A]">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4A6B8F] shrink-0" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                {showPartTimer && (
                                    <div className={`p-4 rounded-xl flex items-center justify-between px-8 transition-colors ${status === 'part2_speak' ? 'bg-[#D17A5C]/10 text-[#D17A5C]' : 'bg-[#4A6B8F]/10 text-[#4A6B8F]'}`}>
                                        <span className="text-xs font-bold uppercase tracking-wider">{status === 'part2_prep' ? "Prep Time" : "Speaking Time"}</span>
                                        <span className="text-3xl font-mono font-bold">{formatTime(partTimer)}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* COMPLETED SCREEN */}
                {status === "completed" && (
                    <div className="absolute inset-0 bg-[#F8F5EE] z-40 flex flex-col items-center justify-start pt-10 px-4 overflow-y-auto">
                        <div className="w-full max-w-3xl pb-20">
                            <div className="text-center mb-8">
                                <CheckCircle className="w-16 h-16 text-[#8FA68E] mx-auto mb-4" />
                                <h2 className="text-3xl font-black text-[#1A1A1A] mb-2 font-display">Simulation Completed</h2>
                                <p className="text-[#525252]">Great job! Here is your performance analysis.</p>
                            </div>
                            {examResult ? (
                                <ScoreCard 
                                    result={examResult} 
                                    cue={cueCardTopic || "Full Simulation"} 
                                    onOpenTestimonial={() => {}}
                                    isLoggedIn={!!userProfile}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 bg-[#FAF6EC] rounded-2xl border border-[#1A1A1A]/10 animate-pulse shadow-sm">
                                    <Loader2 className="w-10 h-10 text-[#D17A5C] animate-spin mb-4" />
                                    <p className="text-[#1A1A1A] font-bold">Examiner is grading your test...</p>
                                    <p className="text-[#525252] text-sm mt-2">Generating feedback for {mode === 'quick' ? "Part 3 Discussion" : "Part 1, 2, and 3"}</p>
                                </div>
                            )}
                            <div className="mt-8 text-center">
                                <button onClick={() => router.push('/progress')} className="px-8 py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-full transition-all shadow-lg">Back to Progress</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MIC CONTROLS */}
            {status !== "completed" && (
                <div className="p-8 pb-12 flex flex-col items-center gap-8 relative z-10">
                    <div className="h-8 flex items-center justify-center w-full max-w-xs">
                        {isRecording ? <AudioVisualizer /> : isProcessing ? <Loader2 className="w-5 h-5 text-[#D17A5C] animate-spin" /> : null}
                    </div>
                    {status !== "checking_token" && (
                        <button
                            onClick={toggleRecording}
                            disabled={isMicLocked}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative group ${
                                isRecording ? "bg-[#D17A5C] scale-110 shadow-[#D17A5C]/50" : isMicLocked ? "bg-[#F8F5EE] border-2 border-[#1A1A1A]/10 opacity-50 cursor-not-allowed" : "bg-[#1A1A1A] hover:bg-black text-white shadow-[#1A1A1A]/20"
                            }`}
                        >
                            {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className={`w-10 h-10 group-hover:scale-110 transition-transform ${isMicLocked ? 'text-[#525252]' : 'text-white'}`} />}
                            {!isRecording && !isMicLocked && (
                                <span className="absolute inset-0 rounded-full border border-[#1A1A1A]/20 animate-ping opacity-20" />
                            )}
                        </button>
                    )}
                </div>
            )}
        </>
      )}

      {/* Voice Selection Modal */}
      <AnimatePresence>
          {showVoiceModal && (
              <VoiceSelectionModal
                  onClose={handleVoiceModalClose}
                  onContinue={handleVoiceSelected}
                  tokenCost={TOKEN_COST}
              />
          )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
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