import React, { useState } from 'react';
import { Zap, Phone, Video, Info, ShieldCheck, Lock } from 'lucide-react';
import { GroupPanel } from './GroupPanel';

const MosaicImage = ({ src, isMe }) => {
  const [isDecrypted, setIsDecrypted] = useState(false);

  return (
    <div 
      className={`relative w-64 h-48 overflow-hidden bg-[#111] rounded-sm group cursor-pointer transition-all duration-300 ${isDecrypted ? 'border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'border border-white/5'}`}
      onMouseDown={() => setIsDecrypted(true)}
      onMouseUp={() => setIsDecrypted(false)}
      onMouseLeave={() => setIsDecrypted(false)}
      onTouchStart={() => setIsDecrypted(true)}
      onTouchEnd={() => setIsDecrypted(false)}
    >
      {/* Content */}
      {isDecrypted ? (
        <img 
          src={src} 
          alt="SECURE_MEDIA" 
          className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-200"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {/* Mosaic Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none grid grid-cols-8 grid-rows-6 gap-1 p-1">
             {Array.from({ length: 48 }).map((_, i) => (
               <div key={i} className={`bg-[#FFFFFF]/10 w-full h-full ${i % 3 === 0 ? 'animate-pulse' : ''}`} style={{ animationDelay: `${i * 50}ms` }} />
             ))}
          </div>
          
          <Lock size={24} className="text-[#A9A9A9] mb-3 opacity-40" />
          <span className="text-[#A9A9A9] font-mono text-[8px] tracking-[3px] uppercase opacity-40">Hold to Decrypt</span>
        </div>
      )}
      
      {/* Active Area Glow */}
      {isDecrypted && (
        <div className="absolute inset-0 pointer-events-none border-2 border-[#00F0FF]/30 animate-pulse" />
      )}
    </div>
  );
};

