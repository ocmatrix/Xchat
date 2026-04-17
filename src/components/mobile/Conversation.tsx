import React, { useState } from 'react';
import { Zap, Phone, Video, Info, ShieldCheck, Lock, ChevronLeft, ArrowRight } from 'lucide-react';
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

      {/* Industrial Header */}
      <div className="flex items-center justify-between px-6 py-6 bg-nexus-bg border-b border-nexus-border shrink-0 z-20">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-6 text-nexus-ink-muted hover:text-nexus-ink transition-colors border-none bg-transparent cursor-pointer">
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <span className="text-nexus-ink font-sans text-sm font-bold tracking-tight">
                {targetName}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent-blue shadow-[0_0_8px_#0F52BA]" />
            </div>
            <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[2px] mt-0.5 uppercase">
              {isGroup ? `Syndicate::${MOCK_MEMBERS.length}_Nodes` : 'Direct_Secure_Link'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => isGroup && setShowGroupPanel(true)}
          className={`p-2 transition-all border-none bg-transparent cursor-pointer flex items-center space-x-2 group ${
            isGroup ? 'text-nexus-accent-gold hover:scale-105' : 'text-nexus-ink-muted opacity-50 cursor-not-allowed'
          }`}
          title={isGroup ? "Group Intelligence & Node List" : "Direct Link Info"}
        >
          {isGroup && (
            <span className="font-mono text-[7px] tracking-[2px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
              Intelligence
            </span>
          )}
          <Info size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Messages Viewport */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-8 flex flex-col space-y-8 scrollbar-hide"
      >
        <div className="mt-auto" />
        {messages.map((item) => {
          if (item.type === 'system') {
            return (
              <div key={item.id} className="w-full py-4 flex flex-col items-center">
                <div className="h-[1px] w-full bg-nexus-border mb-4" />
                <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[3px] uppercase text-center max-w-[80%]">
                  {item.text}
                </span>
                <div className="h-[1px] w-full bg-nexus-border mt-4" />
              </div>
            );
          }

          const isMe = item.sender === 'me';
          
          return (
            <div key={item.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] ${isMe ? 'bg-nexus-bg border border-nexus-accent-gold/20 p-4' : 'bg-nexus-surface p-4'} rounded-sm`}>
                {item.type === 'image' ? (
                  <MosaicPressable src={item.text} />
                ) : (
                  <span className="text-nexus-ink font-sans text-[13.5px] leading-relaxed tracking-wide">
                    {item.text}
                  </span>
                )}
              </div>
              
              {/* Message Fingerprint */}
              <div className={`mt-2 flex items-center space-x-2 cursor-pointer group hover:opacity-100 transition-opacity ${isMe ? 'flex-row opacity-20' : 'flex-row-reverse space-x-reverse opacity-20'}`} onClick={() => setSelectedEpoch(item.id)}>
                <ShieldCheck size={8} className="text-nexus-accent-blue" />
                <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1.5px] uppercase">
                   Epoch::{item.mlsEpoch}
                </span>
                <Lock size={8} className={isMe ? 'text-nexus-accent-gold' : 'text-nexus-accent-blue'} />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Input Panel V2 - Re-refined for strict UI_CONVO_FULL_V2 specs */}
      <div className="px-6 py-8 bg-nexus-bg shrink-0">
        <div className="flex items-center">
          {/* Industrial Gold Lightning Button */}
          <button 
            onClick={onLightningCall} 
            className="w-10 h-10 flex items-center justify-center text-nexus-accent-gold hover:scale-110 active:scale-95 transition-all bg-transparent border-none cursor-pointer"
          >
            <Zap size={20} fill="currentColor" />
          </button>
          
          {/* Borderless Middle TextInput */}
          <div className="flex-1 flex items-center bg-transparent px-4">
            <input 
              type="text"
              className="flex-1 text-nexus-ink bg-transparent font-sans text-[15px] py-3 outline-none placeholder:text-nexus-ink-muted border-none tracking-normal"
              placeholder="Signal_State::SYNCING..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>

          {/* SEND Button - Highlights Cyber Blue on input */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`flex items-center justify-center p-2 transition-all border-none bg-transparent cursor-pointer font-mono text-[10px] font-bold tracking-[2px] ${
              inputText.trim() ? 'text-nexus-accent-blue opacity-100' : 'text-nexus-ink-muted opacity-30'
            }`}
          >
            {inputText.trim() ? 'TRANSMIT' : 'SEND'}
          </button>
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
    </div>
  );
};
