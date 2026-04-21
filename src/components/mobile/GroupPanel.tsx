import React, { useState } from 'react';
import { 
  X, ChevronRight, UserPlus, UserMinus, ShieldAlert, Users, Plus, Shield, Link, Copy, Trash2, Clock, Share2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Member {
  did: string;
  role: 'ADMIN' | 'NODE';
}

interface InviteLink {
  id: string;
  url: string;
  expiresAt: number | null; // null for never
  createdAt: number;
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
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [showInviteCreator, setShowInviteCreator] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState<string>("24H");
  const [policies, setPolicies] = useState({
    prohibitFriending: false,
    prohibitGreetings: false
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const showDeniedToast = () => showToast("Access Denied in Isolated Mode");

  const generateLink = () => {
    if (isIsolated) {
      showDeniedToast();
      return;
    }

    const id = Math.random().toString(36).substring(2, 11);
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const expiryMs = {
      "1H": 3600000,
      "24H": 86400000,
      "7D": 604800000,
      "NEVER": null
    }[selectedExpiry] || 86400000;

    const newLink: InviteLink = {
      id,
      url: `${baseUrl}/join?g=${id}`,
      expiresAt: expiryMs ? Date.now() + expiryMs : null,
      createdAt: Date.now()
    };

    setInviteLinks(prev => [newLink, ...prev]);
    setShowInviteCreator(false);
    showToast("Invite link generated");
  };

  const revokeLink = (id: string) => {
    setInviteLinks(prev => prev.filter(l => l.id !== id));
    showToast("Link revoked");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Link copied to clipboard");
    } catch (err) {
      showToast("Failed to copy link");
    }
  };

  const shareLink = async (link: InviteLink) => {
    const shareData = {
      title: `Join ${groupName}`,
      text: `Join our secure auditorium meeting: ${groupName}`,
      url: link.url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      copyToClipboard(link.url);
    }
  };

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
            <button 
              onClick={() => setShowInviteCreator(!showInviteCreator)}
              className="w-full px-4 py-3 bg-white dark:bg-[#1C1C1E] flex items-center active:opacity-50 transition-opacity"
            >
                <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center mr-3">
                    <Link size={16} className="text-white" />
                </div>
                <span className="text-black dark:text-white text-[17px] flex-1 text-left">Internal Invite Links</span>
                <ChevronRight size={20} className={`text-gray-400 transition-transform ${showInviteCreator ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showInviteCreator && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gray-50 dark:bg-[#2C2C2E] border-t border-gray-200 dark:border-white/5 overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    <div className="flex flex-col space-y-2">
                       <span className="text-gray-500 text-[11px] uppercase ml-1">Set Expiration</span>
                       <div className="flex bg-[#E5E5EA] dark:bg-[#3A3A3C] p-0.5 rounded-[8px]">
                          {["1H", "24H", "7D", "NEVER"].map((t) => (
                            <button 
                              key={t}
                              onClick={() => setSelectedExpiry(t)}
                              className={`flex-1 text-[11px] font-medium py-[5px] rounded-[6px] transition-all border-none cursor-pointer ${selectedExpiry === t ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-sm' : 'bg-transparent text-[#8E8E93]'}`}
                            >
                              {t}
                            </button>
                          ))}
                       </div>
                    </div>

                    <button 
                      onClick={generateLink}
                      className="w-full py-2.5 bg-blue-500 text-white font-semibold rounded-lg text-sm active:scale-[0.98] transition-transform flex items-center justify-center space-x-2 shadow-sm border-none cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Generate Secure Link</span>
                    </button>

                    {inviteLinks.length > 0 && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                        <span className="text-gray-500 text-[11px] uppercase ml-1">Active Links</span>
                        {inviteLinks.map((link) => (
                          <div key={link.id} className="bg-white dark:bg-[#1C1C1E] p-3 rounded-lg border border-gray-200 dark:border-white/5 flex flex-col space-y-2 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-blue-500 truncate mr-2">{link.id}</span>
                              <div className="flex items-center space-x-1 text-[9px] text-gray-500">
                                <Clock size={10} />
                                <span>{link.expiresAt ? `Exp: ${new Date(link.expiresAt).toLocaleDateString()}` : 'Indefinite'}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => copyToClipboard(link.url)}
                                className="flex-1 py-1.5 bg-gray-100 dark:bg-[#2C2C2E] text-black dark:text-white text-[11px] rounded flex items-center justify-center space-x-1 hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-colors border-none cursor-pointer"
                              >
                                <Copy size={12} />
                                <span>Copy</span>
                              </button>
                              <button 
                                onClick={() => shareLink(link)}
                                className="flex-1 py-1.5 bg-gray-100 dark:bg-[#2C2C2E] text-black dark:text-white text-[11px] rounded flex items-center justify-center space-x-1 hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-colors border-none cursor-pointer"
                              >
                                <Share2 size={12} />
                                <span>Share</span>
                              </button>
                              <button 
                                onClick={() => revokeLink(link.id)}
                                className="w-8 h-7 bg-red-50 dark:bg-red-900/20 text-red-500 rounded flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border-none cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
