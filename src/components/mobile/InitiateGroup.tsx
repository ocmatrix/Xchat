import React, { useState } from 'react';
import { 
  X, Search, CheckSquare, Square, 
  Loader2, PhoneCall, Terminal, 
  Shield, Zap, Activity, Users,
  Check, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SyndicateService } from '../../services/syndicateService';

interface Contact {
  did: string;
  online: boolean;
  name?: string;
}

interface InitiateGroupProps {
  onClose: () => void;
  contacts: Contact[];
  onStartCall?: (peers: string[]) => void;
}

export const InitiateGroup = ({ onClose, contacts, onStartCall }: InitiateGroupProps) => {
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [isIsolationActive, setIsIsolationActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  const togglePeer = (did: string) => {
    setSelectedPeers(prev => 
      prev.includes(did) ? prev.filter(p => p !== did) : [...prev, did]
    );
  };

  const handleInitiate = async () => {
    setIsInitializing(true);
    
    try {
      const initiatorPkg = {
        did: "did:p2p:current-node",
        initKey: crypto.getRandomValues(new Uint8Array(32)),
        encryptionKey: crypto.getRandomValues(new Uint8Array(32))
      };

      const peerPackages = selectedPeers.map(did => ({
        did,
        initKey: crypto.getRandomValues(new Uint8Array(32)),
        encryptionKey: crypto.getRandomValues(new Uint8Array(32))
      }));

      const serializedGroupInfo = await SyndicateService.create_syndicate_logic(
        initiatorPkg,
        peerPackages
      );

      console.log("📤 GROUP_GENESIS_SUCCESS:", {
        groupId: "NEW_SYNDICATE",
        peers: selectedPeers,
        serialized_payload_v1: serializedGroupInfo
      });

      await new Promise(r => setTimeout(r, 1500));
      onClose();
    } catch (error) {
      console.error("Critical Syndicate Initialization Failure:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.did.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="absolute inset-0 bg-nexus-bg z-[500] flex flex-col font-sans overflow-hidden animate-in slide-in-from-bottom duration-500">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 technical-grid" />
      </div>

      <div className="flex items-center justify-between px-4 py-4 relative z-10 border-b border-black/[0.03] bg-white">
        <div className="flex flex-col">
           <div className="flex items-center space-x-2">
              <Zap size={14} className="text-nexus-accent-cyan" />
              <h2 className="text-nexus-ink font-bold text-lg tracking-tight uppercase">SYNDICATE_GENESIS</h2>
           </div>
           <span className="text-nexus-ink-muted opacity-50 font-bold text-[8px] tracking-[2px] uppercase">Node_Clustering_v1.0</span>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-black/[0.03] text-nexus-ink-muted hover:text-nexus-ink transition-all rounded-full cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 relative z-10 scrollbar-hide space-y-6">
        <div className="group relative">
           <div className="flex items-center bg-white border border-black/[0.03] shadow-sm px-4 py-3 rounded-[4px] transition-all focus-within:border-nexus-accent-blue/40">
             <Search size={14} className="text-nexus-ink-muted opacity-30 mr-3" />
             <input 
               type="text" 
               placeholder="IDENTIFY NODE DID OR ALIAS..."
               className="flex-1 bg-transparent border-none outline-none text-nexus-ink font-bold text-[11px] tracking-tight placeholder:text-nexus-ink-muted/10 uppercase"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
        </div>

        <div className="space-y-3">
           <div className="flex items-center justify-between px-1">
              <span className="text-nexus-ink-muted opacity-50 font-bold text-[8px] tracking-[2px] uppercase">Verified_Link_Pool</span>
              <span className="text-nexus-ink-muted opacity-40 text-[8px] font-bold tracking-[1px]">{selectedPeers.length} SELECTED</span>
           </div>

           <div className="grid gap-1">
              {filteredContacts.map(contact => (
                <button 
                  key={contact.did}
                  className={`w-full flex items-center p-3 bg-white border rounded-[4px] transition-all text-left relative overflow-hidden group ${selectedPeers.includes(contact.did) ? 'border-nexus-accent-blue/30 shadow-md bg-nexus-accent-blue/[0.02]' : 'border-black/[0.03] shadow-[0_2px_10px_rgba(0,0,0,0.01)]'}`}
                  onClick={() => togglePeer(contact.did)}
                >
                  <div className="mr-3 shrink-0">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedPeers.includes(contact.did) ? 'bg-nexus-accent-blue border-nexus-accent-blue text-white' : 'bg-gray-50 border-black/[0.1] text-transparent'}`}>
                       <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                     <div className="flex items-center space-x-2">
                        <span className="text-nexus-ink font-bold text-[13px] tracking-tight truncate">
                          {contact.name || contact.did.slice(0, 8) + "..." + contact.did.slice(-8)}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ${contact.online ? 'bg-nexus-accent-cyan' : 'bg-gray-200'}`} />
                     </div>
                     <span className="text-nexus-ink-muted opacity-40 font-bold text-[8px] tracking-[1px] uppercase font-mono">
                       {contact.did.slice(0, 24)}...
                     </span>
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-black/[0.03] space-y-3 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <div className="bg-gray-50 border border-black/[0.02] p-3 rounded-[4px]">
           <div className="flex items-start justify-between">
              <div className="flex flex-col">
                  <span className="text-nexus-ink font-bold text-[10px] tracking-tight uppercase leading-none mb-1">Isolation_Sync</span>
                  <p className="text-nexus-ink-muted opacity-50 font-bold text-[8px] leading-relaxed uppercase tracking-[0.5px] max-w-[200px]">
                    Disables peer discovery for cluster subordinates.
                  </p>
              </div>
              <button 
                onClick={() => setIsIsolationActive(!isIsolationActive)}
                className={`w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${isIsolationActive ? 'bg-nexus-accent-blue' : 'bg-gray-300'}`}
              >
                <div 
                  className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${isIsolationActive ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} 
                />
              </button>
           </div>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={handleInitiate}
            disabled={selectedPeers.length === 0 || isInitializing}
            className={`flex-1 h-11 flex items-center justify-center space-x-3 transition-all rounded-[6px] border-none shadow-sm relative overflow-hidden group ${
              selectedPeers.length > 0 && !isInitializing
                ? 'bg-nexus-ink text-white cursor-pointer active:scale-[0.98]' 
                : 'bg-gray-100 text-nexus-ink-muted/30 cursor-not-allowed'
            }`}
          >
            {isInitializing ? (
               <Loader2 size={16} className="animate-spin" />
            ) : (
               <span className="font-bold text-[10px] uppercase tracking-[3px] z-10">INIT_CLUSTER</span>
            )}
          </button>

          <button 
            onClick={() => onStartCall?.(selectedPeers)}
            disabled={selectedPeers.length === 0 || isInitializing}
            className={`w-11 h-11 flex items-center justify-center transition-all bg-transparent border border-black/[0.03] rounded-[6px] group ${
              selectedPeers.length > 0 && !isInitializing
                ? 'border-nexus-accent-blue text-nexus-accent-blue cursor-pointer hover:bg-nexus-accent-blue/5 active:scale-[0.98]' 
                : 'border-nexus-ink-muted/10 text-nexus-ink-muted/10 cursor-not-allowed'
            }`}
          >
            <PhoneCall size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
