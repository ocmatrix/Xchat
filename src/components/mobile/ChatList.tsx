import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Info, Trash2, Search, Zap, Command } from 'lucide-react';

export const ChatList = ({ contacts, onLightningCall, onSelectContact }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.did.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-nexus-bg flex flex-col overflow-hidden">
      {/* Search Header */}
      <div className="px-10 pb-6 pt-0 bg-nexus-bg shrink-0">
        <div className="flex items-center bg-nexus-surface border border-nexus-border rounded-sm px-4 py-2.5 group focus-within:border-nexus-accent-gold transition-all duration-300 shadow-sm focus-within:shadow-[0_0_15px_rgba(226,183,20,0.1)]">
          <Search size={14} className="text-nexus-ink-muted group-focus-within:text-nexus-accent-gold transition-colors" />
          <input 
            type="text"
            placeholder="Search Protocol Nodes..." 
            className="flex-1 bg-transparent border-none outline-none font-mono text-[9px] tracking-[2px] text-nexus-ink placeholder:text-nexus-ink-muted/30 ml-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        <div className="px-6 mb-2 flex items-center justify-between opacity-30 mt-2">
          <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[3px] uppercase">Active_Networks::Shard_01</span>
          <Command size={10} />
        </div>

        {filteredContacts.map((item) => {
          const nodeIsGroup = item.isGroup;
          
          return (
            <div key={item.did} className="relative overflow-hidden group border-b border-nexus-border/10 last:border-none mx-2">
              <div
                className="relative z-10 w-full flex items-center px-4 py-2 hover:bg-nexus-surface/40 hover:translate-x-1 transition-all duration-200 text-left cursor-pointer border-none outline-none rounded-sm"
                onClick={() => onSelectContact(item)}
              >
                {/* Status Indicator Bar */}
                <div className={`w-[2px] h-6 mr-4 shrink-0 transition-all duration-500 ${
                  item.online ? 'bg-nexus-accent-blue shadow-[0_0_8px_var(--nexus-accent-blue)]' : 'bg-nexus-border opacity-30'
                }`} />
                
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center space-x-2">
                       <span className={`font-mono text-[10px] whitespace-nowrap ${nodeIsGroup ? 'text-nexus-accent-gold font-black opacity-80' : 'text-nexus-ink-muted'}`}>
                          {nodeIsGroup ? '#' : '@'}
                       </span>
                       <span className={`text-nexus-ink font-sans text-xs font-medium tracking-tight truncate ${!item.online && 'opacity-50'}`}>
                          {item.name || "UNNAMED_NODE"}
                       </span>
                       {item.unreadCount > 0 && (
                         <span className="text-nexus-accent-gold font-mono text-[9px] font-black animate-pulse">
                           (+{item.unreadCount})
                         </span>
                       )}
                    </div>
                    {/* Compact DID / Cipher Preview */}
                    <div className="flex items-center space-x-2 opacity-30 min-w-0">
                       <span className="text-nexus-ink-muted font-mono text-[7px] tracking-tight truncate">
                         {item.did.slice(0, 16)}...
                       </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0 ml-4 opacity-30 group-hover:opacity-100 transition-opacity">
                    <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1px] font-bold uppercase">
                      {item.timestamp}
                    </span>
                    {item.online && (
                      <span className="text-nexus-accent-blue font-mono text-[6px] uppercase tracking-[1px] mt-0.5 font-bold">Connected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Deterministic Geometric Avatar based on DID seed.
 */
function GeometricAvatar({ seed, avatar }: { seed: string, avatar?: string }) {
  if (avatar) {
    return (
      <div className="w-12 h-12 bg-nexus-surface border border-nexus-border overflow-hidden rounded-sm">
        <img src={avatar} alt="Node" className="w-full h-full object-cover grayscale opacity-80" referrerPolicy="no-referrer" />
      </div>
    );
  }

  // Simple hash for deterministic variations
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pattern = hash % 4; // 4 simple geometric patterns

  return (
    <div className="w-12 h-12 bg-nexus-surface border border-nexus-border flex items-center justify-center overflow-hidden rounded-sm">
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
