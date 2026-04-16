import React, { useState } from 'react';
import { X, ShieldCheck, UserMinus, UserPlus, AlertCircle } from 'lucide-react';
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
    setToast("ACCESS DENIED. PEER ISOLATION ACTIVE.");
    setTimeout(() => setToast(null), 2500);
  };

  const admins = members.filter(m => m.role === 'ADMIN');
  const nodes = members.filter(m => m.role === 'NODE');

  return (
    <div className="absolute inset-0 bg-black/98 z-[100] flex flex-col pt-16 animate-in slide-in-from-right duration-300">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 bg-[#2D0A0A] border border-[#EF4444]/30 rounded-sm flex items-center space-x-3 shadow-[0_10px_40px_rgba(239,68,68,0.2)]"
          >
            <AlertCircle size={14} className="text-[#EF4444]" />
            <span className="text-[#EF4444] font-mono text-[9px] tracking-[1px] uppercase whitespace-nowrap">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A]">
        <div className="flex flex-col">
          <span className="text-[#A9A9A9] font-mono text-[9px] uppercase tracking-[3px] mb-1">MLS_GROUP_INTELLIGENCE</span>
          <span className="text-white font-mono text-sm tracking-[2px] uppercase">{groupName}</span>
          {isIsolated && (
            <span className="text-[#EF4444] font-mono text-[7px] tracking-[1px] uppercase">Node_Isolation_Protocol: ACTIVE</span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent cursor-pointer text-[#A9A9A9]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Section: Administrators */}
        <div className="bg-[#0D0D0D] px-6 py-2 border-y border-[#1A1A1A]">
          <span className={`${isIsolated ? 'text-[#A9A9A9]' : 'text-[#D4AF37]'} font-mono text-[9px] tracking-[2px] uppercase`}>
            {isIsolated ? 'Anonymized_Coordinators' : 'Root_Administrators'} ({admins.length})
          </span>
        </div>
        <div className="px-6 mb-6">
          {admins.map(m => (
            <button 
              key={m.did} 
              className="w-full flex items-center justify-between py-4 border-b border-white/5 last:border-none bg-transparent text-left cursor-pointer outline-none"
              onClick={isIsolated ? showDeniedToast : undefined}
            >
              <div className="flex flex-col overflow-hidden">
                <span className="text-white font-mono text-[10px] tracking-tight truncate">
                  {isIsolated ? `[ISOLATED NODE] Node-${m.did.slice(-4)}` : m.did}
                </span>
                <span className="text-[#A9A9A9] font-mono text-[8px] tracking-widest mt-1.5 opacity-60">
                  {isIsolated ? 'RELAY_TRUST: VERIFIED' : 'TRUST_VECTOR: CRYPTO_MAX'}
                </span>
              </div>
              <ShieldCheck size={14} className={isIsolated ? 'text-[#A9A9A9]' : 'text-[#D4AF37]'} />
            </button>
          ))}
        </div>

        {/* Section: Standard Nodes */}
        <div className="bg-[#0D0D0D] px-6 py-2 border-y border-[#1A1A1A]">
          <span className="text-[#A9A9A9] font-mono text-[9px] tracking-[2px] uppercase">
            {isIsolated ? 'Shadow_Replicas' : 'Active_Nodes'} ({nodes.length})
          </span>
        </div>
        <div className="px-6">
          {nodes.map(m => (
            <button 
              key={m.did} 
              className="w-full flex items-center justify-between py-4 border-b border-white/5 last:border-none bg-transparent text-left cursor-pointer outline-none"
              onClick={isIsolated ? showDeniedToast : undefined}
            >
              <div className="flex flex-col overflow-hidden">
                <span className="text-white font-mono text-[10px] tracking-tight opacity-80 truncate">
                  {isIsolated ? `[ISOLATED NODE] Node-${m.did.slice(-4)}` : m.did}
                </span>
                <span className="text-[#A9A9A9] font-mono text-[8px] tracking-widest mt-1.5 opacity-60">STATUS: REPLICA_SYNCED</span>
              </div>
              {!isIsolated && (
                <button className="text-[#EF4444] opacity-30 hover:opacity-100 border-none bg-transparent cursor-pointer p-0 ml-4 shrink-0">
                  <UserMinus size={14} />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>

      {!isIsolated && (
        <div className="p-8 border-t border-[#1A1A1A] bg-[#0A0A0A]">
          <button className="w-full border border-[#D4AF37]/40 py-4 flex items-center justify-center space-x-3 hover:bg-[#D4AF37]/10 transition-colors border-none bg-transparent cursor-pointer rounded-sm">
            <UserPlus size={16} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-mono text-[9px] uppercase tracking-[3px]">Generate Invite_Ticket</span>
          </button>
        </div>
      )}
    </div>
  );
};