export const Conversation = ({ messages, onLightningCall, onBack, isGroup = false, isIsolated = false, targetName = "SECURE CHANNEL" }) => {
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      console.log("TX_PAYLOAD:", inputText);
      setInputText("");
    }
  };

  const handleLightningCall = async () => {
    console.log("⚡ Initiating QUIC 0-RTT WebTransport...");
    console.log("🔒 Loading SFrame Crypto Suite...");
    onLightningCall();
  };

  const MOCK_MEMBERS = [
    { did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76', role: 'ADMIN' as const },
    { did: 'did:key:z6MkqY8xXyGZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg', role: 'NODE' as const },
    { did: 'did:key:z6MkpBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76xYz', role: 'NODE' as const },
  ];

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col h-full w-full overflow-hidden relative font-sans">
      {showGroupPanel && (
        <GroupPanel 
          groupName={targetName} 
          isIsolated={isIsolated}
          members={MOCK_MEMBERS} 
          onClose={() => setShowGroupPanel(false)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 bg-[#0A0A0A] border-b border-[#1A1A1A] shrink-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-5 hover:text-[#D4AF37] transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer">
            <span className="text-[#A9A9A9] font-mono text-xs tracking-widest transition-colors">{'<'}</span>
          </button>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-[#FFFFFF] font-mono text-xs tracking-[3px] uppercase font-medium">
                {targetName}
              </span>
              <div className="w-1 h-1 rounded-full bg-[#0F52BA] animate-pulse" />
            </div>
            {isGroup && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[#A9A9A9] font-mono text-[8px] tracking-[1.5px] opacity-60">
                  ([{MOCK_MEMBERS.length} NODES]) · EPOCH_STATE: STABLE
                </span>
                {isIsolated && (
                  <>
                    <span className="text-[#404040] text-[8px]">|</span>
                    <span className="text-[#EF4444] font-mono text-[7px] tracking-[1px] uppercase opacity-80">NIP_ACTIVE</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={() => isGroup && setShowGroupPanel(true)}
            className="text-[#A9A9A9] hover:text-[#D4AF37] transition-colors border-none bg-transparent cursor-pointer p-0"
          >
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        className="flex-1 overflow-y-auto px-0 py-8 flex flex-col scrollbar-hide relative"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)' }}
      >
        <div className="mt-auto" /> {/* Push messages to bottom */}
        {messages.map((item) => {
          if (item.type === 'system') {
            return (
              <div key={item.id} className="w-full py-8 flex justify-center px-8">
                <div className="px-5 py-2.5 border-x border-[#D4AF37]/20 bg-[#D4AF37]/5">
                  <span className="text-[#D4AF37] font-mono text-[8px] tracking-[2.5px] text-center block leading-loose uppercase">
                    {item.text}
                  </span>
                </div>
              </div>
            );
          }

          const isMe = item.sender === 'me';
          
          if (item.type === 'image') {
            return (
              <div key={item.id} className={`w-full px-6 py-4 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <MosaicImage src={item.text} isMe={isMe} />
                <div className={`mt-2 flex items-center space-x-2.5 ${isMe ? 'flex-row' : 'flex-row-reverse space-x-reverse'} opacity-40`}>
                  <span className="text-[#A9A9A9] font-mono text-[7px] tracking-[2px] uppercase">
                    IMG_ATTACH · 0x{item.id}
                  </span>
                  <div className={`w-0.5 h-3 ${isMe ? 'bg-[#D4AF37]' : 'bg-[#0F52BA]'} opacity-50`} />
                </div>
              </div>
            );
          }

          return (
            <div key={item.id} className={`w-full px-6 py-2 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {/* Message Bubble */}
              <div className={`max-w-[85%] px-5 py-3.5 bg-[#1A1A1A] relative shadow-[10px_10px_30px_rgba(0,0,0,0.3)] ${isMe ? 'rounded-tl-lg rounded-bl-lg rounded-tr-sm' : 'rounded-tr-lg rounded-br-lg rounded-tl-sm'}`}>
                <span className="text-[#FFFFFF] font-sans text-[13px] leading-relaxed tracking-wide text-left block">
                  {item.text}
                </span>
                
                {/* Internal security indicator */}
                <div className={`absolute top-2 ${isMe ? 'right-2' : 'left-2'} opacity-20`}>
                   <ShieldCheck size={8} className={isMe ? 'text-[#D4AF37]' : 'text-[#0F52BA]'} />
                </div>
              </div>
              
              {/* Metadata Label - Hardcore Geek Aesthetic */}
              <div className={`mt-2 flex items-center space-x-2.5 ${isMe ? 'flex-row' : 'flex-row-reverse space-x-reverse'} opacity-40 hover:opacity-100 transition-opacity`}>
                <span className="text-[#A9A9A9] font-mono text-[7px] tracking-[2px] uppercase whitespace-nowrap">
                  {isMe ? `TX_ACK · EPOCH_${item.mlsEpoch} · 0x${item.id}${item.mlsEpoch}` : `SIG_VERIFIED · ${item.mlsEpoch}`}
                </span>
                <div className={`w-0.5 h-3 ${isMe ? 'bg-[#D4AF37]' : 'bg-[#0F52BA]'} opacity-50`} />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Input Area */}
      <div className="px-6 py-6 pb-10 bg-[#0A0A0A] border-t border-[#1A1A1A]/50 shrink-0">
        <div className="flex items-center bg-[#151515] px-4 rounded-sm border border-white/5 focus-within:border-[#D4AF37]/30 transition-colors">
          <button 
            onClick={handleLightningCall} 
            className="p-3 mr-2 hover:scale-110 active:scale-95 transition-all text-[#D4AF37] bg-transparent border-none cursor-pointer flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
            title="Initiate Secure A/V Call"
          >
            <Zap size={20} fill="currentColor" />
          </button>
          
          <input 
            type="text"
            className="flex-1 text-[#FFFFFF] bg-transparent font-sans text-[13px] py-4 outline-none placeholder:text-[#404040] border-none tracking-wide"
            placeholder="TRANSMIT_PAYLOAD..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`px-4 py-2 font-mono text-[10px] tracking-[2.5px] uppercase transition-all border-none bg-transparent cursor-pointer ${
              inputText.trim() ? 'text-[#D4AF37] opacity-100 hover:scale-105 active:scale-95' : 'text-[#333333] opacity-50 cursor-not-allowed'
            }`}
          >
            SEND
          </button>

          <div className="flex items-center space-x-3 ml-2 opacity-30">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" title="MLS_SYNC_OK" />
          </div>
        </div>
      </div>
    </div>
  );
};
