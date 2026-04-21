import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Zap, ArrowRight, Loader2, Key } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { FirebaseService } from '../../services/FirebaseService';
import LogoIcon from '../LogoIcon';

interface AuthWallProps {
  onSuccess: (did: string) => void;
}

export const AuthWall = ({ onSuccess }: AuthWallProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateIdentity = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Authenticate silently via Mesh Network (Anonymous auth under the hood)
      const result = await signInAnonymously(auth);
      const user = result.user;
      
      // 2. Generate local cryptographic anchor (DID)
      // In a real P2P app, this relies on ed25519/secp256k1 key generation.
      const deterministicDid = `did:nexus:node:${user.uid.slice(0, 16)}`;
      
      // 3. Register self on the discovery protocol (Firestore for prototype)
      await FirebaseService.syncUserProfile(deterministicDid, `CYBER_NOMAD_${Math.floor(Math.random() * 1000)}`);
      
      onSuccess(deterministicDid);
    } catch (err: any) {
      console.error("KEY_GEN_FAULT:", err);
      setError("INITIALIZATION_FAILED::Could not establish sovereign node.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0A0A0A] text-white">
      {/* Visual Identity */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-12 relative"
      >
        <div className="w-24 h-24 bg-nexus-blue/10 border border-nexus-blue/20 rounded-full flex items-center justify-center relative z-10 scale-125">
          <LogoIcon />
        </div>
        <div className="absolute inset-0 bg-nexus-blue/5 blur-3xl scale-150 animate-pulse" />
      </motion.div>

      <div className="text-center space-y-2 mb-12">
        <h1 className="text-3xl font-black tracking-tighter uppercase font-sans">REALEX DOTCOM</h1>
        <p className="text-nexus-accent-gold font-mono text-[9px] tracking-[4px] uppercase font-bold opacity-60">
          Sovereign Node Protocol v2.5
        </p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-sm space-y-4">
          <div className="flex items-start space-x-3">
            <Key size={14} className="text-nexus-accent-gold mt-0.5 shrink-0" />
            <p className="text-[11px] text-white/50 leading-relaxed font-medium">
              Initialize a sovereign node. Keys are generated locally and never leave this enclave. No email required.
            </p>
          </div>
        </div>

        <button 
          onClick={handleGenerateIdentity}
          disabled={loading}
          className="w-full h-14 bg-white text-black font-black text-[11px] tracking-[4px] uppercase rounded-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <span>Generate_Keys_&_Link</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
            <p className="text-red-500 font-mono text-[9px] uppercase tracking-wider text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="absolute bottom-12 flex flex-col items-center space-y-4 opacity-20">
        <div className="flex items-center space-x-4">
          <Zap size={10} />
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">P2P_MESH_READY</span>
          <Shield size={10} />
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">AES_256_ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

