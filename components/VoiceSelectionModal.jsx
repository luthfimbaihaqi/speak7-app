"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircle, Play, Pause, Check, ArrowRight } from "lucide-react";

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

const VoiceCard = ({ voice, isSelected, isPlaying, onSelect, onPlayToggle }) => {
  return (
    <button
      onClick={() => onSelect(voice.id)}
      className={`
        relative w-full text-left p-5 rounded-xl border transition-all duration-300
        ${isSelected 
          ? 'bg-[#F8F5EE] border-[#1A1A1A]/30 shadow-md' 
          : 'bg-[#FAF6EC] border-[#1A1A1A]/10 hover:bg-[#F8F5EE] hover:border-[#1A1A1A]/20'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-[#8FA68E] rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
        {voice.name}
      </h3>

      <p className="text-sm text-[#1A1A1A]/80 mb-1">
        {voice.demographic}
      </p>

      <p className="text-sm text-[#525252] mb-4">
        {voice.tone}
      </p>

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
            ? 'bg-[#4A6B8F]/10 text-[#4A6B8F] border border-[#4A6B8F]/30' 
            : 'bg-[#1A1A1A]/5 text-[#525252] border border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/10 hover:text-[#1A1A1A]'
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

export default function VoiceSelectionModal({ onClose, onContinue, tokenCost }) {
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const audioRef = useRef(null);

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

    if (playingVoiceId === voiceId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingVoiceId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

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

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    onContinue(selectedVoice);
  };

  const handleCloseClick = () => {
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
      className="absolute inset-0 z-50 bg-[#1A1A1A]/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#FAF6EC] border border-[#1A1A1A]/10 rounded-3xl shadow-2xl w-full max-w-3xl my-8 relative">
        <button
          onClick={handleCloseClick}
          className="absolute top-4 right-4 text-[#525252] hover:text-[#1A1A1A] transition-colors z-10"
          aria-label="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] mb-2 font-display">
              Pick Your IELTS Examiner
            </h2>
            <p className="text-[#525252] text-sm">
              Select a voice for your session. Listen to each sample before deciding.
            </p>
          </div>

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

          <button
            onClick={handleContinueClick}
            disabled={!selectedVoice}
            className={`
              w-full py-4 font-bold rounded-xl shadow-lg transition-all
              flex items-center justify-center gap-2 group
              ${selectedVoice
                ? 'bg-[#1A1A1A] hover:bg-black text-white cursor-pointer'
                : 'bg-[#1A1A1A]/5 text-[#525252] cursor-not-allowed border border-[#1A1A1A]/10'
              }
            `}
          >
            <span>Continue to Pre-Flight Check</span>
            {selectedVoice && (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>

          {!selectedVoice && (
            <p className="text-center text-xs text-[#525252] mt-3">
              Please select an examiner to continue
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}