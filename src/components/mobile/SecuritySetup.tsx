import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Fingerprint, Key, ChevronRight, RefreshCcw, Lock, Box, Cpu, QrCode, ArrowLeft, Terminal } from 'lucide-react';

interface SecuritySetupProps {
  onComplete: (did: string) => void;
}

export const SecuritySetup: React.FC<SecuritySetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'INTRO' | 'GENERATING' | 'RESULT' | 'RECOVER' | 'SYNC_SCAN' | 'SYNCING'>('INTRO');
  const [generatedDid, setGeneratedDid] = useState("");
  const [generatedSeed, setGeneratedSeed] = useState("");
  
  // Recovery/Sync state
  const [inputSeed, setInputSeed] = useState("");

  const generateIdentity = async () => {
    setStep('GENERATING');
    await new Promise(r => setTimeout(r, 2000));
    const did = `did:key:z6M${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}`;
    const seed = Array.from({length: 4}, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
    setGeneratedDid(did);
    setGeneratedSeed(seed);
    setStep('RESULT');
  };

  const handleRecover = async () => {
    setStep('GENERATING');
    await new Promise(r => setTimeout(r, 1500));
    // Simulated deterministic derivation from seed
    const recoveredDid = `did:key:z6M_RECOVERED_${inputSeed.split('-')[0] || 'INF'}`;
    setGeneratedDid(recoveredDid);
    setStep('RESULT');
  };

  const startSyncScan = () => {
    setStep('SYNC_SCAN');
  };

  const simulateSync = async () => {
    setStep('SYNCING');
    await new Promise(r => setTimeout(r, 3000));
    const syncedDid = "did:key:z6M_SYNCED_FROM_MASTER_DEVICE";
    setGeneratedDid(syncedDid);
    setStep('RESULT');
  };

  return (
    <div className="flex flex-col h-full bg-nexus-bg text-nexus-ink font-sans p-6 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--nexus-ink) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10">
        
        <AnimatePresence mode="wait">
          {step === 'INTRO' && (
            <motion.div 
              key="intro"
              role="region"
              aria-label="Identity Initialization Selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-nexus-accent-blue/10 rounded-2xl flex items-center justify-center border border-nexus-accent-blue/20">
                  <Shield size={28} className="text-nexus-accent-blue" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter uppercase leading-tight">
                  Mesh_Entry_<br />
                  <span className="text-nexus-accent-blue">Initialize.</span>
                </h1>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={generateIdentity}
                  aria-label="Generate a new cryptographic identity"
                  className="group w-full p-4 bg-nexus-ink text-nexus-bg rounded-lg flex flex-col items-start transition-all active:scale-[0.98] shadow-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent-blue"
                >
                   <div className="flex items-center space-x-2 mb-1">
                      <Cpu size={14} aria-hidden="true" />
                      <span className="text-[10px] font-black uppercase tracking-[3px]">New_Identity</span>
                   </div>
                   <p className="text-[9px] opacity-60 text-left">Generate local ED25519 cryptographic shards.</p>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setStep('SYNC_SCAN')}
                    aria-label="Sync identity from another device via QR"
                    className="p-4 bg-nexus-surface border border-nexus-border rounded-lg flex flex-col items-start hover:bg-nexus-ink/5 transition-all active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-nexus-accent-blue"
                  >
                    <QrCode size={16} className="mb-2 text-nexus-accent-blue" aria-hidden="true" />
                    <span className="text-[9px] font-black uppercase tracking-[1px]">Sync_QR</span>
                  </button>
                  <button 
                    onClick={() => setStep('RECOVER')}
                    aria-label="Recover identity using a backup seed"
                    className="p-4 bg-nexus-surface border border-nexus-border rounded-lg flex flex-col items-start hover:bg-nexus-ink/5 transition-all active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-nexus-accent-blue"
                  >
                    <Key size={16} className="mb-2 text-nexus-accent-gold" aria-hidden="true" />
                    <span className="text-[9px] font-black uppercase tracking-[1px]">Manual_Seed</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-nexus-ink-muted text-center opacity-40 uppercase tracking-widest pt-4">
                Non-Custodial Protocol v4.2
              </p>
            </motion.div>
          )}

          {step === 'RECOVER' && (
            <motion.div 
               key="recover"
               role="region"
               aria-label="Seed Phrase Recovery"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
            >
               <button 
                onClick={() => setStep('INTRO')} 
                aria-label="Return to initial selection"
                className="flex items-center space-x-2 text-nexus-ink-muted hover:text-nexus-ink transition-colors focus:outline-none focus:text-nexus-accent-blue"
               >
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
               </button>

               <div className="space-y-4">
                  <h2 className="text-2xl font-black tracking-tight uppercase">Import_Sovereignty</h2>
                  <p className="text-[11px] text-nexus-ink-muted">Enter your Entropic Seed phrase to reconstruct your identity shards on this terminal.</p>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <Terminal size={12} className="absolute top-3 left-3 text-nexus-ink-muted/40" aria-hidden="true" />
                      <textarea 
                        aria-label="Entropic Seed backup shard"
                        value={inputSeed}
                        onChange={(e) => setInputSeed(e.target.value.toUpperCase())}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="w-full bg-nexus-surface border border-nexus-border rounded-lg p-3 pl-9 text-[14px] font-mono tracking-[4px] text-nexus-accent-gold uppercase focus:border-nexus-accent-gold/40 outline-none h-24 resize-none"
                      />
                    </div>
                    <button 
                      disabled={!inputSeed}
                      onClick={handleRecover}
                      className="w-full py-4 bg-nexus-accent-gold text-black font-black text-xs tracking-[4px] uppercase rounded-sm disabled:opacity-30 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-nexus-accent-gold"
                    >
                      Authenticate_Shards
                    </button>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 'SYNC_SCAN' && (
            <motion.div 
               key="sync_scan"
               role="region"
               aria-label="Identity Sync Handshake"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-6 text-center"
            >
               <div className="space-y-4">
                  <h2 className="text-xl font-black tracking-tight uppercase">Optical_Handshake</h2>
                  <p className="text-[11px] text-nexus-ink-muted">Align this terminal with the Authorization QR on your established device.</p>
                  
                  <button 
                    onClick={simulateSync}
                    aria-label="Simulate scanning authorization QR code"
                    className="aspect-square w-full max-w-[200px] mx-auto bg-nexus-surface border border-nexus-border rounded-2xl flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden focus:outline-none focus:border-nexus-accent-blue"
                  >
                     <div className="absolute inset-0 bg-nexus-accent-blue/5 group-hover:bg-nexus-accent-blue/10 transition-colors" />
                     <div className="w-full h-0.5 bg-nexus-accent-blue absolute top-0 animate-[scan_2s_infinite]" />
                     <QrCode size={48} className="text-nexus-ink-muted group-hover:text-nexus-accent-blue transition-colors relative z-10" aria-hidden="true" />
                     <span className="mt-4 text-[8px] font-black tracking-widest text-nexus-accent-blue uppercase opacity-0 group-hover:opacity-100 transition-opacity">Detecting_Bridge...</span>
                  </button>

                  <button 
                    onClick={() => setStep('INTRO')} 
                    className="text-[10px] font-bold text-nexus-ink-muted uppercase tracking-[2px] mt-4 focus:outline-none focus:text-nexus-ink"
                  >
                    Cancel_Relay
                  </button>
               </div>
            </motion.div>
          )}

          {(step === 'GENERATING' || step === 'SYNCING') && (
            <motion.div 
              key="status"
              role="alert"
              aria-live="polite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-8 text-center"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-2 border-dashed border-nexus-accent-blue/30 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCcw size={32} className="text-nexus-accent-blue animate-spin" aria-hidden="true" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xs font-black tracking-[5px] uppercase text-nexus-ink">
                  {step === 'GENERATING' ? 'Reconstructing_Metadata' : 'Synchronizing_States'}
                </h2>
                <div className="flex items-center space-x-2 justify-center">
                   <div className="w-1 h-1 bg-nexus-accent-blue animate-bounce" />
                   <div className="w-1 h-1 bg-nexus-accent-blue animate-bounce [animation-delay:0.2s]" />
                   <div className="w-1 h-1 bg-nexus-accent-blue animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 'RESULT' && (
            <motion.div 
              key="result"
              role="region"
              aria-label="Identity Finalization"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-full">
                  <Lock size={12} aria-hidden="true" />
                  <span className="text-[9px] font-black tracking-widest uppercase">Identity_Sovereignty_Confirmed</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight uppercase">Terminal_Activated</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-nexus-surface border border-nexus-border rounded-lg space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black tracking-widest text-nexus-ink-muted uppercase">Public_DID</span>
                    <Box size={12} className="text-nexus-ink-muted/40" aria-hidden="true" />
                  </div>
                  <div 
                    role="textbox"
                    aria-readonly="true"
                    aria-label="Generated Public DID"
                    className="bg-nexus-bg p-3 rounded border border-nexus-border font-mono text-[10px] break-all text-nexus-accent-blue leading-relaxed"
                  >
                    {generatedDid}
                  </div>
                </div>

                {generatedSeed && (
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-lg space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black tracking-widest text-nexus-accent-gold uppercase">Backup_Seed_Shard</span>
                      <Shield size={12} className="text-nexus-accent-gold/40" aria-hidden="true" />
                    </div>
                    <div className="bg-nexus-bg p-3 rounded border border-nexus-border flex flex-col space-y-2">
                       <div className="flex items-center justify-between">
                          <p className="text-[9px] text-nexus-ink-muted uppercase tracking-wider font-bold">Entropic_Seed</p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(generatedSeed);
                              alert("Seed Shard copied to local clipboard.");
                            }}
                            className="text-[8px] font-black underline uppercase text-nexus-accent-gold tracking-widest"
                          >
                            Copy
                          </button>
                       </div>
                       <p className="font-mono text-[14px] text-nexus-accent-gold tracking-[3px] text-center select-all py-1 border-y border-dashed border-nexus-accent-gold/20">
                         {generatedSeed}
                       </p>
                       <p className="text-[8px] text-center text-nexus-ink-muted leading-relaxed uppercase opacity-60">
                         Write this down offline. This is your ONLY recovery vector.
                       </p>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => onComplete(generatedDid)}
                className="w-full py-4 bg-nexus-accent-blue text-white font-black text-xs tracking-[4px] uppercase rounded-sm flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent-blue"
              >
                <span>Initialize Mesh Session</span>
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-6 border-t border-nexus-border/40 flex justify-between items-center opacity-40">
        <span className="text-[10px] font-black tracking-[4px]">DOTCOM v4.2</span>
        <span className="text-[8px] font-mono">NON_CUSTODIAL_CORE</span>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};
