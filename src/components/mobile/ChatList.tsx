import React from 'react';
import { motion } from 'motion/react';
import { Info, Trash2 } from 'lucide-react';

export const ChatList = ({ contacts, onLightningCall, onSelectContact }) => {
  return (
    <div className="flex-1 bg-nexus-bg overflow-y-auto scrollbar-hide">
      {contacts.map((item) => (
        <div key={item.did} className="relative overflow-hidden group">
          {/* Swipe Actions (Hidden underneath) */}
          <div className="absolute inset-0 flex justify-end">
            <button 
              className="h-full w-16 bg-nexus-surface flex items-center justify-center text-nexus-ink-muted hover:text-nexus-ink transition-colors border-none cursor-pointer"
              onClick={(e) => { e.stopPropagation(); console.log("NODE_INFO:", item.did); }}
            >
              <Info size={16} strokeWidth={1.5} />
            </button>
            <button 
              className="h-full w-16 bg-[#1A0A0A] flex items-center justify-center text-[#EF4444] hover:bg-[#2D0A0A] transition-colors border-none cursor-pointer"
              onClick={(e) => { e.stopPropagation(); console.log("BURN_PROTOCOL:", item.did); }}
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Main Item Content */}
          <motion.div
            drag="x"
            dragConstraints={{ left: -128, right: 0 }}
            dragElastic={0.05}
            whileDrag={{ cursor: 'grabbing' }}
            className="relative z-10 w-full flex items-center px-6 py-5 bg-nexus-bg hover:bg-nexus-surface transition-colors text-left cursor-pointer border-none outline-none"
            onClick={() => onSelectContact(item)}
          >
            {/* Geometric Avatar Wrapper */}
            <div className="relative mr-5 shrink-0">
               <GeometricAvatar seed={item.did} />
               {item.online && (
                 <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-nexus-accent-blue rounded-full border-2 border-nexus-bg shadow-[0_0_8px_var(--nexus-accent-blue)]" />
               )}
            </div>
            
            <div className="flex-1 justify-center overflow-hidden">
              {/* Identity Header */}
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-nexus-ink font-sans text-[13px] font-bold tracking-tight">
                  {item.name || "ANONYMOUS_NODE"}
                </span>
                <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[1px] truncate uppercase">
                  {item.did.slice(0, 12)}...
                </span>
              </div>
              
              {/* Ciphertext Summary & Padding Metadata */}
              <div className="flex items-center space-x-2 text-nexus-ink-muted font-mono text-[9px] opacity-40">
                <span className="truncate">Encrypted_Payload::{item.lastCiphertext.slice(0, 8)}...</span>
                <span className="px-1 border border-nexus-border bg-nexus-border text-[7px] tracking-widest">{item.paddingBucket}</span>
              </div>
            </div>
            
            <div className="text-nexus-ink-muted font-mono text-[8px] tracking-[2px] shrink-0 ml-4 font-bold">{item.timestamp}</div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

/**
 * Deterministic Geometric Avatar based on DID seed.
 */
function GeometricAvatar({ seed }: { seed: string }) {
  // Simple hash for deterministic variations
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pattern = hash % 4; // 4 simple geometric patterns

  return (
    <div className="w-10 h-10 bg-nexus-surface border border-nexus-border flex items-center justify-center overflow-hidden">
       <div className="w-6 h-6 relative opacity-80">
          {pattern === 0 && <div className="absolute inset-1 border-2 border-nexus-accent-gold rotate-45" />}
          {pattern === 1 && <div className="absolute inset-2 bg-nexus-accent-gold opacity-60 rounded-sm" />}
          {pattern === 2 && (
             <>
               <div className="absolute inset-x-0 h-[1px] top-1/2 bg-nexus-accent-gold" />
               <div className="absolute inset-y-0 w-[1px] left-1/2 bg-nexus-accent-gold" />
             </>
          )}
          {pattern === 3 && (
             <div className="absolute inset-0 border border-nexus-accent-gold rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-nexus-accent-gold" />
             </div>
          )}
       </div>
    </div>
  );
}
