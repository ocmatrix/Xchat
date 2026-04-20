import React, { useState } from 'react';
import { 
  X, ShieldCheck, UserMinus, UserPlus, 
  AlertCircle, Radar, ShieldAlert, Cpu, 
  Users, Terminal, Command, Zap, Activity,
  MessageSquareOff, UserX, ShieldPlus, ShieldMinus,
  Settings
} from 'lucide-react';
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

export const GroupPanel = ({ onClose, members: initialMembers, groupName, isIsolated = false }: GroupPanelProps) => {
  const [toast, setToast] = useState<string | null>(null);
  const [localMembers, setLocalMembers] = useState<Member[]>(initialMembers);
  const [policies, setPolicies] = useState({
    prohibitFriending: false,
    prohibitGreetings: false
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const showDeniedToast = () => showToast("ACCESS_DENIED::ISOLATION_OVERRIDE_FAILED");

  const togglePolicy = (policy: keyof typeof policies) => {
    if (isIsolated) {
      showDeniedToast();
      return;
    }
    const newVal = !policies[policy];
    setPolicies(prev => ({ ...prev, [policy]: newVal }));
    showToast(`POLICY_UPDATED::${policy.toUpperCase()}_${newVal ? 'LOCKED' : 'RELEASED'}`);
  };

  const handleRoleChange = (did: string, nextRole: 'ADMIN' | 'NODE') => {
    if (isIsolated) {
       showDeniedToast();
       return;
    }
    setLocalMembers(prev => prev.map(m => m.did === did ? { ...m, role: nextRole } : m));
    showToast(`CONSENSUS_REACHED::ROLE_UPDATED_FOR_${did.slice(-4)}`);
  };

  const admins = localMembers.filter(m => m.role === 'ADMIN');
  const nodes = localMembers.filter(m => m.role === 'NODE');

  return (
    <div className="absolute inset-0 bg-nexus-bg z-[500] flex flex-col pt-12 animate-in slide-in-from-right duration-500 font-mono overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-nexus-accent-blue/[0.03] to-transparent pointer-events-none" />
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 bg-[#1A0A0A] border border-[#EF4444]/40 rounded-sm flex items-center space-x-4 shadow-[0_20px_60px_rgba(239,68,68,0.3)]"
          >
            <ShieldAlert size={16} className="text-[#EF4444]" />
            <span className="text-[#EF4444] font-black text-[9px] tracking-[3px] uppercase whitespace-nowrap">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Section */}
      <div className="flex items-center justify-between px-10 py-10 relative z-10 border-b border-nexus-border">
        <div className="flex flex-col">
           <div className="flex items-center space-x-4 mb-2">
              <div className="w-1.5 h-6 bg-nexus-accent-gold shadow-[0_0_10px_#D4AF37]" />
              <h2 className="text-nexus-ink font-display text-2xl font-bold tracking-tight uppercase">{groupName}</h2>
              {isIsolated && <Radar size={16} className="text-[#EF4444] animate-pulse" />}
           </div>
           <div className="flex items-center space-x-3">
              <span className="text-nexus-ink-muted opacity-50 font-black text-[7px] tracking-[4px] uppercase">
                 {isIsolated ? 'Node_Isolation::Critical_Consensus' : 'Peer_Discovery::Omni_Mesh_Protocol'}
              </span>
              {isIsolated && (
                  <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] font-black text-[7px] border border-[#EF4444]/20 rounded-sm tracking-[1px]">SECURE_GENESIS</span>
              )}
           </div>
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center bg-nexus-border border border-nexus-border text-nexus-ink-muted hover:text-nexus-ink hover:bg-white/10 transition-all rounded-sm cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-8 px-10 space-y-12">
        {/* MLS Metadata Intelligence Cards */}
        <section className="space-y-4">
           <div className="flex items-center space-x-3 mb-6">
              <Activity size={10} className="text-nexus-accent-blue/40" />
              <span className="text-nexus-ink-muted opacity-50 font-black text-[7px] uppercase tracking-[5px]">Channel_Metrics_Shard</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-nexus-surface border border-nexus-border p-6 rounded-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] rounded-full blur-xl -translate-y-8 translate-x-8" />
                 <span className="text-nexus-ink/10 font-black text-[7px] tracking-[3px] uppercase block mb-3 group-hover:text-nexus-ink-muted opacity-50 transition-colors">MLS_Epoch</span>
                 <span className="text-nexus-accent-gold font-bold text-base tracking-widest drop-shadow-[0_0_5px_rgba(212,175,55,0.2)]">4AA2::91</span>
              </div>
              <div className="bg-nexus-surface border border-nexus-border p-6 rounded-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] rounded-full blur-xl -translate-y-8 translate-x-8" />
                 <span className="text-nexus-ink/10 font-black text-[7px] tracking-[3px] uppercase block mb-3 group-hover:text-nexus-ink-muted opacity-50 transition-colors">Mesh_Depth</span>
                 <span className="text-nexus-ink font-bold text-base tracking-widest">0b0111</span>
              </div>
           </div>
           
           <div className="bg-nexus-surface border border-nexus-border p-6 rounded-sm flex items-center justify-between group hover:border-nexus-accent-blue/20 transition-all">
              <div className="flex flex-col">
                 <span className="text-nexus-ink/10 font-black text-[7px] tracking-[3px] uppercase block mb-2 group-hover:text-nexus-ink-muted opacity-50 transition-colors">Integrity_Pulse</span>
                 <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-sm bg-nexus-accent-blue animate-pulse shadow-[0_0_10px_#00D1FF]" />
                    <span className="text-nexus-accent-blue font-black text-[9px] font-bold tracking-[2px] uppercase">VERIFIED_CONSENSUS::STATE_SYNC</span>
                 </div>
              </div>
              <ShieldCheck size={20} className="text-nexus-accent-blue opacity-20 group-hover:opacity-60 transition-opacity" strokeWidth={1} />
           </div>
        </section>

        {/* Governance Guidelines (Admin Only) */}
        <section className="space-y-6">
           <div className="flex items-center space-x-3 mb-6">
              <Settings size={10} className="text-nexus-accent-gold/40" />
              <span className="text-nexus-ink-muted opacity-50 font-black text-[7px] uppercase tracking-[5px]">Channel_Governance_Core</span>
           </div>
           
           <div className="space-y-3">
              <button 
                onClick={() => togglePolicy('prohibitFriending')}
                className={`w-full flex items-center justify-between p-5 bg-nexus-surface border rounded-sm transition-all group ${policies.prohibitFriending ? 'border-nexus-accent-gold/40' : 'border-nexus-border'}`}
              >
                 <div className="flex items-center space-x-4">
                    <UserX size={14} className={policies.prohibitFriending ? 'text-nexus-accent-gold' : 'text-nexus-ink-muted opacity-30'} />
                    <div className="flex flex-col text-left">
                       <span className="text-nexus-ink font-bold text-[10px] tracking-widest uppercase">Restrict_Inter_Peer_Friending</span>
                       <span className="text-nexus-ink-muted opacity-40 text-[7px] uppercase mt-1">Block_Node_Authorization_Requests</span>
                    </div>
                 </div>
                 <div className={`w-10 h-5 rounded-full border border-nexus-border relative transition-all ${policies.prohibitFriending ? 'bg-nexus-accent-gold/20 border-nexus-accent-gold/40' : 'bg-nexus-bg'}`}>
                    <motion.div 
                      animate={{ x: policies.prohibitFriending ? 20 : 0 }}
                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full ${policies.prohibitFriending ? 'bg-nexus-accent-gold' : 'bg-nexus-ink-muted opacity-30'}`}
                    />
                 </div>
              </button>

              <button 
                onClick={() => togglePolicy('prohibitGreetings')}
                className={`w-full flex items-center justify-between p-5 bg-nexus-surface border rounded-sm transition-all group ${policies.prohibitGreetings ? 'border-nexus-accent-gold/40' : 'border-nexus-border'}`}
              >
                 <div className="flex items-center space-x-4">
                    <MessageSquareOff size={14} className={policies.prohibitGreetings ? 'text-nexus-accent-gold' : 'text-nexus-ink-muted opacity-30'} />
                    <div className="flex flex-col text-left">
                       <span className="text-nexus-ink font-bold text-[10px] tracking-widest uppercase">Mute_Inter_Peer_Greetings</span>
                       <span className="text-nexus-ink-muted opacity-40 text-[7px] uppercase mt-1">Prohibit_Direct_Tunnel_Init</span>
                    </div>
                 </div>
                 <div className={`w-10 h-5 rounded-full border border-nexus-border relative transition-all ${policies.prohibitGreetings ? 'bg-nexus-accent-gold/20 border-nexus-accent-gold/40' : 'bg-nexus-bg'}`}>
                    <motion.div 
                      animate={{ x: policies.prohibitGreetings ? 20 : 0 }}
                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full ${policies.prohibitGreetings ? 'bg-nexus-accent-gold' : 'bg-nexus-ink-muted opacity-30'}`}
                    />
                 </div>
              </button>
           </div>
        </section>

        {/* Identity Section: Operators */}
        <section className="space-y-6">
           <div className="flex items-center justify-between border-b border-nexus-border pb-4">
              <div className="flex items-center space-x-3">
                 <Cpu size={12} className={isIsolated ? 'text-nexus-ink/10' : 'text-nexus-accent-gold/40'} />
                 <span className="text-nexus-ink-muted opacity-50 font-black text-[7px] tracking-[5px] uppercase">
                    {isIsolated ? 'Anonymized_MPC_Relays' : 'Genesis_Key_Holders'}
                 </span>
              </div>
              <span className="text-nexus-ink/10 text-[9px] font-bold tracking-[1px]">{admins.length} PRIMES</span>
           </div>
           
           <div className="space-y-4">
             {admins.map(m => (
               <div key={m.did} className="flex items-center justify-between p-6 bg-black border border-nexus-border rounded-sm hover:border-nexus-accent-gold/20 transition-all relative group">
                  <div className="flex items-center space-x-5">
                     <div className="w-10 h-10 bg-nexus-surface border border-nexus-border flex items-center justify-center rounded-sm">
                        <Terminal size={14} className="text-nexus-ink-muted opacity-50 group-hover:text-nexus-accent-gold/60 transition-colors" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-nexus-ink font-bold text-[11px] tracking-widest">
                           {isIsolated ? `SHADOW_NODE::${m.did.slice(-8).toUpperCase()}` : m.did.slice(0, 8) + "..." + m.did.slice(-8)}
                        </span>
                        <span className="text-nexus-ink-muted opacity-50 font-black text-[7px] tracking-[2px] uppercase mt-1">
                           TIER_1_COORD :: ROLE_GENESIS
                        </span>
                     </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!isIsolated && admins.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRoleChange(m.did, 'NODE'); }}
                        className="p-2 text-[#EF4444] opacity-0 group-hover:opacity-40 hover:opacity-100 transition-all hover:scale-110"
                        title="Demote to Node"
                      >
                        <ShieldMinus size={14} />
                      </button>
                    )}
                    <ShieldCheck size={16} className={isIsolated ? 'text-nexus-ink/10' : 'text-nexus-accent-gold opacity-30 group-hover:opacity-100 transition-opacity'} strokeWidth={1.5} />
                  </div>
               </div>
             ))}
           </div>
        </section>

        {/* Identity Section: Verified Peers */}
        <section className="space-y-6">
           <div className="flex items-center justify-between border-b border-nexus-border pb-4">
              <div className="flex items-center space-x-3">
                 <Users size={12} className="text-nexus-ink/10" />
                 <span className="text-nexus-ink-muted opacity-50 font-black text-[7px] tracking-[5px] uppercase">
                    Verified_Mesh_Peers
                 </span>
              </div>
              <span className="text-nexus-ink/10 text-[9px] font-bold tracking-[1px]">{nodes.length} SHARDS</span>
           </div>
           
           <div className="space-y-4">
             {nodes.map(m => (
               <button 
                 key={m.did} 
                 className={`w-full flex items-center justify-between p-6 bg-black border border-nexus-border rounded-sm transition-all text-left outline-none relative overflow-hidden group ${isIsolated ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-white/20 hover:bg-nexus-surface'}`}
                 onClick={isIsolated ? showDeniedToast : undefined}
               >
                  <div className="flex items-center space-x-5 flex-1 min-w-0 pr-4">
                     <div className="w-10 h-10 bg-nexus-surface border border-nexus-border flex items-center justify-center rounded-sm group-hover:bg-black transition-colors">
                        <Command size={14} className="text-nexus-ink/10 group-hover:text-nexus-ink/30 transition-colors" />
                     </div>
                     <div className="flex flex-col min-w-0">
                        <span className="text-nexus-ink/60 font-bold text-[11px] tracking-widest truncate">
                           {isIsolated ? `HIDDEN_REPLICA::${m.did.slice(-6).toUpperCase()}` : m.did.slice(0, 16) + "..."}
                        </span>
                        <span className="text-nexus-ink/10 font-black text-[7px] tracking-[1.5px] uppercase mt-1 group-hover:text-nexus-ink/30 transition-colors">
                           {isIsolated ? 'ISOLATION_PROTOCOL_LOCK' : 'DR_Ratchet::Verified_Node'}
                        </span>
                     </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {!isIsolated && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRoleChange(m.did, 'ADMIN'); }}
                        className="px-2 py-1 border border-nexus-accent-gold/20 text-nexus-accent-gold font-black text-[7px] uppercase tracking-[1px] opacity-0 group-hover:opacity-100 transition-all hover:bg-nexus-accent-gold/10"
                      >
                         Promote_Prime
                      </button>
                    )}
                    {!isIsolated && (
                      <div 
                        onClick={(e) => { e.stopPropagation(); /* Potential eviction logic */ showToast('COMMENCING_PEER_EVICTION'); }}
                      >
                        <UserMinus size={16} className="text-[#EF4444] opacity-0 group-hover:opacity-40 transition-all hover:scale-110" />
                      </div>
                    )}
                  </div>
                  {/* Subtle hover line */}
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-white opacity-10 group-hover:w-full transition-all duration-500" />
               </button>
             ))}
           </div>
        </section>
      </div>

      <div className="shrink-0 p-10 bg-nexus-bg border-t border-nexus-border">
        {!isIsolated ? (
          <button className="w-full h-16 bg-nexus-surface border border-nexus-border flex items-center justify-center space-x-5 hover:bg-nexus-border hover:border-nexus-accent-gold/30 transition-all cursor-pointer rounded-sm group overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-nexus-accent-gold/[0.02] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="w-8 h-8 rounded-full bg-nexus-accent-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
               <UserPlus size={16} className="text-nexus-accent-gold" />
            </div>
            <span className="text-nexus-accent-gold font-black text-[10px] uppercase font-bold tracking-[6px] group-hover:tracking-[8px] transition-all">BROADCAST_TOKEN</span>
          </button>
        ) : (
          <div className="w-full py-6 flex items-center justify-center space-x-4 opacity-20 border border-dashed border-nexus-border rounded-sm">
             <AlertCircle size={14} className="text-nexus-ink" />
             <span className="text-nexus-ink font-black text-[8px] uppercase tracking-[4px]">Genesis_Isolation_Mode::Immutable</span>
          </div>
        )}
      </div>
    </div>
  );
};
