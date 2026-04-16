import React from 'react';
import { motion } from 'motion/react';
import { Info, Trash2 } from 'lucide-react';

export const ChatList = ({ contacts, onLightningCall, onSelectContact }) => {
  return (
    <div className="flex-1 bg-[#0A0A0A] overflow-y-auto scrollbar-hide">
      {contacts.map((item) => (
        <div key={item.did} className="relative overflow-hidden group">
          {/* Swipe Actions (Hidden underneath) */}
          <div className="absolute inset-0 flex justify-end">
            <button 
              className="h-full w-16 bg-[#1A1A1A] flex items-center justify-center text-[#A9A9A9] hover:text-white transition-colors border-none cursor-pointer"
              onClick={(e) => { e.stopPropagation(); console.log("INFO CALL:", item.did); }}
            >
              <Info size={18} />
            </button>
            <button 
              className="h-full w-16 bg-[#2D0A0A] flex items-center justify-center text-[#EF4444] hover:bg-[#4D0A0A] transition-colors border-none cursor-pointer"
              onClick={(e) => { e.stopPropagation(); console.log("BURN CALL:", item.did); }}
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Main Item Content */}
          <motion.div
            drag="x"
            dragConstraints={{ left: -128, right: 0 }}
            dragElastic={0.05}
            whileDrag={{ cursor: 'grabbing' }}
            className="relative z-10 w-full flex items-center px-6 py-5 bg-[#0A0A0A] hover:bg-[#0D0D0D] transition-colors text-left cursor-pointer border-none outline-none"
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
          </motion.div>
        </div>
      ))}
    </div>
  );
};
