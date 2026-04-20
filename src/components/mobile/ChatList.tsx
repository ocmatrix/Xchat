import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, Trash2, Search, Zap, Command, Sun, Moon, 
  ArrowDownWideNarrow, BarChart3, Activity, 
  Fingerprint, ChevronRight, MoreHorizontal,
  MessageSquareOff, Radar
} from 'lucide-react';

type SortCriteria = 'name' | 'status' | 'timestamp';

export const ChatList = ({ contacts, onSelectContact, onLightningCall, onNavigateToNodes }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortCriteria>('timestamp');

  const processedContacts = useMemo(() => {
    let result = contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.did.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sorting logic
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'status') {
        if (a.online === b.online) return a.name.localeCompare(b.name);
        return a.online ? -1 : 1;
      }
      if (sortBy === 'timestamp') {
        return b.timestamp.localeCompare(a.timestamp);
      }
      return 0;
    });

    return result;
  }, [contacts, searchQuery, sortBy]);

  return (
    <div className="bg-transparent flex flex-col font-sans shrink-0 min-h-full pb-[50px]">
      
      <div className="px-0 pb-1">
        <div className="flex items-center justify-between px-4 my-1">
           <div className="flex items-center space-x-1.5 opacity-60">
              <BarChart3 size={10} className="text-nexus-ink" />
              <span className="text-nexus-ink font-bold text-[9px] tracking-[2px] uppercase">ACTIVE_CONNECTIONS</span>
           </div>
           <span className="text-nexus-ink-muted text-[8px] font-black tracking-widest font-mono shrink-0">{processedContacts.length} ENTITIES</span>
        </div>

        <div className="space-y-0 bg-nexus-surface shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          {processedContacts.map((item, index) => (
            <motion.div 
              key={item.did} 
            >
              <button
                className={`w-full flex items-center px-4 py-2 text-left cursor-pointer outline-none transition-colors bg-nexus-surface border-b border-nexus-border group relative`}
                onClick={() => onSelectContact(item)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0 relative z-10">
                   {/* Perfect 40x40 Circular Headshot */}
                   <div className="relative shrink-0">
                     <div className={`w-[40px] h-[40px] flex items-center justify-center relative rounded-full overflow-hidden bg-nexus-bg border border-nexus-border`}>
                       {item.avatar ? (
                         <img src={item.avatar} alt="Avatar" className="w-full h-full object-cover object-center transition-transform group-hover:scale-110 duration-500" referrerPolicy="no-referrer" />
                       ) : (
                         <Fingerprint size={18} className="text-nexus-ink-muted opacity-20" strokeWidth={1} />
                       )}
                     </div>
                     {item.online && (
                       <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-nexus-accent-cyan border-2 border-nexus-surface z-30" />
                     )}
                   </div>
                   
                   <div className="flex-1 min-w-0 flex flex-col justify-center py-0">
                     <div className="flex items-center justify-between leading-none">
                        <span className={`text-[13px] font-bold tracking-tight text-nexus-ink truncate flex-1 font-sans`}>
                           {item.name || "UID_" + item.did.slice(-4).toUpperCase()}
                        </span>
                        <span className="text-nexus-ink-muted text-[9px] font-bold shrink-0 ml-2 tracking-tight">
                          {item.timestamp}
                        </span>
                     </div>
                     
                     <div className="text-nexus-accent-blue font-bold text-[9px] truncate block tracking-tight leading-none mt-1 uppercase opacity-80">
                       {item.online ? 'BROADCASTING_ACT' : 'OFFLINE_SHARD_IDLE'}
                     </div>

                     <div className="flex items-center justify-between mt-1 leading-none">
                        <div className="flex-1 min-w-0 flex flex-col pr-2">
                           <div className="text-nexus-ink-muted font-bold text-[8px] truncate block font-mono tracking-[0.5px] uppercase opacity-40">
                             {item.lastCiphertext || "Awaiting signal..."}
                           </div>
                        </div>
                        {item.unreadCount > 0 && (
                          <div className="bg-nexus-accent-blue text-white font-black text-[7px] min-w-[14px] h-[14px] flex items-center justify-center rounded-full shrink-0 self-center px-1">
                            {item.unreadCount}
                          </div>
                        )}
                     </div>
                   </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
        
        {processedContacts.length === 0 && (
           <div className="py-24 flex flex-col items-center justify-center text-center px-6">
              <div className="relative mb-6">
                 <div className="w-20 h-20 rounded-full border border-nexus-border bg-nexus-surface flex items-center justify-center shadow-inner relative z-10 transition-colors">
                    <MessageSquareOff size={32} className="text-nexus-ink-muted opacity-20" strokeWidth={1} />
                 </div>
                 <div className="absolute inset-x-[-10px] inset-y-[-10px] border border-nexus-accent-blue/10 rounded-full animate-[ping_3s_linear_infinite] opacity-10" />
                 <div className="absolute inset-0 border border-nexus-accent-blue/20 rounded-full animate-pulse scale-110 opacity-20" />
              </div>
              
              <h3 className="text-[12px] font-black text-nexus-ink uppercase tracking-[4px] mb-3 font-sans">NO_CHANNELS_ACTIVE</h3>
              
              <p className="text-[10px] font-medium text-nexus-ink-muted max-w-[240px] tracking-wide leading-relaxed font-sans uppercase opacity-60 mb-8">
                 Signal swept 0 active peer channels in current sector. Initiate a scan in the node registry to establish secure bridges.
              </p>

              <button 
                onClick={onNavigateToNodes}
                className="group relative flex items-center space-x-3 px-6 py-3 bg-nexus-accent-blue/5 border border-nexus-accent-blue/20 rounded-[4px] hover:bg-nexus-accent-blue/10 transition-all active:scale-95 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Radar size={14} className="text-nexus-accent-blue" />
                <span className="text-nexus-accent-blue font-black text-[9px] tracking-[3px] uppercase">DISCOVER_NODES</span>
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

/**
 * Deterministic Geometric Avatar based on DID seed.
 */
function GeometricAvatar({ seed, avatar, isDarkMode }: { seed: string, avatar?: string, isDarkMode: boolean }) {
  const surfaceClass = isDarkMode ? "bg-nexus-surface" : "bg-white";
  const borderClass = isDarkMode ? "border-nexus-border" : "border-[#E5E5E5]";

  if (avatar) {
    return (
      <div className={`w-12 h-12 ${surfaceClass} border ${borderClass} overflow-hidden rounded-sm`}>
        <img src={avatar} alt="Node" className="w-full h-full object-cover grayscale opacity-80" referrerPolicy="no-referrer" />
      </div>
    );
  }

  // Simple hash for deterministic variations
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pattern = hash % 4; // 4 simple geometric patterns

  return (
    <div className={`w-12 h-12 ${surfaceClass} border ${borderClass} flex items-center justify-center overflow-hidden rounded-sm`}>
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
