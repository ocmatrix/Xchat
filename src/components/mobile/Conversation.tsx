import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, Phone, Video, Info, ShieldCheck, Lock, 
  ChevronLeft, ArrowRight, Trash2, AlertTriangle, 
  RefreshCw, BarChart3, ArrowLeft, Shield, Activity, 
  MoreHorizontal, Command, Terminal, Mic, MicOff,
  Paperclip, Image, Film, MapPin, FileText, Satellite, Orbit, Box, ArrowDown, Clock, Flame
} from 'lucide-react';
import { GroupPanel } from './GroupPanel';
import { motion, AnimatePresence } from 'motion/react';
import { NexusCompressionService } from '../../services/NexusCompressionService';
import { NexusSecurityService } from '../../services/NexusSecurityService';
import { ShadowDropService } from '../../services/ShadowDropService';

// Add type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const MosaicPressable = ({ src }: { src: string }) => {
  const [isDecrypted, setIsDecrypted] = useState(false);

  return (
    <div 
      className={`relative w-72 h-52 overflow-hidden bg-nexus-surface border border-nexus-border rounded-sm group cursor-pointer transition-all duration-500 ${isDecrypted ? 'shadow-[0_0_30px_rgba(212,175,55,0.1)] border-nexus-accent-gold/20' : ''}`}
      onMouseDown={() => setIsDecrypted(true)}
      onMouseUp={() => setIsDecrypted(false)}
      onMouseLeave={() => setIsDecrypted(false)}
      onTouchStart={() => setIsDecrypted(true)}
      onTouchEnd={() => setIsDecrypted(false)}
    >
      {isDecrypted ? (
        <img 
          src={src} 
          alt="DECRYPTED_PAYLOAD" 
          className="w-full h-full object-cover animate-in fade-in duration-300 contrast-125"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat bg-center opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm" />
          <Lock size={18} className="text-nexus-accent-gold mb-2 opacity-30 z-10" strokeWidth={1} />
          <span className="text-nexus-accent-gold font-mono text-[7px] tracking-[4px] uppercase opacity-30 z-10 font-bold">Hold_To_Reveal</span>
          
          {/* Tactical Frame */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20" />
        </div>
      )}
    </div>
  );
};

