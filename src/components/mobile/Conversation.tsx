import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, Phone, Video, Info, ShieldCheck, Lock, 
  ChevronLeft, ArrowRight, Trash2, AlertTriangle, 
  RefreshCw, BarChart3, ArrowLeft, Shield, Activity, 
  MoreHorizontal, Command, Terminal, Mic, MicOff,
  Paperclip, Image, Film, MapPin, FileText, Satellite, Orbit, Box, ArrowDown, Clock, Flame, Plus
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
    <div className="absolute inset-0 bg-nexus-bg z-[500] flex flex-col overflow-hidden animate-in fade-in duration-300 font-sans">
      {showGroupPanel && (
        <GroupPanel 
          groupName={targetName} 
          isIsolated={isIsolated}
          members={MOCK_MEMBERS} 
          onClose={() => setShowGroupPanel(false)} 
        />
      )}

      {/* iOS Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between h-[44px] sm:mt-[30px] px-2 bg-nexus-surface/90 backdrop-blur-xl border-b border-nexus-border transition-all">
        {/* Left: Back Button */}
        <button 
          onClick={onBack} 
          className="flex items-center text-nexus-accent-blue active:opacity-70 transition-opacity bg-transparent border-none cursor-pointer"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
          <span className="text-[17px] -ml-1">Back</span>
        </button>
        
        {/* Center: Title & Avatar */}
        <div 
          className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2 cursor-pointer active:opacity-70"
          onClick={() => isGroup && setShowGroupPanel(true)}
        >
           <h2 className="text-nexus-ink font-semibold text-[17px] tracking-tight truncate max-w-[150px]">
             {targetName}
           </h2>
           <span className="text-nexus-ink-muted text-[11px]">
              {isGroup ? 'Group' : 'Online'}
           </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4 pr-2">
           <button 
             onClick={() => onLightningCall('video')}
             className="text-nexus-accent-blue active:opacity-70 transition-opacity bg-transparent border-none cursor-pointer"
           >
             <Video size={24} strokeWidth={1.5} />
           </button>
           <button 
             onClick={() => onLightningCall('audio')}
             className="text-nexus-accent-blue active:opacity-70 transition-opacity bg-transparent border-none cursor-pointer"
           >
             <Phone size={22} strokeWidth={1.5} />
           </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 pt-[60px] sm:pt-[90px] space-y-3 scrollbar-hide relative flex flex-col transition-colors ${isOfflineMode ? 'bg-nexus-surface' : 'bg-nexus-bg'}`}>
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
      
      {/* iOS Input Interface */}
      <div className={`bg-nexus-surface/90 backdrop-blur-xl border-t border-nexus-border shrink-0 px-3 py-2 pb-safe z-20 transition-all duration-300 relative`}>
        
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
                className="absolute bottom-full left-4 mb-2 z-20 w-[240px] bg-nexus-surface border border-nexus-border rounded-[14px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] p-2 grid grid-cols-2 gap-2 overflow-hidden"
              >
                <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-none">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-1 group-hover:scale-105 transition-transform">
                    <Image size={24} />
                  </div>
                  <span className="text-[12px] font-medium text-nexus-ink">Photo</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-none">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-1 group-hover:scale-105 transition-transform">
                    <Film size={24} />
                  </div>
                  <span className="text-[12px] font-medium text-nexus-ink">Video</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-none">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-1 group-hover:scale-105 transition-transform">
                    <FileText size={24} />
                  </div>
                  <span className="text-[12px] font-medium text-nexus-ink">Document</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-none">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-1 group-hover:scale-105 transition-transform">
                    <MapPin size={24} />
                  </div>
                  <span className="text-[12px] font-medium text-nexus-ink">Location</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex items-end space-x-2">
           <button 
             onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
             className={`text-nexus-ink-muted transition-all bg-transparent border-none p-2 mb-0.5 flex items-center justify-center cursor-pointer hover:text-nexus-ink ${showAttachmentMenu ? 'rotate-45 text-nexus-accent-blue' : ''}`}
           >
              <Plus size={24} strokeWidth={2} className="text-nexus-ink-muted" />
           </button>

           <div className={`flex-1 flex items-center min-h-[36px] max-h-[120px] rounded-[18px] border border-nexus-border bg-nexus-surface relative overflow-hidden`}>
             <input 
               type="text"
               className="flex-1 text-nexus-ink bg-transparent py-2 px-3 outline-none placeholder:text-nexus-ink-muted/50 text-[17px] leading-tight"
               placeholder={isListening ? "Listening..." : "iMessage"}
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
           </div>
           
           <div className="flex items-center mb-0.5">
             <button 
               onClick={inputText.trim() ? handleSend : startSpeechRecognition}
               className={`w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer border-none ${
                 inputText.trim() ? 'bg-nexus-accent-blue text-white' : (isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-transparent text-nexus-ink-muted')
               }`}
             >
               {inputText.trim() ? (
                 <ArrowRight size={18} strokeWidth={2.5} />
               ) : (
                 <Mic size={22} strokeWidth={1.5} />
               )}
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
