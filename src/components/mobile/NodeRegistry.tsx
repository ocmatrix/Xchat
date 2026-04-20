import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Shield, Radar, UserPlus, MoreHorizontal, Fingerprint, Activity, Zap, CheckCircle2, XCircle, RefreshCcw, WifiOff, Plus, Lock, Key, ChevronRight, X } from 'lucide-react';

type NodeConnectionState = 'IDLE' | 'HANDSHAKING' | 'CONNECTED' | 'FAILED';

interface NodeRegistryProps {
  contacts: any[];
  onDiscovery: () => void;
}

export const NodeRegistry = ({ contacts: initialContacts, onDiscovery }: NodeRegistryProps) => {
  const [contacts, setContacts] = useState(initialContacts);
  const [isolationActive, setIsolationActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeConnectionState>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [manualDid, setManualDid] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [manualName, setManualName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initiateHandshake = async (did: string) => {
    // Only allow handshaking if not already connected or handshaking
    if (nodeStatuses[did] === "HANDSHAKING" || nodeStatuses[did] === "CONNECTED")
      return;

    const node = contacts.find((c) => c.did === did);
    if (!node) return;

    setNodeStatuses((prev) => ({ ...prev, [did]: "HANDSHAKING" }));

    // Varying handshake durations: 1s for ONLINE, 3s for OFFLINE
    const handshakeDuration = node.online ? 1000 : 3000;
    await new Promise((resolve) => setTimeout(resolve, handshakeDuration));

    // Logic: ONLINE nodes have a small failure chance (5%), OFFLINE nodes fail more often (90%)
    const failureChance = node.online ? 0.05 : 0.9;
    const success = Math.random() > failureChance;

    setNodeStatuses((prev) => ({
      ...prev,
      [did]: success ? "CONNECTED" : "FAILED",
    }));

    // Reset failed state after a few seconds to allow retry
    if (!success) {
      setTimeout(() => {
        setNodeStatuses((prev) => {
          const newState = { ...prev };
          delete newState[did];
          return newState;
        });
      }, 3000);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDid || !manualKey) return;

    setIsSubmitting(true);
    console.log(`[P2P_HANDSHAKE] Attempting manual connection to ${manualDid}...`);
    
    // Simulate complex cryptographic handshake
    await new Promise(r => setTimeout(r, 2000));
    
    const newNode = {
      did: manualDid,
      name: manualName || `NODE_${manualDid.slice(-4).toUpperCase()}`,
      online: true,
      lastCiphertext: 'Manual bridge established.',
      paddingBucket: '2KB',
      timestamp: 'JUST NOW',
      isGroup: false,
      unreadCount: 0,
      avatar: null,
      shardKey: manualKey
    };

    setContacts(prev => [newNode, ...prev]);
    setNodeStatuses(prev => ({ ...prev, [manualDid]: 'CONNECTED' }));
    
    setIsSubmitting(false);
    setShowAddModal(false);
    setManualDid("");
    setManualKey("");
    setManualName("");
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.did.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col font-sans shrink-0 min-h-full pb-[50px] bg-transparent">
      
      <div className="flex-1 overflow-y-auto scrollbar-hide px-0 pt-0">
        {/* Protocol Settings Section - Compressed */}
        <div className="px-4 py-2 bg-nexus-surface border-b border-nexus-border transition-colors">
           <div className="flex items-center justify-between group">
              <div className="flex items-center space-x-2 relative z-10">
                 <div className={`p-1 transition-all ${isolationActive ? 'text-nexus-accent-cyan' : 'text-nexus-ink-muted'}`}>
                    <Shield size={14} strokeWidth={2.5} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-nexus-ink font-bold text-[9px] tracking-widest uppercase leading-none">ISOLATION_PROTOCOL</span>
                 </div>
              </div>
              <button 
                onClick={() => setIsolationActive(!isolationActive)}
                className={`w-8 h-4 rounded-full relative transition-all duration-300 border border-nexus-border cursor-pointer ${isolationActive ? 'bg-nexus-accent-cyan/10' : 'bg-nexus-bg'}`}
              >
                 <motion.div 
                   animate={{ x: isolationActive ? 16 : 1 }}
                   className={`w-3 h-3 rounded-full absolute top-[0.5px] transition-colors ${isolationActive ? 'bg-nexus-accent-cyan' : 'bg-nexus-surface shadow-sm'}`}
                 />
              </button>
           </div>
        </div>

        {/* Discovery Action - Compressed */}
        <div className="px-4 py-2 border-b border-nexus-border bg-nexus-bg/50 flex space-x-2">
           <button 
             onClick={onDiscovery}
             className="flex-1 h-[30px] bg-nexus-accent-blue/5 border border-nexus-accent-blue/10 flex items-center justify-center space-x-2 hover:bg-nexus-accent-blue/10 transition-all text-nexus-accent-blue active:scale-[0.99] cursor-pointer rounded-[4px] group overflow-hidden shadow-sm"
           >
              <Radar size={12} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold text-[9px] tracking-widest uppercase">SONAR_SCAN</span>
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="aspect-square h-[30px] bg-nexus-ink/5 border border-nexus-border flex items-center justify-center hover:bg-nexus-ink/10 transition-all text-nexus-ink active:scale-[0.99] cursor-pointer rounded-[4px] shadow-sm"
           >
              <Plus size={14} />
           </button>
        </div>

        {/* Manual Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setShowAddModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-sm bg-nexus-surface border-t sm:border border-nexus-border rounded-t-xl sm:rounded-lg overflow-hidden shadow-2xl z-10"
              >
                <div className="p-4 border-b border-nexus-border flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserPlus size={16} className="text-nexus-accent-blue" />
                    <span className="text-[11px] font-black tracking-[2px] uppercase text-nexus-ink">Establish_Manual_Bridge</span>
                  </div>
                  {!isSubmitting && (
                    <button onClick={() => setShowAddModal(false)} className="text-nexus-ink-muted hover:text-nexus-ink transition-colors">
                      <X size={18} />
                    </button>
                  )}
                </div>

                <form onSubmit={handleManualAdd} className="p-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold tracking-[2px] uppercase text-nexus-ink-muted opacity-60">Alias (Optional)</label>
                    <div className="relative flex items-center">
                      <Fingerprint size={12} className="absolute left-3 text-nexus-ink-muted/40" />
                      <input 
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="Node Identifier"
                        className="w-full bg-nexus-bg border border-nexus-border rounded-[4px] py-2 pl-9 pr-4 text-[11px] text-nexus-ink placeholder:text-nexus-ink-muted focus:border-nexus-accent-blue outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold tracking-[2px] uppercase text-nexus-ink-muted opacity-60">Node DID (Required)</label>
                    <div className="relative flex items-center">
                      <Shield size={12} className="absolute left-3 text-nexus-ink-muted/40" />
                      <input 
                        required
                        value={manualDid}
                        onChange={(e) => setManualDid(e.target.value)}
                        placeholder="did:key:..."
                        className="w-full bg-nexus-bg border border-nexus-border rounded-[4px] py-2 pl-9 pr-4 text-[11px] text-nexus-ink placeholder:text-nexus-ink-muted focus:border-nexus-accent-blue outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold tracking-[2px] uppercase text-nexus-ink-muted opacity-60">Shard Encryption Key</label>
                    <div className="relative flex items-center">
                      <Key size={12} className="absolute left-3 text-nexus-ink-muted/40" />
                      <input 
                        required
                        type="password"
                        value={manualKey}
                        onChange={(e) => setManualKey(e.target.value)}
                        placeholder="Entropic_Seed"
                        className="w-full bg-nexus-bg border border-nexus-border rounded-[4px] py-2 pl-9 pr-4 text-[11px] text-nexus-ink placeholder:text-nexus-ink-muted focus:border-nexus-accent-blue outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isSubmitting || !manualDid || !manualKey}
                      className="w-full py-2.5 bg-nexus-accent-blue text-white rounded-[4px] font-black text-[10px] tracking-[3px] uppercase flex items-center justify-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCcw size={14} className="animate-spin" />
                          <span>SYNCHRONIZING_BUFFER...</span>
                        </>
                      ) : (
                        <>
                          <span>Establish_Secure_Bridge</span>
                          <ChevronRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1.5 justify-center opacity-40 py-1">
                    <Lock size={8} />
                    <span className="text-[7px] font-bold tracking-widest uppercase">E2EE_ENFORCED_PROTOCOL_V4</span>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Node List */}
        <div className="bg-nexus-surface shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-colors">
           <div className="flex items-center justify-between px-4 py-2 border-b border-nexus-border">
              <div className="flex items-center space-x-1.5 opacity-60">
                 <Activity size={10} className="text-nexus-ink" />
                 <span className="text-nexus-ink font-bold text-[9px] tracking-[2px] uppercase">NODE_REG_V4</span>
              </div>
              <span className="text-nexus-ink-muted text-[8px] font-black tracking-widest font-mono shrink-0">{filteredContacts.length} ENTITIES</span>
           </div>

           <div className="space-y-0">
           {filteredContacts.map((node, index) => {
             const status = nodeStatuses[node.did] || 'IDLE';
             const isConnecting = status === 'HANDSHAKING';
             const presenceStatus = isConnecting ? 'SYNCHRONIZING' : (node.online ? 'CONNECTED' : 'DISCONNECTED');
             
             return (
               <div 
                 key={node.did} 
                 onClick={() => initiateHandshake(node.did)}
                 className={`group px-4 py-2 flex flex-col cursor-pointer relative overflow-hidden bg-nexus-surface border-b border-nexus-border transition-colors ${
                   status === 'CONNECTED' ? 'bg-nexus-accent-blue/[0.03]' : 
                   status === 'FAILED' ? 'bg-red-500/[0.03]' : 
                   status === 'HANDSHAKING' ? 'bg-nexus-accent-blue/[0.06]' : ''
                 }`}
               >
                  <div className="flex items-center space-x-3 relative z-10 w-full">
                      {/* Avatar Square 40x40 - Circular in this Hub Redesign */}
                      <div className="relative shrink-0">
                        <div className={`w-[40px] h-[40px] rounded-full bg-nexus-bg border flex items-center justify-center shrink-0 relative transition-colors ${
                          status === 'CONNECTED' ? 'border-nexus-accent-blue/40' : 
                          isConnecting ? 'border-nexus-accent-blue/40' : 'border-nexus-border'
                        }`}>
                          {status === 'HANDSHAKING' ? (
                            <RefreshCcw size={16} className="text-nexus-accent-blue animate-spin" strokeWidth={1} />
                          ) : node.avatar ? (
                            <img src={node.avatar} className="w-full h-full object-cover object-center grayscale-0 transition-transform group-hover:scale-110 duration-500" referrerPolicy="no-referrer" />
                          ) : (
                            <Fingerprint size={16} className="text-nexus-ink-muted opacity-20" strokeWidth={1} />
                          )}
                        </div>
                        {node.online && (
                          <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-nexus-accent-cyan border-2 border-nexus-surface z-30" />
                        )}
                      </div>
 
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between leading-none">
                           <span className="text-[13px] font-bold tracking-tight text-nexus-ink uppercase truncate">
                              {node.name || "UNIDENTIFIED_NODE"}
                           </span>
                           <span className={`text-[8px] font-black tracking-widest font-mono shrink-0 ml-2 ${node.online ? 'text-nexus-accent-blue' : 'text-nexus-ink-muted/60'}`}>
                              {presenceStatus}
                           </span>
                        </div>
                        
                        <div className="text-nexus-ink-muted font-bold text-[9px] truncate block tracking-tight leading-none mt-1 opacity-70">
                           Shard_ID: 0x{node.did.slice(-4).toUpperCase()} | P2P_Route: MESH_{node.online ? 'STABLE' : 'DROPPED'}
                        </div>
 
                        <div className="text-nexus-ink-muted font-black text-[8px] truncate block font-mono tracking-tighter uppercase leading-none mt-1 opacity-30">
                           {node.did}
                        </div>
                      </div>
                  </div>
               </div>
             );
           })}
           </div>
           {filteredContacts.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center px-6">
                 <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border border-nexus-border bg-nexus-surface flex items-center justify-center shadow-inner relative z-10 transition-colors">
                       <WifiOff size={32} className="text-nexus-ink-muted opacity-20" strokeWidth={1} />
                    </div>
                    <div className="absolute inset-x-[-10px] inset-y-[-10px] border border-nexus-accent-blue/5 rounded-full animate-[ping_4s_linear_infinite] opacity-10" />
                    <div className="absolute inset-0 border border-nexus-accent-blue/20 rounded-full animate-pulse scale-110 opacity-20" />
                 </div>
                 
                 <h3 className="text-[12px] font-black text-nexus-ink uppercase tracking-[4px] mb-3 font-sans">MESH_TOPOLOGY_EMPTY</h3>
                 
                 <p className="text-[10px] font-medium text-nexus-ink-muted max-w-[240px] tracking-wide leading-relaxed font-sans uppercase opacity-60 mb-8">
                    Zero verified nodes responding in current sector. Signal swept 0 active peer channels. Initiate a Sonar Scan to discover neighboring identities.
                 </p>

                 <button 
                   onClick={onDiscovery}
                   className="group relative flex items-center space-x-3 px-6 py-3 bg-nexus-accent-blue/5 border border-nexus-accent-blue/20 rounded-[4px] hover:bg-nexus-accent-blue/10 transition-all active:scale-95 cursor-pointer overflow-hidden shadow-sm"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   <Radar size={14} className="text-nexus-accent-blue" />
                   <span className="text-nexus-accent-blue font-black text-[9px] tracking-[3px] uppercase">INITIATE_P2P_SCAN</span>
                 </button>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};
