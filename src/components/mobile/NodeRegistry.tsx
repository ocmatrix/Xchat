import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Shield, Radar, UserPlus, MoreHorizontal, Fingerprint, Activity, Zap, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';

type NodeConnectionState = 'IDLE' | 'HANDSHAKING' | 'CONNECTED' | 'FAILED';

interface NodeRegistryProps {
  contacts: any[];
  onDiscovery: () => void;
}

export const NodeRegistry = ({ contacts, onDiscovery }: NodeRegistryProps) => {
  const [isolationActive, setIsolationActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeConnectionState>>({});

  const initiateHandshake = async (did: string) => {
    // Only allow handshaking if not already connected or handshaking
    if (nodeStatuses[did] === 'HANDSHAKING' || nodeStatuses[did] === 'CONNECTED') return;

    setNodeStatuses(prev => ({ ...prev, [did]: 'HANDSHAKING' }));

    // Simulate multi-stage handshake
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 10% failure chance for realism
    const success = Math.random() > 0.1;
    setNodeStatuses(prev => ({ ...prev, [did]: success ? 'CONNECTED' : 'FAILED' }));

    // Reset failed after a few seconds
    if (!success) {
      setTimeout(() => {
        setNodeStatuses(prev => {
          const newState = { ...prev };
          delete newState[did];
          return newState;
        });
      }, 3000);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.did.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-nexus-bg overflow-hidden">
      {/* Search Header */}
      <div className="px-6 py-4">
        <div className="relative flex items-center">
           <Search size={14} className="absolute left-4 text-nexus-ink-muted" />
           <input 
             type="text" 
             placeholder="SEARCH_NODE_REGISTRY..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-nexus-surface border border-nexus-border rounded-sm py-3 pl-12 pr-4 text-nexus-ink font-mono text-[10px] tracking-wider outline-none focus:border-nexus-accent-gold/50 transition-all placeholder:text-nexus-ink-muted/50"
           />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Protocol Settings Section */}
        <div className="px-6 py-6 mb-4">
           <div className="bg-nexus-surface border border-[#EF4444]/20 p-5 flex items-center justify-between rounded-sm">
              <div className="flex items-center space-x-4">
                 <div className={`p-2 rounded-full ${isolationActive ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-nexus-ink-muted/10 text-nexus-ink-muted'}`}>
                    <Shield size={18} strokeWidth={1.5} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-nexus-ink font-mono text-[10px] font-bold tracking-[2px] uppercase">Node_Isolation_Protocol</span>
                    <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1px] mt-1 uppercase">Block_Peer_Metadata_Leaks</span>
                 </div>
              </div>
              <button 
                onClick={() => setIsolationActive(!isolationActive)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 border-none cursor-pointer ${isolationActive ? 'bg-[#EF4444]' : 'bg-nexus-border'}`}
              >
                 <motion.div 
                   animate={{ x: isolationActive ? 26 : 4 }}
                   className="w-4 h-4 bg-white rounded-full absolute top-1"
                 />
              </button>
           </div>
        </div>

        {/* Discovery Action */}
        <div className="px-6 mb-8">
           <button 
             onClick={onDiscovery}
             className="w-full h-14 bg-transparent border border-nexus-accent-blue/30 flex items-center justify-center space-x-3 hover:bg-nexus-accent-blue/5 transition-all text-nexus-accent-blue cursor-pointer rounded-sm"
           >
              <Radar size={16} />
              <span className="font-mono text-[9px] font-bold tracking-[3px] uppercase">Discover_Nearby_Nodes</span>
           </button>
        </div>

        {/* Node List */}
        <div className="px-6 space-y-2 mb-10">
           <div className="flex items-center justify-between mb-4 opacity-40 px-2">
              <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[3px] uppercase">Verified_Network_Nodes</span>
              <span className="text-nexus-ink font-mono text-[8px] uppercase">{filteredContacts.length}</span>
           </div>

           {filteredContacts.map(node => {
             const status = nodeStatuses[node.did] || 'IDLE';
             const isConnecting = status === 'HANDSHAKING';
             const presenceStatus = isConnecting ? 'CONNECTING' : (node.online ? 'ONLINE' : 'OFFLINE');
             
             return (
               <div 
                 key={node.did} 
                 onClick={() => initiateHandshake(node.did)}
                 className={`bg-nexus-card border p-5 flex flex-col space-y-4 rounded-sm group transition-all cursor-pointer relative overflow-hidden ${
                   status === 'CONNECTED' ? 'border-nexus-accent-gold/40' : 
                   status === 'FAILED' ? 'border-[#EF4444]/40' : 
                   status === 'HANDSHAKING' ? 'border-nexus-accent-blue/40' : 'border-nexus-border hover:border-nexus-accent-gold/20'
                 }`}
               >
                  {/* Subtle Scanline for Active Nodes */}
                  {node.online && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nexus-accent-gold/[0.02] to-transparent pointer-events-none opacity-50" />
                  )}

                  <div className="flex items-center justify-between relative z-10">
                     <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-nexus-surface border border-nexus-border flex items-center justify-center text-nexus-ink-muted shrink-0 relative">
                           {status === 'HANDSHAKING' ? (
                             <RefreshCcw size={20} className="text-nexus-accent-blue animate-spin" strokeWidth={1.5} />
                           ) : status === 'CONNECTED' ? (
                             <Zap size={20} className="text-nexus-accent-gold" fill="currentColor" strokeWidth={1} />
                           ) : status === 'FAILED' ? (
                             <XCircle size={20} className="text-[#EF4444]" strokeWidth={1.5} />
                           ) : (
                             <Fingerprint size={20} strokeWidth={1} className={node.online ? 'text-nexus-ink' : 'opacity-40'} />
                           )}
                           
                           {/* Status corner indicator */}
                           <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-nexus-bg ${
                             isConnecting ? 'bg-nexus-accent-blue animate-pulse' : 
                             node.online ? 'bg-nexus-accent-gold' : 'bg-nexus-border'
                           }`} />
                        </div>
                        <div className="flex flex-col">
                           <div className="flex items-center space-x-3">
                             <span className={`font-sans text-sm font-bold tracking-tight transition-colors ${node.online ? 'text-nexus-ink' : 'text-nexus-ink-muted'}`}>
                               {node.name || "UNNAMED_PEER"}
                             </span>
                             <AnimatePresence>
                               {status !== 'IDLE' && (
                                 <motion.div
                                   initial={{ opacity: 0, x: -5 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, scale: 0.8 }}
                                   className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-[2px] border ${
                                     status === 'HANDSHAKING' ? 'bg-nexus-accent-blue/5 border-nexus-accent-blue/20 text-nexus-accent-blue' :
                                     status === 'CONNECTED' ? 'bg-nexus-accent-gold/5 border-nexus-accent-gold/20 text-nexus-accent-gold' :
                                     'bg-[#EF4444]/5 border-[#EF4444]/20 text-[#EF4444]'
                                   }`}
                                 >
                                   <span className="font-mono text-[7px] tracking-[2px] uppercase font-black">
                                     {status}
                                   </span>
                                 </motion.div>
                               )}
                             </AnimatePresence>
                           </div>
                           
                           <div className="flex items-center space-x-2 mt-1.5">
                              <div className={`flex items-center space-x-1.5 px-1.5 py-0.5 rounded-[2px] bg-nexus-bg/50 border border-nexus-border/40`}>
                                 <div className={`w-1 h-1 rounded-full ${
                                   isConnecting ? 'bg-nexus-accent-blue animate-pulse shadow-[0_0_8px_var(--nexus-accent-blue)]' : 
                                   node.online ? 'bg-nexus-accent-gold shadow-[0_0_8px_var(--nexus-accent-gold)]' : 
                                   'bg-nexus-ink-muted opacity-30'
                                 }`} />
                                 <span className="font-mono text-[6px] tracking-[2px] uppercase font-extrabold opacity-80">
                                   {presenceStatus}
                                 </span>
                              </div>
                              <span className="text-nexus-ink-muted font-mono text-[7px] uppercase truncate max-w-[120px] opacity-40 select-all">{node.did}</span>
                           </div>
                        </div>
                     </div>
                     <button className="p-2 text-nexus-ink-muted hover:text-nexus-ink transition-colors border-none bg-transparent cursor-pointer">
                        <MoreHorizontal size={14} />
                     </button>
                  </div>

                  {/* Connectivity Stats Bar */}
                  {node.online && status === 'CONNECTED' && (
                   <div className="flex items-center justify-between px-2 py-2 bg-nexus-surface/50 rounded-sm">
                      <div className="flex items-center space-x-4">
                         <div className="flex flex-col">
                            <span className="text-nexus-ink-muted font-mono text-[6px] uppercase tracking-[1px]">Latency</span>
                            <span className="text-nexus-ink font-mono text-[9px]">{Math.floor(Math.random() * 50) + 20}ms</span>
                         </div>
                         <div className="w-[1px] h-4 bg-nexus-border" />
                         <div className="flex flex-col">
                            <span className="text-nexus-ink-muted font-mono text-[6px] uppercase tracking-[1px]">Bandwidth</span>
                            <span className="text-nexus-ink font-mono text-[9px]">{(Math.random() * 10).toFixed(1)} Mb/s</span>
                         </div>
                      </div>
                      <div className="flex items-center space-x-1">
                         {[1, 1, 1, 0, 0].map((bar, i) => (
                            <div key={i} className={`w-1 h-3 rounded-[1px] ${i < 3 ? 'bg-nexus-accent-gold' : 'bg-nexus-border'}`} />
                         ))}
                      </div>
                   </div>
                 )}
              </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};
