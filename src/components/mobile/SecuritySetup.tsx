import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Fingerprint, Key, ChevronRight, RefreshCcw, Lock, Box, Cpu, QrCode, ArrowLeft, Terminal } from 'lucide-react';
import LogoIcon from '../LogoIcon';

interface SecuritySetupProps {
  onComplete: (did: string) => void;
}

export const SecuritySetup: React.FC<SecuritySetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'INTRO' | 'GENERATING' | 'RESULT' | 'RECOVER' | 'SYNC_SCAN' | 'SYNCING'>('INTRO');
  const [generatedDid, setGeneratedDid] = useState("");
  const [generatedSeed, setGeneratedSeed] = useState("");
  const [backupVerified, setBackupVerified] = useState(false);
  
  // Recovery/Sync state
  const [inputSeed, setInputSeed] = useState("");

  const generateIdentity = async () => {
    setStep('GENERATING');
    setBackupVerified(false);
    await new Promise(r => setTimeout(r, 2000));
    const did = `did:key:z6M${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}`;
    const seed = Array.from({length: 4}, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
    setGeneratedDid(did);
    setGeneratedSeed(seed);
    setStep('RESULT');
  };

  const handleRecover = async () => {
    setStep('GENERATING');
    setBackupVerified(true);
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
    <div className="flex flex-col h-full bg-white dark:bg-[#000000] text-black dark:text-white font-sans p-6 overflow-hidden relative">
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
              <div className="flex flex-col items-center text-center space-y-4 mb-4">
                <div className="w-16 h-16 bg-[#007AFF]/10 rounded-2xl flex items-center justify-center">
                  <LogoIcon className="text-[#007AFF] text-4xl" aria-hidden="true" />
                </div>
                <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
                  Welcome
                </h1>
                <p className="text-[#8E8E93] text-[15px] font-normal leading-relaxed px-4">
                  Set up your identity or sync an existing device to continue.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={generateIdentity}
                  aria-label="Generate a new cryptographic identity"
                  className="w-full p-4 bg-[#007AFF] text-white rounded-xl flex flex-col items-center justify-center transition-colors active:bg-[#007AFF]/80 focus:outline-none"
                >
                   <span className="text-[17px] font-semibold mb-1">Create New Identity</span>
                   <p className="text-[13px] opacity-80 text-center font-normal">Generate local encryption keys.</p>
                </button>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button 
                    onClick={() => setStep('SYNC_SCAN')}
                    aria-label="Sync identity from another device via QR"
                    className="p-4 bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-xl flex flex-col items-center justify-center hover:bg-[#E5E5EA] dark:hover:bg-[#2C2C2E] transition-colors active:scale-[0.98] focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center mb-3">
                      <QrCode size={20} className="text-[#007AFF]" aria-hidden="true" />
                    </div>
                    <span className="text-[15px] font-medium">Sync QR</span>
                  </button>
                  <button 
                    onClick={() => setStep('RECOVER')}
                    aria-label="Recover identity using a backup seed"
                    className="p-4 bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-xl flex flex-col items-center justify-center hover:bg-[#E5E5EA] dark:hover:bg-[#2C2C2E] transition-colors active:scale-[0.98] focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FF9500]/10 flex items-center justify-center mb-3">
                      <Key size={20} className="text-[#FF9500]" aria-hidden="true" />
                    </div>
                    <span className="text-[15px] font-medium">Seed Phrase</span>
                  </button>
                </div>
              </div>
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
                className="flex items-center space-x-1 text-[#007AFF] hover:opacity-80 transition-opacity focus:outline-none -ml-2"
               >
                  <ArrowLeft size={20} aria-hidden="true" />
                  <span className="text-[17px] font-normal">Back</span>
               </button>

               <div className="space-y-4">
                  <h2 className="text-[28px] font-semibold tracking-tight">Recovery</h2>
                  <p className="text-[15px] text-[#8E8E93] leading-relaxed">Enter your recovery phrase to reconstruct your identity on this device.</p>
                  
                  <div className="space-y-4 pt-2">
                    <textarea 
                      aria-label="Recovery phrase"
                      value={inputSeed}
                      onChange={(e) => setInputSeed(e.target.value.toUpperCase())}
                      placeholder="Enter 12 or 24 words..."
                      className="w-full bg-[#F2F2F7] dark:bg-[#1C1C1E] border-none rounded-xl p-4 text-[17px] text-black dark:text-white placeholder:text-[#8E8E93] focus:ring-2 focus:ring-[#007AFF] outline-none h-32 resize-none"
                    />
                    <button 
                      disabled={!inputSeed}
                      onClick={handleRecover}
                      className="w-full py-3.5 bg-[#007AFF] text-white font-semibold text-[17px] rounded-xl disabled:opacity-50 transition-colors active:bg-[#007AFF]/80 focus:outline-none"
                    >
                      Recover Identity
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
               <div className="flex justify-start">
                 <button 
                  onClick={() => setStep('INTRO')} 
                  className="flex items-center space-x-1 text-[#007AFF] hover:opacity-80 transition-opacity focus:outline-none -ml-2"
                 >
                    <ArrowLeft size={20} aria-hidden="true" />
                    <span className="text-[17px] font-normal">Back</span>
                 </button>
               </div>

               <div className="space-y-4">
                  <h2 className="text-[28px] font-semibold tracking-tight">Scan QR</h2>
                  <p className="text-[15px] text-[#8E8E93] leading-relaxed max-w-xs mx-auto">Align this device with the Authorization QR on your established device.</p>
                  
                  <button 
                    onClick={simulateSync}
                    aria-label="Simulate scanning authorization QR code"
                    className="aspect-square w-full max-w-[240px] mx-auto mt-8 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[24px] flex flex-col items-center justify-center relative overflow-hidden focus:outline-none active:scale-[0.98] transition-transform"
                  >
                     <div className="w-full h-0.5 bg-[#34C759] absolute top-0 shadow-[0_0_8px_rgba(52,199,89,0.8)] animate-[scan_2s_infinite]" />
                     <QrCode size={64} className="text-[#8E8E93] mb-4" aria-hidden="true" />
                     <span className="text-[15px] font-medium text-[#007AFF]">Tap to Simulate Scan</span>
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
              className="flex flex-col items-center justify-center space-y-6 text-center py-12"
            >
              <RefreshCcw size={40} className="text-[#007AFF] animate-spin" aria-hidden="true" />
              <h2 className="text-[17px] font-semibold text-black dark:text-white">
                {step === 'GENERATING' ? 'Securing Identity...' : 'Syncing Data...'}
              </h2>
            </motion.div>
          )}

          {step === 'RESULT' && (
            <motion.div 
              key="result"
              role="region"
              aria-label="Identity Finalization"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#34C759]/10 rounded-full flex items-center justify-center">
                  <Lock size={32} className="text-[#34C759]" aria-hidden="true" />
                </div>
                <h2 className="text-[28px] font-semibold tracking-tight">Activated</h2>
                <p className="text-[15px] text-[#8E8E93] leading-relaxed">Your device is successfully linked.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-xl p-4 space-y-2">
                  <div className="flex items-center text-[#8E8E93]">
                    <span className="text-[13px] font-medium uppercase tracking-wider">Device ID</span>
                  </div>
                  <div 
                    role="textbox"
                    aria-readonly="true"
                    aria-label="Generated Public DID"
                    className="font-mono text-[13px] break-all text-black dark:text-white leading-relaxed"
                  >
                    {generatedDid}
                  </div>
                </div>

                {generatedSeed && (
                  <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-xl p-4 space-y-3 border border-[#FF9500]/20">
                    <div className="flex items-center justify-between text-[#8E8E93]">
                      <span className="text-[13px] font-medium uppercase tracking-wider text-[#FF9500]">Recovery Phrase</span>
                      <Shield size={16} className="text-[#FF9500]" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col space-y-3">
                       <p className="font-mono text-[17px] text-[#FF9500] text-center select-all py-3 bg-[#FF9500]/5 rounded-lg border border-[#FF9500]/10">
                         {generatedSeed}
                       </p>
                       <div className="flex items-center justify-between mt-1">
                          <p className="text-[13px] text-[#8E8E93] leading-relaxed">
                            Save offline. Your only recovery method.
                          </p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(generatedSeed);
                              alert("Recovery phrase copied");
                            }}
                            className="text-[15px] font-medium text-[#007AFF] hover:underline"
                          >
                            Copy
                          </button>
                       </div>
                       <label className="flex items-start space-x-3 mt-2 cursor-pointer select-none">
                         <input
                           type="checkbox"
                           className="mt-1"
                           checked={backupVerified}
                           onChange={(e) => setBackupVerified(e.target.checked)}
                         />
                         <span className="text-[13px] text-[#8E8E93] leading-relaxed">
                           我已离线备份助记词，理解丢失后无法找回身份。
                         </span>
                       </label>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => onComplete(generatedDid)}
                disabled={!!generatedSeed && !backupVerified}
                className="w-full py-3.5 bg-[#007AFF] text-white font-semibold text-[17px] rounded-xl flex items-center justify-center space-x-2 active:bg-[#007AFF]/80 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
