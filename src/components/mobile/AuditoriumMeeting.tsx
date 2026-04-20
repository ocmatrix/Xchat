import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Mic, MicOff, Hand, Video, VideoOff, 
  Settings, X, Check, XCircle, Shield, 
  Activity, Signal, Lock, ShieldAlert
} from 'lucide-react';

interface AuditoriumMeetingProps {
  roomName: string;
  initialRole?: 'HOST' | 'LISTENER';
  onDisconnect: () => void;
}

interface Participant {
  did: string;
  role: 'HOST' | 'SPEAKER' | 'LISTENER';
  hasHandRaised?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export const AuditoriumMeeting: React.FC<AuditoriumMeetingProps> = ({ 
  roomName, 
  initialRole = 'LISTENER', 
  onDisconnect 
}) => {
  const [role, setRole] = useState<'HOST' | 'SPEAKER' | 'LISTENER'>(initialRole);
  const [handRaised, setHandRaised] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showApprovalFlash, setShowApprovalFlash] = useState(false);
  const [blockedConnections, setBlockedConnections] = useState(0);

  // High-Density Media Engine Stats
  const [compressionStats, setCompressionStats] = useState({
    codec: 'AV1_HD',
    efficiency: 0,
    savedBandwidth: 0,
    bitrate: 0
  });
  
  // Use a ref for isLocked to access it inside intervals without re-triggering them
  const isLockedRef = useRef(isLocked);
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // CRDT Mock State
  const [participants, setParticipants] = useState<Participant[]>([
    { did: 'MY_NODE', role: initialRole, isMuted: false },
    { did: 'CORE_SYNDICATE_HOST', role: 'HOST', isMuted: false },
    { did: 'GUEST_SPEAKER_01', role: 'SPEAKER', isMuted: false },
    { did: 'LISTENER_092', role: 'LISTENER', hasHandRaised: true },
    { did: 'LISTENER_114', role: 'LISTENER' },
    ...Array.from({length: 45}).map((_, i) => ({ 
      did: `NODE_${Math.floor(Math.random() * 9000) + 1000}`, 
      role: 'LISTENER' as const 
    }))
  ]);

