import React, { useState } from 'react';
import { X, Scan, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PeerDiscoveryProps {
  onClose: () => void;
  onConnected: (did: string) => void;
}

export const PeerDiscovery = ({ onClose, onConnected }: PeerDiscoveryProps) => {
  const [manualDid, setManualDid] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleConnect = () => {
    if (!manualDid.trim()) return;
    
    setIsConnecting(true);
    
    // Simulate successful handshake
    setTimeout(() => {
      // Haptic & Visual Feedback
      if ('vibration' in navigator) {
        try { navigator.vibrate([100, 50, 100]); } catch (e) { /* silent */ }
      }
      console.log("🔒 HANDSHAKE_ESTABLISHED: Key material exchanged via Diffie-Hellman.");
      console.log("🫨 HAPTIC_TRIGGER: Connection success.");

      setFlash(true);
      setTimeout(() => {
        setFlash(false);
        setIsConnecting(false);
        onConnected(manualDid);
      }, 500);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 bg-nexus-bg z-[600] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Visual Success Flash */}
      <AnimatePresence>
        {flash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-[700] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Mode A: Visual Scan (Viewfinder) */}
      <div className="flex-1 relative flex flex-col">
        {/* Header */}
        <div className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
           <div className="flex flex-col">
              <span className="text-nexus-accent-blue font-mono text-[10px] tracking-[4px] uppercase mb-1">Visual_Radar</span>
              <span className="text-nexus-ink font-mono text-[8px] uppercase tracking-[2px] opacity-60">Locating Identity Matrix...</span>
           </div>
           <button 
             onClick={onClose}
             className="p-2 bg-nexus-surface rounded-full text-nexus-ink-muted hover:text-nexus-ink transition-colors border-none bg-transparent cursor-pointer"
           >
             <X size={20} />
           </button>
        </div>

        {/* Viewfinder Graphics */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-64 h-64 relative">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-nexus-accent-blue" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-nexus-accent-blue" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-nexus-accent-blue" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-nexus-accent-blue" />

              {/* Scanning line animation */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 w-full h-[1px] bg-nexus-accent-blue shadow-[0_0_10px_var(--nexus-accent-blue)] z-10"
              />
              
              {/* Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                 <Scan size={32} className="text-nexus-accent-blue opacity-30" strokeWidth={1} />
              </div>
           </div>
        </div>

        {/* Backdrop noise */}
        <div className="absolute inset-0 opacity-10 bg-grid-white/[0.05] pointer-events-none" />
      </div>

      {/* Mode B: Manual Input Panel */}
      <div className="bg-nexus-surface p-8 pb-12 border-t border-nexus-border relative z-50">
        <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[3px] uppercase mb-6 block text-center opacity-60">
          Manual Peer Address Submission
        </span>
        
        <div className="flex items-center space-x-4">
           <div className="flex-1 bg-nexus-bg p-1 border-b border-nexus-border focus-within:border-nexus-accent-blue transition-colors">
              <input 
                 type="text"
                 placeholder="INPUT PEER DID OR ADDRESS..."
                 value={manualDid}
                 onChange={(e) => setManualDid(e.target.value)}
                 className="w-full bg-transparent border-none py-3 px-3 text-nexus-ink font-mono text-[10px] tracking-wide outline-none placeholder:text-nexus-ink-muted/50"
              />
           </div>
           
           <button 
             onClick={handleConnect}
             disabled={!manualDid.trim() || isConnecting}
             className={`p-4 rounded-sm transition-all border-none cursor-pointer flex items-center justify-center ${
               manualDid.trim() && !isConnecting 
                 ? 'bg-nexus-accent-blue text-white hover:scale-105' 
                 : 'bg-nexus-border text-nexus-ink-muted/50 cursor-not-allowed'
             }`}
           >
             {isConnecting ? (
               <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
             ) : (
               <Send size={16} strokeWidth={1.5} />
             )}
           </button>
        </div>

        {/* Handshake warning */}
        <div className="mt-8 flex items-center justify-center space-x-2 opacity-30">
           <AlertCircle size={10} className="text-nexus-ink-muted" />
           <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[1px] uppercase">Handshake involves key-exchange metadata leak risk.</span>
        </div>
      </div>
    </div>
  );
};