export const Conversation = ({ messages: initialMessages, onLightningCall, onBack, isGroup = false, isIsolated = false, targetName = "SECURE CHANNEL" }) => {
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSharding, setIsSharding] = useState(false);
  const [offlineTTL, setOfflineTTL] = useState("72H");
  const [showTTLSelector, setShowTTLSelector] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [localMessages, setLocalMessages] = useState<any[]>(initialMessages);
  
  // Sync prop changes to local state
  useEffect(() => {
    setLocalMessages(initialMessages);
  }, [initialMessages]);

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("STT_SUBSYSTEM_UNAVAILABLE::Browser does not support Web Speech API");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        console.log("🎙️ SECURE_VOICE_LINK_ESTABLISHED");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? " " : "") + transcript);
        console.log("🔤 PHONETIC_DATA_DECODED:", transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("🎙️ STT_SUBSYSTEM_FAULT:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log("🎙️ SECURE_VOICE_LINK_TERMINATED");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("🎙️ STT_INIT_FAILURE:", err);
    }
  };

  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<any[]>([]);
  const [burningMessageId, setBurningMessageId] = useState<string | null>(null);
  const [burningProcessIds, setBurningProcessIds] = useState<Record<string, number>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, historyMessages]);

  const loadHistory = async () => {
    if (isLoadingHistory || hasLoadedHistory) return;
    setIsLoadingHistory(true);
    
    // Simulate P2P history shard retrieval
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockHistory = [
      { id: 'h1', text: '[REDACTED] Initial syndicate formation. #001', type: 'system', mlsEpoch: '10A1' },
      { id: 'h2', text: 'Target objective: Decentralized Mesh expansion.', sender: 'them', mlsEpoch: '10A2' },
      { id: 'h3', text: 'All nodes synchronized. Ready for operation.', sender: 'me', mlsEpoch: '10A2' },
    ];
    
    setHistoryMessages(mockHistory);
    setIsLoadingHistory(false);
    setHasLoadedHistory(true);
  };

  const handleSend = async () => {
    if (inputText.trim()) {
      const messagePayload = {
        text: inputText,
        timestamp: Date.now(),
        sender: 'me',
        shardId: '01'
      };

      // 1. Secure Payload via E2EE (Double Ratchet + AES-GCM)
      const encryptedEnvelope = await NexusSecurityService.encrypt(messagePayload, currentEpoch);

      // 2. Apply Nexus Compression before transmission
      const networkEnvelope = await NexusCompressionService.compress(encryptedEnvelope);

      if (isOfflineMode) {
        // Shadow Drop Asynchronous Core: EXEC PHASE 3.0
        setIsSharding(true);
        const shadowEnv = await ShadowDropService.initiateShadowDrop(messagePayload, offlineTTL);
        setIsSharding(false);

        console.log(`🌑 SHADOW_PROTOCOL::REPOSITED_IN_VAULT`);
        console.log(`🧩 FRAGMENT_CID::${shadowEnv.cid}`);
        console.log(`🏢 BLIND_RELAY_SWARM::${shadowEnv.blindRelaySwarm.join(' | ')}`);
        
        const offlineMessage = {
          id: `msg-${Date.now()}`,
          text: inputText,
          sender: 'me',
          timestamp: 'Shadowed',
          isOffline: true,
          cid: shadowEnv.cid,
          nodes: shadowEnv.blindRelaySwarm,
          ttl: shadowEnv.ttl
        };
        setLocalMessages(prev => [...prev, offlineMessage]);
      } else {
        // Real-time Core: Active P2P Tunnel
        console.log(`📡 TX_STREAM_INITIATED::SECURE_ENVELOPE_V1`);
        console.log(`🔒 E2EE_HASH::${encryptedEnvelope.authTag.slice(0, 12)}`);
        console.log(`📊 NEXUS_OPTIMIZATION::RATIO=${((1 - networkEnvelope.compressedSize / networkEnvelope.originalSize) * 100).toFixed(1)}%`);
        
        const newMessage = {
          id: `msg-${Date.now()}`,
          text: inputText,
          sender: 'me',
          timestamp: 'Just now'
        };
        setLocalMessages(prev => [...prev, newMessage]);
      }
      
      setInputText("");
    }
  };

  const startBurning = (messageId: string) => {
    const duration = 5; // 5 seconds countdown
    setBurningProcessIds((prev) => ({ ...prev, [messageId]: duration }));

    const interval = setInterval(() => {
      setBurningProcessIds((prev) => {
        const remaining = (prev[messageId] || 0) - 1;
        if (remaining <= 0) {
          clearInterval(interval);
          const next = { ...prev };
          delete next[messageId];
          console.log(`MESSAGE_BURNED::${messageId}`);
          
          // Remove from local and history messages
          setLocalMessages(m => m.filter(msg => msg.id !== messageId));
          setHistoryMessages(m => m.filter(msg => msg.id !== messageId));
          
          return next;
        }
        return { ...prev, [messageId]: remaining };
      });
    }, 1000);
  };

  const currentEpoch = "4AA2";
  const MOCK_MEMBERS = [
    { did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76', role: 'ADMIN' as const },
    { did: 'did:key:z6MkqY8xXyGZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg', role: 'NODE' as const },
  ];

  return (
    <div className="absolute inset-0 bg-nexus-bg z-[100] flex flex-col overflow-hidden animate-in fade-in duration-500 font-sans">
      {showGroupPanel && (
        <GroupPanel 
          groupName={targetName} 
          isIsolated={isIsolated}
          members={MOCK_MEMBERS} 
          onClose={() => setShowGroupPanel(false)} 
        />
      )}

      {/* Tactical Header */}
      <div className="shrink-0 z-20 flex flex-col pt-10 pb-1 px-4 bg-nexus-surface/90 backdrop-blur-xl border-b border-nexus-border shadow-sm relative transition-colors">
        <div className="flex items-center justify-between w-full h-[36px]">
          <div className="flex items-center space-x-3 overflow-hidden flex-1">
            <button 
              onClick={onBack} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-nexus-bg border border-nexus-border text-nexus-ink-muted hover:text-nexus-ink transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex flex-col min-w-0 flex-1 pl-1">
               <div className="flex items-center space-x-2 mb-0 w-full" onClick={() => isGroup && setShowGroupPanel(true)}>
                  <h2 className="text-nexus-ink font-sans text-2xl font-bold tracking-tight uppercase truncate cursor-pointer">
                    {targetName}
                  </h2>
                  <div className={`w-1.5 h-1.5 shrink-0 rounded-full ${isIsolated ? 'bg-[#FF3B30]' : 'bg-nexus-accent-cyan animate-pulse'}`} />
                  
                  {/* E2EE DYNAMIC COLOR-CODED BADGE */}
                  <div className={`flex items-center space-x-1 px-1.5 py-0.5 border rounded-[3px] ml-1 shrink-0 ${
                    isIsolated 
                      ? 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]' 
                      : 'bg-nexus-accent-gold/10 border-nexus-accent-gold/20 text-nexus-accent-gold'
                  }`}>
                    <ShieldCheck size={8} />
                    <span className="font-black text-[6px] tracking-[1px] uppercase">
                      {isIsolated ? 'HARDENED_E2EE' : 'SECURE_E2EE'}
                    </span>
                  </div>
               </div>
               <div className="flex items-center space-x-2 w-full truncate">
                  <span className="text-nexus-ink-muted opacity-50 font-black text-[7px] tracking-[4px] uppercase shrink-0">
                    {isIsolated ? 'ISOLATED_SEC_NET' : 'P2P_TUNNEL::ACT'}
                  </span>
                  <div className="w-[1px] h-2 bg-black/[0.05] shrink-0" />
                  <span className="text-nexus-ink-muted opacity-50 font-black text-[7px] tracking-[4px] uppercase truncate">
                    EPOCH_{currentEpoch}
                  </span>
               </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
             <button 
               onClick={onLightningCall}
               className="w-9 h-9 flex items-center justify-center text-nexus-ink-muted hover:text-nexus-ink transition-all cursor-pointer rounded-full active:scale-95"
             >
               <Video size={16} strokeWidth={2} />
             </button>
             <button 
               onClick={() => setShowGroupPanel(true)}
               className="w-9 h-9 flex items-center justify-center text-nexus-ink-muted hover:text-nexus-ink transition-all cursor-pointer rounded-full active:scale-95"
             >
               <MoreHorizontal size={16} strokeWidth={2} />
             </button>
          </div>
        </div>

        <div className="h-8 flex items-center px-0 mt-1 border-t border-nexus-border justify-between overflow-hidden">
           <div className="flex items-center min-w-0">
              <Terminal size={10} className="text-nexus-ink-muted opacity-30 mr-2" />
              <span className="text-nexus-ink-muted opacity-30 font-mono text-[7px] uppercase tracking-[1px] mr-2 font-black">Path://</span>
              <span className="text-nexus-ink-muted font-mono text-[8px] truncate tracking-tighter opacity-60">
                 {isOfflineMode ? `ShadowDrop_Vault_Active::OFFLINE_MAIL_ACTIVE` : (isGroup ? `Consensus_Active::Epoch_${currentEpoch}` : `Shard_Tunnel::${targetName.toUpperCase()}_NODE`)}
              </span>
           </div>
           
           <div className="flex items-center space-x-3 opacity-30">
              <div className="flex items-center space-x-1">
                 <Shield size={9} className="text-nexus-accent-blue" />
                 <span className="text-nexus-ink font-bold text-[7px] uppercase tracking-[1px]">E2EE</span>
              </div>
              <div className="flex items-center space-x-1">
                 <BarChart3 size={9} className="text-nexus-ink" />
                 <span className="text-nexus-ink font-bold text-[7px] uppercase tracking-[1px]">98ms</span>
              </div>
           </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide relative flex flex-col transition-colors ${isOfflineMode ? 'bg-nexus-surface shadow-[inset_0_0_100px_rgba(212,175,55,0.04)]' : 'bg-nexus-bg'}`}>
        {isOfflineMode && (
          <div className="absolute inset-0 pointer-events-none z-10 border-x border-nexus-accent-gold/5" />
        )}
        {isGroup && !hasLoadedHistory && (
          <div className="flex items-center justify-center py-6 mb-4 bg-nexus-surface border border-nexus-border rounded-[4px] shadow-sm">
            <button 
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="px-6 py-2 border border-nexus-accent-blue/20 hover:bg-nexus-accent-blue/5 transition-all bg-transparent cursor-pointer flex items-center space-x-3 rounded-[2px] disabled:opacity-30 group"
            >
              <RefreshCw size={11} className={`text-nexus-accent-blue ${isLoadingHistory ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              <span className="text-nexus-accent-blue font-bold text-[8px] tracking-[3px] uppercase">
                {isLoadingHistory ? 'Decrypting_Epochs...' : 'SYNCHRONIZE_LOCAL_SHARDS'}
              </span>
            </button>
          </div>
        )}

        <div className="mt-auto flex flex-col space-y-2">
          {[...historyMessages, ...localMessages].map((item, idx, arr) => {
            const isMe = item.sender === 'me';
            const timestamp = "12:41";
            const showMetadata = idx === 0 || arr[idx-1].sender !== item.sender;
            const burningCountdown = burningProcessIds[item.id];
            
            if (item.type === 'system') {
              return (
                <div key={item.id} className="flex px-4 py-2 border-l border-nexus-accent-blue/30 bg-nexus-accent-blue/[0.03] my-2 text-center items-center justify-center">
                  <span className="text-nexus-accent-blue font-bold text-[7px] uppercase tracking-[2px] opacity-40 mr-2">CORE_LOG:</span>
                  <span className="text-nexus-ink-muted text-[10px] leading-tight tracking-tight opacity-70 italic">{item.text}</span>
                </div>
              );
            }

            return (
              <div key={item.id} className={`flex flex-col group relative ${showMetadata ? 'mt-3' : 'mt-0.5'} ${isMe ? 'items-end' : 'items-start'}`}>
                {showMetadata && (
                   <span className={`text-[8px] font-bold uppercase tracking-[1px] mb-1 opacity-30 ${isMe ? 'mr-1' : 'ml-1'}`}>
                      {isMe ? 'Local_Node' : (item.sender || 'Peer_Node')}
                   </span>
                )}
                
                <div className={`flex items-start group relative ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {item.type === 'image' ? (
                      <div className="rounded-[4px] overflow-hidden border border-nexus-border shadow-sm">
                         <MosaicPressable src={item.text} />
                      </div>
                    ) : (
                      <div className={`px-4 py-2.5 rounded-[12px] shadow-sm transition-all text-[14px] leading-snug tracking-tight relative overflow-hidden ${
                        isMe 
                        ? (item.isOffline 
                            ? 'bg-nexus-surface border border-nexus-accent-gold/40 text-nexus-ink shadow-[0_0_15px_rgba(212,175,55,0.05)]' 
                            : 'bg-nexus-accent-blue text-white font-medium') + ' rounded-tr-none' 
                        : 'bg-nexus-surface border border-nexus-border text-nexus-ink rounded-tl-none'
                      }`}>
                        {item.isOffline && (
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:100%_3px]" />
                        )}
                        {burningCountdown > 0 && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden">
                            <motion.div 
                              initial={{ opacity: 0, scale: 2 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              key={burningCountdown}
                              className="text-white font-black text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20"
                            >
                               {burningCountdown}
                            </motion.div>
                            <motion.div 
                              initial={{ width: '0%' }}
                              animate={{ width: `${(1 - burningCountdown / 5) * 100}%` }}
                              className="absolute inset-0 bg-red-600/40 mix-blend-overlay z-10"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent z-0 animate-pulse" />
                          </div>
                        )}
                        {item.text}
                        {item.isOffline && (
                          <div className="mt-1 pt-1 border-t border-nexus-accent-gold/10 flex flex-col space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[6px] font-black uppercase tracking-[2px] text-nexus-accent-gold">STORED IN RELAY SWARM</span>
                              <div className="flex items-center space-x-1 px-1 py-0.5 bg-nexus-accent-gold/20 border border-nexus-accent-gold/30 rounded-[2px]">
                                <Clock size={6} className="text-nexus-accent-gold" />
                                <span className="text-[5px] font-black text-nexus-accent-gold uppercase tracking-[1px]">AUTO-WIPE: {item.ttl || '72H'}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                               {item.nodes?.map((n: string, i: number) => (
                                 <div key={i} className="px-1 py-0.5 bg-nexus-accent-gold/5 border border-nexus-accent-gold/10 rounded-[1px]">
                                    <span className="text-[4px] font-bold text-nexus-accent-gold/40">{n}</span>
                                 </div>
                               ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!burningCountdown && (
                    <div className={`flex items-center space-x-2 self-end mb-1 mx-2 transition-opacity duration-300 opacity-20 group-hover:opacity-60 ${isMe ? '' : 'flex-row-reverse'}`}>
                      {item.isOffline ? (
                        <Orbit size={8} className="text-nexus-accent-gold animate-spin-slow" />
                      ) : (
                        <Clock size={8} className="text-nexus-ink-muted" />
                      )}
                      <span className="text-[7px] font-bold text-nexus-ink-muted uppercase tracking-tighter">
                         {typeof item.timestamp === 'number' ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : (item.timestamp || timestamp)}
                      </span>
                      {isMe && (
                        <button 
                          onClick={() => setBurningMessageId(item.id)}
                          className="text-red-500 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-all bg-transparent border-none p-1 cursor-pointer"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  )}

                  {!isMe && item.isOffline && (
                    <div className="flex items-center space-x-1 mt-1 opacity-40 ml-1">
                       <ArrowDown size={8} className="text-nexus-accent-cyan" />
                       <span className="text-[6px] font-black uppercase tracking-[1px] text-nexus-accent-cyan">DECRYPTING_SHADOW...</span>
                    </div>
                  )}

                  {burningCountdown > 0 && (
                    <div className="flex items-center space-x-2 self-end mb-1 mx-2">
                      <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-[2px] shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        <Flame size={8} className="text-red-500 animate-pulse" />
                        <span className="text-red-500 font-black text-[7px] uppercase tracking-[1.5px]">DATA_PURGE_IN: {burningCountdown}S</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} className="h-4 shrink-0" />
      </div>
      
      {/* Tactical Input Interface */}
      <div className={`bg-nexus-surface/80 backdrop-blur-xl border-t border-nexus-border shrink-0 px-4 py-3 pb-8 z-20 transition-all duration-700 relative ${isOfflineMode ? 'shadow-[0_-20px_50px_rgba(212,175,55,0.06)]' : ''}`}>
        
        {/* Voice Recognition Status Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 24, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-center space-x-3 bg-nexus-accent-gold/5 border-b border-nexus-accent-gold/10 overflow-hidden"
            >
               <div className="flex space-x-0.5 items-center h-2">
                 {[1, 2, 3, 4, 5].map((i) => (
                   <motion.div
                     key={i}
                     animate={{ height: [4, 12, 4] }}
                     transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                     className="w-0.5 bg-nexus-accent-gold rounded-full"
                   />
                 ))}
               </div>
               <span className="text-nexus-accent-gold font-black text-[7px] tracking-[4px] uppercase animate-pulse">Listening_Secure_Voice_Stream...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sharding Status Indicator */}
        <AnimatePresence>
          {isSharding && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 24, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-center space-x-3 bg-nexus-accent-gold/10 border-b border-nexus-accent-gold/20 overflow-hidden"
            >
               <RefreshCw size={10} className="text-nexus-accent-gold animate-spin" />
               <span className="text-nexus-accent-gold font-black text-[7px] tracking-[4px] uppercase animate-pulse">ENCRYPTING & SHARDING_PAYLOAD...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment Menu Popover */}
        <AnimatePresence>
          {showAttachmentMenu && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAttachmentMenu(false)}
                className="fixed inset-0 z-10"
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-4 mb-2 z-20 w-48 bg-nexus-surface border border-nexus-border rounded-xl shadow-2xl p-2 grid grid-cols-2 gap-2 overflow-hidden"
              >
                <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-nexus-bg transition-colors group cursor-pointer border-none">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-1 group-hover:scale-110 transition-transform">
                    <Image size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-nexus-ink uppercase tracking-wider">Image</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-nexus-bg transition-colors group cursor-pointer border-none">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-1 group-hover:scale-110 transition-transform">
                    <Film size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-nexus-ink uppercase tracking-wider">Video</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-nexus-bg transition-colors group cursor-pointer border-none">
                  <div className="w-10 h-10 rounded-full bg-nexus-accent-gold/10 flex items-center justify-center text-nexus-accent-gold mb-1 group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-nexus-ink uppercase tracking-wider">Doc</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-nexus-bg transition-colors group cursor-pointer border-none">
                  <div className="w-10 h-10 rounded-full bg-nexus-accent-cyan/10 flex items-center justify-center text-nexus-accent-cyan mb-1 group-hover:scale-110 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-nexus-ink uppercase tracking-wider">Place</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className={`flex items-center space-x-2 border rounded-full px-4 py-1 focus-within:shadow-md transition-all duration-500 relative ${
          isOfflineMode 
          ? 'bg-nexus-accent-gold/[0.03] border-nexus-accent-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
          : 'bg-nexus-bg border-nexus-border focus-within:bg-nexus-surface'
        }`}>
           {isOfflineMode && (
             <div className="absolute -top-3 left-6 flex items-center space-x-2 z-30">
               <div className="px-1.5 py-0.5 bg-nexus-accent-gold text-black text-[6px] font-black uppercase tracking-[2px] rounded-sm animate-pulse">
                 PROTOCOL: SHADOW_DROP
               </div>
               
               <div className="relative">
                 <button 
                   onClick={() => setShowTTLSelector(!showTTLSelector)}
                   className="flex items-center space-x-1 px-1.5 py-0.5 bg-nexus-surface border border-nexus-accent-gold/30 text-nexus-accent-gold text-[6px] font-black uppercase tracking-[1px] rounded-sm hover:bg-nexus-accent-gold hover:text-black transition-all cursor-pointer"
                 >
                   <Clock size={6} />
                   <span>TTL: {offlineTTL}</span>
                 </button>
                 
                 <AnimatePresence>
                   {showTTLSelector && (
                     <motion.div 
                       initial={{ opacity: 0, y: 5 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 5 }}
                       className="absolute bottom-full left-0 mb-1 bg-nexus-surface border border-nexus-accent-gold/40 rounded-sm p-1 shadow-xl flex flex-col space-y-1 min-w-[60px]"
                     >
                       {["24H", "48H", "72H", "168H"].map((t) => (
                         <button 
                           key={t}
                           onClick={() => {
                             setOfflineTTL(t);
                             setShowTTLSelector(false);
                           }}
                           className={`px-2 py-1 text-[6px] font-black uppercase text-left rounded-xs transition-colors border-none cursor-pointer ${
                             offlineTTL === t 
                             ? 'bg-nexus-accent-gold text-black' 
                             : 'text-nexus-accent-gold hover:bg-nexus-accent-gold/10 bg-transparent'
                           }`}
                         >
                           {t} {t === '168H' ? '(1 WEEK)' : ''}
                         </button>
                       ))}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             </div>
           )}
           <button 
             onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
             className={`text-nexus-ink-muted transition-all bg-transparent border-none p-0 flex items-center justify-center cursor-pointer hover:text-nexus-ink ${showAttachmentMenu ? 'rotate-45 text-nexus-accent-blue' : ''}`}
           >
              <Paperclip size={18} strokeWidth={2.5} />
           </button>

           <input 
             type="text"
             className="flex-1 text-nexus-ink bg-transparent py-2.5 px-1 outline-none placeholder:text-nexus-ink-muted/20 text-[15px]"
             placeholder={isListening ? "Listening..." : "Message..."}
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
           />
           
           <div className="flex items-center space-x-1">
             <button 
               onClick={() => setIsOfflineMode(!isOfflineMode)}
               className={`w-9 h-9 flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer border-none ${
                  isOfflineMode 
                  ? 'text-nexus-accent-gold bg-nexus-accent-gold/10' 
                  : 'bg-transparent text-nexus-ink-muted opacity-30 hover:opacity-100 hover:bg-nexus-ink/5'
               }`}
               title={isOfflineMode ? "OFFLINE_MAIL_ACTIVE" : "SWITCH_TO_OFFLINE_MAIL"}
             >
               <Satellite size={16} strokeWidth={2.5} />
             </button>

             <button
               onClick={startSpeechRecognition}
               className={`w-9 h-9 flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer border-none ${
                  isListening 
                  ? 'bg-nexus-accent-gold text-black shadow-[0_0_20px_rgba(255,184,0,0.5)]' 
                  : 'bg-transparent text-nexus-ink-muted opacity-30 hover:opacity-100 hover:bg-nexus-ink/5'
               }`}
             >
               {isListening ? <MicOff size={18} strokeWidth={2.5} /> : <Mic size={18} strokeWidth={2.5} />}
             </button>

             <button
               onClick={handleSend}
               disabled={!inputText.trim()}
               className={`w-9 h-9 flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer border-none ${
                 inputText.trim() 
                 ? 'bg-nexus-accent-blue text-white shadow-md active:scale-95' 
                 : 'bg-transparent text-nexus-ink-muted opacity-20'
               }`}
             >
               <ArrowRight size={18} strokeWidth={3} />
             </button>
           </div>
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {burningMessageId && (
          <BurnConfirmation 
            onConfirm={() => {
              startBurning(burningMessageId);
              setBurningMessageId(null);
            }}
            onCancel={() => setBurningMessageId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const BurnConfirmation = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-nexus-bg/95 backdrop-blur-xl z-[1000] flex items-center justify-center p-12 text-center"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-nexus-surface border border-[#EF4444]/30 p-10 flex flex-col items-center rounded-sm"
      >
        <div className="w-20 h-20 bg-[#EF4444]/10 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 border border-[#EF4444]/20 rounded-full animate-ping" />
          <AlertTriangle size={36} className="text-[#EF4444]" />
        </div>
        
        <h3 className="text-nexus-ink font-black text-lg tracking-[6px] uppercase mb-4">
          Irreversible_Burn
        </h3>
        
        <p className="text-nexus-ink-muted font-mono text-[10px] leading-relaxed mb-12 uppercase tracking-wide">
          This payload will be erased from all decentralized shards in this epoch. This action is final and cannot be undone by any node.
        </p>
        
        <div className="w-full space-y-4">
          <button 
            onClick={onConfirm}
            className="w-full h-16 bg-[#EF4444] text-black font-black text-[10px] tracking-[6px] uppercase hover:bg-[#FF5555] transition-all cursor-pointer rounded-sm shadow-[0_0_30px_rgba(239,68,68,0.3)] active:scale-95"
          >
            CONFIRM_BURN
          </button>
          
          <button 
            onClick={onCancel}
            className="w-full h-16 bg-transparent border border-nexus-border text-nexus-ink-muted font-black text-[10px] tracking-[4px] uppercase hover:bg-white/5 hover:text-nexus-ink transition-all cursor-pointer rounded-sm"
          >
            ABORT_OPERATION
          </button>
        </div>

        <div className="mt-10 flex items-center space-x-3 opacity-20">
          <div className="w-1.5 h-1.5 rounded-sm bg-[#EF4444] animate-pulse" />
          <span className="text-nexus-ink font-black text-[7px] tracking-[3px] uppercase">
            Sovereign_Node_Authorization_Required
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
