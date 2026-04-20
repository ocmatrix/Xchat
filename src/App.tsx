import React, { useState, useEffect, Component, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatList } from './components/mobile/ChatList';
import { Conversation } from './components/mobile/Conversation';
import { ProfileSettings } from './components/mobile/ProfileSettings';
import { MediaCall } from './components/mobile/MediaCall';
import { InitiateGroup } from './components/mobile/InitiateGroup';
import { PeerDiscovery } from './components/mobile/PeerDiscovery';
import { NodeRegistry } from './components/mobile/NodeRegistry';
import { AuditoriumMeeting } from './components/mobile/AuditoriumMeeting';
import { SecuritySetup } from './components/mobile/SecuritySetup';
import { MessageSquare, Users, Shield, ShieldAlert, Plus, Radar, Sun, Moon, Battery, Wifi, Signal, Activity, Cpu, Hexagon } from 'lucide-react';

// Global Safety Shim for Sovereign Node Environment
if (typeof window !== 'undefined') {
  // Gracefully handle cross-origin Location access errors in iframe environments
  try {
    // This is a common pattern to mitigate cross-origin errors in nested frames
    if (window.parent !== window) {
      // Just being cautious to ensure location.origin doesn't throw if accessed
      // in certain sandboxed contexts
      console.log("NODE_KERNEL::SANDBOX_DETECTION_ACTIVE");
    }
  } catch (e) {
    // Ignore cross-origin access errors
  }
}

