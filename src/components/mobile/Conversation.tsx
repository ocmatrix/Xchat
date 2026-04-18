import React, { useState } from 'react';
import { Zap, Phone, Video, Info, ShieldCheck, Lock, ChevronLeft, ArrowRight, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { GroupPanel } from './GroupPanel';
import { motion, AnimatePresence } from 'motion/react';

const MosaicPressable = ({ src }: { src: string }) => {
  const [isDecrypted, setIsDecrypted] = useState(false);

  return (
    <div 
      className={`relative w-72 h-52 overflow-hidden bg-nexus-surface rounded-sm group cursor-pointer transition-all duration-500 ${isDecrypted ? 'shadow-[0_0_30px_rgba(212,175,55,0.1)]' : ''}`}
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
          className="w-full h-full object-cover animate-in fade-in duration-300"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat bg-center opacity-30">
          <div className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm" />
          <Lock size={18} className="text-nexus-accent-gold mb-2 opacity-30 z-10" />
          <span className="text-nexus-accent-gold font-mono text-[7px] tracking-[4px] uppercase opacity-30 z-10">Hold_To_Reveal</span>
        </div>
      )}
    </div>
  );
};

export const Conversation = ({ messages, onLightningCall, onBack, isGroup = false, isIsolated = false, targetName = "SECURE CHANNEL" }) => {
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedEpoch, setSelectedEpoch] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<any[]>([]);
  const [burningMessageId, setBurningMessageId] = useState<string | null>(null);

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

  const handleSend = () => {
    if (inputText.trim()) {
      console.log("TX_DATA_STREAM:", inputText);
      setInputText("");
    }
  };

  const currentEpoch = "4AA2";
  const MOCK_MEMBERS = [
    { did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76', role: 'ADMIN' as const },
    { did: 'did:key:z6MkqY8xXyGZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg', role: 'NODE' as const },
  ];

  return (
    <div className="flex-1 bg-nexus-bg flex flex-col h-full w-full overflow-hidden relative font-sans border-l border-nexus-border">
      {showGroupPanel && (
        <GroupPanel 
          groupName={targetName} 
          isIsolated={isIsolated}
          members={MOCK_MEMBERS} 
          onClose={() => setShowGroupPanel(false)} 
        />
      )}

      {/* XChat-Style Network/Topic Header */}
      <div className="flex flex-col shrink-0 z-20">
        <div className="h-10 bg-black border-b border-nexus-border flex items-center px-4 space-x-4">
          <button onClick={onBack} className="text-nexus-ink-muted hover:text-nexus-ink transition-colors border-none bg-transparent cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <div className="h-4 w-[1px] bg-nexus-border" />
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="text-nexus-accent-gold font-mono text-[10px] whitespace-nowrap">NETWORK::SHARD_01</span>
            <span className="text-nexus-ink-muted text-[10px] opacity-30">/</span>
            <span className="text-nexus-ink font-mono text-[10px] tracking-tight truncate">{targetName}</span>
          </div>
        </div>
        <div className="h-8 bg-nexus-surface border-b border-nexus-border flex items-center px-6 overflow-hidden">
           <span className="text-nexus-ink-muted font-mono text-[8px] uppercase tracking-[1px] mr-3 shrink-0">Topic:</span>
           <span className="text-nexus-ink font-sans text-[10px] truncate opacity-80 italic">
              {isGroup ? `Secure Syndicate protocol active. Epoch: ${currentEpoch}. All node traffic is E2EE.` : `Direct P2P link established with node ${targetName.slice(0, 8)}...`}
           </span>
        </div>
      </div>

      {/* XChat-Style Log Viewport */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col font-mono scrollbar-hide bg-[#050505]"
      >
        {isGroup && !hasLoadedHistory && (
          <div className="flex flex-col items-center justify-center py-6 mb-4 border-b border-nexus-border/20">
            <button 
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="px-4 py-1.5 border border-nexus-accent-gold/20 hover:bg-nexus-accent-gold/5 transition-all bg-transparent cursor-pointer flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw size={10} className={isLoadingHistory ? 'animate-spin' : 'text-nexus-accent-gold'} />
              <span className="text-nexus-accent-gold font-mono text-[8px] tracking-[2px] uppercase">
                {isLoadingHistory ? 'Syncing_Shards...' : 'Replay_Channel_Log'}
              </span>
            </button>
          </div>
        )}

        <div className="mt-auto space-y-1">
          {[...historyMessages, ...messages].map((item) => {
            const isMe = item.sender === 'me';
            const timestamp = "12:41"; // Mock timestamp
            
            if (item.type === 'system') {
              return (
                <div key={item.id} className="flex space-x-2 py-1 opacity-40">
                  <span className="text-nexus-ink-muted text-[9px] w-10 shrink-0">[{timestamp}]</span>
                  <span className="text-nexus-accent-blue text-[9px] font-bold">—</span>
                  <span className="text-nexus-ink-muted text-[9px] italic flex-1">
                    {item.text}
                  </span>
                </div>
              );
            }

            // Simple hash for handle color
            const handleColors = ['text-nexus-accent-gold', 'text-nexus-accent-blue', 'text-[#F472B6]', 'text-[#34D399]', 'text-[#A78BFA]'];
            const colorClass = isMe ? 'text-white font-bold' : handleColors[item.id?.length % handleColors.length || 0];

            return (
              <div key={item.id} className="flex items-start space-x-2 group">
                <span className="text-nexus-ink-muted text-[9px] w-10 shrink-0 opacity-30 group-hover:opacity-100 transition-opacity">[{timestamp}]</span>
                <span className={`${colorClass} text-[10px] w-20 shrink-0 text-right truncate`}>
                  {isMe ? '<ME>' : `<${item.sender || 'PEER'}>`}
                </span>
                <div className="flex-1 flex flex-col">
                  {item.type === 'image' ? (
                    <div className="mt-2 mb-2">
                       <MosaicPressable src={item.text} />
                    </div>
                  ) : (
                    <span className="text-nexus-ink-muted text-[11px] leading-relaxed break-words">
                      {item.text}
                    </span>
                  )}
                </div>
                
                {isMe && (
                  <button 
                    onClick={() => setBurningMessageId(item.id)}
                    className="opacity-0 group-hover:opacity-30 p-1 hover:text-[#EF4444] hover:opacity-100 transition-all bg-transparent border-none cursor-pointer"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* XChat-Style Bottom Input Rail */}
      <div className="bg-black border-t border-nexus-border shrink-0 p-1">
        <div className="flex items-center space-x-2 px-3 py-2 bg-nexus-surface/30 rounded-sm focus-within:bg-nexus-surface/50 transition-all">
          <span className="text-nexus-accent-blue font-mono text-[12px] font-black opacity-50 shrink-0 select-none">&gt;</span>
          <input 
            type="text"
            className="flex-1 text-nexus-ink bg-transparent font-mono text-[11px] py-1 outline-none placeholder:text-nexus-ink-muted/30 border-none"
            placeholder="Type message or /command..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <div className="flex items-center space-x-2">
             <button 
               onClick={onLightningCall}
               className="p-1.5 text-nexus-accent-gold hover:scale-110 active:scale-95 transition-all bg-transparent border-none cursor-pointer"
             >
               <Zap size={14} fill="currentColor" />
             </button>
             <div className="w-[1px] h-4 bg-nexus-border" />
             <button
               onClick={handleSend}
               disabled={!inputText.trim()}
               className={`px-3 py-1 font-mono text-[9px] font-bold tracking-[1px] rounded-[2px] transition-all border-none cursor-pointer ${
                 inputText.trim() ? 'bg-nexus-accent-blue/20 text-nexus-accent-blue' : 'text-nexus-ink-muted/20'
               }`}
             >
               SEND
             </button>
          </div>
        </div>
        <div className="flex items-center justify-between px-3 h-6">
           <div className="flex items-center space-x-3">
              <span className="text-nexus-accent-blue font-mono text-[7px] uppercase tracking-[1px]">MODE::+e2ee</span>
              <span className="text-nexus-ink-muted font-mono text-[7px] uppercase tracking-[1px] opacity-20">|</span>
              <span className="text-nexus-accent-gold font-mono text-[7px] uppercase tracking-[1px]">ENCRYPTION::SHARD_V2</span>
           </div>
           {isGroup && (
             <button onClick={() => setShowGroupPanel(true)} className="text-nexus-ink-muted hover:text-nexus-accent-gold font-mono text-[7px] uppercase tracking-[1px] bg-transparent border-none cursor-pointer">
               {MOCK_MEMBERS.length}_Users_Logged
             </button>
           )}
        </div>
      </div>

      {/* Epoch Info Dialog */}
      <AnimatePresence>
        {selectedEpoch && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 10 }}
             onClick={() => setSelectedEpoch(null)}
             className="absolute inset-x-6 bottom-32 bg-nexus-surface border border-nexus-accent-gold/30 p-4 z-50 flex flex-col cursor-pointer"
           >
             <span className="text-nexus-accent-gold font-mono text-[9px] tracking-[2px] uppercase mb-2">Payload_Integrity_Audit</span>
             <div className="space-y-1">
                <div className="flex justify-between">
                   <span className="text-nexus-ink-muted font-mono text-[7px] uppercase">MLS_Epoch</span>
                   <span className="text-nexus-ink font-mono text-[7px]">{currentEpoch}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-nexus-ink-muted font-mono text-[7px] uppercase">Rachet_State</span>
                   <span className="text-nexus-ink font-mono text-[7px]">SYNCHRONIZED</span>
                </div>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Burn Confirmation Dialog */}
      <AnimatePresence>
        {burningMessageId && (
          <BurnConfirmation 
            onConfirm={() => {
              console.log("BURN_PROTOCOL_EXECUTED_ON:", burningMessageId);
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
      className="absolute inset-0 bg-nexus-bg/95 backdrop-blur-md z-[1000] flex items-center justify-center p-8 text-center"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-nexus-surface border border-[#EF4444]/30 p-8 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} className="text-[#EF4444]" />
        </div>
        
        <h3 className="text-nexus-ink font-mono text-[14px] font-black tracking-[4px] uppercase mb-4">
          Irreversible_Burn
        </h3>
        
        <p className="text-nexus-ink-muted font-sans text-xs leading-relaxed mb-10 opacity-60">
          This payload will be erased from all decentralized shards in this epoch. This action is final and cannot be undone by any node.
        </p>
        
        <div className="w-full space-y-4">
          <button 
            onClick={onConfirm}
            className="w-full h-14 bg-[#1A0A0A] border border-[#EF4444]/50 text-[#EF4444] font-mono text-[10px] font-bold tracking-[6px] uppercase hover:bg-[#2D0A0A] transition-all cursor-pointer rounded-sm"
          >
            CONFIRM_BURN
          </button>
          
          <button 
            onClick={onCancel}
            className="w-full h-14 bg-transparent border border-nexus-border text-nexus-ink-muted font-mono text-[10px] font-bold tracking-[3px] uppercase hover:bg-nexus-surface transition-all cursor-pointer rounded-sm"
          >
            ABORT_OPERATION
          </button>
        </div>

        <div className="mt-8 flex items-center space-x-2 opacity-20">
          <div className="w-1 h-1 rounded-full bg-nexus-ink-muted animate-pulse" />
          <span className="text-nexus-ink-muted font-mono text-[6px] tracking-[2px] uppercase">
            Sovereign_Node_Admin_Authorized
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
