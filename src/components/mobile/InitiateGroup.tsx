import React, { useState } from 'react';
import { X, Search, CheckSquare, Square, Loader2 } from 'lucide-react';
import { SyndicateService } from '../../services/syndicateService';

interface Contact {
  did: string;
  online: boolean;
}

interface InitiateGroupProps {
  onClose: () => void;
  contacts: Contact[];
}

export const InitiateGroup = ({ onClose, contacts }: InitiateGroupProps) => {
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
      // 1. Prepare key packages for selected peers (Simulating resolution from peer DID documents)
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

      // 2. Call MLS-inspired Syndicate Initialization Logic
      const serializedGroupInfo = await SyndicateService.create_syndicate_logic(
        initiatorPkg,
        peerPackages
      );

      console.log("📤 GROUP_GENESIS_SUCCESS:", {
        groupId: "NEW_SYNDICATE",
        peers: selectedPeers,
        serialized_payload_v1: serializedGroupInfo
      });

      // Artificial initialization delay for UX feedback
      await new Promise(r => setTimeout(r, 1200));
      
      onClose();
    } catch (error) {
      console.error("Critical Syndicate Initialization Failure:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.did.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-nexus-bg z-[500] flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-nexus-border">
        <span className="text-nexus-ink font-mono text-[10px] tracking-[3px] uppercase">Initiate_Syndicate</span>
        <button onClick={onClose} className="p-1 hover:bg-nexus-ink/10 rounded-full transition-colors border-none bg-transparent cursor-pointer text-nexus-ink-muted">
          <X size={20} />
        </button>
      </div>

      {/* Peer Selection */}
      <div className="flex-1 overflow-y-auto pt-6 px-6 scrollbar-hide">
        {/* Search Bar */}
        <div className="flex items-center bg-nexus-surface px-4 py-3 rounded-sm border border-nexus-border mb-8">
          <Search size={14} className="text-nexus-ink-muted mr-3" />
          <input 
            type="text" 
            placeholder="ENTER PEER DID..."
            className="flex-1 bg-transparent border-none outline-none text-nexus-ink font-mono text-[10px] tracking-wider placeholder:text-nexus-ink-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[2px] uppercase opacity-60">Verified_Authorized_Keys</span>
        </div>

        {filteredContacts.map(contact => (
          <button 
            key={contact.did}
            className="w-full flex items-center py-4 border-b border-nexus-border last:border-none text-left bg-transparent border-none cursor-pointer"
            onClick={() => togglePeer(contact.did)}
          >
            <div className="mr-4 text-nexus-accent-gold">
              {selectedPeers.includes(contact.did) ? <CheckSquare size={18} /> : <Square size={18} className="opacity-30" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-nexus-ink font-mono text-[10px] truncate">{contact.did}</div>
              <div className="text-nexus-ink-muted font-mono text-[7px] tracking-[1px] mt-1 uppercase opacity-40">
                {contact.online ? 'NODE_ACTIVE' : 'NODE_OFFLINE'}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Genesis Parameters */}
      <div className="px-6 py-8 bg-nexus-surface border-t border-nexus-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-nexus-ink font-mono text-[10px] tracking-[1.5px] uppercase">Peer Isolation Protocol</span>
            <span className="text-nexus-ink-muted font-mono text-[7px] mt-1 leading-relaxed max-w-[240px]">
              *Genesis parameter. Immutable once deployed. Disables peer-to-peer discovery and direct handshakes within the syndicate.
            </span>
          </div>
          <button 
            onClick={() => setIsIsolationActive(!isIsolationActive)}
            className={`w-10 h-5 rounded-full relative transition-colors duration-200 border-none cursor-pointer ${isIsolationActive ? 'bg-nexus-accent-gold' : 'bg-nexus-border'}`}
          >
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-200 ${isIsolationActive ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <button 
          onClick={handleInitiate}
          disabled={selectedPeers.length === 0 || isInitializing}
          className={`w-full py-4 flex items-center justify-center space-x-3 transition-all border-none cursor-pointer rounded-sm ${
            selectedPeers.length > 0 && !isInitializing
              ? 'bg-nexus-accent-gold text-black hover:bg-nexus-accent-gold/80' 
              : 'bg-nexus-border text-nexus-ink-muted/50 cursor-not-allowed'
          }`}
        >
          {isInitializing ? (
             <Loader2 size={16} className="animate-spin" />
          ) : (
             <span className="font-mono text-[10px] font-bold uppercase tracking-[4px]">Initiate Syndicate</span>
          )}
        </button>
      </div>
    </div>
  );
};
