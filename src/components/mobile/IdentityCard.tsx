import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Download, ShieldCheck, WifiOff, Clock, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

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
        backgroundColor: '#050506', // Use the dark background
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
    <div className="flex flex-col items-center w-full font-mono">
      {/* The Actual Card Area for Export */}
      <div 
        ref={cardRef}
        className={`bg-black p-12 border relative overflow-hidden flex flex-col items-center shadow-[0_0_80px_rgba(0,0,0,0.6)] transition-all duration-700 ${
          isOffline ? 'border-[#EF4444]/40 grayscale-[0.2]' : 'border-nexus-border'
        }`}
        id="nexus-identity-card"
        style={{ width: '340px' }}
      >
        {/* Background Textures & Watermarks */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none technical-grid" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-nexus-ink/[0.02] text-[80px] font-black tracking-tighter select-none pointer-events-none rotate-12">
          NEXUS_CORE
        </div>
        
        {/* Hardware Status Strip */}
        <div className="absolute top-0 inset-x-0 h-1 flex">
           <div className={`flex-1 transition-colors duration-500 ${isOffline ? 'bg-[#EF4444]' : 'bg-nexus-accent-blue'}`} />
           <div className="w-1/3 bg-white/5" />
           <div className="w-1/6 bg-nexus-accent-gold" />
        </div>

        {/* Offline Protocol Overlay */}
        <AnimatePresence mode="wait">
          {isOffline && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 border-2 border-[#EF4444]/10 pointer-events-none z-10"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-[#EF4444]/20 animate-pulse" />
              <div className="absolute bottom-4 left-4 text-[#EF4444] text-[6px] font-black tracking-[2px] uppercase opacity-40">COMM_LINK_INTERRUPTED_FALLBACK_ACTIVE</div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header Decor */}
        <div className="w-full flex justify-between items-start mb-12 z-20">
           <div className="flex flex-col">
              <div className="flex items-center space-x-3 mb-2">
                 <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] transition-colors ${isOffline ? 'bg-[#EF4444] text-[#EF4444]' : 'bg-nexus-accent-blue text-nexus-accent-blue'}`} />
                 <span className={`text-[8px] tracking-[4px] uppercase font-black transition-colors ${isOffline ? 'text-[#EF4444]/80' : 'text-nexus-accent-blue'}`}>
                    {isOffline ? 'CORE_ISOLATION' : 'NODE_PRIME'}
                 </span>
              </div>
              <span className="text-nexus-ink-muted opacity-50 text-[7px] tracking-[2px] uppercase font-bold">
                IDENTITY_VERIFICATION_MATRIX_V4.2
              </span>
              <p className="text-[6px] text-nexus-accent-gold font-bold uppercase mt-1 tracking-widest">» SCAN_TO_ESTABLISH_P2P_LINK</p>
           </div>
           
           <div className="flex flex-col items-end opacity-40">
              <span className="text-nexus-ink text-[6px] tracking-[1px] uppercase font-mono">ID_SHARD_8821</span>
              <span className="text-nexus-ink text-[6px] tracking-[1px] uppercase font-mono opacity-50">RELAY: ASIA-PACIFIC</span>
           </div>
        </div>

        {/* QR Matrix Container */}
        <div className={`relative p-5 bg-black/40 border backdrop-blur-sm shadow-2xl transition-all duration-500 group ${isOffline ? 'border-[#EF4444]/30' : 'border-nexus-border hover:border-nexus-accent-gold/40'}`}>
           {/* Corner Decorators */}
           <div className={`absolute -top-1 -left-1 w-6 h-6 border-t border-l transition-colors duration-500 ${isOffline ? 'border-[#EF4444]/60' : 'border-nexus-accent-gold'}`} />
           <div className={`absolute -top-1 -right-1 w-6 h-6 border-t border-r transition-colors duration-500 ${isOffline ? 'border-[#EF4444]/60' : 'border-nexus-accent-gold'}`} />
           <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b border-l transition-colors duration-500 ${isOffline ? 'border-[#EF4444]/60' : 'border-nexus-accent-gold'}`} />
           <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b border-r transition-colors duration-500 ${isOffline ? 'border-[#EF4444]/60' : 'border-nexus-accent-gold'}`} />

           <div className="relative overflow-hidden p-2 rounded-[2px] bg-white/5">
              <QRCodeSVG
                value={did}
                size={220}
                bgColor="transparent"
                fgColor="#FFFFFF"
                level="H"
                includeMargin={false}
                className="transition-all duration-1000 opacity-90 grayscale-[0.2]"
              />
              {/* Scanline Effect */}
              <motion.div 
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 w-full h-[2px] bg-nexus-border z-10"
              />
           </div>

           {/* Security Stamp overlay */}
           <div className="absolute top-2 right-2 flex items-center space-x-1 px-1.5 py-0.5 bg-black border border-nexus-border rounded-[1px] opacity-20 pointer-events-none scale-75 origin-top-right">
              <ShieldCheck size={8} className="text-nexus-ink" />
              <span className="text-[5px] text-nexus-ink tracking-[1px] uppercase font-black">VALIDATED</span>
           </div>
        </div>

        {/* Identity Metadata Footer */}
        <div className="w-full mt-12 bg-nexus-border opacity-50 border border-nexus-border p-6 relative overflow-hidden z-20">
           <div className="absolute top-0 right-0 w-16 h-1 bg-nexus-accent-gold/20" />
           
           <div className="flex flex-col mb-6 group/id relative">
              <div className="flex justify-between items-center mb-1">
                <span className="text-nexus-ink-muted opacity-50 text-[6px] tracking-[3px] uppercase font-black leading-none">NODE_IDENTIFIER</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(did);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full mt-4 py-3 flex justify-center items-center space-x-2 bg-nexus-accent-gold/20 hover:bg-nexus-accent-gold/40 border border-nexus-accent-gold/50 rounded-lg transition-all"
                >
                  <span className="text-nexus-accent-gold font-black uppercase tracking-widest text-xs">
                    {copied ? 'DID_COPIED' : 'COPY_YOUR_DID'}
                  </span>
                  {copied ? <Check size={14} className="text-nexus-accent-gold" /> : <Copy size={14} className="text-nexus-accent-gold" />}
                </button>
              </div>
              <span className={`text-[10px] break-all leading-tight tracking-[1px] font-bold transition-opacity duration-500 ${isOffline ? 'text-[#EF4444]/80' : 'text-nexus-ink/80'}`}>
                {did}
              </span>
           </div>

           <div className="flex items-center space-x-8">
              <div className="flex flex-col">
                 <span className="text-nexus-ink/10 text-[6px] tracking-[2px] uppercase mb-1 font-black">Classification</span>
                 <div className="flex items-center space-x-2">
                    <div className="w-1 h-3 bg-nexus-accent-blue" />
                    <span className={`text-[9px] tracking-[2px] uppercase font-black ${isOffline ? 'text-nexus-ink-muted' : 'text-nexus-accent-gold'}`}>
                       {isOffline ? 'CACHED_SLOT' : 'ALPHA_ENTITY'}
                    </span>
                 </div>
              </div>
              <div className="flex-1 h-full flex flex-col items-end">
                 <span className="text-nexus-ink/10 text-[6px] tracking-[2px] uppercase mb-1 font-black">Signal_Integrity</span>
                 <div className="flex items-center space-x-1">
                    {[1, 1, 1, 1, 0].map((v, i) => (
                       <div key={i} className={`w-3 h-1.5 rounded-[1px] ${i < 4 && !isOffline ? 'bg-nexus-accent-blue shadow-[0_0_5px_var(--nexus-accent-blue)]' : isOffline ? 'bg-[#EF4444]/30' : 'bg-white/5'}`} />
                    ))}
                 </div>
              </div>
           </div>
           
           {/* Technical Specs Footer */}
           <div className="mt-8 pt-4 border-t border-nexus-border flex justify-between items-center opacity-30">
              <span className="text-[5px] tracking-[2px] uppercase">SHA-256 / AES-256-GCM / ED25519</span>
              <span className="text-[5px] tracking-[1px] uppercase">Nexus_Kernel_v1.0.4</span>
           </div>
        </div>
      </div>

      {/* Export Action Trigger */}
      <div className="relative mt-12 w-full max-w-sm">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="w-full flex items-center justify-center space-x-4 h-16 bg-nexus-border border border-nexus-border text-nexus-ink hover:text-nexus-accent-gold hover:border-nexus-accent-gold/40 transition-all rounded-sm group relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Download size={18} className="text-nexus-ink-muted group-hover:text-nexus-accent-gold transition-colors" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[5px] uppercase font-black">Export_Secure_Identity</span>
        </motion.button>
        <div className="mt-4 flex items-center justify-center space-x-2 text-nexus-ink-muted opacity-50 select-none">
           <div className="w-1 h-1 bg-white/20 rounded-full" />
           <span className="text-[7px] tracking-[2px] uppercase font-bold">Shard will be saved in Buffer_Storage_Format (.PNG)</span>
        </div>
      </div>
    </div>
  );
};
