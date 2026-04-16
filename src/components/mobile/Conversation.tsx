import React from 'react';

export const Conversation = ({ messages, onLightningCall, onBack }) => {
  const handleLightningCall = async () => {
    console.log("⚡ Initiating QUIC 0-RTT WebTransport...");
    console.log("🔒 Loading SFrame Crypto Suite...");
    onLightningCall();
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-6 py-4 bg-[#0A0A0A] border-b border-[#1A1A1A] shrink-0">
        <button onClick={onBack} className="mr-4 hover:opacity-70 transition-opacity flex items-center justify-center border-none bg-transparent cursor-pointer">
          <span className="text-[#A9A9A9] font-mono text-xs tracking-widest">{'< BACK'}</span>
        </button>
        <span className="text-[#FFFFFF] font-mono text-xs tracking-[2px] uppercase">
          SECURE CHANNEL
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-0 py-5 flex flex-col-reverse scrollbar-hide">
        {messages.map((item) => {
          const isMe = item.sender === 'me';
          return (
            <div key={item.id} className={`w-full px-6 py-1.5 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {/* Minimalist Bubble: #1A1A1A background, no borders */}
              <div className={`max-w-[75%] px-4 py-3 bg-[#1A1A1A] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[#FFFFFF] font-sans text-[13px] leading-relaxed tracking-wide text-left">
                  {item.text}
                </span>
                
                {/* Security Fingerprint & Metadata */}
                <button className="flex items-center mt-2 opacity-30 hover:opacity-100 transition-opacity border-none bg-transparent cursor-pointer p-0">
                  <span className="text-[#A9A9A9] font-mono text-[8px] mr-1.5 tracking-widest leading-none">
                    EPOCH:{item.mlsEpoch}
                  </span>
                  {/* Unobtrusive security fingerprint icon/dot */}
                  <div className="w-1 h-1 bg-[#D4AF37]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Input Area */}
      <div className="flex items-center px-4 py-2 bg-[#0A0A0A] border-t border-[#1A1A1A] shrink-0">
        <button onClick={handleLightningCall} className="p-3 mr-2 hover:opacity-70 transition-opacity text-[#D4AF37] text-lg border-none bg-transparent cursor-pointer flex items-center justify-center">
          ⚡
        </button>
        
        <input 
          type="text"
          className="flex-1 text-[#FFFFFF] bg-transparent font-sans text-sm py-3 outline-none placeholder:text-[#404040] border-none"
          placeholder="TRANSMIT..."
        />
      </div>
    </div>
  );
};
