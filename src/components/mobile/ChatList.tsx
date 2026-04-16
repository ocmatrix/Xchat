import React from 'react';

export const ChatList = ({ contacts, onLightningCall, onSelectContact }) => {
  return (
    <div className="flex-1 bg-[#0A0A0A] overflow-y-auto scrollbar-hide">
      {contacts.map((item) => (
        <button 
          key={item.did}
          className="w-full flex items-center px-6 py-5 bg-[#0A0A0A] hover:bg-[#111] transition-colors text-left border-none outline-none cursor-pointer"
          onClick={() => onSelectContact(item)}
        >
          {/* Micro-status indicator (Presence Plane) */}
          <div className={`w-1.5 h-1.5 rounded-full mr-5 shrink-0 ${item.online ? 'bg-[#0F52BA] shadow-[0_0_6px_#0F52BA]' : 'bg-[#333333]'}`} />
          
          <div className="flex-1 justify-center overflow-hidden">
            {/* DID Public Key Identifier */}
            <div className="text-[#FFFFFF] font-mono text-xs tracking-[2px] uppercase mb-1.5 truncate">
              {item.did.slice(0, 8)}...{item.did.slice(-4)}
            </div>
            
            {/* Ciphertext Summary (Bucketized Padding) */}
            <div className="text-[#A9A9A9] font-mono text-[9px] opacity-50 truncate">
              🔒 0x{item.lastCiphertext.slice(0, 16)}... [PAD:{item.paddingBucket}]
            </div>
          </div>
          
          <div className="text-[#A9A9A9] font-mono text-[9px] tracking-widest shrink-0 ml-4">{item.timestamp}</div>
        </button>
      ))}
    </div>
  );
};
