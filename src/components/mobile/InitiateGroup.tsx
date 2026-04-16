import React, { useState } from 'react';
import { X, Search, CheckSquare, Square } from 'lucide-react';

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

  const togglePeer = (did: string) => {
    setSelectedPeers(prev => 
      prev.includes(did) ? prev.filter(p => p !== did) : [...prev, did]
    );
  };

  const handleInitiate = () => {
    /* 
      EXEC LOGIC:
      Calling Rust Core: mls_create_group(peers: selectedPeers, isolation: isIsolationActive)
      Generating Key Tree root...
      Broadcasting encrypted invitations via noise-protocol signaling channel.
    */
    console.log("INITIATING SYNDICATE...", { peers: selectedPeers, isolation: isIsolationActive });
    onClose();
  };

  const filteredContacts = contacts.filter(c => 
    c.did.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] z-[500] flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-[#1A1A1A]">
        <span className="text-white font-mono text-[10px] tracking-[3px] uppercase">Initiate_Syndicate</span>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent cursor-pointer text-[#A9A9A9]">
          <X size={20} />
        </button>
      </div>

      {/* Peer Selection */}
      <div className="flex-1 overflow-y-auto pt-6 px-6 scrollbar-hide">
        {/* Search Bar */}
        <div className="flex items-center bg-[#111] px-4 py-3 rounded-sm border border-white/5 mb-8">
          <Search size={14} className="text-[#404040] mr-3" />
          <input 
            type="text" 
            placeholder="ENTER PEER DID..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-[10px] tracking-wider placeholder:text-[#404040]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <span className="text-[#A9A9A9] font-mono text-[8px] tracking-[2px] uppercase opacity-60">Verified_Authorized_Keys</span>
        </div>

        {filteredContacts.map(contact => (
          <button 
            key={contact.did}
            className="w-full flex items-center py-4 border-b border-white/5 last:border-none text-left bg-transparent border-none cursor-pointer"
            onClick={() => togglePeer(contact.did)}
          >
            <div className="mr-4 text-[#D4AF37]">
              {selectedPeers.includes(contact.did) ? <CheckSquare size={18} /> : <Square size={18} className="opacity-30" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-white font-mono text-[10px] truncate">{contact.did}</div>
              <div className="text-[#A9A9A9] font-mono text-[7px] tracking-[1px] mt-1 uppercase opacity-40">
                {contact.online ? 'NODE_ACTIVE' : 'NODE_OFFLINE'}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Genesis Parameters */}
      <div className="px-6 py-8 bg-[#0D0D0D] border-t border-[#1A1A1A]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-white font-mono text-[10px] tracking-[1.5px] uppercase">Peer Isolation Protocol</span>
            <span className="text-[#A9A9A9] font-mono text-[7px] mt-1 leading-relaxed max-w-[240px]">
              *Genesis parameter. Immutable once deployed. Disables peer-to-peer discovery and direct handshakes within the syndicate.
            </span>
          </div>
          <button 
            onClick={() => setIsIsolationActive(!isIsolationActive)}
            className={`w-10 h-5 rounded-full relative transition-colors duration-200 border-none cursor-pointer ${isIsolationActive ? 'bg-[#D4AF37]' : 'bg-[#222]'}`}
          >
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-200 ${isIsolationActive ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <button 
          onClick={handleInitiate}
          disabled={selectedPeers.length === 0}
          className={`w-full py-4 flex items-center justify-center space-x-3 transition-all border-none cursor-pointer rounded-sm ${
            selectedPeers.length > 0 
              ? 'bg-[#D4AF37] text-black hover:bg-[#B8962F]' 
              : 'bg-[#1A1A1A] text-[#404040] cursor-not-allowed'
          }`}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-[4px]">Initiate Syndicate</span>
        </button>
      </div>
    </div>
  );
};
