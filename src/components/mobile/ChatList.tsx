import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, Trash2, Search, Zap, Command, Sun, Moon, 
  ArrowDownWideNarrow, BarChart3, Activity, 
  Fingerprint, ChevronRight, MoreHorizontal,
  MessageSquareOff, Radar, UserPlus, UserCheck, X, RefreshCw
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FirebaseService } from '../../services/FirebaseService';

type SortCriteria = 'name' | 'status' | 'timestamp';

const ContactListItem = React.memo(({ item, index, isLast, onSelectContact }: any) => {
  return (
    <motion.div>
      <button
        className="w-full h-[68px] flex items-center pl-4 text-left cursor-pointer outline-none transition-colors bg-white dark:bg-[#1C1C1E] active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E] group relative border-none"
        onClick={() => onSelectContact(item)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0 relative z-10 w-full pr-4">
           {/* Avatar */}
           <div className="relative shrink-0">
             <div className="w-12 h-12 flex items-center justify-center relative rounded-full overflow-hidden bg-[#F2F2F7] dark:bg-[#2C2C2E]">
               {item.avatar ? (
                 <img src={item.avatar} alt="Avatar" className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
               ) : (
                 <span className="text-[#8E8E93] font-medium text-lg">{item.name?.charAt(0) || "U"}</span>
               )}
             </div>
           </div>
           
           <div className={`flex-1 min-w-0 h-[68px] flex flex-col justify-center ${!isLast ? 'border-b border-black/5 dark:border-white/5' : ''}`}>
             <div className="flex items-center justify-between mb-0.5">
                <span className="text-[16px] font-medium text-black dark:text-white truncate flex-1 leading-tight">
                   {item.name || "UID_" + item.did.slice(-4)}
                </span>
                <div className="flex items-center space-x-2 shrink-0 ml-2">
                   <span className="text-[#8E8E93] text-sm font-normal">
                     {item.timestamp}
                   </span>
                   <ChevronRight size={14} className="text-[#C7C7CC] dark:text-[#5A5A5E]" />
                </div>
             </div>
             
             <div className="flex items-center justify-between mt-0.5 leading-snug">
                <div className="flex-1 min-w-0 flex items-center space-x-2 pr-2">
                   {/* Truncated message preview */}
                   <span className="text-[#8E8E93] font-normal text-[15px] truncate block opacity-90">
                     {item.lastCiphertext || "Photo"}
                   </span>
                </div>
                <AnimatePresence>
                  {item.unreadCount > 0 && (
                    <motion.div 
                      key="unreadBadge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="bg-[#007AFF] text-white font-medium text-[12px] min-w-[20px] h-[20px] flex items-center justify-center rounded-full shrink-0 px-1.5 ml-1 leading-none"
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
  );
});

export const ChatList = ({ contacts, onSelectContact, onLightningCall, onNavigateToNodes, searchQuery: externalSearchQuery }: any) => {
  const [sortBy, setSortBy] = useState<SortCriteria>('timestamp');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactDID, setNewContactDID] = useState("");
  const [newContactAlias, setNewContactAlias] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

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
    let result = contacts.filter((c: any) => 
      c.name.toLowerCase().includes(externalSearchQuery.toLowerCase()) || 
      c.did.toLowerCase().includes(externalSearchQuery.toLowerCase())
    );

    // Sorting logic
    result.sort((a: any, b: any) => {
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

  const virtualizer = useVirtualizer({
    count: processedContacts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    overscan: 5,
  });

  const handleChatClick = useCallback(async (contact: any) => {
    console.log('[ChatList] Contact click received');
    console.table(contact || {});

    let resolvedContact = { ...contact };
    const missingNodeId = !resolvedContact?.node_id && !resolvedContact?.nodeId && !resolvedContact?.uid && !resolvedContact?.id && !resolvedContact?.did;
    const missingConversationId = !resolvedContact?.conversation_id && !resolvedContact?.conversationId && !resolvedContact?.convId;

    if (missingNodeId || missingConversationId) {
      console.warn('[ChatList] Missing critical contact fields. Starting cloud metadata sync...', {
        missingNodeId,
        missingConversationId
      });
      try {
        resolvedContact = await FirebaseService.syncContactMetadata(resolvedContact);
      } catch (error) {
        console.error('[ChatList] Cloud metadata sync failed:', error);
      }
    }

    const finalNodeId = resolvedContact?.node_id || resolvedContact?.nodeId || resolvedContact?.uid || resolvedContact?.id || resolvedContact?.did;
    const finalConversationId = resolvedContact?.conversation_id || resolvedContact?.conversationId || resolvedContact?.convId;

    if (!finalNodeId || !finalConversationId) {
      console.warn('[ChatList] Navigation blocked: missing node_id or conversation_id after sync.', {
        finalNodeId,
        finalConversationId,
        resolvedContact
      });
      return;
    }

    if (!resolvedContact?.publicKey && !resolvedContact?.pubKey) {
      console.warn('[ChatList] Potential route guard block: public key missing in context payload.', resolvedContact);
    }

    onSelectContact({
      ...resolvedContact,
      id: resolvedContact.id || finalNodeId,
      uid: resolvedContact.uid || finalNodeId,
      did: resolvedContact.did || finalNodeId,
      convId: resolvedContact.convId || finalConversationId
    });
  }, [onSelectContact]);

  return (
    <div className="bg-transparent flex flex-col font-sans flex-1 min-h-0 relative">
      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto px-0 pb-12"
      >
        <div 
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = processedContacts[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <ContactListItem 
                  item={item} 
                  index={virtualItem.index} 
                  isLast={virtualItem.index === processedContacts.length - 1}
                  onSelectContact={handleChatClick}
                />
              </div>
            );
          })}
        </div>
        
        {processedContacts.length === 0 && (
           <div className="py-24 flex flex-col items-center justify-center text-center px-6">
              <div className="relative mb-6">
                 <div className="w-20 h-20 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-center">
                    <MessageSquareOff size={32} className="text-[#8E8E93]" strokeWidth={1.5} />
                 </div>
              </div>
              
              <h3 className="text-[17px] font-semibold text-black dark:text-white mb-2">No Chats</h3>
              
              <p className="text-[15px] font-normal text-[#8E8E93] max-w-[240px] leading-relaxed mb-8">
                 You have no active conversations. Discover nodes in the network to start chatting.
              </p>

              <button 
                onClick={onNavigateToNodes}
                className="flex items-center space-x-2 px-6 py-3 bg-[#007AFF] rounded-full hover:bg-[#007AFF]/90 transition-colors active:scale-95 cursor-pointer"
              >
                <Radar size={18} className="text-white" />
                <span className="text-white font-medium text-[15px]">Discover Nodes</span>
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
          className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
        >
          <div className="absolute inset-0" onClick={() => !isAdding && onClose()} />
          
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-xl shadow-2xl relative overflow-hidden"
          >
            <div className="p-4 flex justify-between items-center border-b border-black/5 dark:border-white/5 bg-transparent">
              <span className="text-[15px] font-medium text-black dark:text-white">Discover Peer</span>
              {!isAdding && !addSuccess && (
                <button onClick={onClose} className="text-[#8E8E93] hover:text-black dark:hover:text-white transition-colors bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full p-1.5 focus:outline-none">
                  <X size={16} className="rotate-45" />
                </button>
              )}
            </div>

            <div className="p-6">
              {addSuccess ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center py-6 space-y-4 text-center"
                >
                  <div className="w-16 h-16 bg-[#34C759]/10 rounded-full flex items-center justify-center">
                    <UserCheck size={32} className="text-[#34C759]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-black dark:text-white font-medium text-[15px]">Peer Connected</h3>
                    <p className="text-xs text-[#8E8E93]">Identity established successfully.</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={onAdd} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="did-input" className="text-xs font-normal text-[#8E8E93]">Identity ID</label>
                      <div className="relative">
                        <Fingerprint size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                        <input 
                          id="did-input"
                          autoFocus
                          required
                          value={did}
                          onChange={(e: any) => setDid(e.target.value)}
                          placeholder="ID: xxxx..."
                          className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border-none rounded-[10px] py-3 pl-10 pr-4 text-[15px] text-black dark:text-white placeholder:text-[#8E8E93] focus:ring-2 focus:ring-[#007AFF] outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="alias-input" className="text-xs font-normal text-[#8E8E93]">Alias (Optional)</label>
                      <div className="relative">
                        <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                        <input 
                          id="alias-input"
                          value={alias}
                          onChange={(e: any) => setAlias(e.target.value)}
                          placeholder="Enter alias"
                          className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border-none rounded-[10px] py-3 pl-10 pr-4 text-[15px] text-black dark:text-white placeholder:text-[#8E8E93] focus:ring-2 focus:ring-[#007AFF] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!did || isAdding}
                    className="w-full py-3 bg-[#007AFF] text-white rounded-[10px] font-medium text-[15px] flex items-center justify-center space-x-2 hover:bg-[#007AFF]/90 active:bg-[#007AFF]/80 transition-colors disabled:opacity-50"
                  >
                    {isAdding ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Discover</span>
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
