import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, Trash2, Search, Zap, Command, Sun, Moon, 
  ArrowDownWideNarrow, BarChart3, Activity, 
  Fingerprint, ChevronRight, MoreHorizontal,
  MessageSquareOff, Radar, UserPlus, UserCheck, X, RefreshCw
} from 'lucide-react';

type SortCriteria = 'name' | 'status' | 'timestamp';

export const ChatList = ({ contacts, onSelectContact, onLightningCall, onNavigateToNodes, searchQuery: externalSearchQuery }: any) => {
  const [sortBy, setSortBy] = useState<SortCriteria>('timestamp');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactDID, setNewContactDID] = useState("");
  const [newContactAlias, setNewContactAlias] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactDID) return;

    setIsAdding(true);
    // Simulate P2P discovery and DHT mapping
    await new Promise(r => setTimeout(r, 1500));
    setIsAdding(false);
    setAddSuccess(true);
    
    // In a real app, this would dispatch to a global state/db
    console.log("PEER_MAPPED::", { did: newContactDID, alias: newContactAlias });
    
    setTimeout(() => {
      setAddSuccess(false);
      setShowAddModal(false);
      setNewContactDID("");
      setNewContactAlias("");
    }, 1800);
  };

  const processedContacts = useMemo(() => {
    let result = contacts.filter(c => 
      c.name.toLowerCase().includes(externalSearchQuery.toLowerCase()) || 
      c.did.toLowerCase().includes(externalSearchQuery.toLowerCase())
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
  }, [contacts, externalSearchQuery, sortBy]);

  return (
    <div className="bg-transparent flex flex-col font-sans shrink-0 min-h-full pb-[50px]">
      
      <div className="px-0 pb-1">
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
                        <AnimatePresence>
                          {item.unreadCount > 0 && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="bg-nexus-accent-gold text-nexus-bg font-black text-[8px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full shrink-0 shadow-[0_0_12px_rgba(212,175,55,0.4)] border border-nexus-accent-gold/20 px-1.5"
                            >
                              {item.unreadCount > 99 ? '99+' : item.unreadCount}
                            </motion.div>
                          )}
                        </AnimatePresence>
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

      <AddContactModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddContact}
        isAdding={isAdding}
        addSuccess={addSuccess}
        did={newContactDID}
        setDid={setNewContactDID}
        alias={newContactAlias}
        setAlias={setNewContactAlias}
      />
    </div>
  );
};

export const AddContactModal = ({ isOpen, onClose, onAdd, isAdding, addSuccess, did, setDid, alias, setAlias }: any) => {
   return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
        >
          <div className="absolute inset-0" onClick={() => !isAdding && onClose()} />
          
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-nexus-surface border border-nexus-border rounded-xl shadow-2xl relative overflow-hidden"
          >
            <div className="p-4 border-b border-nexus-border flex justify-between items-center bg-nexus-bg/30">
              <div className="flex items-center space-x-2">
                <UserPlus size={16} className="text-nexus-accent-blue" aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-[3px]">Manual_Peer_Discovery</span>
              </div>
              {!isAdding && !addSuccess && (
                <button onClick={onClose} className="text-nexus-ink-muted hover:text-nexus-ink transition-colors">
                  <X size={16} className="rotate-45" />
                </button>
              )}
            </div>

            <div className="p-8">
              {addSuccess ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center py-6 space-y-4 text-center"
                >
                  <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center">
                    <UserCheck size={32} className="text-[#10B981]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-nexus-ink font-black text-xs uppercase tracking-[2px]">PEER_MAPPED_SUCCESSFULLY</h3>
                    <p className="text-[9px] text-nexus-ink-muted uppercase tracking-tight">Identity shard and direct bridge established.</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={onAdd} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="did-input" className="text-[8px] font-bold tracking-[2px] uppercase text-nexus-ink-muted opacity-60">Identity_DID_URI</label>
                      <div className="relative">
                        <Fingerprint size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-ink-muted/40" />
                        <input 
                          id="did-input"
                          autoFocus
                          required
                          value={did}
                          onChange={(e: any) => setDid(e.target.value)}
                          placeholder="did:nexus:xxxx..."
                          className="w-full bg-nexus-bg border border-nexus-border rounded-[4px] py-2.5 pl-9 pr-4 text-[11px] text-nexus-ink placeholder:text-nexus-ink-muted focus:border-nexus-accent-blue outline-none transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="alias-input" className="text-[8px] font-bold tracking-[2px] uppercase text-nexus-ink-muted opacity-60">Alias_Optional</label>
                      <div className="relative">
                        <Zap size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-ink-muted/40" />
                        <input 
                          id="alias-input"
                          value={alias}
                          onChange={(e: any) => setAlias(e.target.value)}
                          placeholder="LOCAL_IDENTIFIER"
                          className="w-full bg-nexus-bg border border-nexus-border rounded-[4px] py-2.5 pl-9 pr-4 text-[11px] text-nexus-ink placeholder:text-nexus-ink-muted focus:border-nexus-accent-blue outline-none transition-colors font-sans uppercase tracking-widest font-black"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!did || isAdding}
                    className="w-full py-3 bg-nexus-accent-blue text-white rounded-[4px] font-black text-[10px] tracking-[3px] uppercase flex items-center justify-center space-x-3 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isAdding ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>INITIATING_HANDSHAKE...</span>
                      </>
                    ) : (
                      <span>DISCOVER_PEER</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
