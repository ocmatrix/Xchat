import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Zap, Phone, Video, Info, ShieldCheck, Lock, 
  ChevronLeft, ArrowRight, Trash2, AlertTriangle, 
  RefreshCw, BarChart3, ArrowLeft, Shield, Activity, 
  MoreHorizontal, Command, Terminal, Mic, MicOff,
  Paperclip, Image, Film, MapPin, FileText, Satellite, Orbit, Box, ArrowDown, Clock, Flame, Plus, Contact
} from 'lucide-react';
import { GroupPanel } from './GroupPanel';
import { PrivateChatSettings } from './PrivateChatSettings';
import { motion, AnimatePresence } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { auth } from '../../lib/firebase';
import { FirebaseService } from '../../services/FirebaseService';
import { WebRTCService } from '../../services/WebRTCService';
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

const MemoizedMessageBubble = React.memo(({ item, idx, arr, burningCountdown, setBurningMessageId }: any) => {
  const isMe = item.sender === 'me';
  const timestamp = typeof item.timestamp === 'number' ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : (item.timestamp || "12:41");
  const showMetadata = idx === 0 || arr[idx-1].sender !== item.sender;

  if (item.type === 'system') {
    return (
      <div className="flex w-full justify-center my-4">
        <div className="flex flex-col items-center bg-black/5 dark:bg-white/5 rounded-lg px-4 py-2.5 backdrop-blur-sm max-w-[85%] text-center">
           <span className="text-[#8E8E93] font-medium text-[10px] tracking-wider uppercase mb-1">SYSTEM_EVENT_{item.mlsEpoch || 'LOG'}</span>
           <span className="text-black dark:text-white text-[11px] leading-snug">{item.text}</span>
        </div>
      </div>
    );
  }

  const baseBubbleStyles = `px-4 py-2.5 rounded-[18px] shadow-sm transition-all text-[15px] leading-relaxed relative overflow-hidden ${
    isMe 
    ? (item.isOffline 
        ? 'bg-[#FF9500] text-white shadow-[0_0_15px_rgba(255,149,0,0.15)]' 
        : 'bg-[#007AFF] text-white font-normal') + ' rounded-tr-sm' 
    : 'bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 text-black dark:text-white rounded-tl-sm'
  }`;

  const renderDecorations = () => (
    <>
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
      {item.isOffline && (
        <div className={`mt-2 pt-1.5 flex flex-col space-y-1.5 ${isMe ? 'border-t border-white/20' : 'border-t border-black/5 dark:border-white/10'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[6px] font-black uppercase tracking-[2px] ${isMe ? 'text-white/50' : 'text-nexus-accent-gold'}`}>STORED IN RELAY SWARM</span>
            <div className={`flex items-center space-x-1 px-1 py-0.5 border rounded-[2px] ${isMe ? 'bg-white/10 border-white/20' : 'bg-nexus-accent-gold/20 border-nexus-accent-gold/30'}`}>
              <Clock size={6} className={isMe ? 'text-white/70' : 'text-nexus-accent-gold'} />
              <span className={`text-[5px] font-black uppercase tracking-[1px] ${isMe ? 'text-white/90' : 'text-nexus-accent-gold'}`}>AUTO-WIPE: {item.ttl || '72H'}</span>
            </div>
          </div>
          {item.nodes && item.nodes.length > 0 && (
            <div className="flex items-center space-x-1 flex-wrap gap-y-1">
               {item.nodes.map((n: string, i: number) => (
                 <div key={i} className={`px-1 py-0.5 border rounded-[1px] ${isMe ? 'bg-white/5 border-white/10' : 'bg-nexus-accent-gold/5 border-nexus-accent-gold/10'}`}>
                    <span className={`text-[4px] font-bold ${isMe ? 'text-white/40' : 'text-nexus-accent-gold/40'}`}>{n}</span>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch (item.type) {
      case 'image':
      case 'media':
        return (
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="rounded-[16px] overflow-hidden border border-black/5 dark:border-white/5 shadow-sm p-1 bg-white dark:bg-[#1C1C1E] backdrop-blur-md relative"
          >
             {item.type === 'media' || !item.text ? (
                <div className="w-64 h-40 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[12px] flex flex-col items-center justify-center space-y-3 cursor-pointer group transition-colors">
                   <div className="w-12 h-12 rounded-full border border-[#C7C7CC] dark:border-[#5A5A5E] flex items-center justify-center group-active:scale-95 transition-transform">
                      <Image size={24} className="text-[#8E8E93]" />
                   </div>
                   <div className="text-center">
                      <span className="text-[13px] font-medium text-black dark:text-white block mb-1">Encrypted Media</span>
                      <span className="text-[11px] text-[#8E8E93]">Size: {item.size || '3.2MB'} • Tap to Decrypt</span>
                   </div>
                </div>
             ) : (
                <MosaicPressable src={item.text} />
             )}
          </motion.div>
        );

      case 'file':
        return (
          <motion.div whileTap={{ scale: 0.99 }} className={`${baseBubbleStyles} !px-3`}>
            <div className={`flex items-center space-x-3 ${isMe ? 'text-white' : 'text-black dark:text-white'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]'}`}>
                <FileText size={20} className={isMe ? 'text-white' : 'text-[#007AFF]'} />
              </div>
              <div className="flex flex-col min-w-[120px] pr-2">
                <span className="font-semibold text-[14px] truncate leading-tight mb-0.5 max-w-[180px]">{item.fileName || 'Archive.zip'}</span>
                <span className={`text-[11px] font-medium ${isMe ? 'text-white/70' : 'text-[#8E8E93]'}`}>{item.fileSize || 'Unknown Size'} • {item.fileType || 'BIN'}</span>
              </div>
            </div>
            {renderDecorations()}
          </motion.div>
        );

      case 'call':
        const isMissed = item.callState === 'missed';
        return (
          <motion.div whileTap={{ scale: 0.99 }} className={`${baseBubbleStyles} !px-3`}>
            <div className={`flex items-center space-x-3 ${isMe ? 'text-white' : 'text-black dark:text-white'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMissed ? (isMe ? 'bg-white/20' : 'bg-red-500/10') : (isMe ? 'bg-white/20' : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]')}`}>
                {item.callType === 'video' ? (
                  <Video size={18} className={isMissed ? (isMe ? 'text-white' : 'text-red-500') : (isMe ? 'text-white' : 'text-[#007AFF]')} />
                ) : (
                  <Phone size={18} className={isMissed ? (isMe ? 'text-white' : 'text-red-500') : (isMe ? 'text-white' : 'text-[#007AFF]')} />
                )}
              </div>
              <div className="flex flex-col pr-2">
                <span className={`font-semibold text-[15px] leading-tight mb-0.5 ${isMissed && !isMe ? 'text-red-500' : ''}`}>
                  {isMissed ? 'Missed Call' : `${item.callType === 'video' ? 'Video' : 'Audio'} Call`}
                </span>
                <span className={`text-[12px] font-medium ${isMe ? 'text-white/70' : 'text-[#8E8E93]'}`}>
                  {isMissed ? timestamp : (item.callDuration || 'Ended')}
                </span>
              </div>
            </div>
            {renderDecorations()}
          </motion.div>
        );

      default:
        return (
          <motion.div whileTap={{ scale: 0.99 }} className={baseBubbleStyles}>
            {item.text}
            {renderDecorations()}
          </motion.div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
      className={`flex flex-col group relative ${showMetadata ? 'mt-3' : 'mt-0.5'} ${isMe ? 'items-end' : 'items-start'}`}
    >
      {showMetadata && (
         <span className={`text-[11px] font-medium text-[#8E8E93] mb-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
            {isMe ? 'Me' : (item.sender || 'Peer Node')}
         </span>
      )}
      
      <div className={`flex items-end group relative ${isMe ? 'flex-row-reverse' : ''}`}>
        <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'} z-10`}>
          {renderContent()}
        </div>
        
        {!burningCountdown && (
          <div className={`flex items-center space-x-2 pb-1 mx-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isMe ? '' : 'flex-row-reverse'} shrink-0 z-0`}>
            {item.isOffline ? (
              <Orbit size={10} className="text-nexus-accent-gold animate-spin-slow" />
            ) : (
              <Clock size={10} className="text-[#8E8E93]" />
            )}
            <span className="text-[10px] font-medium text-[#8E8E93] tracking-tight">
               {timestamp}
            </span>
            {isMe && (
              <button 
                onClick={() => setBurningMessageId(item.id)}
                className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-full transition-all cursor-pointer"
                title="Burn Message"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}

        {burningCountdown > 0 && (
          <div className="flex items-center space-x-2 pb-1 mx-2 shrink-0">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-[4px] shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              <Flame size={10} className="text-red-500 animate-pulse" />
              <span className="text-red-500 font-bold text-[9px] uppercase tracking-[1px]">{burningCountdown}S</span>
            </div>
          </div>
        )}
        
        {!isMe && item.isOffline && !burningCountdown && (
          <div className="absolute -bottom-4 left-0 flex items-center space-x-1 opacity-60">
             <ArrowDown size={10} className="text-nexus-accent-cyan" />
             <span className="text-[8px] font-bold uppercase tracking-[1px] text-nexus-accent-cyan">DECRYPTING_SHADOW...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export const Conversation = ({ onLightningCall, onBack, isGroup = false, isIsolated = false, targetName = "SECURE CHANNEL", convId, myDid }: { 
  onLightningCall: (mode: 'voice' | 'video') => void, 
  onBack: () => void, 
  isGroup?: boolean, 
  isIsolated?: boolean, 
  targetName?: string,
  convId?: string,
  myDid: string | null
}) => {
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [showPrivateChatSettings, setShowPrivateChatSettings] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSharding, setIsSharding] = useState(false);
  const [offlineTTL, setOfflineTTL] = useState("72H");
  const [showTTLSelector, setShowTTLSelector] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [localMessages, setLocalMessages] = useState<any[]>([]);

  // WebRTC State
  const [videoCallState, setVideoCallState] = useState<'idle' | 'calling' | 'receiving' | 'connected'>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const webrtcService = useMemo(() => (convId && myDid) ? new WebRTCService(convId, myDid) : null, [convId, myDid]);
  const processedSignals = useRef<Set<string>>(new Set());

  const handleP2PSend = () => {
    if (!inputText.trim() || !webrtcService || !myDid) return;
    const success = webrtcService.sendP2PMessage(inputText);
    if (success) {
      setLocalMessages(prev => [...prev, {
        id: `p2p-${Date.now()}`,
        senderId: myDid,
        content: inputText,
        timestamp: Date.now(),
        sender: 'me',
        isMe: true,
        protocol: 'webrtc-datachannel'
      }]);
      setInputText("");
    } else {
      console.warn("P2P_CHANNEL_NOT_READY");
    }
  };

  // WebRTC Handlers
  const handleStartCall = async (mode: 'voice' | 'video') => {
    if (!webrtcService) return;
    setVideoCallState('calling');
    try {
      const stream = await webrtcService.startLocalStream(mode === 'video', true);
      setLocalStream(stream);
      webrtcService.setCallbacks(
        (rStream) => setRemoteStream(rStream),
        (state) => {
          if (state === 'connected') setVideoCallState('connected');
          if (state === 'disconnected' || state === 'failed' || state === 'closed') handleEndCall();
        },
        (msg) => {
          setLocalMessages(prev => [...prev, {
            id: `p2p-${Date.now()}`,
            senderId: 'them',
            content: msg,
            timestamp: Date.now(),
            sender: 'them',
            isMe: false,
            protocol: 'webrtc-datachannel'
          }]);
        }
      );
      await webrtcService.createOffer();
    } catch (e) {
      console.error(e);
      setVideoCallState('idle');
    }
  };

  const handleAcceptCall = async () => {
    if (!webrtcService) return;
    try {
      const stream = await webrtcService.startLocalStream(true, true);
      setLocalStream(stream);
      webrtcService.setCallbacks(
        (rStream) => setRemoteStream(rStream),
        (state) => {
          if (state === 'connected') setVideoCallState('connected');
          if (state === 'disconnected' || state === 'failed' || state === 'closed') handleEndCall();
        },
        (msg) => {
          setLocalMessages(prev => [...prev, {
            id: `p2p-${Date.now()}`,
            senderId: 'them',
            content: msg,
            timestamp: Date.now(),
            sender: 'them',
            isMe: false,
            protocol: 'webrtc-datachannel'
          }]);
        }
      );
      await webrtcService.acceptCall();
      setVideoCallState('connected');
    } catch (e) {
      console.error(e);
      setVideoCallState('idle');
    }
  };

  const handleFileTransfer = async () => {
    setShowAttachmentMenu(false);
    if (videoCallState === 'idle') {
      alert("Establishing P2P Tunnel for File Transfer...");
      await handleStartCall('voice'); // Use voice mode as minimal P2P setup
    }
    // Simulation of file selection
    const mockFile = { name: "SECRET_DOSSIER.PDF", size: "4.2MB" };
    if (webrtcService) {
      webrtcService.sendP2PMessage(`FILE_TRANSFER_INIT:${JSON.stringify(mockFile)}`);
    }
  };

  const handleEndCall = () => {
    if (webrtcService) webrtcService.stopLocalStream();
    setVideoCallState('idle');
    setLocalStream(null);
    setRemoteStream(null);
  };

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const burnIntervals = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      // Hardened Anti-Fragility: Ensure ALL intervals are destroyed on component unmount
      Object.values(burnIntervals.current).forEach(clearInterval);
      burnIntervals.current = {};
    };
  }, []);

  useEffect(() => {
    if (!convId) return;
    const unsub = FirebaseService.subscribeToMessages(convId, (msgs) => {
      const displayMsgs: any[] = [];
      
      msgs.forEach(m => {
        const isMyMessage = m.senderId === myDid;
        
        // Handle signals silently
        if (m.type === 'signal') {
          if (!isMyMessage && !processedSignals.current.has(m.id)) {
            processedSignals.current.add(m.id);
            if (webrtcService) {
              const payload = JSON.parse(m.content || '{}');
              if (payload.type === 'offer' && videoCallState === 'idle') {
                setVideoCallState('receiving');
              }
              webrtcService.handleIncomingSignal(m.content);
            }
          }
          return; // Do not render signals
        }

        displayMsgs.push({
          ...m,
          text: m.content || "Ciphertext Corrupted",
          sender: isMyMessage ? 'me' : 'them',
          isMe: isMyMessage
        });
      });
      
      setLocalMessages(displayMsgs);
    });
    return () => unsub();
  }, [convId, webrtcService, videoCallState]);

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
  
  const parentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const allMessages = useMemo(() => [...historyMessages, ...localMessages], [historyMessages, localMessages]);

  const virtualizer = useVirtualizer({
    count: allMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // rough estimate of average message height
    overscan: 10,
  });

  const scrollToBottom = () => {
    if (allMessages.length > 0) {
      virtualizer.scrollToIndex(allMessages.length - 1, { align: 'end' });
    }
  };

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      switch(style) {
        case 'light': window.navigator.vibrate(10); break;
        case 'medium': window.navigator.vibrate(20); break;
        case 'heavy': window.navigator.vibrate(50); break;
        case 'success': window.navigator.vibrate([10, 30, 10]); break;
        case 'error': window.navigator.vibrate([50, 50, 50]); break;
      }
    }
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
    if (inputText.trim() && convId) {
      triggerHaptic('success');
      
      const content = inputText;
      
      // In a real production app, we would encrypt here using a refined key exchange
      // For this step, we'll store the content in Firebase (mocking encryption if needed)
      // and update the real-time stream.
      
      try {
        await FirebaseService.sendMessage(convId, {
          content,
          protocol: 'NXS-v2.0-STRICT',
          nonce: Math.random().toString(36).slice(2),
          type: 'text'
        });
        setInputText("");
      } catch (err) {
        console.error("MESSAGE_TX_FAULT:", err);
      }
    }
  };

  const startBurning = (messageId: string) => {
    const duration = 5; // 5 seconds countdown
    setBurningProcessIds((prev) => ({ ...prev, [messageId]: duration }));

    // If there's an existing interval for this message, clear it (idempotency)
    if (burnIntervals.current[messageId]) {
      clearInterval(burnIntervals.current[messageId]);
    }

    const interval = setInterval(() => {
      setBurningProcessIds((prev) => {
        const remaining = (prev[messageId] || 0) - 1;
        if (remaining <= 0) {
          clearInterval(interval);
          delete burnIntervals.current[messageId];
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

    burnIntervals.current[messageId] = interval;
  };

  const currentEpoch = "4AA2";
  const MOCK_MEMBERS = [
    { did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76', role: 'ADMIN' as const },
    { did: 'did:key:z6MkqY8xXyGZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg', role: 'NODE' as const },
  ];

  return (
      <div className="absolute inset-0 bg-[#EFEFF4] dark:bg-black z-[500] flex flex-col overflow-hidden animate-in fade-in duration-500 font-sans">
      {showGroupPanel && (
        <GroupPanel 
          groupName={targetName} 
          isIsolated={isIsolated}
          members={MOCK_MEMBERS} 
          onClose={() => setShowGroupPanel(false)} 
        />
      )}

      {showPrivateChatSettings && (
         <PrivateChatSettings
            targetName={targetName}
            onClose={() => setShowPrivateChatSettings(false)}
         />
      )}

      {/* Header - iOS Style Consistency */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-3 bg-[#F2F2F7]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-all pt-[env(safe-area-inset-top)]" style={{ height: 'calc(2.75rem + env(safe-area-inset-top))' }}>
        {/* Left: Back button + Unread Count */}
        <div className="flex items-center w-[80px]">
          <button 
            onClick={onBack} 
            className="flex items-center -space-x-1 text-[#007AFF] hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none outline-none py-2"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
            <span className="text-[17px] font-normal">Back</span>
          </button>
        </div>
        
        {/* Center: Group Name / Peer Name */}
        <div 
          className="flex flex-col items-center justify-center flex-1 min-w-0" 
          onClick={() => isGroup ? setShowGroupPanel(true) : setShowPrivateChatSettings(true)}
        >
           <div className="flex items-center justify-center w-full">
              <h2 className="text-black dark:text-white font-sans text-[17px] font-semibold tracking-tight truncate cursor-pointer">
                {targetName}
              </h2>
           </div>
        </div>

        {/* Right: WhatsApp style options for individual, standard for group */}
        <div className="flex items-center justify-end w-[120px]">
           {!isGroup && (
               <button 
                 onClick={() => onLightningCall('voice')}
                 className="w-10 h-10 flex items-center justify-center text-[#007AFF] hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none"
               >
                 <Phone size={24} strokeWidth={2} />
               </button>
           )}
           <button 
             onClick={() => handleStartCall('video')}
             className="w-10 h-10 flex items-center justify-center text-[#007AFF] hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none"
           >
             <Video size={26} strokeWidth={2} />
           </button>
           <button 
             onClick={() => isGroup ? setShowGroupPanel(true) : setShowPrivateChatSettings(true)}
             className="w-10 h-10 flex items-center justify-end text-[#007AFF] hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none pr-1"
           >
             <MoreHorizontal size={24} strokeWidth={2} />
           </button>
        </div>
      </div>

      {/* Telemetry Strip - iOS Info Banner Style */}
      <div className="flex items-center px-4 border-b border-black/5 dark:border-white/5 justify-between bg-white dark:bg-[#1C1C1E] overflow-hidden shrink-0 transition-all" style={{ marginTop: 'calc(2.75rem + env(safe-area-inset-top))', height: '1.75rem' }}>
         <div className="flex items-center min-w-0">
            <Terminal size={10} className="text-[#8E8E93] mr-2" />
            <span className="text-[#8E8E93] font-mono text-[9px] truncate tracking-tight">
               {isOfflineMode ? `SHADOW_VAULT` : (isGroup ? `CONSENSUS_ACT` : `TUNNEL::${targetName.toUpperCase()}`)}
            </span>
         </div>
         
         <div className="flex items-center space-x-2">
            <div className="flex items-center">
               <Shield size={10} className="text-[#007AFF] mr-1" />
               <span className="text-black dark:text-white font-semibold text-[9px] uppercase tracking-wider">E2EE</span>
            </div>
            <div className="flex items-center border-l border-black/10 dark:border-white/10 pl-2">
               <span className="text-[#8E8E93] font-mono text-[9px] uppercase">98ms</span>
            </div>
         </div>
      </div>

      {/* Message Stream */}
      <div 
        ref={parentRef}
        className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 relative flex flex-col transition-colors ${isOfflineMode ? 'bg-[#E5E5EA] dark:bg-[#2C2C2E]' : 'bg-[#EFEFF4] dark:bg-black'}`}
      >
        {isOfflineMode && (
          <div className="absolute inset-0 pointer-events-none z-10 border-x border-[#FF9500]/10" />
        )}
        {isGroup && !hasLoadedHistory && (
          <div className="flex items-center justify-center py-4 mb-4 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-xl shadow-sm">
            <button 
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="px-6 py-2 transition-all bg-transparent cursor-pointer flex items-center space-x-3 rounded-[2px] disabled:opacity-50 group border-none"
            >
              <RefreshCw size={14} className={`text-[#007AFF] ${isLoadingHistory ? 'animate-spin' : ''}`} />
              <span className="text-[#007AFF] font-medium text-[11px] tracking-wider uppercase">
                {isLoadingHistory ? 'Decrypting...' : 'Sync History'}
              </span>
            </button>
          </div>
        )}

        <div 
          className="mt-auto relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = allMessages[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <MemoizedMessageBubble 
                  item={item} 
                  idx={virtualItem.index} 
                  arr={allMessages} 
                  burningCountdown={burningProcessIds[item.id]} 
                  setBurningMessageId={setBurningMessageId} 
                />
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} className="h-4 shrink-0" />
      </div>
      
      {/* iOS Style Input Interface */}
      <div className={`bg-[#F2F2F7]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 shrink-0 px-3 py-3 z-20 transition-all duration-700 relative pb-[calc(1.5rem+env(safe-area-inset-bottom))]`}>
        
        {/* Voice Recognition Status Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 24, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-center space-x-3 bg-red-500/10 border-b border-red-500/20 overflow-hidden mb-2 rounded-lg"
            >
               <div className="flex space-x-1 items-center h-2">
                 {[1, 2, 3, 4, 5].map((i) => (
                   <motion.div
                     key={i}
                     animate={{ height: [4, 12, 4] }}
                     transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                     className="w-1 bg-red-500 rounded-full"
                   />
                 ))}
               </div>
               <span className="text-red-500 font-medium text-[11px] uppercase tracking-wider animate-pulse">Listening...</span>
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
              className="flex items-center justify-center space-x-3 bg-[#FF9500]/10 border-b border-[#FF9500]/20 overflow-hidden mb-2 rounded-lg"
            >
               <RefreshCw size={12} className="text-[#FF9500] animate-spin" />
               <span className="text-[#FF9500] font-medium text-[11px] uppercase tracking-wider animate-pulse">Encrypting & Sharding...</span>
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
                className="fixed inset-0 z-10"
                onClick={() => setShowAttachmentMenu(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-4 mb-2 z-20 w-56 bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-3 grid grid-cols-2 gap-3 overflow-hidden"
              >
                <button className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-none bg-transparent">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#3A3A3C] shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center text-[#007AFF] mb-1.5 group-active:scale-95 transition-transform">
                    <Image size={28} />
                  </div>
                  <span className="text-[12px] font-medium text-black dark:text-white">Photos</span>
                </button>
                <button className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-none bg-transparent">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#3A3A3C] shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center text-[#FF9500] mb-1.5 group-active:scale-95 transition-transform">
                    <Film size={28} />
                  </div>
                  <span className="text-[12px] font-medium text-black dark:text-white">Video</span>
                </button>
                <button 
                  onClick={handleFileTransfer}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-none bg-transparent"
                >
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#3A3A3C] shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center text-[#AF52DE] mb-1.5 group-active:scale-95 transition-transform">
                    <FileText size={28} />
                  </div>
                  <span className="text-[12px] font-medium text-black dark:text-white">File</span>
                </button>
                <button className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-none bg-transparent">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#3A3A3C] shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center text-[#34C759] mb-1.5 group-active:scale-95 transition-transform">
                    <MapPin size={28} />
                  </div>
                  <span className="text-[12px] font-medium text-black dark:text-white">Location</span>
                </button>
                <button className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border-none bg-transparent">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#3A3A3C] shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center text-[#FF3B30] mb-1.5 group-active:scale-95 transition-transform">
                    <Contact size={28} />
                  </div>
                  <span className="text-[12px] font-medium text-black dark:text-white">Contact</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className={`flex items-center space-x-2 border rounded-full px-3 py-1.5 focus-within:shadow-sm transition-all duration-500 relative ${
          isOfflineMode 
          ? 'bg-[#FF9500]/5 border-[#FF9500]/30 shadow-[0_0_15px_rgba(255,149,0,0.1)]' 
          : 'bg-white dark:bg-[#1C1C1E] border-[#C7C7CC] dark:border-[#3A3A3C]'
        }`}>
           {isOfflineMode && (
             <div className="absolute -top-5 left-8 flex items-center space-x-2 z-30">
               <div className="px-2 py-1 bg-[#FF9500] text-white text-[8px] font-bold uppercase tracking-wider rounded-md animate-pulse shadow-md">
                 OFFLINE RELAY
               </div>
               
               <div className="relative">
                 <button 
                   onClick={() => setShowTTLSelector(!showTTLSelector)}
                   className="flex items-center space-x-1 px-2 py-1 bg-white dark:bg-[#1C1C1E] border border-[#FF9500] text-[#FF9500] shadow-md text-[8px] font-bold uppercase tracking-wider rounded-md hover:bg-[#FF9500] hover:text-white transition-all cursor-pointer"
                 >
                   <Clock size={8} />
                   <span>TTL: {offlineTTL}</span>
                 </button>
                 
                 <AnimatePresence>
                   {showTTLSelector && (
                     <motion.div 
                       initial={{ opacity: 0, y: 5 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 5 }}
                       className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl p-1.5 shadow-xl flex flex-col space-y-0.5 min-w-[80px]"
                     >
                       {["24H", "48H", "72H", "168H"].map((t) => (
                         <button 
                           key={t}
                           onClick={() => {
                             setOfflineTTL(t);
                             setShowTTLSelector(false);
                           }}
                           className={`px-3 py-2 text-[11px] font-medium text-left rounded-lg transition-colors border-none cursor-pointer ${
                             offlineTTL === t 
                             ? 'bg-[#FF9500] text-white' 
                             : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 bg-transparent'
                           }`}
                         >
                           {t} {t === '168H' ? '(Weekly)' : ''}
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
             className={`text-[#8E8E93] transition-colors bg-transparent border-none p-1 flex items-center justify-center cursor-pointer hover:text-[#007AFF] ${showAttachmentMenu ? 'rotate-45 text-[#007AFF]' : ''}`}
           >
              <Plus size={24} strokeWidth={2.5} />
           </button>

           <input 
             type="text"
             className="flex-1 text-black dark:text-white bg-transparent py-1.5 px-2 outline-none placeholder:text-[#8E8E93] text-[16px]"
             placeholder={isListening ? "Listening..." : "Message"}
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
           />
           
           <div className="flex items-center space-x-1 pl-1">
             <button 
               onClick={() => setIsOfflineMode(!isOfflineMode)}
               className={`w-9 h-9 flex items-center justify-center transition-colors duration-300 rounded-full cursor-pointer border-none ${
                  isOfflineMode 
                  ? 'bg-[#FF9500] text-white shadow-sm' 
                  : 'bg-transparent text-[#8E8E93] hover:text-[#007AFF]'
               }`}
             >
               <Satellite size={20} strokeWidth={2} />
             </button>

             <button
               onClick={startSpeechRecognition}
               className={`w-9 h-9 flex items-center justify-center transition-colors duration-300 rounded-full cursor-pointer border-none ${
                  isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-sm' 
                  : 'bg-transparent text-[#8E8E93] hover:text-[#007AFF]'
               }`}
             >
               {isListening ? <MicOff size={20} strokeWidth={2} /> : <Mic size={20} strokeWidth={2} />}
             </button>

             <button
               onClick={handleSend}
               disabled={!inputText.trim()}
               className={`w-9 h-9 flex items-center justify-center transition-transform duration-300 rounded-full cursor-pointer border-none ${
                 inputText.trim() 
                 ? 'bg-[#007AFF] text-white shadow-md active:scale-95' 
                 : 'bg-transparent text-[#8E8E93] opacity-30'
               }`}
             >
               <ArrowRight size={20} strokeWidth={2.5} />
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

      {/* WebRTC Video Overlay */}
      <AnimatePresence>
        {videoCallState !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-[2000] bg-black text-white flex flex-col"
          >
            <div className="absolute top-12 left-4 right-4 flex justify-between items-center z-10">
              <span className="font-semibold text-lg drop-shadow-md">{targetName}</span>
              <span className="text-sm font-mono text-white/70 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                {videoCallState === 'calling' && 'Calling...'}
                {videoCallState === 'receiving' && 'Incoming Call...'}
                {videoCallState === 'connected' && 'Encrypted P2P'}
              </span>
            </div>

            {/* Remote Video (Full Screen) */}
            <div className="flex-1 relative bg-[#1c1c1e] flex justify-center items-center overflow-hidden">
               {remoteStream ? (
                 <video 
                   ref={remoteVideoRef} 
                   autoPlay 
                   playsInline 
                   className="w-full h-full object-cover" 
                 />
               ) : (
                 <div className="flex flex-col items-center">
                   <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                     <Video size={40} className="text-white/50" />
                   </div>
                   <span className="text-white/50 animate-pulse">
                     {videoCallState === 'calling' ? 'Establishing P2P Tunnel...' : 'Awaiting Connection...'}
                   </span>
                 </div>
               )}

               {/* Local Video (PiP) */}
               {localStream && videoCallState === 'connected' && (
                 <motion.div 
                   drag
                   dragConstraints={{ top: 20, left: 20, right: 280, bottom: 400 }}
                   className="absolute top-16 right-4 w-28 h-40 bg-black rounded-lg overflow-hidden shadow-2xl border border-white/20 z-20 cursor-move"
                 >
                   <video 
                     ref={localVideoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     className="w-full h-full object-cover transform scale-x-[-1]" 
                   />
                 </motion.div>
               )}
            </div>

            {/* Call Controls */}
            <div className="h-32 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-6 px-6 pb-6">
              {videoCallState === 'receiving' && (
                <button 
                  onClick={handleAcceptCall}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.4)] border-none"
                >
                  <Video size={28} className="text-white" />
                </button>
              )}
              
              <button 
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.4)] border-none"
              >
                <Phone size={28} className="text-white rotate-[135deg]" />
              </button>
            </div>
          </motion.div>
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
