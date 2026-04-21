import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Lock, 
  AlertCircle, Loader2, RefreshCw, ArrowLeft, 
  Shield, Activity, CameraOff, MoreVertical, 
  MoreHorizontal, Zap, Terminal, Target
} from 'lucide-react';

interface MediaCallProps {
  onEndCall: () => void;
  targetName: string;
  participantCount?: number;
}

export const MediaCall = ({ onEndCall, targetName, participantCount = 1, initialMode = 'video' }: MediaCallProps & { initialMode?: 'audio' | 'video' }) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(initialMode === 'audio');
  const [callDuration, setCallDuration] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [iceState, setIceState] = useState<RTCIceConnectionState>('new');
  const [connectionStrategy, setConnectionStrategy] = useState<'P2P' | 'SFU'>('P2P');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Nexus Advanced ICE Configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { 
        urls: 'turn:turn.nexus-relay.io:3478', 
        username: 'nexus_user', 
        credential: 'ephemeral_token_2026' 
      },
      { 
        urls: 'turn:turn.nexus-relay-fallback.io:443', 
        username: 'nexus_fallback', 
        credential: 'ephemeral_token_fallback' 
      }
    ],
    iceCandidatePoolSize: 20, // Increased pool size for faster negotiation
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle', // Optimize by bundling all media streams over a single transport
    rtcpMuxPolicy: 'require'    // Require RTCP multiplexing to reduce port usage
  };

  const initWebRTC = async (stream: MediaStream) => {
    try {
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      // Add tracks to connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        setIceState(state);
        console.log(`📡 RTC_ICE_STATE_CHANGE::${state.toUpperCase()}`);

        if (state === 'failed' || state === 'disconnected') {
          handleICEFailure();
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🧊 ICE_CANDIDATE_HARVESTED:", event.candidate.protocol);
        }
      };

      // In a real app, we would handle signaling here (createOffer, setLocalDescription, etc.)
      
      // Simulate real-time ICE process for the visual demo (Optimized timings)
      setTimeout(() => setIceState('gathering'), 200);
      setTimeout(() => setIceState('checking'), 500);
      setTimeout(() => setIceState('connected'), 1000);
      
    } catch (err) {
      console.error("RTC_INIT_FAILURE:", err);
    }
  };

  const handleICEFailure = () => {
    console.warn("⚠️ P2P_NEGOTIATION_FAILED. Migrating to Syndicate SFU...");
    setConnectionStrategy('SFU');
    // Simulate re-routing through the SFU cluster
    setTimeout(() => {
      setIceState('connected');
    }, 1500);
  };

  const initMedia = async () => {
    try {
      setCameraError(null);
      setIsMediaLoading(true);
      
      // Standardize constraints for high-fidelity institutional link
      const constraints = { 
        audio: true, 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };

      console.log("🎙️ RTC_SUBSYSTEM::REQUESTING_MEDIA_HARDWARE...");
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Verify track integrity
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (!videoTrack) console.warn("RTC_SUBSYSTEM::WARNING::NO_VIDEO_TRACK_FOUND");
      if (!audioTrack) console.warn("RTC_SUBSYSTEM::WARNING::NO_AUDIO_TRACK_FOUND");

      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      await initWebRTC(stream);
      setIsMediaLoading(false);
    } catch (err: any) {
      console.error("RTC_MEDIA_SUBSYSTEM_CRITICAL:", err.name, err.message);
      
      let msg = "HARDWARE_INITIALIZATION_FAULT::An unexpected error occurred while linking to system sensors.";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "PERMISSION_DENIED::Your browser or OS has blocked sensor access. Please check privacy settings and ensure 'Camera' and 'Microphone' are enabled for this terminal.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = "HARDWARE_NOT_FOUND::No compatible media sensors detected. Ensure your camera and microphone are physically connected and powered on.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = "SENSOR_BUSY::The camera or microphone is already being used by another application or process on this node.";
      } else if (err.name === 'OverconstrainedError') {
        msg = "CONSTRAINT_MISMATCH::The requested video resolution exceeds the capabilities of your hardware sensors.";
      } else if (err.name === 'SecurityError') {
        msg = "SECURITY_VIOLATION::Media access is restricted by a security policy (likely due to an insecure context or Cross-Origin policy).";
      } else if (err.name === 'AbortError') {
        msg = "SYSTEM_ABORT::A general hardware failure occurred during the sensor initialization sequence.";
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
    }, 4000);
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

  // Dynamic grid configuration based on participant count
  const getGridLayout = () => {
    if (participantCount <= 1) return 'grid-cols-1 grid-rows-1';
    if (participantCount <= 4) return 'grid-cols-2 grid-rows-2';
    return 'grid-cols-3 grid-rows-3';
  };

  const renderRemoteFeeds = () => {
    const feeds = [];
    // Always render at least one feed for generic 1-on-1 experience
    const count = Math.max(1, participantCount);
    
    for (let i = 0; i < count; i++) {
      feeds.push(
        <div key={`feed-${i}`} className="relative w-full h-full bg-[#1A1A1C] border border-white/5 rounded-[12px] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />
          {!isMediaLoading ? (
             <div className="absolute flex flex-col items-center justify-center scale-75 md:scale-90 opacity-60">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-[#242426] border border-white/5 rounded-full flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-110" />
                  <span className="text-white/20 text-2xl md:text-3xl font-black">
                    {i === 0 ? targetName.charAt(0) : `P${i}`}
                  </span>
               </div>
               <span className="text-white/10 text-[8px] md:text-[10px] font-black tracking-[4px] uppercase truncate px-2">
                 {i === 0 ? 'REMOTE_NODE' : `PEER_${i}`}
               </span>
             </div>
          ) : null}
        </div>
      );
    }
    return feeds;
  };

  const getPipStyles = () => {
    if (participantCount <= 1) {
      return 'w-[90px] h-[135px] bottom-[110px] right-3 rounded-[4px]';
    }
    if (participantCount <= 4) {
      return 'w-[75px] h-[112px] top-[100px] right-3 rounded-[4px]';
    }
    return 'w-[60px] h-[90px] top-[140px] right-3 rounded-[4px] shadow-[0_4px_20px_rgba(0,0,0,0.8)]';
  };

  return (
    <div 
      className="absolute inset-0 bg-[#000000] z-[200] flex flex-col font-sans"
      onClick={resetHideTimer}
    >
      {/* Background Context (Blurred) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1C1E] to-[#000000]" />
      </div>

      {/* Top Info Header (Industrial Style) */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 inset-x-0 pt-11 pb-2 px-4 z-20 flex flex-col pointer-events-none bg-gradient-to-b from-black/80 to-transparent border-b border-white/5"
          >
             <div className="flex justify-between items-center w-full">
               <div className="flex flex-col">
                 <h2 className="text-white/90 text-[14px] font-black tracking-tighter uppercase font-sans mb-0">
                   {participantCount > 1 ? `SECURE_GROUP_${participantCount}` : targetName}
                 </h2>
                 <div className="flex items-center space-x-2">
                    <span className="text-white/30 text-[8px] font-mono tracking-widest font-bold">
                      DUR: {formatTime(callDuration)}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-white/30 text-[8px] font-mono tracking-widest font-bold">
                      STRAT: {connectionStrategy}
                    </span>
                 </div>
               </div>
               
               {/* Small ICE State Pill */}
               <div className={`flex items-center space-x-1 px-1.5 py-0.5 border rounded-[2px] pointer-events-auto bg-black/60 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                    (iceState === 'connected' || iceState === 'completed') ? 'border-[#00E5FF]/30 text-[#00E5FF]' 
                    : (iceState === 'checking' || iceState === 'gathering') ? 'border-[#D4AF37]/30 text-[#D4AF37]'
                    : 'border-[#FF3B30]/30 text-[#FF3B30]'
                  }`}>
                  <div className={`w-1 h-1 rounded-full ${
                    (iceState === 'connected' || iceState === 'completed') ? 'bg-[#00E5FF]' 
                    : (iceState === 'checking' || iceState === 'gathering') ? 'bg-[#D4AF37] animate-pulse'
                    : 'bg-[#FF3B30]'
                  }`} />
                  <span className="text-[7px] uppercase tracking-widest font-black font-sans">{iceState}</span>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Feed Viewport (Grid layout for participants) */}
      <div className="flex-1 relative z-10 p-2 pb-[100px] pt-20 h-full w-full overflow-hidden">
        <div className={`w-full h-full grid gap-2 ${getGridLayout()}`}>
          {renderRemoteFeeds()}
        </div>

        {/* Local Node PIP Stream (Floating) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`absolute z-30 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.9)] transition-all duration-500 border border-white/10 ${getPipStyles()}`}
        >
          <div className="w-full h-full relative bg-[#1C1C1E]">
            {isMediaLoading && (
               <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Loader2 size={18} className="text-[#FFFFFF] animate-spin" />
               </div>
            )}
            
            <video 
              ref={localVideoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoOff || isMediaLoading || cameraError ? 'opacity-0' : 'opacity-100'} -scale-x-100`}
            />

            {isVideoOff && !isMediaLoading && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#2C2C2E]">
                 <CameraOff size={20} className="text-[#8E8E93]" strokeWidth={1.5} />
              </div>
            )}
            
            {/* PIP Badge */}
            {!isMediaLoading && !cameraError && (
              <div className="absolute bottom-1 right-1 px-1 bg-black/40 rounded-[1px] border border-white/5">
                <span className="text-[5px] text-white/40 uppercase font-black tracking-tighter">LOCAL_NODE</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* System Error Modal */}
      <AnimatePresence>
        {cameraError && !isMediaLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-[#000000]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-20 h-20 bg-[#FF3B30]/10 rounded-full flex items-center justify-center mb-8 relative">
               <div className="absolute inset-0 border border-[#FF3B30]/20 rounded-full animate-ping" />
               <AlertCircle size={40} className="text-[#FF3B30]" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-[#FFFFFF] font-black text-xl tracking-[4px] uppercase mb-4">SENSOR_LINK_FAULT</h2>
            
            <div className="bg-[#1C1C1E] border border-white/5 p-4 rounded-sm mb-10 w-full max-w-sm">
               <p className="text-[#FF3B30] font-mono text-[10px] leading-relaxed uppercase tracking-wider mb-2">
                  {cameraError.split('::')[0]}
               </p>
               <p className="text-[#EBEBF5]/60 text-[11px] leading-relaxed font-sans font-medium uppercase tracking-tight">
                  {cameraError.split('::')[1] || "Secure media link could not be established due to a hardware initialization failure."}
               </p>
            </div>
            
            <div className="w-full max-w-[280px] space-y-4 relative z-10">
              <button 
                onClick={initMedia}
                className="w-full bg-[#FFFFFF] text-[#000000] h-14 font-black text-[10px] tracking-[4px] uppercase rounded-sm active:scale-[0.98] transition-all flex items-center justify-center border-none cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                RE-RETRY_SUBSYSTEM
              </button>
              <button 
                onClick={onEndCall}
                className="w-full bg-transparent border border-white/10 text-[#FFFFFF] h-14 font-black text-[10px] tracking-[4px] uppercase rounded-sm active:scale-[0.98] transition-all flex items-center justify-center border-none cursor-pointer hover:bg-white/5"
              >
                TERMINATE_LINK
              </button>
            </div>

            <div className="mt-12 flex items-center space-x-3 opacity-20">
               <div className="w-1.5 h-1.5 rounded-sm bg-[#FF3B30] animate-pulse" />
               <span className="text-white font-black text-[7px] tracking-[3px] uppercase">
                  Hardware_Node_Authorization_Required
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tactile Control Interface (Industrial Style) */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-6 inset-x-4 z-40 flex justify-center w-[calc(100%-32px)]"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="flex w-full max-w-[320px] items-center justify-between bg-black/80 backdrop-blur-xl px-1 py-1 rounded-[4px] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.9)]">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className={`flex-1 h-11 rounded-[2px] mx-0.5 flex flex-col items-center justify-center transition-all border border-transparent cursor-pointer ${
                    isMuted ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20' : 'bg-[#1A1A1C] text-[#E5E5E5] hover:bg-[#242426] border-white/5 shadow-inner'
                  }`}
                >
                  {isMuted ? <MicOff size={14} strokeWidth={2.5} /> : <Mic size={14} strokeWidth={2.5} />}
                  <span className="text-[7px] font-black tracking-widest mt-0.5 uppercase font-sans">{isMuted ? 'MUTED' : 'MIC'}</span>
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsVideoOff(!isVideoOff); }}
                  className={`flex-1 h-11 rounded-[2px] mx-0.5 flex flex-col items-center justify-center transition-all border border-transparent cursor-pointer ${
                    isVideoOff ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20' : 'bg-[#1A1A1C] text-[#E5E5E5] hover:bg-[#242426] border-white/5 shadow-inner'
                  }`}
                >
                  {isVideoOff ? <VideoOff size={14} strokeWidth={2.5} /> : <Video size={14} strokeWidth={2.5} />}
                  <span className="text-[7px] font-black tracking-widest mt-0.5 uppercase font-sans">{isVideoOff ? 'NO_CAM' : 'CAM'}</span>
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onEndCall(); }}
                  className="flex-1 h-11 rounded-[2px] mx-0.5 bg-[#FF3B30] text-white hover:bg-[#FF453A] flex flex-col items-center justify-center transition-all border border-[#FF3B30]/50 cursor-pointer active:scale-95"
                >
                  <PhoneOff size={14} strokeWidth={3} />
                  <span className="text-[7px] font-black tracking-[2px] mt-0.5 uppercase font-sans">DISCONNECT</span>
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
