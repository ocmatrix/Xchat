import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Shield, Radar, UserPlus, MoreHorizontal, Fingerprint, Activity } from 'lucide-react';

interface NodeRegistryProps {
  contacts: any[];
  onDiscovery: () => void;
}

export const NodeRegistry = ({ contacts, onDiscovery }: NodeRegistryProps) => {
  const [isolationActive, setIsolationActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

           {filteredContacts.map(node => (
             <div key={node.did} className="bg-nexus-card border border-nexus-border p-4 flex items-center justify-between rounded-sm group hover:border-nexus-accent-gold/20 transition-all">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 bg-nexus-surface border border-nexus-border flex items-center justify-center text-nexus-ink-muted">
                      <Fingerprint size={18} strokeWidth={1} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight">{node.name || "UNNAMED_PEER"}</span>
                      <div className="flex items-center space-x-2 mt-1">
                         <span className="text-nexus-ink-muted font-mono text-[7px] uppercase truncate w-32">{node.did}</span>
                         <Activity size={8} className={node.online ? 'text-nexus-accent-blue' : 'text-nexus-ink-muted'} />
                      </div>
                   </div>
                </div>
                <button className="p-2 text-nexus-ink-muted hover:text-nexus-ink transition-colors border-none bg-transparent cursor-pointer">
                   <MoreHorizontal size={14} />
                </button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
