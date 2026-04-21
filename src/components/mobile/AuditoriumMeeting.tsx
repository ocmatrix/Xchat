import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Mic, MicOff, Hand, Video, VideoOff, 
  Settings, X, Check, XCircle, Shield, 
  Activity, Signal, Lock, ShieldAlert,
  MoreVertical, UserMinus, Ban
} from 'lucide-react';

interface AuditoriumMeetingProps {
  roomName: string;
  initialRole?: 'HOST' | 'LISTENER';
  onDisconnect: () => void;
  onMinimize?: () => void;
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
  onDisconnect,
  onMinimize
}) => {
  const [role, setRole] = useState<'HOST' | 'SPEAKER' | 'LISTENER'>(initialRole);
  const [handRaised, setHandRaised] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showApprovalFlash, setShowApprovalFlash] = useState(false);
  const [blockedConnections, setBlockedConnections] = useState(0);
  const [activeMenuDid, setActiveMenuDid] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ action: 'remove' | 'block', did: string } | null>(null);

  // Connection Error State
  const [mediaError, setMediaError] = useState<{ title: string; message: string } | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

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
        
        // If reconnecting, bandwidth drops to near-zero
        if (isReconnecting) {
          return { ...prev, bitrate: Math.max(0, prev.bitrate - 150) };
        }

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

  const handleDemote = (did: string) => {
    console.log(`[CRDT_STATE] Demoting ${did} to LISTENER`);
    setParticipants(prev => prev.map(p =>
      p.did === did ? { ...p, role: 'LISTENER', isMuted: false, isVideoOff: false } : p
    ));
    setActiveMenuDid(null);
  };

  const handleRemoveParticipant = (did: string) => {
    console.log(`[CRDT_STATE] Removing ${did} from room`);
    setParticipants(prev => prev.filter(p => p.did !== did));
    setConfirmModal(null);
  };

  const handleBlockParticipant = (did: string) => {
    console.log(`[CRDT_STATE] Blocking ${did} - adding to blacklist`);
    setBlockedConnections(prev => prev + 1);
    setParticipants(prev => prev.filter(p => p.did !== did));
    setConfirmModal(null);
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-black border border-white/10 rounded-md shadow-2xl p-5 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert size={24} className="text-[#EF4444]" />
              </div>
              <h3 className="text-white font-bold text-sm tracking-wide mb-2 uppercase">
                {confirmModal.action === 'remove' ? 'Remove Participant?' : 'Block Connection?'}
              </h3>
              <p className="text-white/60 text-[11px] mb-6 font-mono leading-relaxed px-4">
                {confirmModal.action === 'remove' 
                  ? `Are you sure you want to forcibly disconnect ${confirmModal.did} from the auditorium?` 
                  : `Are you sure you want to block ${confirmModal.did}? They will not be able to rejoin the current mesh.`
                }
              </p>
              <div className="flex w-full space-x-3">
                <button 
                  onClick={() => setConfirmModal(null)} 
                  className="flex-1 py-3 text-[10px] font-bold tracking-[1px] uppercase border border-white/10 rounded-sm hover:bg-white/5 transition-colors text-white/70"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => confirmModal.action === 'remove' ? handleRemoveParticipant(confirmModal.did) : handleBlockParticipant(confirmModal.did)} 
                  className="flex-1 py-3 text-[10px] font-bold tracking-[1px] uppercase bg-[#EF4444] text-white rounded-sm hover:bg-[#DC2626] transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Error Overlay Banner */}
      <AnimatePresence>
        {mediaError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] mt-4 w-11/12 max-w-md bg-[#1A0B0B]/90 backdrop-blur-xl border border-[#EF4444]/40 rounded-lg shadow-[0_10px_40px_rgba(239,68,68,0.2)] overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#EF4444] to-transparent animate-[pulse_2s_ease-in-out_infinite]"></div>
            <div className="px-4 py-3 flex items-start space-x-3">
              <div className="shrink-0 p-1.5 bg-[#EF4444]/10 rounded-full mt-0.5 animate-pulse">
                <ShieldAlert size={16} className="text-[#EF4444]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#EF4444] font-black text-[11px] uppercase tracking-[2px]">{mediaError.title}</h3>
                <p className="text-white/60 text-[10px] tracking-wide mt-1 leading-relaxed font-mono">
                  {mediaError.message}
                </p>
                <div className="flex items-center space-x-2 mt-2 opacity-50">
                   <Activity size={10} className="text-white" />
                   <span className="text-[9px] font-mono tracking-widest text-[#D4AF37]">ATTEMPTING_RECONNECT...</span>
                </div>
              </div>
              <button onClick={() => setMediaError(null)} className="shrink-0 text-white/40 hover:text-white transition-colors">
                 <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="shrink-0 h-16 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          {onMinimize && (
            <button 
              onClick={onMinimize}
              className="mr-1 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          )}
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
                
                {/* Top-Right indicators and Host Menu Trigger */}
                <div className="absolute top-2 right-2 flex items-center space-x-1 z-30">
                  <div className="text-white/40">
                    {speaker.isMuted ? <MicOff size={12} /> : <Mic size={12} className={speaker.role === 'HOST' ? 'text-[#D4AF37]' : 'text-[#00D1FF]'} />}
                  </div>
                  {role === 'HOST' && speaker.did !== 'MY_NODE' && (
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenuDid(speaker.did); }}
                        className="p-0.5 text-white/50 hover:text-white transition-colors bg-black/40 rounded-sm backdrop-blur-md border border-white/10 ml-1"
                      >
                        <MoreVertical size={12} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenuDid === speaker.did && (
                          <>
                            {/* Invisible backdrop to close menu */}
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuDid(null); }} />

                            {/* Context Menu */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10, transformOrigin: 'top right' }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                              className="absolute top-full right-0 mt-2 w-36 bg-black/90 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl z-50 flex flex-col py-1 overflow-hidden"
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleMute(speaker.did); setActiveMenuDid(null); }}
                                className="px-3 py-2 flex items-center space-x-3 hover:bg-white/10 transition-colors text-left"
                              >
                                {speaker.isMuted ? <Mic size={10} className="text-[#22C55E]" /> : <MicOff size={10} className="text-[#EF4444]" />}
                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">{speaker.isMuted ? 'Unmute Auth' : 'Force Mute'}</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleVideo(speaker.did); setActiveMenuDid(null); }}
                                className="px-3 py-2 flex items-center space-x-3 hover:bg-white/10 transition-colors text-left"
                              >
                                {speaker.isVideoOff ? <Video size={10} className="text-[#22C55E]" /> : <VideoOff size={10} className="text-[#EF4444]" />}
                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">{speaker.isVideoOff ? 'Enable Feed' : 'Cut Video'}</span>
                              </button>
                              <div className="h-[1px] bg-white/10 my-1 box-border w-full" />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDemote(speaker.did); }}
                                className="px-3 py-2 flex items-center space-x-3 hover:bg-[#D4AF37]/20 transition-colors text-left text-[#D4AF37]"
                              >
                                <UserMinus size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Demote</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirmModal({ action: 'remove', did: speaker.did }); setActiveMenuDid(null); }}
                                className="px-3 py-2 flex items-center space-x-3 hover:bg-[#EF4444]/20 transition-colors text-left text-[#EF4444]"
                              >
                                <XCircle size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Remove</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirmModal({ action: 'block', did: speaker.did }); setActiveMenuDid(null); }}
                                className="px-3 py-2 flex items-center space-x-3 hover:bg-[#EF4444]/20 transition-colors text-left text-[#EF4444]"
                              >
                                <Ban size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Block</span>
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
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

              {/* Dev Simulation Control */}
              <button 
                onClick={() => {
                   setMediaError({
                     title: "CRITICAL_GOSSIP_FAILURE",
                     message: "Local hardware pipeline collapsed. Rebooting physical audio layer and attempting mesh reconnection..."
                   });
                   setIsReconnecting(true);
                   setTimeout(() => { setIsReconnecting(false); setMediaError(null); }, 4000);
                }}
                className="w-full py-1.5 flex justify-center items-center space-x-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 text-[#D4AF37] rounded-sm cursor-pointer transition-colors"
              >
                <Activity size={10} />
                <span className="text-[8px] font-black uppercase tracking-[1px]">Sim Fault</span>
              </button>

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
              <button 
                onClick={() => handleToggleMute('MY_NODE')}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-transform cursor-pointer border-none shadow-[0_0_20px_rgba(255,255,255,0.2)] ${
                  participants.find(p => p.did === 'MY_NODE')?.isMuted 
                  ? 'bg-[#EF4444] text-white hover:bg-[#EF4444]/90' 
                  : 'bg-white text-black hover:scale-105'
                }`}
              >
                {participants.find(p => p.did === 'MY_NODE')?.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button 
                onClick={() => handleToggleVideo('MY_NODE')}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer border-none ${
                  participants.find(p => p.did === 'MY_NODE')?.isVideoOff
                  ? 'bg-[#EF4444] text-white hover:bg-[#EF4444]/90'
                  : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {participants.find(p => p.did === 'MY_NODE')?.isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
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
