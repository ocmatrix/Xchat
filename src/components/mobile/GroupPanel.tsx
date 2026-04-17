import React, { useState } from 'react';
import { X, ShieldCheck, UserMinus, UserPlus, AlertCircle, Radar, ShieldAlert, Cpu, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Member {
  did: string;
  role: 'ADMIN' | 'NODE';
}

interface GroupPanelProps {
  onClose: () => void;
  members: Member[];
  groupName: string;
  isIsolated?: boolean;
}

export const GroupPanel = ({ onClose, members, groupName, isIsolated = false }: GroupPanelProps) => {
  const [toast, setToast] = useState<string | null>(null);

  const showDeniedToast = () => {
    setToast("ACCESS DENIED::ISOLATION_OVERRIDE_FAILED");
    setTimeout(() => setToast(null), 2500);
  };

  const admins = members.filter(m => m.role === 'ADMIN');
  const nodes = members.filter(m => m.role === 'NODE');

  return (
    <div className="absolute inset-0 bg-nexus-bg z-[100] flex flex-col pt-12 animate-in slide-in-from-right duration-400">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 bg-nexus-surface border border-[#EF4444]/30 rounded-sm flex items-center space-x-3 shadow-[0_10px_50px_rgba(239,68,68,0.2)]"
          >
            <ShieldAlert size={14} className="text-[#EF4444]" />
            <span className="text-[#EF4444] font-mono text-[8px] tracking-[2px] uppercase whitespace-nowrap font-bold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-8 py-8 border-b border-nexus-border">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3 mb-1">
             <span className="text-nexus-ink font-mono text-sm tracking-[3px] uppercase font-bold">{groupName}</span>
             {isIsolated && <Radar size={14} className="text-[#EF4444] animate-pulse" />}
          </div>
          <div className="flex items-center space-x-2">
             <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[2px] uppercase">
                {isIsolated ? 'Node_Isolation::Genesis' : 'Peer_Discovery::Active'}
             </span>
             {isIsolated && (
                 <span className="px-1 bg-[#EF4444]/10 text-[#EF4444] font-mono text-[7px] border border-[#EF4444]/20 rounded-sm">IMMUTABLE</span>
             )}
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-nexus-ink-muted hover:text-nexus-ink transition-colors border-none bg-transparent cursor-pointer"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
        {/* MLS Intelligence Metrics Section */}
        <div className="px-8 mb-10">
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-nexus-card border border-nexus-border p-4 rounded-sm">
                 <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[2px] uppercase block mb-1">MLS_Epoch</span>
                 <span className="text-nexus-ink font-mono text-xs font-bold tracking-widest">4AA2::91</span>
              </div>
              <div className="bg-nexus-card border border-nexus-border p-4 rounded-sm">
                 <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[2px] uppercase block mb-1">Tree_Depth</span>
                 <span className="text-nexus-ink font-mono text-xs font-bold tracking-widest">0x07</span>
              </div>
           </div>
           <div className="mt-3 bg-nexus-surface border border-nexus-border p-4 rounded-sm flex items-center justify-between">
              <div>
                 <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[2px] uppercase block mb-1">Handshake_Integrity</span>
                 <span className="text-nexus-accent-blue font-mono text-[9px] font-bold tracking-[1px] uppercase">STATE_SYNCHRONIZED</span>
              </div>
              <ShieldCheck size={16} className="text-nexus-accent-blue opacity-40" />
           </div>
        </div>

        {/* Section: Administrators */}
        <div className="px-8 mt-4 mb-8">
           <div className="flex items-center space-x-3 mb-4 opacity-40">
              <Cpu size={12} className={isIsolated ? 'text-nexus-ink-muted' : 'text-nexus-accent-gold'} />
              <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[3px] uppercase">
                 {isIsolated ? 'Anonymized_Coordinators' : 'Genesis_Operators'}
              </span>
           </div>
           
           <div className="space-y-4">
             {admins.map(m => (
               <div key={m.did} className="flex items-center justify-between p-4 bg-nexus-surface border border-nexus-border rounded-sm">
                  <div className="flex flex-col">
                     <span className="text-nexus-ink font-mono text-[10px] tracking-tight">
                        {isIsolated ? `Anonymous_Node::${m.did.slice(-4)}` : m.did.slice(0, 16) + "..."}
                     </span>
                     <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1.5px] uppercase mt-1">
                        MPC_TIER_1 :: ROLE_ROOT
                     </span>
                  </div>
                  <ShieldCheck size={14} className={isIsolated ? 'text-nexus-ink-muted' : 'text-nexus-accent-gold'} opacity={0.6} />
               </div>
             ))}
           </div>
        </div>

        {/* Section: Standard Nodes */}
        <div className="px-8 mt-8">
           <div className="flex items-center space-x-3 mb-4 opacity-40">
              <Users size={12} className="text-nexus-ink-muted" />
              <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[3px] uppercase">
                 Verified_Peers ({nodes.length})
              </span>
           </div>
           
           <div className="space-y-4">
             {nodes.map(m => (
               <button 
                 key={m.did} 
                 className={`w-full flex items-center justify-between p-4 bg-nexus-surface border border-nexus-border rounded-sm transition-all text-left outline-none ${isIsolated ? 'cursor-not-allowed grayscale' : 'cursor-pointer hover:border-nexus-accent-gold/20 group'}`}
                 onClick={isIsolated ? showDeniedToast : undefined}
               >
                  <div className="flex flex-col overflow-hidden">
                     <span className="text-nexus-ink font-mono text-[10px] tracking-tight opacity-70">
                        {isIsolated ? `Shadow_Replica::${m.did.slice(-4)}` : m.did.slice(0, 16) + "..."}
                     </span>
                     <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1px] uppercase mt-1">
                        {isIsolated ? 'Handshake_Blocked' : 'Double_Ratchet::Synchronized'}
                     </span>
                  </div>
                  {!isIsolated && (
                    <UserMinus size={14} className="text-[#EF4444] opacity-0 group-hover:opacity-40 transition-opacity" />
                  )}
               </button>
             ))}
           </div>
        </div>
      </div>

      {!isIsolated && (
        <div className="p-8 border-t border-nexus-border bg-nexus-bg">
          <button className="w-full h-14 bg-nexus-surface border border-nexus-accent-gold/20 flex items-center justify-center space-x-4 hover:bg-nexus-border transition-all border-none cursor-pointer rounded-sm group overflow-hidden relative">
            <div className="absolute inset-0 bg-nexus-accent-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <UserPlus size={16} className="text-nexus-accent-gold z-10" />
            <span className="text-nexus-accent-gold font-mono text-[10px] uppercase font-bold tracking-[4px] z-10">Generate Group Token</span>
          </button>
        </div>
      )}
    </div>
  );
};