// ... (ErrorBoundary remains the same, I'll keep it for stability)
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  // ... (keeping existing ErrorBoundary code)
  declare state: { hasError: boolean };
  declare props: { children: ReactNode };

  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    // Safely check error message to avoid recursive cross-origin issues
    const errorMessage = error?.message || String(error);
    if (!errorMessage.includes("origin' from 'Location'")) {
      console.error("ErrorBoundary caught:", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center border-[8px] border-[#1A1A1A] rounded-[40px] overflow-hidden">
          <ShieldAlert size={48} className="text-[#EF4444] mb-4 opacity-50" />
          <h2 className="text-[#D4AF37] font-mono text-xs tracking-[4px] uppercase mb-4">Kernel_Panic</h2>
          <p className="text-[#A9A9A9] font-mono text-[8px] tracking-[1.5px] uppercase opacity-40 leading-loose">
            Environmental integrity compromised. <br/>
            Attempting automatic node recovery...
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 border border-black/20 px-6 py-2 text-black font-sans text-xs font-semibold uppercase tracking-wider active:bg-black/10 bg-transparent cursor-pointer rounded-full"
          >
            Hot Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Mock Data
export const MOCK_CONTACTS = [
  { 
    did: 'CORE_SYNDICATE', 
    name: 'CORE_SYNDICATE', 
    online: true, 
    lastCiphertext: 'Protocol: No logs retained.', 
    paddingBucket: '1KB', 
    timestamp: '9:41 AM', 
    isGroup: true, 
    isIsolated: true,
    unreadCount: 3,
    avatar: 'https://picsum.photos/seed/p3/200/200'
  },
  { 
    did: 'CONCURRENCY_TEST_LAB', 
    name: 'AUDITORIUM_TEST_NET', 
    online: true, 
    lastCiphertext: 'Simulating 100+ active peers...', 
    paddingBucket: '4KB', 
    timestamp: 'NOW', 
    isGroup: true, 
    isIsolated: false,
    unreadCount: 99,
    avatar: 'https://picsum.photos/seed/testnet/200/200'
  },
  { 
    did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76', 
    name: 'CYBER_PUNK', 
    online: true, 
    lastCiphertext: 'Handshake successful. Ready.', 
    paddingBucket: '512B', 
    timestamp: 'Yesterday', 
    isGroup: false,
    unreadCount: 1,
    avatar: 'https://picsum.photos/seed/p1/200/200'
  },
  { 
    did: 'did:key:z6MkqY8xXyGZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg', 
    name: 'NEURO_LINK', 
    online: false, 
    lastCiphertext: 'Payload received, awaiting decrypt.', 
    paddingBucket: '256B', 
    timestamp: 'Monday', 
    isGroup: false,
    unreadCount: 0,
    avatar: 'https://picsum.photos/seed/p2/200/200'
  }
];

const MOCK_MESSAGES = [
  { id: '1', text: '[SYSTEM] MLS Epoch advanced to #43. Key tree rotated.', type: 'system', mlsEpoch: '4A9E' },
  { id: '2', text: 'Initiating secure channel. Double Ratchet state synchronized.', sender: 'them', mlsEpoch: '4A9F' },
  { id: '3', text: 'https://picsum.photos/seed/cyber/800/600', sender: 'them', type: 'image', mlsEpoch: '4A9F' },
  { id: '4', text: 'Acknowledged. Key material rotated. Ready for transmission.', sender: 'me', mlsEpoch: '4A9F' },
  { id: '5', text: 'Sending payload chunk 1/3...', sender: 'them', mlsEpoch: '4AA0' },
];

const MOCK_DEVICES = [
  { id: '1', name: 'Primary Node (iPhone 14 Pro)', lastSeen: 'NOW', ip: '192.168.1.42', isCurrent: true },
  { id: '2', name: 'Backup Node (MacBook Pro)', lastSeen: '2 HOURS AGO', ip: '10.0.0.15', isCurrent: false },
];

type MainTab = 'CHATS' | 'NODES' | 'SOVEREIGNTY';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('CHATS');
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [myDid, setMyDid] = useState("");
  const [activeContact, setActiveContact] = useState<any>(null);
  const [overlayScreen, setOverlayScreen] = useState<'MediaCall' | 'InitiateGroup' | 'PeerDiscovery' | 'AuditoriumMeeting' | null>(null);
  const [callParticipantsCount, setCallParticipantsCount] = useState(1);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    }
  }, [theme]);

  const handleSelectContact = (contact: any) => {
    setActiveContact(contact);
    setIsConversationOpen(true);
  };

  const handleBack = () => {
    setIsConversationOpen(false);
    setActiveContact(null);
  };

  const handleSetupComplete = (did: string) => {
    setMyDid(did);
    setIsInitialized(true);
  };

  const startMediaCall = () => {
    if (activeContact && activeContact.isGroup) {
      setOverlayScreen('AuditoriumMeeting');
    } else {
      setOverlayScreen('MediaCall');
    }
  };

  return (
    <div className="min-h-screen w-full bg-nexus-bg flex items-center justify-center font-sans transition-colors duration-500">
      {/* Container - Institutional Digital Hub Redesign */}
      <div className="w-full h-[100dvh] sm:w-[393px] sm:h-[852px] bg-nexus-bg flex flex-col relative sm:border sm:border-nexus-border sm:rounded-[6px] overflow-hidden transition-colors duration-500 shadow-2xl">
        
        {/* Header Area - Highly Compressed stacked rows */}
        {!isConversationOpen && (
          <div className="sticky top-0 z-[150] w-full bg-nexus-surface border-b border-nexus-border flex flex-col pt-10 pb-0 px-4 transition-colors duration-500">
            
            {/* Row 1: Title & Icons */}
            <div className="flex justify-between items-center w-full">
               <h1 className="text-[22px] font-black text-nexus-ink uppercase tracking-tighter leading-none mb-0 font-sans">
                 DOTCOM
               </h1>
               <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-nexus-ink-muted hover:text-nexus-ink hover:bg-nexus-ink/5 transition-all cursor-pointer active:scale-90"
                  >
                    {theme === 'dark' ? <Sun size={13} strokeWidth={2.5} /> : <Moon size={13} strokeWidth={2.5} />}
                  </button>
                  <button 
                    className="w-7 h-7 flex items-center justify-center rounded-full text-nexus-accent-blue hover:text-nexus-accent-blue hover:bg-nexus-accent-blue/5 transition-all cursor-pointer active:scale-90"
                  >
                    <Activity size={13} strokeWidth={2.5} />
                  </button>
               </div>
            </div>
            
            {/* Row 2: Encrypted Status - Flush beneath title */}
            <div className="flex items-center space-x-1.5 mt-[1px] leading-none py-0">
               <div className="w-1.5 h-1.5 bg-nexus-accent-cyan rounded-full shadow-[0_0_8px_rgba(0,209,255,0.6)] shrink-0"></div>
               <span className="text-nexus-accent-blue text-[8.5px] tracking-[1.5px] uppercase font-black font-sans leading-none">ENCRYPTED_SYNC</span>
            </div>

            {/* Row 3: Telemetry Codes - Flush beneath status */}
            <div className="flex items-center space-x-2 font-mono font-black py-[2px] leading-none">
                <span className="text-nexus-ink-alt text-[8px]">L: 14MS</span>
                <span className="text-nexus-ink-alt text-[8px]">S: 0x4B2</span>
            </div>

            {/* Compressed Search Bar - height < 32px */}
            <div className="mt-1 pb-2">
               <div className="relative flex items-center group w-full bg-nexus-bg border border-nexus-border rounded-[2px] h-[30px] px-3">
                  <div className="text-nexus-ink-muted opacity-60 mr-2 shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search..."
                    className="w-full bg-transparent border-none text-[11px] outline-none text-nexus-ink placeholder:text-nexus-ink-muted/30 font-sans"
                  />
               </div>
            </div>
          </div>
        )}

        {/* Screen Content - Zero Waste */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-nexus-bg transition-colors duration-500">
          {!isInitialized ? (
            <SecuritySetup onComplete={handleSetupComplete} />
          ) : (
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                {!isConversationOpen ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex-col flex shrink-0 min-h-max pb-[50px]"
                  >
                    {activeTab === 'CHATS' && (
                      <ChatList 
                        contacts={MOCK_CONTACTS} 
                        onLightningCall={startMediaCall} 
                        onSelectContact={handleSelectContact}
                        onNavigateToNodes={() => setActiveTab('NODES')}
                      />
                    )}
                    {activeTab === 'NODES' && (
                      <NodeRegistry 
                        contacts={MOCK_CONTACTS.filter(c => !c.isGroup)} 
                        onDiscovery={() => setOverlayScreen('PeerDiscovery')}
                      />
                    )}
                    {activeTab === 'SOVEREIGNTY' && (
                      <ProfileSettings 
                        did={myDid || "did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76"} 
                        devices={MOCK_DEVICES} 
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="Conversation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full shrink-0 min-h-full z-50 flex flex-col bg-nexus-bg"
                  >
                    <Conversation 
                      messages={MOCK_MESSAGES} 
                      onLightningCall={startMediaCall}
                      onBack={handleBack}
                      isGroup={activeContact?.isGroup}
                      isIsolated={activeContact?.isIsolated}
                      targetName={activeContact?.name || (activeContact?.did.includes(':') ? `${activeContact.did.slice(0, 12)}...` : activeContact?.did)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ErrorBoundary>
          )}
        </div>

        {/* Bottom Tab Bar - Translucent Frosted Glass */}
        {!isConversationOpen && (
          <div className="h-[46px] w-full bg-nexus-surface/80 backdrop-blur-3xl border-t border-nexus-border flex items-start justify-around px-2 shrink-0 z-[200] absolute bottom-0 left-0 transition-colors duration-500">
             
             <TabItem 
              active={activeTab === 'CHATS'} 
              icon={<MessageSquare size={14} strokeWidth={2.5} />} 
              label="CHANNELS" 
              badge={3} 
              onClick={() => setActiveTab('CHATS')} 
            />
            <TabItem 
              active={activeTab === 'NODES'} 
              icon={<Cpu size={14} strokeWidth={2.5} />} 
              label="NODES" 
              onClick={() => setActiveTab('NODES')} 
            />
            <TabItem 
              active={activeTab === 'SOVEREIGNTY'} 
              icon={<Hexagon size={14} strokeWidth={2.5} />} 
              label="CORE" 
              onClick={() => setActiveTab('SOVEREIGNTY')} 
            />
          </div>
        )}

        {/* Home Indicator */}
        <div className="hidden sm:flex absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[60px] h-[3px] bg-nexus-ink/5 rounded-full z-[210] pointer-events-none" />

        {/* Overlays (Secure Layers) */}
        <AnimatePresence>
          {overlayScreen === 'MediaCall' && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(20px)' }}
              exit={{ opacity: 0, scale: 0.9, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 z-[600]"
            >
              <MediaCall 
                targetName={activeContact?.name || activeContact?.did || "EXTERNAL_NODE"} 
                participantCount={callParticipantsCount}
                onEndCall={() => {
                  setOverlayScreen(null);
                  setCallParticipantsCount(1);
                }} 
              />
            </motion.div>
          )}
          {overlayScreen === 'AuditoriumMeeting' && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(20px)' }}
              exit={{ opacity: 0, scale: 0.9, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 z-[600]"
            >
              <AuditoriumMeeting
                roomName={activeContact?.name || "ENCRYPTED GROUP"}
                initialRole="HOST"
                onDisconnect={() => setOverlayScreen(null)}
              />
            </motion.div>
          )}
          {overlayScreen === 'PeerDiscovery' && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute inset-0 z-[600]"
            >
               <PeerDiscovery 
                 onClose={() => setOverlayScreen(null)}
                 onConnected={(did, encKey) => {
                   setOverlayScreen(null);
                   console.log("HANDSHAKE SUCCESSFUL WITH:", did);
                   if (encKey) {
                     console.log("🛡️ SESSION_ENCRYPTION_ACTIVE:", encKey.slice(0, 12) + "...");
                   }
                 }}
               />
            </motion.div>
          )}
          {overlayScreen === 'InitiateGroup' && (
            <motion.div 
               initial={{ opacity: 0, y: 852 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 852 }}
               className="absolute inset-0 z-[600]"
            >
               <InitiateGroup 
                  contacts={MOCK_CONTACTS.filter(c => !c.isGroup)} 
                  onClose={() => setOverlayScreen(null)} 
                  onStartCall={(peers) => {
                    setCallParticipantsCount(peers.length + 1);
                    setOverlayScreen('MediaCall');
                  }}
               />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function TabItem({ active, icon, label, badge = 0, onClick }: { active: boolean, icon: React.ReactNode, label: string, badge?: number, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-start pt-1 space-y-0.5 bg-transparent border-none cursor-pointer relative px-0 h-full z-10 transition-colors rounded-none w-full max-w-[80px]"
    >
      <div className={`relative ${active ? 'text-nexus-accent-blue' : 'text-nexus-ink-muted'}`}>
        <div className={`transition-all ${active ? 'scale-110 drop-shadow-[0_0_12px_var(--nexus-accent-blue)]' : 'scale-90 opacity-50'}`}>
           {icon}
        </div>
        {badge > 0 && (
          <div className="absolute -top-1 -right-2 bg-[#FF3B30] text-white font-sans font-black text-[6px] w-[11px] h-[11px] flex items-center justify-center rounded-sm z-10 shadow-[0_0_8px_rgba(255,59,48,0.3)]">
            {badge}
          </div>
        )}
      </div>
      <span className={`font-sans text-[8px] font-bold tracking-[3px] uppercase transition-colors leading-none ${active ? 'text-nexus-accent-blue' : 'text-nexus-ink-muted opacity-50'}`}>
        {label}
      </span>
      {active && (
         <motion.div 
           layoutId="activeTabIndicator"
           className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-nexus-accent-blue shadow-[0_0_10px_var(--nexus-accent-blue)]" 
         />
      )}
    </button>
  );
}


