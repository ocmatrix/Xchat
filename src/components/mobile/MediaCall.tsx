import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Lock } from 'lucide-react';

interface MediaCallProps {
  onEndCall: () => void;
  targetName: string;
}

export const MediaCall = ({ onEndCall, targetName }: MediaCallProps) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="absolute inset-0 bg-nexus-bg z-[200] flex flex-col overflow-hidden"
      onClick={() => setControlsVisible(!controlsVisible)}
    >
      {/* Top Protocol Status Bar */}
      <div className="pt-16 pb-4 px-6 flex justify-between items-start pointer-events-none z-10">
        <div className="flex flex-col">
          <span className="text-nexus-accent-gold font-mono text-[9px] tracking-[2px] uppercase opacity-80 mb-1">
            QUIC 0-RTT LINKED | SFRAME SECURED
          </span>
          <span className="text-nexus-ink font-mono text-xs tracking-widest">{targetName}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-nexus-ink-muted font-mono text-[9px] tracking-widest uppercase mb-1">Duration</span>
          <span className="text-nexus-ink font-mono text-xs tabular-nums">{formatTime(callDuration)}</span>
        </div>
      </div>

      {/* Main RTC Views (Placeholder) */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* Remote Video Placeholder */}
        <div className="absolute inset-0 bg-nexus-bg flex items-center justify-center">
           <div className="flex flex-col items-center opacity-20">
              <Lock size={48} className="text-nexus-accent-gold mb-4" />
              <span className="text-nexus-ink font-mono text-[10px] uppercase tracking-[4px]">E2EE_STREAM_ACTIVE</span>
           </div>
        </div>

        {/* Local Video Pip */}
        <div className="absolute top-32 right-6 w-28 h-40 bg-nexus-surface border border-nexus-border rounded-sm overflow-hidden z-20">
          <div className="w-full h-full flex items-center justify-center">
            {isVideoOff ? (
              <VideoOff size={20} className="text-nexus-ink-muted/20" />
            ) : (
              <div className="w-full h-full bg-nexus-border animate-pulse" />
            )}
          </div>
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-nexus-bg/50 backdrop-blur-sm rounded-[2px]">
            <span className="text-nexus-ink font-mono text-[7px] tracking-widest uppercase">Self</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="px-10 pb-16 pt-8 bg-nexus-bg/60 backdrop-blur-md flex justify-between items-center z-30 border-t border-nexus-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center group">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-5 transition-all bg-transparent border-none cursor-pointer flex items-center justify-center ${isMuted ? 'text-[#EF4444]' : 'text-nexus-ink-muted hover:text-nexus-ink'}`}
              >
                {isMuted ? <MicOff size={22} strokeWidth={1.5} /> : <Mic size={22} strokeWidth={1.5} />}
              </button>
              <span className="text-[7px] font-mono tracking-[2px] uppercase opacity-30 group-hover:opacity-60 transition-opacity">Audio</span>
            </div>

            <div className="flex flex-col items-center">
              <button 
                onClick={onEndCall}
                className="p-6 text-[#EF4444] hover:text-[#DC2626] transition-all border border-[#EF4444]/20 hover:border-[#EF4444]/40 bg-transparent cursor-pointer flex items-center justify-center rounded-sm"
              >
                <PhoneOff size={28} strokeWidth={1.5} />
              </button>
              <span className="text-[7px] font-mono tracking-[2px] uppercase mt-2 text-[#EF4444]/60">Disconnect</span>
            </div>

            <div className="flex flex-col items-center group">
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-5 transition-all bg-transparent border-none cursor-pointer flex items-center justify-center ${isVideoOff ? 'text-[#EF4444]' : 'text-nexus-ink-muted hover:text-nexus-ink'}`}
              >
                {isVideoOff ? <VideoOff size={22} strokeWidth={1.5} /> : <Video size={22} strokeWidth={1.5} />}
              </button>
              <span className="text-[7px] font-mono tracking-[2px] uppercase opacity-30 group-hover:opacity-60 transition-opacity">Camera</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
