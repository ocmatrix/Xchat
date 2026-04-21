import React, { useState } from 'react';
import { 
  ChevronLeft, Plus, Search, BellOff, Pin, Bell, Image as ImageIcon, Trash2, AlertCircle, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrivateChatSettingsProps {
  onClose: () => void;
  targetName: string;
}

export const PrivateChatSettings = ({ onClose, targetName }: PrivateChatSettingsProps) => {
  const [policies, setPolicies] = useState({
    muteNotifications: false,
    pinChat: false,
    reminders: false
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const togglePolicy = (policy: keyof typeof policies) => {
    setPolicies(prev => ({ ...prev, [policy]: !prev[policy] }));
  };

  return (
    <div className="absolute inset-0 bg-[#F2F2F7] dark:bg-black z-[500] flex flex-col animate-in slide-in-from-right duration-300 font-sans">
      {/* iOS Header */}
      <div className="flex items-center justify-between px-3 h-12 bg-white dark:bg-[#1C1C1E] border-b border-black/5 dark:border-white/5 relative z-10 shrink-0">
        <button 
          onClick={onClose} 
          className="flex items-center -space-x-1 text-[#007AFF] hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none outline-none z-20"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="absolute inset-x-0 flex justify-center z-10 pointer-events-none">
          <span className="font-semibold text-[17px] text-black dark:text-white">
            Chat Info
          </span>
        </div>
        <div className="w-[80px]" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F2F2F7] dark:bg-black space-y-2 pb-12">
        {/* Section 1: Members (Like WeChat, shows contact + add button) */}
        <div className="bg-white dark:bg-[#1C1C1E] px-4 py-4 mb-2 flex items-start space-x-5">
            <div className="flex flex-col items-center">
                <div className="w-[52px] h-[52px] bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-md overflow-hidden flex items-center justify-center border border-black/5 dark:border-white/5 mb-1.5">
                    <span className="text-[#8E8E93] text-[20px] font-medium">{targetName.charAt(0)}</span>
                </div>
                <span className="text-black dark:text-white text-[12px] truncate max-w-[60px] text-center">{targetName}</span>
            </div>
            
            <div className="flex flex-col items-center">
                <button className="w-[52px] h-[52px] bg-white dark:bg-[#1C1C1E] rounded-md flex items-center justify-center border-2 border-dashed border-[#C7C7CC] dark:border-[#3A3A3C] active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E] transition-colors mb-1.5 focus:outline-none">
                    <Plus size={24} className="text-[#8E8E93]" strokeWidth={1.5} />
                </button>
            </div>
        </div>

        {/* Section 2 */}
        <div className="bg-white dark:bg-[#1C1C1E]">
            <div className="flex flex-col border-b border-black/5 dark:border-white/5">
                <button 
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="w-full pl-4 pr-4 py-3 flex items-center bg-transparent active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E] transition-colors border-none"
                >
                     <span className="text-black dark:text-white text-[16px] flex-1 text-left font-normal">Search Chat History</span>
                     <ChevronRight size={20} className={`text-[#C7C7CC] dark:text-[#5A5A5E] transition-transform ${isSearchExpanded ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-[white] dark:bg-[#1C1C1E]"
                    >
                      <div className="px-4 pb-4 pt-2 space-y-4 border-t border-black/5 dark:border-white/5 mx-4 mt-2">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                          <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] border-none rounded-[10px] py-2 pl-9 pr-3 text-[15px] focus:outline-none focus:bg-[#E0E0E5] dark:focus:bg-[#3A3A3C] transition-colors text-black dark:text-white"
                          />
                        </div>
                        <div className="flex flex-col space-y-3">
                          <span className="text-[13px] text-[#8E8E93] font-medium tracking-wide">Advance Filters</span>
                          
                          <div className="flex items-center space-x-2">
                             <span className="text-[15px] text-black dark:text-white w-[70px]">Sender:</span>
                             <select className="flex-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] border-none rounded-lg py-[7px] px-3 text-[15px] text-black dark:text-white focus:outline-none appearance-none">
                               <option value="all">Anyone</option>
                               <option value="me">Me</option>
                               <option value="them">{targetName}</option>
                             </select>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                             <span className="text-[15px] text-black dark:text-white w-[70px]">From:</span>
                             <input type="date" className="flex-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] border-none rounded-lg py-1.5 px-3 text-[15px] text-black dark:text-white focus:outline-none" />
                          </div>

                          <div className="flex items-center space-x-2">
                             <span className="text-[15px] text-black dark:text-white w-[70px]">To:</span>
                             <input type="date" className="flex-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] border-none rounded-lg py-1.5 px-3 text-[15px] text-black dark:text-white focus:outline-none" />
                          </div>
                        </div>
                        
                        <button className="w-full bg-[#007AFF] text-white rounded-[10px] py-[10px] font-semibold text-[16px] active:opacity-70 transition-opacity border-none cursor-pointer mt-2">
                          Search
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
        </div>

        {/* Section 3: Toggles */}
        <div className="bg-white dark:bg-[#1C1C1E] mt-2">
            <div className="w-full pl-4 pr-4 py-2.5 flex items-center justify-between border-b border-black/5 dark:border-white/5">
                <span className="text-black dark:text-white text-[16px] font-normal">Mute Notifications</span>
                <button 
                    onClick={() => togglePolicy('muteNotifications')}
                    className={`w-[51px] h-[31px] rounded-full transition-colors relative flex items-center px-[2px] ${policies.muteNotifications ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
                >
                    <motion.div 
                        animate={{ x: policies.muteNotifications ? 20 : 0 }}
                        className="w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
                    />
                </button>
            </div>
            <div className="w-full pl-4 pr-4 py-2.5 flex items-center justify-between border-b border-black/5 dark:border-white/5">
                <span className="text-black dark:text-white text-[16px] font-normal">Pin Chat</span>
                <button 
                    onClick={() => togglePolicy('pinChat')}
                    className={`w-[51px] h-[31px] rounded-full transition-colors relative flex items-center px-[2px] ${policies.pinChat ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
                >
                    <motion.div 
                        animate={{ x: policies.pinChat ? 20 : 0 }}
                        className="w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
                    />
                </button>
            </div>
            <div className="w-full pl-4 pr-4 py-2.5 flex items-center justify-between">
                <span className="text-black dark:text-white text-[16px] font-normal">Reminders</span>
                <button 
                    onClick={() => togglePolicy('reminders')}
                    className={`w-[51px] h-[31px] rounded-full transition-colors relative flex items-center px-[2px] ${policies.reminders ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
                >
                    <motion.div 
                        animate={{ x: policies.reminders ? 20 : 0 }}
                        className="w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
                    />
                </button>
            </div>
        </div>

        {/* Section 4 */}
        <div className="bg-white dark:bg-[#1C1C1E] mt-2">
            <button className="w-full pl-4 pr-4 py-3 flex items-center bg-transparent active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E] transition-colors border-none">
                 <span className="text-black dark:text-white text-[16px] flex-1 text-left font-normal">Set Chat Background</span>
                 <ChevronRight size={20} className="text-[#C7C7CC] dark:text-[#5A5A5E]" />
            </button>
        </div>

        {/* Section 5 */}
        <div className="bg-white dark:bg-[#1C1C1E] mt-2">
            <button className="w-full pl-4 pr-4 py-3 flex items-center bg-transparent active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E] transition-colors border-none">
                 <span className="text-black dark:text-white text-[16px] flex-1 text-left font-normal">Clear Chat History</span>
                 <ChevronRight size={20} className="text-[#C7C7CC] dark:text-[#5A5A5E]" />
            </button>
        </div>

        {/* Section 6 */}
        <div className="bg-white dark:bg-[#1C1C1E] mt-2 mb-8">
            <button className="w-full pl-4 pr-4 py-3 flex items-center bg-transparent active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E] transition-colors border-none">
                 <span className="text-black dark:text-white text-[16px] flex-1 text-left font-normal">Report</span>
                 <ChevronRight size={20} className="text-[#C7C7CC] dark:text-[#5A5A5E]" />
            </button>
        </div>
      </div>
    </div>
  );
};
