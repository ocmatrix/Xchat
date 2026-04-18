import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Download, ShieldCheck, WifiOff, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IdentityCardProps {
  did: string;
}

/**
 * IdentityCard: Production-ready component for displaying and exporting 
 * a user's sovereign identity QR matrix.
 */
export const IdentityCard = ({ did }: IdentityCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleExport = async () => {
    if (cardRef.current === null) return;
    
    try {
      console.log("📸 NX_EXPORT: Capturing identity matrix...");
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--nexus-bg').trim() || '#0A0A0A',
        style: {
           padding: '20px'
        }
      });
      saveAs(dataUrl, `nexus-id-${did.slice(-8)}.png`);
      console.log("✅ NX_EXPORT_SUCCESS: Identity card saved to buffer.");
      
      // Haptic simulation for success
      if ('vibrate' in navigator) navigator.vibrate([20, 30, 20]);
    } catch (err) {
      console.error("❌ NX_EXPORT_FAILED: Capture sequence interrupted.", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* The Actual Card Area for Export */}
      <div 
        ref={cardRef}
        className={`bg-nexus-bg p-10 border relative overflow-hidden flex flex-col items-center shadow-2xl transition-all duration-700 ${
          isOffline ? 'border-[#EF4444]/40 grayscale-[0.4]' : 'border-nexus-accent-gold/30'
        }`}
        id="nexus-identity-card"
      >
        {/* Aesthetic Overlay Noise */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Offline Protocol Overlay */}
        <AnimatePresence mode="wait">
          {isOffline && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 border-2 border-[#EF4444]/10 pointer-events-none z-0"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#EF4444]/50 to-transparent animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header Decor */}
        <div className="w-full flex justify-between items-center mb-10 z-10">
           <div className="flex flex-col">
              <span className={`font-mono text-[9px] tracking-[4px] uppercase font-bold transition-colors ${isOffline ? 'text-[#EF4444]/60' : 'text-nexus-accent-gold'}`}>
                {isOffline ? 'Nexus_Cache' : 'Nexus_Core'}
              </span>
              <span className="text-nexus-ink-muted font-mono text-[7px] tracking-[2px] uppercase opacity-40">
                {isOffline ? 'Local_Shard_Instance' : 'Identity_Matrix'}
              </span>
           </div>
           {isOffline ? (
             <WifiOff size={18} className="text-[#EF4444] animate-pulse" strokeWidth={1.5} />
           ) : (
             <ShieldCheck size={18} className="text-nexus-accent-gold opacity-60" strokeWidth={1.5} />
           )}
        </div>

        {/* QR Matrix */}
        <div className={`p-3 bg-white/[0.02] border relative mb-10 transition-colors ${isOffline ? 'border-[#EF4444]/20' : 'border-nexus-border'}`}>
           <QRCodeSVG
             value={did}
             size={250}
             bgColor="transparent"
             fgColor="currentColor"
             level="H"
             includeMargin={false}
             className={`transition-colors duration-1000 ${isOffline ? 'text-nexus-ink-muted/50' : 'text-nexus-accent-gold'}`}
           />
           
           {/* Precision Corner Graphics */}
           <div className={`absolute -top-1 -left-1 w-3 h-3 border-t border-l transition-colors ${isOffline ? 'border-[#EF4444]/40' : 'border-nexus-accent-gold'}`} />
           <div className={`absolute -top-1 -right-1 w-3 h-3 border-t border-r transition-colors ${isOffline ? 'border-[#EF4444]/40' : 'border-nexus-accent-gold'}`} />
           <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-b border-l transition-colors ${isOffline ? 'border-[#EF4444]/40' : 'border-nexus-accent-gold'}`} />
           <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b border-r transition-colors ${isOffline ? 'border-[#EF4444]/40' : 'border-nexus-accent-gold'}`} />
        </div>

        {/* Identity Metadata Footer */}
        <div className="w-full border-t border-nexus-border pt-8 flex flex-col items-center text-center z-10">
           <span className={`font-mono text-[9px] tracking-widest break-all px-4 mb-2 transition-opacity ${isOffline ? 'opacity-40' : 'opacity-100'}`}>
             {did}
           </span>
           <div className="flex space-x-6">
              <div className="flex flex-col">
                 <span className="text-nexus-ink-muted font-mono text-[6px] tracking-[1.5px] uppercase opacity-40">Classification</span>
                 <span className={`font-mono text-[8px] tracking-[1px] uppercase ${isOffline ? 'text-nexus-ink-muted font-bold' : 'text-nexus-accent-gold'}`}>
                    {isOffline ? 'Cached_Node' : 'Alpha_Protocol'}
                 </span>
              </div>
              <div className="flex flex-col">
                 <span className="text-nexus-ink-muted font-mono text-[6px] tracking-[1.5px] uppercase opacity-40">Status</span>
                 <div className="flex items-center space-x-1.5 justify-center">
                    {isOffline && <Clock size={8} className="text-[#EF4444]" />}
                    <span className={`font-mono text-[8px] tracking-[1px] uppercase ${isOffline ? 'text-[#EF4444]' : 'text-nexus-accent-gold'}`}>
                      {isOffline ? 'Offline_Mode' : 'Node_Genesis'}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Export Action Trigger */}
      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={handleExport}
        className="mt-8 flex items-center space-x-3 text-nexus-accent-gold hover:text-nexus-ink transition-all bg-nexus-card border border-nexus-accent-gold/20 px-8 py-3 rounded-sm group cursor-pointer"
      >
        <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
        <span className="font-mono text-[9px] tracking-[3px] uppercase">Export Identity Card</span>
      </motion.button>
    </div>
  );
};
