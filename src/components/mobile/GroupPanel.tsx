import React, { useState } from 'react';
import { 
  X, ChevronRight, UserPlus, UserMinus, ShieldAlert, Users, Plus, Shield
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

  const showDeniedToast = () => showToast("Access Denied in Isolated Mode");

  const togglePolicy = (policy: keyof typeof policies) => {
    if (isIsolated) {
      showDeniedToast();
      return;
    }
    const newVal = !policies[policy];
    setPolicies(prev => ({ ...prev, [policy]: newVal }));
    showToast(`${newVal ? 'Enabled' : 'Disabled'} policy`);
  };

  const handleRoleChange = (did: string, nextRole: 'ADMIN' | 'NODE') => {
    if (isIsolated) {
       showDeniedToast();
       return;
    }
    setLocalMembers(prev => prev.map(m => m.did === did ? { ...m, role: nextRole } : m));
    showToast(`Updated role for ${did.slice(-4)}`);
  };

  const admins = localMembers.filter(m => m.role === 'ADMIN');
  const nodes = localMembers.filter(m => m.role === 'NODE');

  return (
    <div className="absolute inset-0 bg-[#F2F2F7] dark:bg-black z-[500] flex flex-col animate-in slide-in-from-bottom-full duration-300 font-sans shadow-2xl rounded-t-xl overflow-hidden mt-12 sm:mt-0 sm:rounded-none">
      {/* iOS Modal Handle (optional, standard modal indicator) */}
      <div className="flex justify-center pt-2 sm:hidden">
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-black/80 dark:bg-white/80 backdrop-blur-md rounded-full flex items-center shadow-lg"
          >
            <span className="text-white dark:text-black font-medium text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Header */}
      <div className="flex items-center justify-between px-4 h-12 relative z-10 shrink-0 border-b border-gray-200 dark:border-white/10 bg-[#F2F2F7] dark:bg-black">
        <button 
          onClick={onClose}
          className="text-blue-500 font-semibold text-[17px] active:opacity-50 transition-opacity"
        >
          Close
        </button>
        <span className="font-semibold text-[17px] text-black dark:text-white absolute left-1/2 -translate-x-1/2">
          Group Info
        </span>
        <div className="w-12" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        
        {/* Header Profile Section */}
        <div className="flex flex-col items-center pb-2">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3 text-2xl font-semibold text-gray-500 dark:text-gray-400">
                {groupName.substring(0, 1)}
            </div>
            <h2 className="text-black dark:text-white text-2xl font-bold">{groupName}</h2>
            <span className="text-gray-500 text-sm mt-1">{localMembers.length} Members</span>
        </div>

        {/* Group Functions */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden">
            <button className="w-full px-4 py-3 bg-white dark:bg-[#1C1C1E] flex items-center border-b border-gray-200 dark:border-white/10 active:opacity-50 transition-opacity">
                <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center mr-3">
                    <Plus size={16} className="text-white" />
                </div>
                <span className="text-black dark:text-white text-[17px] flex-1 text-left">Add Member</span>
                <ChevronRight size={20} className="text-gray-400 font-light" />
            </button>
            <button className="w-full px-4 py-3 bg-white dark:bg-[#1C1C1E] flex items-center active:opacity-50 transition-opacity">
                <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center mr-3">
                    <Shield size={16} className="text-white" />
                </div>
                <span className="text-black dark:text-white text-[17px] flex-1 text-left">Share Group Link</span>
                <ChevronRight size={20} className="text-gray-400 font-light" />
            </button>
        </div>

        {/* Settings Group */}
        <div className="space-y-2">
            <span className="text-gray-500 text-[13px] uppercase ml-4">Group Management</span>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden">
                <div className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
                    <span className="text-black dark:text-white text-[17px]">Restrict Friending</span>
                    <div className="flex bg-[#E5E5EA] dark:bg-[#2C2C2E] p-0.5 rounded-[8px] w-[150px]">
                        <button 
                            onClick={() => { if(!isIsolated) setPolicies(p => ({...p, prohibitFriending: false})) }}
                            className={`flex-[0.5] text-[13px] font-medium py-[5px] rounded-[6px] transition-all border-none cursor-pointer ${!policies.prohibitFriending ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'bg-transparent text-[#8E8E93] hover:text-black dark:hover:text-white'}`}
                        >
                            Allowed
                        </button>
                        <button 
                            onClick={() => { if(!isIsolated) setPolicies(p => ({...p, prohibitFriending: true})) }}
                            className={`flex-[0.5] text-[13px] font-medium py-[5px] rounded-[6px] transition-all border-none cursor-pointer ${policies.prohibitFriending ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'bg-transparent text-[#8E8E93] hover:text-black dark:hover:text-white'}`}
                        >
                            Restricted
                        </button>
                    </div>
                </div>
                <div className="w-full px-4 py-3 flex items-center justify-between">
                    <span className="text-black dark:text-white text-[17px]">Mute Greetings</span>
                    <div className="flex bg-[#E5E5EA] dark:bg-[#2C2C2E] p-0.5 rounded-[8px] w-[150px]">
                        <button 
                            onClick={() => { if(!isIsolated) setPolicies(p => ({...p, prohibitGreetings: false})) }}
                            className={`flex-[0.5] text-[13px] font-medium py-[5px] rounded-[6px] transition-all border-none cursor-pointer ${!policies.prohibitGreetings ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'bg-transparent text-[#8E8E93] hover:text-black dark:hover:text-white'}`}
                        >
                            Allowed
                        </button>
                        <button 
                            onClick={() => { if(!isIsolated) setPolicies(p => ({...p, prohibitGreetings: true})) }}
                            className={`flex-[0.5] text-[13px] font-medium py-[5px] rounded-[6px] transition-all border-none cursor-pointer ${policies.prohibitGreetings ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'bg-transparent text-[#8E8E93] hover:text-black dark:hover:text-white'}`}
                        >
                            Muted
                        </button>
                    </div>
                </div>
            </div>
            {isIsolated && <p className="text-gray-500 text-xs mx-4 text-center">Settings are locked in isolated environment.</p>}
        </div>

        {/* Member List */}
        <div className="space-y-2 pb-8">
           <span className="text-gray-500 text-[13px] uppercase ml-4">Members</span>
           <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden">
               {localMembers.map((m, idx) => (
                   <div 
                      key={m.did}
                      className={`flex items-center px-4 py-3 bg-white dark:bg-[#1C1C1E] ${idx !== localMembers.length - 1 ? 'border-b border-gray-200 dark:border-white/10' : ''}`}
                   >
                     <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 shrink-0">
                         <span className="text-gray-500 dark:text-gray-300 font-semibold text-sm">
                             {m.did.slice(m.did.length - 2).toUpperCase()}
                         </span>
                     </div>
                     <div className="flex-1 min-w-0 pr-2">
                        <p className="text-black dark:text-white text-[17px] truncate">
                            {isIsolated ? `Hidden User` : m.did.slice(0, 16) + "..."}
                        </p>
                        <p className="text-gray-500 text-[13px]">
                            {m.role === 'ADMIN' ? 'Owner' : 'Participant'}
                        </p>
                     </div>
                     {!isIsolated && (
                         <button 
                             onClick={(e) => { e.stopPropagation(); handleRoleChange(m.did, m.role === 'ADMIN' ? 'NODE' : 'ADMIN'); }}
                             className="text-blue-500 text-[15px] hover:opacity-70 active:opacity-50 transition-opacity"
                         >
                             {m.role === 'ADMIN' ? 'Demote' : 'Promote'}
                         </button>
                     )}
                   </div>
               ))}
           </div>
        </div>

      </div>
    </div>
  );
};
