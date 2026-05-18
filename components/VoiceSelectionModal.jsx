"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircle, Play, Pause, Check, ArrowRight } from "lucide-react";

// 🔥 Voice configuration matching backend VOICE_MAP
const VOICES = [
  {
    id: 'paul',
    name: 'Paul',
    demographic: 'Senior British male',
    tone: 'Calm and authoritative tone',
    samplePath: '/audio/samples/paul-sample.mp3'
  },
  {
    id: 'billie',
    name: 'Billie',
    demographic: 'Middle-aged American male',
    tone: 'Warm and engaging delivery',
    samplePath: '/audio/samples/billie-sample.mp3'
  },
  {
    id: 'taylor',
    name: 'Taylor',
    demographic: 'Middle-aged British female',
    tone: 'Clear and articulate voice',
    samplePath: '/audio/samples/taylor-sample.mp3'
  }
];

// 🔥 Single Voice Card Component
const VoiceCard = ({ voice, isSelected, isPlaying, onSelect, onPlayToggle }) => {
  return (
    <button
      onClick={() => onSelect(voice.id)}
      className={`
        relative w-full text-left p-5 rounded-xl border transition-all duration-300
        ${isSelected 
          ? 'bg-white/10 border-white/30 shadow-lg' 
          : 'bg-white/5 border-white/10 hover:bg-white/[0.07] hover:border-white/20'
        }
      `}
    >
      {/* Selected checkmark indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-emerald-500/90 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Voice name */}
      <h3 className="text-xl font-bold text-white mb-2">
        {voice.name}
      </h3>

      {/* Demographic line (factual) */}
      <p className="text-sm text-slate-300 mb-1">
        {voice.demographic}
      </p>

      {/* Tone line (descriptive) */}
      <p className="text-sm text-slate-400 mb-4">
        {voice.tone}
      </p>

      {/* Play sample button */}
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onPlayToggle(voice.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            onPlayToggle(voice.id);
          }
        }}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full
          text-xs font-semibold transition-all cursor-pointer
          ${isPlaying 
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
          }
        `}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            <span>Playing...</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" />
            <span>Listen Sample</span>
          </>
        )}
      </div>
    </button>
  );
};

// 🔥 MAIN COMPONENT
export default function VoiceSelectionModal({ onClose, onContinue, tokenCost }) {
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const audioRef = useRef(null);

  // Cleanup audio when modal unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSelectVoice = (voiceId) => {
    setSelectedVoice(voiceId);
  };

  const handlePlayToggle = (voiceId) => {
    const voice = VOICES.find(v => v.id === voiceId);
    if (!voice) return;

    // If clicking the currently playing voice → pause it
    if (playingVoiceId === voiceId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingVoiceId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Play the new sample
    const audio = new Audio(voice.samplePath);
    audio.onended = () => {
      setPlayingVoiceId(null);
      audioRef.current = null;
    };
    audio.onerror = () => {
      console.error(`Failed to load audio: ${voice.samplePath}`);
      setPlayingVoiceId(null);
      audioRef.current = null;
    };

    audio.play().catch(err => {
      console.error('Audio play failed:', err);
      setPlayingVoiceId(null);
      audioRef.current = null;
    });

    audioRef.current = audio;
    setPlayingVoiceId(voiceId);
  };

  const handleContinueClick = () => {
    if (!selectedVoice) return;

    // Stop any playing audio before continuing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    onContinue(selectedVoice);
  };

  const handleCloseClick = () => {
    // Stop any playing audio before closing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl my-8 relative">
        {/* Close button */}
        <button
          onClick={handleCloseClick}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
              Pick Your IELTS Examiner
            </h2>
            <p className="text-slate-400 text-sm">
              Select a voice for your session. Listen to each sample before deciding.
            </p>
          </div>

          {/* Voice Cards - Responsive: vertical mobile, horizontal desktop */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-8">
            {VOICES.map((voice) => (
              <div key={voice.id} className="flex-1">
                <VoiceCard
                  voice={voice}
                  isSelected={selectedVoice === voice.id}
                  isPlaying={playingVoiceId === voice.id}
                  onSelect={handleSelectVoice}
                  onPlayToggle={handlePlayToggle}
                />
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinueClick}
            disabled={!selectedVoice}
            className={`
              w-full py-4 font-bold rounded-xl shadow-lg transition-all
              flex items-center justify-center gap-2 group
              ${selectedVoice
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              }
            `}
          >
            <span>Continue to Pre-Flight Check</span>
            {selectedVoice && (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>

          {/* Helper text */}
          {!selectedVoice && (
            <p className="text-center text-xs text-slate-500 mt-3">
              Please select an examiner to continue
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}