  // Log simulated background activity
  useEffect(() => {
    console.log(`[EXEC: RUST_GOSSIP_SWARM] Topic Subscribed: AUDITORIUM_${roomName.replace(/\s/g, '_')}`);
    console.log(`[EXEC: RUST_GOSSIP_SWARM] Flood Protection Active: 512MB Buffer Cached`);
    console.log(`[EXEC: GO_CASCADED_SFU] Topology Built: Super Node Cascade Initialized`);
    console.log(`[EXEC: GO_CASCADED_SFU] Pub/Sub: Connecting to nearest leaf node...`);

    // High-Density Compression Simulation Engine
    const mediaEngineTimer = setInterval(() => {
      setCompressionStats(prev => {
        const baseEfficiency = 42; // AV1 standard over H264
        const jitter = Math.random() * 5 - 2.5;
        const currentEfficiency = Math.min(65, Math.max(35, baseEfficiency + jitter));
        
        return {
          codec: Math.random() > 0.05 ? 'AV1_HD' : 'VP9_FALLBACK',
          efficiency: currentEfficiency,
          savedBandwidth: (currentEfficiency / 100) * 12.5, // MB per min simulated
          bitrate: 450 + Math.floor(Math.random() * 300)
        };
      });
    }, 3000);

    // Simulate incoming network traffic and connections
    const intervalId = setInterval(() => {
      const newNodeId = `NODE_${Math.floor(Math.random() * 9000) + 1000}`;
      
      if (isLockedRef.current) {
        console.warn(`[SECURITY] Rejected connection attempt from ${newNodeId}: ROOM IS LOCKED`);
        setBlockedConnections(prev => prev + 1);
      } else {
        setParticipants(prev => {
          // Cap it slightly to avoid infinite memory bloat in mock
          if (prev.length < 150) {
             return [...prev, { did: newNodeId, role: 'LISTENER' }];
          }
          return prev;
        });
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [roomName]);

  const speakers = participants.filter(p => p.role === 'HOST' || p.role === 'SPEAKER');
  const listeners = participants.filter(p => p.role === 'LISTENER');
  const requests = listeners.filter(p => p.hasHandRaised);

  // Listener Actions
  const toggleRaiseHand = () => {
    if (role !== 'LISTENER') return;
    
    const nextState = !handRaised;
    setHandRaised(nextState);
    
    // Optimistic Update via CRDT Simulation
    setParticipants(prev => prev.map(pt => 
      pt.did === 'MY_NODE' ? { ...pt, hasHandRaised: nextState } : pt
    ));
    
    console.log(`[CRDT_STATE] Update: MY_NODE_HAND_RAISED=${nextState}`);
  };

  // Host Action: Approve Hand
  const approveRequest = (did: string) => {
    console.log(`[CRDT_STATE] Elevating ${did} to SPEAKER`);
    
    // Perform simulated CRDT elevation
    setParticipants(prev => prev.map(p => 
      p.did === did 
        ? { ...p, role: 'SPEAKER' as const, hasHandRaised: false, isMuted: false } 
        : p
    ));

    // Broadcast logic simulation
    console.log(`[GOSSIP_SWARM] Broadcast: PERMISSION_ELEVATION_DID=${did}`);
    
    // If we're approving the local node (simulated), trigger the flash and role switch
    if (did === 'MY_NODE') {
      triggerApprovalFlash();
    } else {
      // For any approval by the host, show a quick 'success' visual pulse to confirm action
      console.log(`[UI_AUDITORIUM] Approval confirmed for remote peer: ${did}`);
    }
  };

  const denyRequest = (did: string) => {
    setParticipants(prev => prev.map(p => p.did === did ? { ...p, hasHandRaised: false } : p));
  };

  const triggerApprovalFlash = () => {
    setShowApprovalFlash(true);
    setTimeout(() => {
      setRole('SPEAKER');
      setHandRaised(false);
      setShowApprovalFlash(false);
    }, 1500);
  };

  const handleMuteAll = () => {
    console.log("[CRDT_STATE] Muting all speakers...");
    setParticipants(prev => prev.map(p => p.role === 'SPEAKER' ? { ...p, isMuted: true } : p));
  };

  const handleToggleMute = (did: string) => {
    console.log(`[CRDT_STATE] Toggling MUTE for ${did}`);
    setParticipants(prev => prev.map(p => 
      p.did === did ? { ...p, isMuted: !p.isMuted } : p
    ));
  };

  const handleToggleVideo = (did: string) => {
    console.log(`[CRDT_STATE] Toggling VIDEO for ${did}`);
    setParticipants(prev => prev.map(p => 
      p.did === did ? { ...p, isVideoOff: !p.isVideoOff } : p
    ));
  };

  const handleLockRoom = () => {
    setIsLocked(!isLocked);
    console.log(`[GOSSIP_SWARM] Broadcast: ROOM_LOCKED=${!isLocked}`);
  };

  const gridColsClass = speakers.length === 1 
    ? 'grid-cols-1' 
    : speakers.length <= 4 
      ? 'grid-cols-2' 
      : 'grid-cols-3';

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0a] text-white font-sans overflow-hidden relative">
      
      {/* Approval Flash Effect */}
      <AnimatePresence>
        {showApprovalFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#00D1FF] mix-blend-screen pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="shrink-0 h-16 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-[14px] font-black uppercase tracking-[2px]">{roomName}</span>
              <AnimatePresence>
                {isLocked && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="px-1.5 py-0.5 bg-[#EF4444]/10 border border-[#EF4444]/50 text-[#EF4444] text-[8px] font-black uppercase tracking-[1px] rounded-sm flex items-center space-x-1"
                  >
                    <Lock size={8} />
                    <span>LOCKED</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-[#00D1FF] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,209,255,0.6)]" />
              <span className="text-[8px] font-bold tracking-[2px] text-[#00D1FF] uppercase">SFU_CASCADE_ACTIVE</span>
            </div>

            {/* HIGH DENSITY ENGINE HUD */}
            <div className="flex items-center space-x-3 mt-1.5 px-2 py-0.5 bg-black/40 border border-white/5 rounded-full backdrop-blur-sm self-start">
               <div className="flex items-center space-x-1">
                  <Activity size={8} className="text-[#00D1FF]" />
                  <span className="text-[7px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">Engine:</span>
                  <span className="text-[7px] font-mono font-bold text-[#00D1FF]">{compressionStats.codec}</span>
               </div>
               <div className="w-[1px] h-2 bg-white/10" />
               <div className="flex items-center space-x-1">
                  <span className="text-[7px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">Gain:</span>
                  <span className="text-[7px] font-mono font-bold text-[#10B981]">+{compressionStats.efficiency.toFixed(1)}%</span>
               </div>
               <div className="w-[1px] h-2 bg-white/10" />
               <div className="flex items-center space-x-1">
                  <span className="text-[7px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">Rate:</span>
                  <span className="text-[7px] font-mono font-bold text-[#D4AF37]">{compressionStats.bitrate}kbps</span>
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-white/30 mr-2">
             <Users size={12} />
             <span className="text-[10px] font-mono">{participants.length}</span>
          </div>
          {role === 'HOST' ? (
             <div className="px-2 py-1 border border-[#D4AF37] text-[#D4AF37] text-[8px] font-bold uppercase tracking-[2px] rounded-sm">Host</div>
          ) : (
             <button onClick={() => setRole('HOST')} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/50 text-[8px] font-bold uppercase tracking-[2px] rounded-sm cursor-pointer border-none transition-colors hidden sm:block">DEBUG: BE HOST</button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        
        {/* STAGE AREA */}
        <div className="shrink-0 min-h-[30%] max-h-[50%] border-b border-white/10 p-4 flex flex-col relative">
          <div className="absolute top-2 left-4 text-[8px] font-black tracking-[4px] text-white/20 uppercase">Stage</div>
          
          <div className={`flex-1 grid ${gridColsClass} gap-3 mt-4 overflow-y-auto scrollbar-hide p-1`}>
            {speakers.map((speaker, idx) => (
              <div key={speaker.did} className="relative rounded-lg border border-white/10 bg-white/5 overflow-hidden flex flex-col aspect-video">
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-sm border border-white/10 flex items-center space-x-1 z-10">
                  <span className="text-[8px] font-bold tracking-[1px] text-white/80 truncate max-w-[80px]">{speaker.did}</span>
                </div>
                
                {/* Host Controls for Peer Management */}
                {role === 'HOST' && speaker.did !== 'MY_NODE' && (
                  <div className="absolute top-2 left-2 flex items-center space-x-1 z-20">
                    <button 
                      onClick={() => handleToggleMute(speaker.did)}
                      className={`p-1.5 rounded-sm border transition-all ${speaker.isMuted ? 'bg-[#EF4444]/20 border-[#EF4444]/40 text-[#EF4444]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                    >
                      {speaker.isMuted ? <MicOff size={10} /> : <Mic size={10} />}
                    </button>
                    <button 
                      onClick={() => handleToggleVideo(speaker.did)}
                      className={`p-1.5 rounded-sm border transition-all ${speaker.isVideoOff ? 'bg-[#EF4444]/20 border-[#EF4444]/40 text-[#EF4444]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                    >
                      {speaker.isVideoOff ? <VideoOff size={10} /> : <Video size={10} />}
                    </button>
                  </div>
                )}

                <div className="absolute top-2 right-2 text-white/40 z-10">
                  {speaker.isMuted ? <MicOff size={12} /> : <Mic size={12} className={speaker.role === 'HOST' ? 'text-[#D4AF37]' : 'text-[#00D1FF]'} />}
                </div>
                {/* Simulated Waveform or Video stream */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none transition-all">
                  {speaker.isVideoOff ? (
                    <VideoOff size={32} className="text-white/20" />
                  ) : (
                    idx % 2 === 0 ? <Video size={32} /> : <Activity size={32} />
                  )}
                </div>
                {speaker.isVideoOff && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-[7px] font-black uppercase tracking-[2px] text-white/40">Feed_Disconnected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* HOST: SIDEBAR / REQUESTS QUEUE (overlaid or split) */}
        {role === 'HOST' && (
          <div className="absolute top-[30%] right-0 w-48 h-[60%] border-l border-white/10 bg-black/80 backdrop-blur-xl z-20 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
              <span className="text-[10px] font-bold tracking-[2px] text-white/70 uppercase">Requests</span>
              <span className="bg-[#D4AF37] text-black text-[8px] font-black px-1.5 py-0.5 rounded-sm">{requests.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {requests.map(req => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={req.did} 
                  className="p-2 border border-white/10 rounded-sm bg-white/5 flex flex-col space-y-2"
                >
                  <span className="text-[10px] font-mono text-white/80 truncate">{req.did}</span>
                  <div className="flex space-x-1">
                    <button onClick={() => approveRequest(req.did)} className="flex-1 flex justify-center py-1 bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/30 rounded-sm cursor-pointer border border-[#22C55E]/30">
                      <Check size={12} />
                    </button>
                    <button onClick={() => denyRequest(req.did)} className="flex-1 flex justify-center py-1 bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 rounded-sm cursor-pointer border border-[#EF4444]/30">
                      <XCircle size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {requests.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center pt-8 opacity-30 text-center">
                   <Hand size={16} className="mb-2" />
                   <span className="text-[8px] font-bold tracking-widest uppercase">No Requests</span>
                </div>
              )}
            </div>
            
            {/* Global Actions */}
            <div className="p-2 border-t border-white/10 flex flex-col space-y-1">
              <AnimatePresence>
                {isLocked && blockedConnections > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-col items-center justify-center p-2 mb-1 border border-[#EF4444]/30 bg-[#EF4444]/5 rounded-sm"
                  >
                    <div className="flex items-center space-x-1 text-[#EF4444] mb-0.5">
                      <ShieldAlert size={10} />
                      <span className="text-[8px] font-black uppercase tracking-[1px]">Blocked Intrusions</span>
                    </div>
                    <span className="text-[#EF4444] text-[14px] font-mono font-bold leading-none">{blockedConnections}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={handleMuteAll} className="w-full py-1.5 flex justify-center items-center space-x-2 border border-white/20 hover:bg-white/10 text-white/70 rounded-sm cursor-pointer transition-colors">
                <MicOff size={10} />
                <span className="text-[8px] font-black uppercase tracking-[1px]">Mute All</span>
              </button>
              <button onClick={handleLockRoom} className={`w-full py-1.5 flex justify-center items-center space-x-2 border text-white/70 rounded-sm cursor-pointer transition-colors ${isLocked ? 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/20 hover:bg-white/10'}`}>
                <Lock size={10} />
                <span className="text-[8px] font-black uppercase tracking-[1px]">{isLocked ? 'Room Locked' : 'Lock Room'}</span>
              </button>
            </div>
          </div>
        )}

        {/* AUDIENCE AREA */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
          <div className="flex justify-between items-center mb-3">
             <div className="text-[8px] font-black tracking-[4px] text-white/20 uppercase">Audience</div>
             <div className="text-[8px] font-mono text-white/30 uppercase tracking-[1px] border border-white/10 px-1.5 py-0.5 flex items-center space-x-1">
               <Signal size={8} className="text-[#00D1FF]" />
               <span>GossipSub_Leaf</span>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1 pr-2">
             {listeners.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                   <div className="flex items-center space-x-2">
                     <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                        <Shield size={8} className="text-white/40" />
                     </div>
                     <span className="font-mono text-[11px] text-white/80">{p.did}</span>
                   </div>
                   <div className="flex items-center">
                     {p.hasHandRaised && <Hand size={10} className="text-[#00D1FF] animate-pulse" />}
                   </div>
                </div>
             ))}
          </div>
        </div>

      </div>

      {/* Control Bar - Bottom */}
      <div className="shrink-0 h-16 border-t border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center px-6 relative z-30">
        
        {/* Disconnect - Always present on far right */}
        <button 
          onClick={onDisconnect} 
          className="absolute right-6 w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer border border-red-500/30"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Center Controls based on Role */}
        <div className="flex items-center space-x-6">
          {role === 'LISTENER' ? (
            <button 
              onClick={toggleRaiseHand}
              className={`flex items-center justify-center space-x-2 h-10 px-6 rounded-full border transition-all cursor-pointer ${
                handRaised 
                ? 'bg-[#00D1FF]/20 border-[#00D1FF]/50 text-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.2)]' 
                : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
              }`}
            >
              <Hand size={18} className={handRaised ? 'animate-bounce' : ''} />
              <span className="text-[10px] font-black uppercase tracking-[2px]">{handRaised ? 'REQUEST_SENT' : 'RAISE_HAND'}</span>
            </button>
          ) : (
            <>
              {/* Speaker/Host Controls */}
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform cursor-pointer border-none shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Mic size={20} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer border-none">
                <Video size={18} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer border-none">
                <Settings size={18} />
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
