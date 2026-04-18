import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Lock, AlertCircle, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';

interface MediaCallProps {
  onEndCall: () => void;
  targetName: string;
  participantCount?: number;
}

export const MediaCall = ({ onEndCall, targetName, participantCount = 1 }: MediaCallProps) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const initMedia = async () => {
    try {
      setCameraError(null);
      setIsMediaLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { facingMode: 'user' } 
      });
      
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsMediaLoading(false);
    } catch (err: any) {
      console.error("RTC_MEDIA_SUBSYSTEM_CRITICAL:", err);
      let msg = "Hardware Initialization Failed";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Access Denied: Camera/Mic permissions required for secure link.";
      }
      setCameraError(msg);
      setIsMediaLoading(false);
    }
  };

  const resetHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    setControlsVisible(true);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    resetHideTimer();
    
    initMedia();

    return () => {
      clearInterval(timer);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      // Clean up stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Sync mute/video state with stream tracks
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="absolute inset-0 bg-nexus-bg z-[200] flex flex-col overflow-hidden"
      onClick={resetHideTimer}
    >
      {/* Top Protocol Status Bar */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="pt-16 pb-4 px-6 flex justify-between items-start pointer-events-none z-10 absolute top-0 left-0 right-0"
          >
            <div className="flex flex-col">
              <span className="text-nexus-accent-gold font-mono text-[9px] tracking-[2px] uppercase opacity-80 mb-1">
                {participantCount > 1 ? `MESH_MULTICAST active | ${participantCount} NODES` : 'QUIC 0-RTT LINKED | SFRAME SECURED'}
              </span>
              <span className="text-nexus-ink font-mono text-xs tracking-widest">
                {participantCount > 1 ? 'Syndicate_Secure_Channel' : targetName}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-nexus-ink-muted font-mono text-[9px] tracking-widest uppercase mb-1">Duration</span>
              <span className="text-nexus-ink font-mono text-xs tabular-nums">{formatTime(callDuration)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="absolute top-32 right-6 w-28 h-40 bg-nexus-surface border border-nexus-border rounded-sm overflow-hidden z-20 shadow-2xl">
          <div className="w-full h-full relative border-none">
            {isMediaLoading && (
               <div className="absolute inset-0 flex items-center justify-center bg-nexus-surface animate-pulse">
                  <Loader2 size={16} className="text-nexus-accent-gold animate-spin" />
               </div>
            )}
            
            <video 
              ref={localVideoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover grayscale transition-opacity duration-500 ${isVideoOff || isMediaLoading || cameraError ? 'opacity-0' : 'opacity-100'}`}
            />

            {isVideoOff && !isMediaLoading && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-nexus-surface">
                 <VideoOff size={20} className="text-nexus-ink-muted/20" />
              </div>
            )}

            {cameraError && !isMediaLoading && (
               <div className="absolute inset-0 flex items-center justify-center bg-[#1A0A0A]">
                  <AlertCircle size={20} className="text-[#EF4444] opacity-40" />
               </div>
            )}
          </div>
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-nexus-bg/50 backdrop-blur-sm rounded-[2px] z-10">
            <span className="text-nexus-ink font-mono text-[7px] tracking-widest uppercase">Self</span>
          </div>
        </div>

        {/* Global Error Overlay */}
        <AnimatePresence>
          {cameraError && !isMediaLoading && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 z-[100] bg-nexus-bg/80 flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="w-20 h-20 bg-[#EF4444]/10 rounded-full flex items-center justify-center mb-8 border border-[#EF4444]/20">
                <AlertCircle size={36} className="text-[#EF4444]" />
              </div>
              
              <h2 className="text-nexus-ink font-mono text-[11px] font-bold tracking-[4px] uppercase mb-4 text-[#EF4444]">
                Kernel_Protocol_Fault
              </h2>
              
              <div className="bg-nexus-surface/50 border border-nexus-border p-6 rounded-sm mb-10 max-w-[280px]">
                <p className="text-nexus-ink-muted font-sans text-[11px] leading-relaxed tracking-tight">
                  {cameraError}
                </p>
              </div>

              <div className="flex flex-col w-full max-w-[280px] space-y-3">
                <button 
                  onClick={initMedia}
                  className="w-full bg-nexus-accent-gold text-black py-4 font-mono text-[10px] font-bold uppercase tracking-[2px] rounded-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-all border-none cursor-pointer"
                >
                  <RefreshCw size={14} className={isMediaLoading ? 'animate-spin' : ''} />
                  <span>Retry_Handshake</span>
                </button>
                <button 
                  onClick={onEndCall}
                  className="w-full border border-nexus-border py-4 font-mono text-[10px] items-center justify-center space-x-2 text-nexus-ink-muted tracking-[2px] rounded-sm flex uppercase active:scale-[0.98] transition-all bg-transparent cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Abort_Connection</span>
                </button>
              </div>
              
              <div className="mt-8">
                <span className="text-nexus-ink-muted font-mono text-[7px] uppercase tracking-[2px] opacity-30">
                  REF_ERROR::NODE_SENSOR_DENIAL
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="px-10 pb-16 pt-8 bg-nexus-bg/60 backdrop-blur-md flex justify-between items-center z-30 border-t border-nexus-border absolute bottom-0 left-0 right-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center group">
              <button 
                onClick={(e) => { e.stopPropagation(); resetHideTimer(); setIsMuted(!isMuted); }}
                className={`p-5 transition-all bg-transparent border-none cursor-pointer flex items-center justify-center ${isMuted ? 'text-[#EF4444]' : 'text-nexus-ink-muted hover:text-nexus-ink'}`}
              >
                {isMuted ? <MicOff size={22} strokeWidth={1.5} /> : <Mic size={22} strokeWidth={1.5} />}
              </button>
              <span className="text-[7px] font-mono tracking-[2px] uppercase opacity-30 group-hover:opacity-60 transition-opacity">Audio</span>
            </div>

            <div className="flex flex-col items-center">
              <motion.button 
                onClick={onEndCall}
                animate={{ 
                  boxShadow: ["0 0 0px rgba(239, 68, 68, 0)", "0 0 20px rgba(239, 68, 68, 0.3)", "0 0 0px rgba(239, 68, 68, 0)"],
                  scale: [1, 1.05, 1]
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="p-6 text-[#EF4444] hover:text-[#DC2626] transition-all border border-[#EF4444]/20 hover:border-[#EF4444]/40 bg-transparent cursor-pointer flex items-center justify-center rounded-sm"
              >
                <PhoneOff size={28} strokeWidth={1.5} />
              </motion.button>
              <span className="text-[7px] font-mono tracking-[2px] uppercase mt-2 text-[#EF4444]/60">Disconnect</span>
            </div>

            <div className="flex flex-col items-center group">
              <button 
                onClick={(e) => { e.stopPropagation(); resetHideTimer(); setIsVideoOff(!isVideoOff); }}
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
