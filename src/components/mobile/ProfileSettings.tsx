import React from 'react';

export const ProfileSettings = ({ did, devices }) => {
  return (
    <div className="flex-1 bg-[#0A0A0A] px-6 py-8 overflow-y-auto scrollbar-hide h-full flex flex-col">
      
      {/* Asset Isolation: Social Identity Only */}
      <div className="mb-12 shrink-0">
        <div className="text-[#A9A9A9] font-mono text-[9px] uppercase tracking-[2px] mb-3">
          Social Identity (Isolated)
        </div>
        <div className="text-[#FFFFFF] font-mono text-xs tracking-widest opacity-90 break-all">
          {did}
        </div>
      </div>

      {/* Progressive Decentralization Path */}
      <div className="mb-12 shrink-0">
        <div className="text-[#A9A9A9] font-mono text-[9px] uppercase tracking-[2px] mb-4">
          Sovereignty Level
        </div>
        <div className="bg-[#1A1A1A] p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#D4AF37] font-mono text-[10px] tracking-widest">LEVEL 1: MPC HOSTED</span>
            <div className="w-1.5 h-1.5 bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
          </div>
          <div className="text-[#A9A9A9] font-sans text-[11px] leading-relaxed mb-5 opacity-80">
            Root key split via 2-of-3 threshold. Fast recovery enabled via Secure Enclave and Cloud HSM.
          </div>
          
          <button className="w-full border border-[#D4AF37] py-3 flex items-center justify-center hover:bg-[#D4AF37]/10 transition-colors bg-transparent cursor-pointer">
            <span className="text-[#D4AF37] font-mono text-[9px] uppercase tracking-[2px]">
              Upgrade to Self-Custody
            </span>
          </button>
        </div>
      </div>

      {/* Device Audit (device-core interface) */}
      <div className="shrink-0 mb-8">
        <div className="text-[#A9A9A9] font-mono text-[9px] uppercase tracking-[2px] mb-4">
          Trusted Devices
        </div>
        {devices.map((dev) => (
          <div key={dev.id} className="flex justify-between items-center py-4 border-b border-[#1A1A1A]">
            <div className="flex flex-col text-left">
              <div className="text-[#FFFFFF] font-sans text-[13px] tracking-wide mb-1.5">
                {dev.name}
              </div>
              <div className="text-[#A9A9A9] font-mono text-[8px] tracking-widest opacity-60">
                LAST SEEN: {dev.lastSeen} | {dev.ip}
              </div>
            </div>
            {dev.isCurrent ? (
              <span className="text-[#D4AF37] font-mono text-[8px] tracking-widest">ACTIVE</span>
            ) : (
              <button className="hover:opacity-70 transition-opacity border-none bg-transparent cursor-pointer p-0">
                <span className="text-[#EF4444] font-mono text-[8px] tracking-widest">REVOKE</span>
              </button>
            )}
          </div>
        ))}
      </div>
      
    </div>
  );
};
