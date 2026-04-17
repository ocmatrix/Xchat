import React, { useState } from 'react';
import { Copy, Shield, Clock, ExternalLink, Lock, EyeOff, Fingerprint, Trash2, ChevronRight, Activity, ShieldCheck, Square } from 'lucide-react';
import { IdentityCard } from './IdentityCard';
import { motion, AnimatePresence } from 'motion/react';

export const ProfileSettings = ({ did, devices }: { did: string, devices: any[] }) => {
  const [alias, setAlias] = useState("CYBER_NOMAD");
  const [showIdentityCard, setShowIdentityCard] = useState(false);
  const [securityStates, setSecurityStates] = useState({
    biometrics: true,
    privacy: false,
  });
  const [password, setPassword] = useState("********");

  const toggleSwitch = (key: keyof typeof securityStates) => {
    setSecurityStates(prev => ({ ...prev, [key]: !prev[key] }));
    if ('vibrate' in navigator) navigator.vibrate(15);
  };

  const calculateStrength = (pass: string) => {
    if (pass.length < 4) return 20;
    if (pass.length < 8) return 50;
    return 90;
  };

  return (
    <div className="flex-1 bg-nexus-bg overflow-y-auto scrollbar-hide h-full flex flex-col relative">
      
      <AnimatePresence>
        {showIdentityCard && (
           <motion.div 
             initial={{ opacity: 0, x: 393 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 393 }}
             className="absolute inset-0 bg-nexus-bg z-[500] flex flex-col pt-12"
           >
              <div className="flex items-center px-8 mb-8">
                 <button onClick={() => setShowIdentityCard(false)} className="bg-transparent border-none text-nexus-ink-muted font-mono text-xs cursor-pointer">
                    {'< BACK'}
                 </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center -translate-y-12">
                 <IdentityCard did={did} />
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      <div className="px-8 pt-10 pb-20 space-y-12">
        
        {/* Module A: Security & Biometrics */}
        <div className="space-y-6">
          <h2 className="text-nexus-ink-muted font-mono text-[10px] uppercase tracking-[4px] opacity-40">Security_Protocol</h2>
          
          <div className="space-y-8">
            {/* Vault Password */}
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight">Vault_Access_Key</span>
                  <button className="text-nexus-accent-gold font-mono text-[8px] uppercase tracking-[2px] bg-transparent border-none cursor-pointer">Modify</button>
               </div>
               <div className="bg-nexus-surface p-4 rounded-sm border border-nexus-border">
                  <div className="flex items-center space-x-3 mb-3">
                     <Lock size={12} className="text-nexus-ink-muted opacity-50" />
                     <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-transparent border-none text-nexus-ink font-mono text-xs flex-1 outline-none"
                        placeholder="ENTER_NEW_KEY..."
                     />
                  </div>
                  <div className="h-[2px] w-full bg-nexus-border rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateStrength(password)}%` }}
                        className={`h-full ${calculateStrength(password) > 80 ? 'bg-nexus-accent-blue' : calculateStrength(password) > 40 ? 'bg-nexus-accent-gold' : 'bg-[#EF4444]'}`}
                     />
                  </div>
               </div>
            </div>

            {/* Biometric Toggle */}
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight">Biometric_Relay</span>
                  <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1px] mt-1 uppercase">Local_TEE_Only_Authentication</span>
               </div>
               <Switch active={securityStates.biometrics} onClick={() => toggleSwitch('biometrics')} />
            </div>

            {/* Screen Privacy */}
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight">App_Switcher_Masking</span>
                  <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1px] mt-1 uppercase">Obfuscate_Node_Preview</span>
               </div>
               <Switch active={securityStates.privacy} onClick={() => toggleSwitch('privacy')} />
            </div>
          </div>
        </div>

        {/* Module B: Node Profile */}
        <div className="space-y-6">
          <h2 className="text-nexus-ink-muted font-mono text-[10px] uppercase tracking-[4px] opacity-40">Identity_Profile</h2>
          
          <div className="space-y-8">
            {/* Alias */}
            <div className="space-y-3">
               <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight">Identity_Alias</span>
               <input 
                  type="text" 
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full bg-nexus-surface border border-nexus-border py-3 px-4 text-nexus-ink font-sans text-sm focus:border-nexus-accent-gold/50 transition-all outline-none rounded-sm"
               />
            </div>

            {/* Geometric Avatar */}
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight">Abstract_Genesis_Avatar</span>
                  <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1px] mt-1 uppercase">Deterministic_Geometric_Map</span>
               </div>
               <div className="w-12 h-12 bg-nexus-surface border border-nexus-border flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-nexus-accent-gold rotate-45" />
               </div>
            </div>

            {/* Display DID */}
            <button 
              onClick={() => setShowIdentityCard(true)}
              className="w-full bg-nexus-card border border-nexus-border p-4 rounded-sm flex items-center justify-between cursor-pointer hover:border-nexus-accent-gold/40 transition-colors"
            >
               <div className="flex flex-col text-left">
                  <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[2px] uppercase mb-1">Decentralized_Identifier</span>
                  <span className="text-nexus-ink font-mono text-[10px] tracking-widest">{did.slice(0, 16)}...{did.slice(-4)}</span>
               </div>
               <ExternalLink size={14} className="text-nexus-ink-muted" />
            </button>
          </div>
        </div>

        {/* Device Auditing (Existing Feature Maintenance) */}
        <div className="space-y-6">
           <h2 className="text-nexus-ink-muted font-mono text-[10px] uppercase tracking-[4px] opacity-40">Authorized_Nodes</h2>
           <div className="space-y-4">
              {devices.map(dev => (
                <div key={dev.id} className="bg-nexus-card border border-nexus-border p-4 flex items-center justify-between rounded-sm">
                   <div className="flex flex-col">
                      <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight">{dev.name}</span>
                      <span className="text-nexus-ink-muted font-mono text-[7px] mt-1">{dev.ip} · {dev.lastSeen}</span>
                   </div>
                   {dev.isCurrent ? <ShieldCheck size={14} className="text-nexus-accent-gold" /> : <button className="text-[#EF4444] font-mono text-[7px] uppercase border-none bg-transparent cursor-pointer">REVOKE</button>}
                </div>
              ))}
           </div>
        </div>

        {/* Module C: System Actions */}
        <div className="pt-8 space-y-6">
           <button 
             className="w-full h-14 bg-transparent border border-[#EF4444]/20 flex items-center justify-center space-x-4 hover:bg-[#EF4444]/5 transition-all cursor-pointer rounded-sm group"
             onClick={() => {
                // Secure erasure simulation (No blocking UI)
                console.log("VAULT_ERASURE::INITIATED");
                console.log("KERNEL::CACHE_OVERWRITE_SUCCESS_0xFA92B");
             }}
           >
              <Trash2 size={16} className="text-[#EF4444] opacity-40 group-hover:opacity-100" />
              <span className="text-[#EF4444] font-mono text-[9px] uppercase tracking-[4px] opacity-40 group-hover:opacity-100">Wipe_Local_Vault</span>
           </button>
        </div>

      </div>
    </div>
  );
};

function Switch({ active, onClick }: { active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-10 h-5 rounded-full relative transition-all duration-300 border-none cursor-pointer ${active ? 'bg-nexus-accent-blue' : 'bg-nexus-border'}`}
    >
      <motion.div 
        animate={{ x: active ? 22 : 2 }}
        className="w-4 h-4 bg-white rounded-full absolute top-0.5"
      />
    </button>
  );
}
