import React from 'react';
import { Copy, Shield, Clock, ExternalLink } from 'lucide-react';

export const ProfileSettings = ({ did, devices }) => {
  const [alias, setAlias] = React.useState("CYBER_NOMAD");

  return (
    <div className="flex-1 bg-[#0A0A0A] px-0 overflow-y-auto scrollbar-hide h-full flex flex-col">
      
      {/* Identity Card Section */}
      <div className="bg-[#0D0D0D] pt-12 pb-10 px-8 flex flex-col items-center border-b border-white/5 shadow-2xl">
        {/* QR Matrix (Data Matrix Style) */}
        <div className="w-48 h-48 bg-[#0A0A0A] p-4 mb-8 border border-[#D4AF37]/20 relative group overflow-hidden">
          <div className="w-full h-full relative bg-[#D4AF37]">
             {/* Visual pattern simulation: Black blocks on gold background */}
             <div className="absolute inset-0 bg-[#0A0A0A] grid grid-cols-10 grid-rows-10">
               {Array.from({ length: 100 }).map((_, i) => (
                 <div key={i} className={`${(i * 13) % 7 === 0 || (i * 17) % 5 === 0 ? 'bg-transparent' : 'bg-[#0A0A0A]'} border-[0.5px] border-[#D4AF37]/5`} />
               ))}
             </div>
             <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-noise pointer-events-none" />
          </div>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />
        </div>

        {/* DID Display */}
        <div className="w-full bg-[#151515] p-3 rounded-sm border border-white/5 mb-6 flex items-center justify-between">
          <div className="flex flex-col flex-1 overflow-hidden pr-4">
            <span className="text-[#A9A9A9] font-mono text-[7px] tracking-[2px] uppercase mb-1">Identity_Identifier</span>
            <span className="text-white font-mono text-[9px] break-all tracking-tight opacity-70 leading-relaxed font-medium">
              {did}
            </span>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(did);
              // Simple web toast simulation
              console.log("DID copied to secure buffer");
            }}
            className="p-3 bg-[#1A1A1A] hover:bg-[#222] border-none rounded-sm transition-colors text-[#D4AF37] cursor-pointer shrink-0"
            title="Copy DID"
          >
            <Copy size={12} strokeWidth={1.5} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="bg-[#111] p-4 border-l-2 border-[#D4AF37]">
             <span className="text-[#A9A9A9] font-mono text-[7px] tracking-[2px] uppercase mb-2 block">Node_Uptime</span>
             <span className="text-white font-mono text-[11px] tabular-nums tracking-widest">347:12:05</span>
          </div>
          <div className="bg-[#111] p-4 border-l-2 border-white/5">
             <span className="text-[#A9A9A9] font-mono text-[7px] tracking-[2px] uppercase mb-2 block">Trust_Sovereignty</span>
             <span className="text-white font-mono text-[11px] tracking-widest uppercase">MPC_Tier_1</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-10">
        {/* Alias Section */}
        <div className="mb-12">
          <div className="text-[#A9A9A9] font-mono text-[9px] uppercase tracking-[2px] mb-4 opacity-60">Identity Alias</div>
          <div className="relative group">
             <input 
                type="text" 
                value={alias} 
                onChange={(e) => setAlias(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 py-3 text-white font-sans text-sm tracking-wide focus:border-[#D4AF37]/40 outline-none transition-all"
             />
             <span className="absolute right-0 bottom-3 text-[#D4AF37] font-mono text-[7px] tracking-[2px] uppercase opacity-40 group-focus-within:opacity-100">Modify</span>
          </div>
        </div>

        {/* Device Management Section (Refined) */}
        <div className="mb-10">
          <div className="text-[#A9A9A9] font-mono text-[9px] uppercase tracking-[2px] mb-6 opacity-60 flex justify-between items-center">
            <span>Authorized Nodes</span>
            <span className="text-[#D4AF37] opacity-100">{devices.length}</span>
          </div>
          <div className="space-y-4">
            {devices.map((dev) => (
              <div key={dev.id} className="flex justify-between items-center bg-[#0D0D0D] p-5 border border-white/5 rounded-sm">
                <div className="flex flex-col text-left">
                  <div className="text-[#FFFFFF] font-sans text-[13px] tracking-wide mb-1 opacity-90">
                    {dev.name}
                  </div>
                  <div className="text-[#A9A9A9] font-mono text-[8px] tracking-[1.5px] opacity-40 uppercase">
                    {dev.lastSeen} · {dev.ip}
                  </div>
                </div>
                {dev.isCurrent ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-[#D4AF37] animate-pulse" />
                    <span className="text-[#D4AF37] font-mono text-[8px] tracking-widest uppercase">Current</span>
                  </div>
                ) : (
                  <button className="text-[#EF4444] font-mono text-[8px] tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity border-none bg-transparent cursor-pointer">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button className="w-full border border-white/5 py-4 flex items-center justify-center space-x-3 hover:bg-white/5 transition-all bg-transparent cursor-pointer group">
          <Shield size={14} className="text-[#D4AF37]" />
          <span className="text-[#A9A9A9] group-hover:text-white font-mono text-[9px] uppercase tracking-[3px] transition-colors">
            Initialize Sovereign Key Migration
          </span>
        </button>
      </div>
      
    </div>
  );
};
