import React, { useState, useEffect, Component, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatList } from './components/mobile/ChatList';
import { Conversation } from './components/mobile/Conversation';
import { ProfileSettings } from './components/mobile/ProfileSettings';
import { MediaCall } from './components/mobile/MediaCall';
import { InitiateGroup } from './components/mobile/InitiateGroup';
import { PeerDiscovery } from './components/mobile/PeerDiscovery';
import { NodeRegistry } from './components/mobile/NodeRegistry';
import { MessageSquare, Users, Shield, ShieldAlert, Plus, Radar, Sun, Moon } from 'lucide-react';

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
            className="mt-8 border border-[#D4AF37]/20 px-6 py-2 text-[#D4AF37] font-mono text-[10px] uppercase tracking-[2px] active:bg-[#D4AF37]/10 bg-transparent cursor-pointer"
          >
            Hot_Reload_Kernel
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Mock Data
const MOCK_CONTACTS = [
  { did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76', name: 'CYBER_PUNK', online: true, lastCiphertext: '8f2a9b3c4d5e6f7a', paddingBucket: '512B', timestamp: '14:22', isGroup: false },
  { did: 'did:key:z6MkqY8xXyGZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg', name: 'NEURO_LINK', online: false, lastCiphertext: '1a2b3c4d5e6f7a8b', paddingBucket: '256B', timestamp: '11:05', isGroup: false },
  { did: 'CORE_SYNDICATE', name: 'CORE_SYNDICATE', online: true, lastCiphertext: 'c4d5e6f7a8b9c0d1', paddingBucket: '1KB', timestamp: 'YESTERDAY', isGroup: true, isIsolated: true },
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
  const [activeContact, setActiveContact] = useState<any>(null);
  const [overlayScreen, setOverlayScreen] = useState<'MediaCall' | 'InitiateGroup' | 'PeerDiscovery' | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
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

  const startMediaCall = () => {
    setOverlayScreen('MediaCall');
  };

  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center font-sans transition-colors duration-500">
      {/* Mobile Device Container */}
      <div className="w-[393px] h-[852px] bg-nexus-bg border-[12px] border-nexus-border rounded-[52px] overflow-hidden relative shadow-2xl flex flex-col transition-all duration-500">
        
        {/* Dynamic Header */}
        <div className="flex items-center justify-between px-8 pt-10 pb-4 bg-nexus-bg shrink-0 z-50">
          <div className="flex flex-col">
            <h1 className="text-nexus-ink font-mono text-[16px] font-black tracking-[4px] uppercase">
              {activeTab}
            </h1>
            <span className="text-nexus-ink-muted font-mono text-[8px] tracking-[2px] mt-1">PROTO::SOVEREIGN_V2</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-nexus-ink-muted hover:text-nexus-accent-gold transition-all duration-300 bg-transparent border-none cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {activeTab === 'CHATS' && (
               <div className="flex items-center space-x-6">
                 <button onClick={() => setOverlayScreen('InitiateGroup')} className="p-0 bg-transparent border-none text-nexus-accent-gold hover:scale-110 transition-transform cursor-pointer">
                   <Plus size={20} />
                 </button>
                 <button onClick={() => setOverlayScreen('PeerDiscovery')} className="p-0 bg-transparent border-none text-nexus-ink-muted hover:text-nexus-accent-gold transition-colors cursor-pointer">
                   <Radar size={18} />
                 </button>
               </div>
            )}
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-hidden relative bg-nexus-bg">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              {!isConversationOpen ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute inset-0 flex flex-col"
                >
                  {activeTab === 'CHATS' && (
                    <ChatList 
                      contacts={MOCK_CONTACTS} 
                      onLightningCall={startMediaCall} 
                      onSelectContact={handleSelectContact}
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
                      did="did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76" 
                      devices={MOCK_DEVICES} 
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="Conversation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute inset-0 z-50 flex flex-col bg-nexus-bg"
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

            {/* Overlays */}
            <AnimatePresence>
              {overlayScreen === 'MediaCall' && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-[600]"
                >
                  <MediaCall 
                    targetName={activeContact?.name || activeContact?.did || "EXTERNAL_NODE"} 
                    onEndCall={() => setOverlayScreen(null)} 
                  />
                </motion.div>
              )}
              {overlayScreen === 'PeerDiscovery' && (
                <PeerDiscovery 
                  onClose={() => setOverlayScreen(null)}
                  onConnected={(did) => {
                    setOverlayScreen(null);
                    console.log("HANDSHAKE SUCCESSFUL WITH:", did);
                  }}
                />
              )}
              {overlayScreen === 'InitiateGroup' && (
                <InitiateGroup 
                   contacts={MOCK_CONTACTS.filter(c => !c.isGroup)} 
                   onClose={() => setOverlayScreen(null)} 
                />
              )}
            </AnimatePresence>
          </ErrorBoundary>
        </div>

        {/* Bottom Tab Bar */}
        {!isConversationOpen && (
          <div className="h-[80px] bg-nexus-bg border-t border-nexus-border flex items-center justify-around px-8 pb-6 shrink-0 z-50">
            <TabItem 
              active={activeTab === 'CHATS'} 
              icon={<MessageSquare size={20} />} 
              label="CHATS" 
              onClick={() => setActiveTab('CHATS')} 
            />
            <TabItem 
              active={activeTab === 'NODES'} 
              icon={<Users size={20} />} 
              label="NODES" 
              onClick={() => setActiveTab('NODES')} 
            />
            <TabItem 
              active={activeTab === 'SOVEREIGNTY'} 
              icon={<Shield size={20} />} 
              label="CORE" 
              onClick={() => setActiveTab('SOVEREIGNTY')} 
            />
          </div>
        )}

        {/* Home Indicator */}
        <div className="h-[34px] w-full bg-nexus-bg flex items-center justify-center pb-2 shrink-0">
          <div className="w-[134px] h-[5px] bg-nexus-ink-muted rounded-full opacity-20" />
        </div>

      </div>
    </div>
  );
}

function TabItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center space-y-1 bg-transparent border-none cursor-pointer transition-all ${active ? 'text-nexus-accent-gold' : 'text-nexus-ink-muted'}`}
    >
      <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
        {icon}
      </div>
      <span className="font-mono text-[8px] tracking-[2px] font-black uppercase">{label}</span>
    </button>
  );
}
