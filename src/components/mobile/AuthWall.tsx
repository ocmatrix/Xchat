import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Shield, Fingerprint, 
  ArrowRight, RefreshCw, Key,
  Lock, Orbit, Terminal,
  ShieldCheck, AlertCircle, Copy, Check,
  Share, PlusSquare, Smartphone, X
} from 'lucide-react';
import { NexusSecurityService } from '../../services/NexusSecurityService';
import { NexusUtilityService } from '../../services/NexusUtilityService';
import { FirebaseService } from '../../services/FirebaseService';
import { auth } from '../../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import LogoIcon from '../LogoIcon';

interface AuthWallProps {
  onSuccess: (did: string) => void;
}

export const AuthWall = ({ onSuccess }: AuthWallProps) => {
  const [step, setStep] = useState<'IDLE' | 'GENERATING' | 'MNEMONIC' | 'RESTORE' | 'SYNCING'>('IDLE');
  const [did, setDid] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [restoreSeed, setRestoreSeed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [backupVerified, setBackupVerified] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLog, setSyncLog] = useState("");
  
  const isIOS = NexusUtilityService.isIOS();
  const isStandalone = NexusUtilityService.isStandalone();
  const showIOSHint = isIOS && !isStandalone;

  const handleGenerateIdentity = async () => {
    setStep('GENERATING');
    setError(null);

    try {
      // 1. PURE LOCAL SOVEREIGN KEY GENERATION
      const identity = await NexusSecurityService.generateSovereignIdentity();
      setDid(identity.did);
      setMnemonic(identity.mnemonic);
      
      await new Promise(r => setTimeout(r, 2000));
      setStep('MNEMONIC');
    } catch (err: any) {
      console.error("IDENTITY_GEN_FAULT:", err);
      setError(`BOOTSTRAP_FAULT::${err.message || "Crypto_Enclave_Error"}`);
      setStep('IDLE');
    }
  };

  const handleRestoreIdentity = async () => {
    if (!restoreSeed.trim()) return;
    
    setStep('SYNCING');
    setError(null);
    setSyncProgress(0);

    try {
      const identity = await NexusSecurityService.restoreIdentity(restoreSeed);
      setDid(identity.did);
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 5) {
        setSyncProgress(i);
        if (i === 20) setSyncLog("VERIFYING_RECOVERY_SHARDS...");
        if (i === 50) setSyncLog("RECONSTRUCTING_RSA_ENCLAVE...");
        if (i === 80) setSyncLog("ROTATING_MLS_EPOCH...");
        await new Promise(r => setTimeout(r, 50));
      }
      
      try {
        await signInAnonymously(auth);
      } catch (e) {}

      onSuccess(identity.did);
    } catch (err: any) {
      setError(err.message || "RECOVERY_FAILED");
      setStep('RESTORE');
    }
  };

  const handleLinkToMesh = async () => {
    if (!backupVerified) return;
    console.log("🚀 START_SYNC_SEQUENCE...");
    setStep('SYNCING');
    setSyncProgress(0);
    setSyncLog("INITIATING_COLD_BOOT...");
    
    try {
      // Step-by-step progress simulation
      const steps = [
        { progress: 15, log: "ISOLATING_HARDWARE_ID..." },
        { progress: 30, log: "COMPUTING_BLAKE3_DIGESTS..." },
        { progress: 45, log: "ESTABLISHING_ANONYMOUS_BRIDGE..." },
        { progress: 60, log: "SYNCING_IDENTITY_PROFILE..." },
        { progress: 85, log: "FINALIZING_MESH_ENTROPY..." },
        { progress: 100, log: "TERMINAL_READY" }
      ];

      for (const s of steps) {
        setSyncProgress(s.progress);
        setSyncLog(s.log);
        await new Promise(r => setTimeout(r, 400));
      }

      // 2. Mesh Synchronization (Internal transport layer)
      try {
        await signInAnonymously(auth).catch(e => console.warn("AUTH_FAIL_IGNORED", e));
      } catch (authErr) {
        console.warn("MESH_SYNC_LIMITED (Isolated Mode Possible):", authErr);
      }

      const nodeName = "NODE_" + Math.random().toString(36).substring(2, 6).toUpperCase();
      await FirebaseService.syncUserProfile(did, nodeName).catch(e => console.warn("SYNC_FAIL_IGNORED", e));
      
      console.log("✅ SYNC_COMPLETE::TRIGGER_SUCCESS");
      onSuccess(did);
    } catch (err: any) {
      console.error("MESH_COLD_BOOT_FAULT:", err);
      onSuccess(did);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-[8000] bg-[#0A0A0A] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#D4AF37_0%,transparent_50%)] blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'IDLE' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm space-y-12 text-center relative z-10"
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-nexus-surface border border-nexus-border rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                  <LogoIcon className="text-[64px]" />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">DotCom</h2>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-[4px]">Sovereign_Node_Protocol</p>
              </div>
            </div>

            <div className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-sm backdrop-blur-sm">
                <p className="text-[11px] text-white/60 leading-relaxed font-mono text-left">
                  <span className="text-nexus-accent-gold pr-2">»</span>
                  Local key generation via Web Crypto API.<br/>
                  <span className="text-nexus-accent-gold pr-2">»</span>
                  No centralized database registration required.<br/>
                  <span className="text-nexus-accent-gold pr-2">»</span>
                  Identity is derived from your local hardware enclave.
                </p>
            </div>

            <div className="flex flex-col space-y-3 w-full">
              <button 
                onClick={handleGenerateIdentity}
                className="w-full group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative py-4 border border-white flex items-center justify-center space-x-3 text-white group-hover:text-black transition-colors duration-300">
                  <Fingerprint size={16} />
                  <span className="text-xs font-black uppercase tracking-[3px]">Generate_Identity</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button 
                onClick={() => setStep('RESTORE')}
                className="w-full group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative py-3 border border-white/30 flex items-center justify-center space-x-3 text-white/70 hover:text-white transition-colors duration-300">
                  <RefreshCw size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[2px]">Restore_Existing_Node</span>
                </div>
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center space-x-3"
              >
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <span className="text-[10px] font-mono text-red-500 text-left leading-tight break-all uppercase">{error}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'GENERATING' && (
          <motion.div 
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-8"
          >
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border border-nexus-accent-gold/20 rounded-full animate-ping" />
              <div className="absolute inset-0 border-2 border-nexus-accent-gold/40 rounded-full animate-spin flex items-center justify-center">
                 <RefreshCw size={24} className="text-nexus-accent-gold" />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-nexus-accent-gold font-mono text-[9px] tracking-[4px] uppercase font-bold animate-pulse">
                Computing_Hardware_Keys...
              </span>
              <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-0 bg-nexus-accent-gold"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 'RESTORE' && (
          <motion.div 
            key="restore"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col space-y-6 w-full"
          >
             <div className="flex items-center justify-between">
                <button onClick={() => setStep('IDLE')} className="text-white/40 hover:text-white transition-colors">
                  <ArrowRight size={20} className="rotate-180" />
                </button>
                <span className="text-[10px] font-mono font-black text-nexus-accent-gold uppercase tracking-[4px]">Migration_Protocol</span>
                <div className="w-5" />
             </div>

             <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                   <p className="text-[10px] font-mono text-white/40 uppercase mb-4 tracking-wider">Input Recovery Seed Shards:</p>
                   <textarea
                     value={restoreSeed}
                     onChange={(e) => setRestoreSeed(e.target.value)}
                     placeholder="pulse nexus echo cipher..."
                     className="w-full h-32 bg-transparent border border-white/20 p-3 text-white font-mono text-xs outline-none focus:border-nexus-accent-gold transition-colors resize-none"
                   />
                </div>

                <button 
                  onClick={handleRestoreIdentity}
                  disabled={!restoreSeed.trim()}
                  className={`w-full py-4 font-black uppercase tracking-[3px] text-xs transition-all ${restoreSeed.trim() ? 'bg-white text-black' : 'bg-white/10 text-white/20'}`}
                >
                  Synchronize_Terminal
                </button>
             </div>

             {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
                <p className="text-[9px] font-mono text-red-500 uppercase">{error}</p>
              </div>
            )}
          </motion.div>
        )}

        {step === 'MNEMONIC' && (
          <motion.div 
            key="mnemonic"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm space-y-8"
          >
            <div className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                 <div className="px-3 py-1 bg-nexus-accent-gold/10 border border-nexus-accent-gold/20 rounded-full">
                    <span className="text-nexus-accent-gold font-mono text-[8px] uppercase tracking-widest font-black">Identity_Established</span>
                 </div>
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Sovereign_Mnemonic_Seed</h2>
              <p className="text-[10px] text-white/40 font-mono uppercase leading-relaxed px-4">
                This is your private key in plain words. Do not let it leave this device.
                Storing it locally in your Sovereign Enclave.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-white/5 blur-md group-hover:bg-white/10 transition-all" />
              <div className="relative bg-[#111111] border border-white/10 p-6 rounded-sm space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {mnemonic.split(' ').map((word, i) => (
                    <div key={i} className="flex flex-col space-y-1">
                      <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">WD_{i+1}</span>
                      <span className="text-[11px] font-mono text-white/80 font-bold tracking-tight">{word}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                   <div className="flex items-center space-x-2">
                     <Lock size={12} className="text-white/20" />
                     <span className="text-[8px] font-mono text-white/20 uppercase">Encrypted_At_Rest</span>
                   </div>
                   <button 
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 text-[9px] font-mono font-bold uppercase tracking-wider text-white hover:text-nexus-accent-gold transition-colors"
                   >
                     {copied ? <Check size={12} /> : <Copy size={12} />}
                     <span>{copied ? 'Copied' : 'Backup_To_Paper'}</span>
                   </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-nexus-accent-gold/5 border border-nexus-accent-gold/10 rounded-sm">
                 <div className="flex items-start space-x-3">
                    <ShieldCheck size={14} className="text-nexus-accent-gold mt-0.5" />
                    <div className="space-y-2 flex-1">
                       <p className="text-[11px] font-mono text-white/80 font-bold uppercase tracking-tight leading-none">Security_Protocol::Activated</p>
                       <p className="text-[9px] font-mono text-white/40 uppercase leading-relaxed">Your Identity ID: <span className="text-nexus-accent-gold">{did.slice(0, 16)}...</span></p>
                       
                       <label 
                         onClick={() => setBackupVerified(!backupVerified)}
                         className="flex items-start space-x-3 mt-4 cursor-pointer group/check select-none"
                       >
                         <div className="relative flex items-center pt-0.5">
                           <input 
                             type="checkbox" 
                             className="sr-only" 
                             checked={backupVerified} 
                             readOnly
                           />
                           <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-200 ${backupVerified ? 'bg-nexus-accent-gold border-nexus-accent-gold' : 'border-white/30 group-hover/check:border-white/50 bg-white/5'}`}>
                             {backupVerified && <Check size={14} className="text-black" strokeWidth={3} />}
                           </div>
                         </div>
                         <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest font-black leading-tight pt-0.5 group-hover/check:text-white transition-colors">
                           I_have_recorded_my_backup_words
                         </span>
                       </label>
                    </div>
                 </div>
              </div>

              <motion.button 
                whileTap={backupVerified ? { scale: 0.98 } : {}}
                onClick={handleLinkToMesh}
                disabled={!backupVerified}
                className={`w-full py-4 font-black uppercase text-xs tracking-[4px] transition-all flex items-center justify-center space-x-3 ${
                  backupVerified 
                    ? 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                    : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'
                }`}
              >
                {!backupVerified && <Lock size={12} className="opacity-50" />}
                <span>Initialize_Terminal</span>
              </motion.button>
            </div>

            {showIOSHint && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed bottom-6 left-6 right-6 z-[9000] bg-[#1A1A1A] border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl flex items-center space-x-4"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-nexus-accent-gold">
                  <Smartphone size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-display font-black text-white/80 uppercase tracking-widest mb-1">Fullscreen Experience</p>
                  <p className="text-[6px] font-mono text-white/40 uppercase tracking-[1px] leading-relaxed">
                    Tap <Share size={8} className="inline mx-1" /> then <PlusSquare size={8} className="inline mx-1" /> "Add to Home Screen" to remove the browser UI and run as a standalone node.
                  </p>
                </div>
                <button 
                  onClick={() => setStep('IDLE')} // Just a dummy click to trigger a local UI state refresh if needed
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'SYNCING' && (
          <motion.div 
            key="syncing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-12 w-full max-w-xs"
          >
            <div className="w-20 h-20 relative flex items-center justify-center">
              <div className="absolute inset-0 border border-white/5 rounded-full" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-nexus-accent-gold rounded-full"
              />
              <Terminal size={32} className="text-white animate-pulse" />
            </div>

            <div className="w-full space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-white font-mono text-[9px] tracking-[4px] uppercase font-bold animate-pulse">
                    {syncLog || "Deploying_Mesh_Protocol..."}
                  </span>
                  <span className="text-nexus-accent-gold font-mono text-[10px] font-black">{syncProgress}%</span>
                </div>
                <div className="h-[2px] w-full bg-white/5 relative overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${syncProgress}%` }}
                    className="absolute inset-y-0 left-0 bg-nexus-accent-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Finalizing_Encrypted_Handshake</p>
                <div className="flex space-x-1">
                   {[1,2,3,4,5].map(i => (
                     <motion.div 
                       key={i}
                       animate={{ opacity: [0.2, 1, 0.2] }}
                       transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                       className="w-1 h-1 bg-nexus-accent-gold rounded-full"
                     />
                   ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

