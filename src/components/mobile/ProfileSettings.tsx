import React, { useState } from 'react';
import { Copy, Shield, Clock, ExternalLink, Lock, EyeOff, Fingerprint, Trash2, ChevronRight, Activity, ShieldCheck, Square, RefreshCw } from 'lucide-react';
import { IdentityCard } from './IdentityCard';
import { motion, AnimatePresence } from 'motion/react';

export const ProfileSettings = ({ did, devices }: { did: string, devices: any[] }) => {
  const [alias, setAlias] = useState("CYBER_NOMAD");
  const [bio, setBio] = useState("ENCRYPTED HUMAN ENTITY // MESH_OPERATOR_01 // VOID_RUNNER");
  const [avatarSeed, setAvatarSeed] = useState(did);
  const [showIdentityCard, setShowIdentityCard] = useState(false);
  const [securityStates, setSecurityStates] = useState({
    biometrics: true,
    privacy: false,
  });
  const [password, setPassword] = useState("********");
  const [powerProfile, setPowerProfile] = useState<'PERFORMANCE' | 'BALANCE' | 'ECO'>('BALANCE');
  const [isMining, setIsMining] = useState(true);

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
             className="absolute inset-0 bg-nexus-bg z-[500] flex flex-col pt-2"
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

      <div className="px-8 pt-2 pb-20 space-y-12">
        {/* Module 0: Network Vitals Dashboard */}
        <div className="space-y-6">
           <h2 className="text-nexus-ink-muted font-mono text-[10px] uppercase tracking-[4px] opacity-40">Network_Vital_Signs</h2>
           <div className="bg-nexus-surface border border-nexus-border p-6 rounded-sm space-y-6">
              <div className="flex items-center justify-between">
                 <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                       <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="1" className="text-nexus-border" />
                       <motion.circle 
                          initial={{ strokeDasharray: "0 264" }}
                          animate={{ strokeDasharray: "220 264" }}
                          cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-nexus-accent-gold" 
                       />
                    </svg>
                    <div className="flex flex-col items-center">
                       <span className="text-nexus-ink font-mono text-xl font-bold">98%</span>
                       <span className="text-nexus-ink-muted font-mono text-[6px] tracking-[2px] uppercase">Integrity</span>
                    </div>
                 </div>
                 <div className="flex-1 ml-8 space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="text-nexus-ink-muted font-mono text-[8px] uppercase tracking-[1px]">Inbound_Relay</span>
                       <span className="text-nexus-ink font-mono text-[10px]">1.2 MB/s</span>
                    </div>
                    <div className="h-[1px] w-full bg-nexus-border" />
                    <div className="flex justify-between items-end">
                       <span className="text-nexus-ink-muted font-mono text-[8px] uppercase tracking-[1px]">Outbound_Diff</span>
                       <span className="text-nexus-ink font-mono text-[10px]">480 KB/s</span>
                    </div>
                    <div className="h-[1px] w-full bg-nexus-border" />
                    <div className="flex justify-between items-end">
                       <span className="text-nexus-ink-muted font-mono text-[8px] uppercase tracking-[1px]">Protocol_Lag</span>
                       <span className="text-nexus-ink font-mono text-[10px] text-nexus-accent-blue">14ms</span>
                    </div>
                 </div>
              </div>
              
              {/* Mini Trend Line */}
              <div className="h-10 w-full flex items-end space-x-0.5">
                 {[40, 60, 45, 90, 65, 30, 70, 85, 40, 55, 75, 95, 20, 40, 60, 80, 50, 45, 90, 60].map((h, i) => (
                    <motion.div 
                       key={i}
                       initial={{ height: 0 }}
                       animate={{ height: `${h}%` }}
                       transition={{ delay: i * 0.05 }}
                       className="flex-1 bg-nexus-accent-gold/20 hover:bg-nexus-accent-gold transition-colors"
                    />
                 ))}
              </div>
           </div>
        </div>

        {/* Module X: Nexus Minting Subsystem */}
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-nexus-ink-muted font-mono text-[10px] uppercase tracking-[4px] opacity-40">Minting_Subsystem</h2>
              <div className="flex items-center space-x-2">
                 <span className={`w-1.5 h-1.5 rounded-full ${isMining ? 'bg-nexus-accent-gold shadow-[0_0_8px_rgba(196,168,115,0.5)] animate-pulse' : 'bg-nexus-ink-muted'}`} />
                 <span className="text-nexus-ink font-mono text-[8px]">{isMining ? 'ACTIVE' : 'STANDBY'}</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-nexus-surface border border-nexus-border p-4 rounded-sm">
                 <span className="text-nexus-ink-muted font-mono text-[7px] uppercase tracking-[2px]">Daily_Yield</span>
                 <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-nexus-accent-gold font-mono text-lg font-bold">128.4</span>
                    <span className="text-nexus-ink font-mono text-[8px]">$NXS</span>
                 </div>
              </div>
              <div className="bg-nexus-surface border border-nexus-border p-4 rounded-sm">
                 <span className="text-nexus-ink-muted font-mono text-[7px] uppercase tracking-[2px]">Mesh_Reputation</span>
                 <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-nexus-ink font-mono text-lg font-bold">0.92</span>
                    <span className="text-nexus-ink-muted font-mono text-[8px]">TRUST</span>
                 </div>
              </div>
           </div>

           <div className="bg-nexus-card border border-nexus-accent-gold/20 p-5 rounded-sm">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex flex-col">
                    <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight">Power_Efficiency_Profile</span>
                    <span className="text-nexus-ink-muted font-mono text-[7px] mt-1 uppercase tracking-[1px]">Balance_Yield_vs_Battery</span>
                 </div>
                 <button 
                   onClick={() => setIsMining(!isMining)}
                   className={`w-12 h-6 rounded-full relative transition-all duration-300 border-none cursor-pointer ${isMining ? 'bg-nexus-accent-gold' : 'bg-nexus-border'}`}
                 >
                    <motion.div animate={{ x: isMining ? 28 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1" />
                 </button>
              </div>

              <div className="flex space-x-2 p-1 bg-nexus-surface border border-nexus-border rounded-sm">
                 {(['ECO', 'BALANCE', 'PERFORMANCE'] as const).map(p => (
                    <button
                       key={p}
                       onClick={() => setPowerProfile(p)}
                       className={`flex-1 py-2 font-mono text-[8px] tracking-[1px] uppercase transition-all rounded-sm border-none cursor-pointer ${powerProfile === p ? (p === 'PERFORMANCE' ? 'bg-[#EF4444] text-white' : 'bg-nexus-accent-gold text-nexus-bg') : 'bg-transparent text-nexus-ink-muted'}`}
                    >
                       {p}
                    </button>
                 ))}
              </div>
              
              <div className="mt-4 flex items-center space-x-2 text-nexus-ink-muted">
                 <Activity size={10} className={isMining ? 'text-nexus-accent-gold' : ''} />
                 <span className="font-mono text-[7px] uppercase tracking-[1px]">
                    {powerProfile === 'PERFORMANCE' ? 'Warning: High device temperature likely' : powerProfile === 'ECO' ? 'Minimal node contribution Mode' : 'Standard P2P Relay active'}
                 </span>
              </div>
           </div>
        </div>
         
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
               <div className="flex items-center space-x-2">
                 <ShieldCheck size={10} className="text-nexus-accent-gold" />
                 <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight uppercase">Identity_Alias</span>
               </div>
               <input 
                  type="text" 
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full bg-nexus-surface border border-nexus-border py-4 px-5 text-nexus-ink font-sans text-sm focus:border-nexus-accent-gold/50 transition-all outline-none rounded-sm font-medium tracking-tight"
               />
            </div>

            {/* Bio */}
            <div className="space-y-3">
               <div className="flex items-center space-x-2">
                 <Fingerprint size={10} className="text-nexus-accent-blue" />
                 <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight uppercase">Node_Bio_Fragment</span>
               </div>
               <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-nexus-surface border border-nexus-border py-4 px-5 text-nexus-ink font-sans text-[12px] leading-relaxed focus:border-nexus-accent-gold/50 transition-all outline-none rounded-sm resize-none tracking-wide"
                  placeholder="EXPLAIN_YOUR_NODE_PURPOSE_IN_THE_MESH..."
               />
               <p className="text-[8px] font-mono text-nexus-ink-muted uppercase tracking-[1px] opacity-40">
                 * Bio data is encrypted and stored in local TEE
               </p>
            </div>

            {/* Geometric Avatar */}
            <div className="flex items-center justify-between bg-nexus-surface border border-nexus-border p-5 rounded-sm">
               <div className="flex flex-col">
                  <span className="text-nexus-ink font-sans text-xs font-bold tracking-tight">Abstract_Genesis_Avatar</span>
                  <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1px] mt-1 uppercase opacity-60">Deterministic_Geometric_Map</span>
                  <button 
                    onClick={() => setAvatarSeed(Math.random().toString(36))}
                    className="mt-4 text-nexus-accent-gold font-mono text-[8px] tracking-[2px] uppercase border-none bg-transparent cursor-pointer hover:opacity-100 opacity-60 transition-opacity flex items-center space-x- relative"
                  >
                    REFRESH_SEED_SIGNAL
                  </button>
               </div>
               <div className="w-16 h-16 bg-nexus-bg border border-nexus-border flex items-center justify-center rounded-sm relative group overflow-hidden">
                  <GeometricAvatarPreview seed={avatarSeed} />
                  <div className="absolute inset-0 bg-nexus-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               </div>
            </div>

            {/* Display DID */}
            <button 
              onClick={() => setShowIdentityCard(true)}
              className="w-full bg-nexus-card border border-nexus-border p-5 rounded-sm flex items-center justify-between cursor-pointer hover:border-nexus-accent-gold/40 transition-all group"
            >
               <div className="flex flex-col text-left">
                  <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[2px] uppercase mb-1 opacity-60">Decentralized_Identifier</span>
                  <span className="text-nexus-ink font-mono text-[10px] tracking-widest">{did.slice(0, 16)}...{did.slice(-4)}</span>
               </div>
               <ExternalLink size={14} className="text-nexus-ink-muted group-hover:text-nexus-accent-gold transition-colors" />
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

/**
 * Deterministic Geometric Avatar Preview for Profile.
 */
function GeometricAvatarPreview({ seed }: { seed: string }) {
  // Simple hash for deterministic variations
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pattern = hash % 4; // 4 simple geometric patterns

  return (
    <div className="w-8 h-8 relative opacity-80">
      {pattern === 0 && <div className="absolute inset-1 border-2 border-nexus-accent-gold rotate-45" />}
      {pattern === 1 && <div className="absolute inset-2 bg-nexus-accent-gold opacity-60 rounded-sm" />}
      {pattern === 2 && (
          <>
            <div className="absolute inset-x-0 h-[1px] top-1/2 bg-nexus-accent-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
            <div className="absolute inset-y-0 w-[1px] left-1/2 bg-nexus-accent-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
          </>
      )}
      {pattern === 3 && (
          <div className="absolute inset-0 border border-nexus-accent-gold rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-nexus-accent-gold shadow-[0_0_6px_var(--nexus-accent-gold)]" />
          </div>
      )}
    </div>
  );
}
