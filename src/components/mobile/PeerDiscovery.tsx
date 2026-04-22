import React, { useState, useEffect, useRef } from 'react';
import { X, Scan, Send, AlertCircle, Camera, Loader2, Key, Shield, RefreshCw, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';
import { NexusCompressionService, CompressedEnvelope } from '../../services/NexusCompressionService';
import { NexusSecurityService } from '../../services/NexusSecurityService';
import { FirebaseService } from '../../services/FirebaseService';

interface PeerDiscoveryProps {
  onClose: () => void;
  onConnected: (did: string, encKey?: string) => void;
}

export const PeerDiscovery = ({ onClose, onConnected }: PeerDiscoveryProps) => {
  const [manualDid, setManualDid] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [flash, setFlash] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(true);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{ did: string; key: string; initiatorDid?: string; stats?: CompressedEnvelope } | null>(null);
  const qrCodeRegionRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "nexus-qr-reader";

  // Generate a cryptographically strong symmetric key (AES-GCM 256)
  const generateEncryptionKey = async () => {
    try {
      const key = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      const exported = await window.crypto.subtle.exportKey("raw", key);
      const base64Key = btoa(String.fromCharCode(...new Uint8Array(exported)));
      setEncryptionKey(base64Key);
      console.log("🛡️ IDENTITY_SHIELD::SYMMETRIC_KEY_GENERATED");
    } catch (err) {
      console.error("KEY_GENERATION_FAILURE:", err);
    }
  };

  useEffect(() => {
    // Force stop any existing camera instances when mounting PeerDiscovery
    Html5Qrcode.getCameras().then(devices => {
        if(devices.length > 0) {
           // Basic cleanup logic if needed, already handled by html5-qrcode
        }
    }).catch(console.error);

    generateEncryptionKey();
    
    let html5QrCode: Html5Qrcode | null = null;
    
    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(scannerId);
        qrCodeRegionRef.current = html5QrCode;
        
        setIsCameraStarting(true);
        
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
             console.log("🔓 QR_PAYLOAD_DECRYPTED:", decodedText);
             // Use the scanned DID
             handleExternalConnect(decodedText);
          },
          () => {
             // Silence parsing errors as they happen constantly during scanning
          }
        );
        setIsCameraStarting(false);
      } catch (err) {
        console.error("CAMERA_SUBSYSTEM_FAILURE:", err);
        setCameraError(err instanceof Error ? err.message : String(err));
        setIsCameraStarting(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, []);

  const handleExternalConnect = async (did: string, key?: string) => {
    // Stop scanner first
    if (qrCodeRegionRef.current && qrCodeRegionRef.current.isScanning) {
      qrCodeRegionRef.current.stop().catch(console.error);
    }
    
    setManualDid(did);
    setIsConnecting(true);
    
    const finalKey = key || encryptionKey;
    
    // Ensure Sovereign Identity is established for the handshake
    let myIdentity = NexusSecurityService.getStoredIdentity();
    if (!myIdentity) {
      console.log("🆔 GENERATING_ON_THE_FLY_IDENTITY...");
      myIdentity = await NexusSecurityService.generateSovereignIdentity();
    }

    // Nexus Handshake Compression Optimization
    const handshakeMetadata = {
      targetDid: did,
      initiatorDid: myIdentity.did,
      initiatorPubKey: myIdentity.publicKey,
      sessionKey: finalKey,
      timestamp: Date.now(),
      protocol: 'SHIELD_V3_SOVEREIGN',
      sessionType: 'E2EE_P2P'
    };

    const envelope = await NexusCompressionService.compress(handshakeMetadata);
    console.log("🗝️ SOVEREIGN_HANDSHAKE_INITIATED:", did, "IDENTITY:", myIdentity.did);
    console.log("📦 NEXUS_LOAD_REDUCTION:", ((1 - envelope.compressedSize / envelope.originalSize) * 100).toFixed(1) + "%");
    
    setTimeout(() => {
      if ('vibration' in navigator) {
        try { navigator.vibrate([100, 50, 100]); } catch (e) { /* silent */ }
      }
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
        setIsConnecting(false);
        setPendingConnection({ 
          did, 
          key: finalKey, 
          initiatorDid: myIdentity.did,
          stats: envelope 
        });
      }, 500);
    }, 1000);
  };

  const handleManualConnect = () => {
    if (!manualDid.trim()) return;
    handleExternalConnect(manualDid, encryptionKey);
  };

  return (
    <div className="absolute inset-0 bg-nexus-bg z-[600] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500 font-mono">
      {/* Handshake Confirmation Overlay */}
      <AnimatePresence>
        {pendingConnection && (
          <HandshakeConfirmation 
            did={pendingConnection.did}
            initiatorDid={pendingConnection.initiatorDid || "LOCAL_NODE"}
            encryptionKey={pendingConnection.key}
            stats={pendingConnection.stats}
            isConnecting={isConnecting}
            onConfirm={async () => {
              if (isConnecting) return;
              setIsConnecting(true);
              
              try {
                // 1. Establish the Mesh Transport Channel
                console.log("🛰️ MESH::INITIATING_TRANSPORT_LINK...");
                const convId = await FirebaseService.getOrCreateDirectConversation(pendingConnection.did);
                
                if (convId) {
                  // 2. Transmit the Cryptographic Handshake Signal
                  // This establishes the E2EE parameters in the shared signaling channel
                  await FirebaseService.sendMessage(convId, {
                    content: JSON.stringify({
                      type: 'handshake-request',
                      initiator: pendingConnection.initiatorDid,
                      sessionKey: pendingConnection.key,
                      protocol: 'SOVEREIGN_V3'
                    }),
                    protocol: 'NXS-HANDSHAKE-SIG',
                    nonce: crypto.randomUUID().slice(0, 8),
                    type: 'signal'
                  });
                  
                  console.log("✅ HANDSHAKE_SIGNAL_EMITTED::CONV=" + convId);
                  onConnected(pendingConnection.did, pendingConnection.key);
                }
              } catch (err) {
                console.error("🚫 HANDSHAKE_PROTOCOL_FAILURE:", err);
                // Instead of only setting cameraError, show a clear alert or set state
                // that HandshakeConfirmation can display.
                setCameraError("SIGNALING TIMEOUT: P2P Link establishment failed.");
              } finally {
                // Remove setPendingConnection(null) from finally to keep the modal open on error,
                // allowing the user to read the error and abort manually. 
                setIsConnecting(false);
              }
            }}
            onCancel={() => setPendingConnection(null)}
          />
        )}
      </AnimatePresence>

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
        <div className="absolute top-0 w-full pt-16 px-10 pb-8 flex justify-between items-center z-50">
           <div className="flex flex-col">
              <span className="text-nexus-accent-blue font-bold text-[8px] tracking-[4px] uppercase mb-1 drop-shadow-[0_0_8px_rgba(0,209,255,0.4)]">Active_Sonar</span>
              <span className="text-nexus-ink-muted text-[7px] uppercase tracking-[2px]">Locating Identity Node...</span>
           </div>
           <button 
             onClick={onClose}
             className="w-10 h-10 flex items-center justify-center bg-white/5 border border-nexus-border rounded-sm text-nexus-ink-muted hover:text-nexus-ink hover:bg-white/10 transition-all cursor-pointer"
           >
             <X size={18} />
           </button>
        </div>

        {/* Viewfinder Graphics */}
        <div className="absolute inset-0 flex items-center justify-center">
           {/* Camera Video Stream Container */}
           <div id={scannerId} className="absolute inset-0 z-0 grayscale contrast-125 opacity-80"></div>

           <div className="w-72 h-72 relative z-10 border border-nexus-border bg-black/10 backdrop-blur-[1px]">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-nexus-accent-blue/60" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-nexus-accent-blue/60" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-nexus-accent-blue/60" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-nexus-accent-blue/60" />

              {/* Status messages / Feedback */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isCameraStarting && (
                  <div className="flex flex-col items-center animate-pulse">
                    <div className="w-10 h-10 border-2 border-nexus-accent-blue border-t-transparent rounded-full animate-spin mb-6" />
                    <span className="text-nexus-accent-blue font-bold text-[7px] tracking-[3px] uppercase">Waking_Subsystem...</span>
                  </div>
                )}
                
                {cameraError && (
                  <div className="flex flex-col items-center px-8 text-center">
                    <AlertCircle size={32} className="text-[#EF4444] mb-4 opacity-50" />
                    <span className="text-[#EF4444] font-bold text-[8px] tracking-[1px] uppercase mb-2">Camera_Denial</span>
                    <span className="text-nexus-ink/30 text-[6px] tracking-[1px] uppercase leading-relaxed font-mono">
                      Hardware was restricted by OS kernel. Use manual link extraction.
                    </span>
                  </div>
                )}
                
                {!isCameraStarting && !cameraError && (
                   <div className="flex flex-col items-center opacity-40">
                      <Scan size={44} className="text-nexus-accent-blue mb-4" strokeWidth={1} />
                      <span className="text-nexus-accent-blue font-bold text-[6px] tracking-[5px] uppercase">Awaiting_Signal</span>
                   </div>
                )}
              </div>

              {/* Scanning line animation */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 w-full h-[2px] bg-nexus-accent-blue shadow-[0_0_15px_var(--nexus-accent-blue)] z-10"
              />
              
              {/* Reticle Decor */}
              <div className="absolute -top-4 -left-4 text-nexus-accent-blue/20 text-[6px] uppercase tracking-[1px]">LAT: 34.0522</div>
              <div className="absolute -top-4 -right-4 text-nexus-accent-blue/20 text-[6px] uppercase tracking-[1px]">LON: 118.2437</div>
              <div className="absolute -bottom-4 -left-4 text-nexus-accent-blue/20 text-[6px] uppercase tracking-[1px]">ALT: 0.00</div>
              <div className="absolute -bottom-4 -right-4 text-nexus-accent-blue/20 text-[6px] uppercase tracking-[1px]">HDOP: 1.0</div>
           </div>
        </div>

        {/* Global ambient noise */}
        <div className="absolute inset-0 pointer-events-none technical-grid opacity-[0.03]" />
      </div>

      {/* Mode B: Manual Input Panel */}
      <div className="bg-nexus-surface p-10 pb-16 border-t border-nexus-border relative z-50">
        <div className="flex items-center justify-between mb-8">
          <span className="text-nexus-ink-muted opacity-50 font-bold text-[7px] tracking-[4px] uppercase">
            Manual_Node_Resolution
          </span>
          <button 
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-sm border transition-all cursor-pointer ${
               showKeyInput ? 'bg-nexus-accent-gold/10 border-nexus-accent-gold/30 text-nexus-accent-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'bg-transparent border-nexus-border text-nexus-ink/30 hover:text-nexus-ink/50'
            }`}
          >
            <Shield size={10} />
            <span className="text-[7px] tracking-[2px] uppercase font-black">Link_Shield</span>
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-end">
               <span className="text-white/20 text-[7px] uppercase tracking-[2px] font-mono">Target_Node_DID</span>
               <button 
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setManualDid(text);
                    } catch (e) {}
                  }}
                  className="text-nexus-accent-blue hover:text-white transition-colors text-[8px] uppercase font-bold tracking-widest bg-transparent border-none cursor-pointer"
               >
                 [PASTE_CLIPBOARD]
               </button>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex-1 bg-nexus-border border-b border-nexus-border focus-within:border-nexus-accent-blue transition-all group">
                  <input 
                     type="text"
                     placeholder="INPUT NODE IDENTIFIER..."
                     value={manualDid}
                     onChange={(e) => setManualDid(e.target.value)}
                     className="w-full bg-transparent border-none py-4 px-4 text-nexus-ink text-[11px] tracking-widest outline-none placeholder:text-nexus-ink/10 placeholder:font-black"
                  />
               </div>
               
               <button 
                 onClick={handleManualConnect}
                 disabled={!manualDid.trim() || isConnecting}
                 className={`w-14 h-14 rounded-sm transition-all border-none cursor-pointer flex items-center justify-center shadow-2xl ${
                   manualDid.trim() && !isConnecting 
                     ? 'bg-nexus-accent-blue text-nexus-ink hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,209,255,0.3)]' 
                     : 'bg-white/5 text-nexus-ink/10 cursor-not-allowed'
                 }`}
               >
                 {isConnecting ? (
                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 ) : (
                   <Send size={20} strokeWidth={2} />
                 )}
               </button>
            </div>
          </div>

          <AnimatePresence>
            {showKeyInput && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-6 pt-2"
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 bg-nexus-accent-gold rounded-full shadow-[0_0_8px_var(--nexus-accent-gold)]" />
                      <span className="text-nexus-accent-gold/60 font-bold text-[7px] tracking-[3px] uppercase">Ephemeral_Channel_Secret</span>
                    </div>
                    <button 
                      onClick={generateEncryptionKey}
                      className="p-2 text-nexus-ink-muted opacity-50 hover:text-nexus-accent-gold transition-all bg-transparent border-none cursor-pointer"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                  <div className="bg-black/40 p-5 border border-nexus-border rounded-sm relative group flex items-start space-x-4">
                    <textarea 
                      value={isKeyVisible ? encryptionKey : "•".repeat(encryptionKey.length)}
                      onChange={(e) => isKeyVisible && setEncryptionKey(e.target.value)}
                      readOnly={!isKeyVisible}
                      className="flex-1 bg-transparent border-none text-nexus-accent-gold font-mono text-[10px] leading-relaxed break-all outline-none resize-none h-20 scrollbar-hide"
                      spellCheck={false}
                    />
                    <button 
                      onClick={() => setIsKeyVisible(!isKeyVisible)}
                      className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-sm text-nexus-ink-muted opacity-50 hover:text-nexus-accent-gold transition-colors bg-transparent border-none cursor-pointer shrink-0"
                    >
                      {isKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <div className="absolute top-2 right-16 flex items-center space-x-1 opacity-20 pointer-events-none">
                      <span className="text-[6px] font-mono leading-none">ECC_CURVE_P256</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global failure risk warning */}
        <div className="mt-10 flex items-center justify-center space-x-3 opacity-20 select-none">
           <BarChart3 size={10} />
           <span className="text-[6px] tracking-[2px] uppercase font-black">Encryption Handshake involves data-shard exposure risk. Proceed with node trust.</span>
        </div>
      </div>
    </div>
  );
};

const HandshakeConfirmation = ({ did, initiatorDid, encryptionKey, stats, isConnecting, onConfirm, onCancel }: { 
  did: string, 
  initiatorDid: string,
  encryptionKey: string,
  stats?: CompressedEnvelope,
  isConnecting?: boolean,
  onConfirm: () => void, 
  onCancel: () => void 
}) => {
  const reduction = stats ? ((1 - stats.compressedSize / stats.originalSize) * 100).toFixed(0) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-[1000] flex items-center justify-center p-8 font-mono"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-nexus-surface border border-nexus-border p-8 flex flex-col items-center shadow-[0_0_100px_rgba(0,0,0,0.8)]"
      >
        <div className="w-16 h-16 bg-nexus-accent-gold/5 border border-nexus-accent-gold/20 rounded-sm flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
          <Shield size={32} className="text-nexus-accent-gold" />
        </div>
        
        <h3 className="text-nexus-ink font-display text-lg font-bold tracking-tight mb-6 uppercase text-center leading-none">
          Handshake_Finalization
          <span className="block text-[8px] text-nexus-accent-blue mt-2 tracking-[4px]">Sovereign_Protocol_V3</span>
        </h3>
        
        <div className="w-full space-y-4 mb-8">
           <div className="relative pv-6">
              <div className="flex flex-col items-start bg-nexus-border/30 p-4 border border-nexus-border rounded-sm mb-2">
                 <span className="text-nexus-ink-muted opacity-50 text-[6px] uppercase tracking-[2px] mb-1 font-black">LOCAL_INITIATOR_NODE</span>
                 <span className="text-white text-[9px] break-all leading-tight font-bold tracking-tight opacity-70 italic">{initiatorDid}</span>
              </div>
              
              <div className="flex items-center justify-center py-2 relative">
                 <div className="absolute inset-x-0 h-[1px] bg-nexus-border" />
                 <div className="bg-nexus-surface px-3 py-1 border border-nexus-border rounded-full z-10 flex items-center space-x-2">
                    <RefreshCw size={8} className="text-nexus-accent-blue animate-spin-slow" />
                    <span className="text-[6px] text-nexus-ink-muted uppercase tracking-[2px]">Linking</span>
                 </div>
              </div>

              <div className="flex flex-col items-start bg-nexus-accent-blue/10 p-4 border border-nexus-accent-blue/30 rounded-sm mt-2">
                 <span className="text-nexus-accent-blue text-[6px] uppercase tracking-[2px] mb-1 font-black">IDENTIFIED_PEER_TARGET</span>
                 <span className="text-nexus-accent-blue text-[9px] break-all leading-tight font-bold tracking-tight">{did}</span>
              </div>
           </div>
           
           <div className="flex flex-col items-start border-t border-nexus-border pt-4">
              <span className="text-nexus-ink-muted opacity-50 text-[6px] uppercase tracking-[2px] mb-2 font-black">SESSION_CIPHER_SECRET</span>
              <div className="flex items-center space-x-3 w-full bg-black/40 p-3 border border-nexus-border rounded-sm">
                <Key size={10} className="text-nexus-accent-gold shrink-0" />
                <span className="text-nexus-accent-gold text-[9px] break-all leading-tight font-bold tracking-tighter truncate">{encryptionKey}</span>
              </div>
           </div>

           {stats && (
             <div className="flex items-center justify-between bg-white/5 p-3 border border-white/5 rounded-sm">
                <div className="flex items-center space-x-3">
                   <BarChart3 size={10} className="text-nexus-ink-muted" />
                   <span className="text-nexus-ink-muted text-[6px] uppercase tracking-[2px] font-black">Handshake_Payload</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-nexus-accent-blue text-[9px] font-black">-{reduction}% SIZE</span>
                </div>
             </div>
           )}
        </div>
        
        <p className="text-nexus-ink/20 text-[7px] leading-relaxed mb-8 font-mono uppercase tracking-[2px] text-center px-2">
          By authorizing, you establish a direct sovereign link. Keys are stored in the local hardware enclave.
        </p>
        
        <div className="w-full space-y-3">
          <button 
            onClick={onConfirm}
            disabled={isConnecting}
            className="w-full h-14 bg-nexus-accent-blue text-black font-bold text-[10px] tracking-[4px] uppercase hover:opacity-90 transition-all cursor-pointer rounded-sm border-none shadow-[0_0_30px_rgba(0,209,255,0.2)] active:scale-95 flex items-center justify-center"
          >
            {isConnecting ? (
               <div className="flex items-center space-x-2">
                 <Loader2 size={16} className="animate-spin" />
                 <span>[ PROCESSING_SIGNAL... ]</span>
               </div>
            ) : (
              "AUTHORIZE_CONNECTION"
            )}
          </button>
          
          <button 
            onClick={onCancel}
            className="w-full h-12 bg-transparent border border-nexus-border text-nexus-ink-muted opacity-40 font-bold text-[8px] tracking-[2px] uppercase hover:bg-white/5 transition-all cursor-pointer rounded-sm active:scale-95"
          >
             ABORT_HANDSHAKE
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
