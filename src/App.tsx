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
import { MessageSquare, Users, Shield, ShieldAlert, Plus, Radar, Sun, Moon, Battery, Wifi, Signal, Activity, Cpu, Hexagon, Search, UserPlus, X } from 'lucide-react';

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

type MainTab = 'LATEST' | 'ONLINE' | 'A-Z';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('LATEST');
  const [currentView, setCurrentView] = useState<'CHAT' | 'NODES' | 'SECURITY'>('CHAT'); // ADDED
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [myDid, setMyDid] = useState("");
  const [activeContact, setActiveContact] = useState<any>(null);
  const [overlayScreen, setOverlayScreen] = useState<'MediaCall' | 'InitiateGroup' | 'PeerDiscovery' | 'AuditoriumMeeting' | null>(null);
  const [callParticipantsCount, setCallParticipantsCount] = useState(1);
  const [callMode, setCallMode] = useState<'audio' | 'video'>('video');
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

  const startMediaCall = (mode: 'audio' | 'video' = 'video') => {
    setCallMode(mode);
    if (activeContact && activeContact.isGroup) {
      setOverlayScreen('AuditoriumMeeting');
    } else {
      setOverlayScreen('MediaCall');
    }
  };

  const filteredContacts = MOCK_CONTACTS.filter(c => {
    if (activeTab === 'ONLINE') return c.online;
    return true;
  }).sort((a, b) => {
    if (activeTab === 'A-Z') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className={`min-h-screen w-full flex items-center justify-center font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-[#000000]' : 'bg-[#F2F2F7]'}`}>
      {/* Container - iOS Device Architecture */}
      <div className={`w-full h-[100dvh] sm:w-[393px] sm:h-[852px] ${theme === 'dark' ? 'bg-[#000000]' : 'bg-[#F2F2F7]'} flex flex-col relative sm:border-[8px] sm:border-black dark:sm:border-white/20 sm:rounded-[44px] overflow-hidden transition-colors duration-300 sm:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]`}>
        
        {/* Dynamic Island / Notch Space (Mock) */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[20px] z-[9999]"></div>

        {/* iOS Navigation Bar */}
        {isInitialized && !isConversationOpen && (
          <div className="absolute top-0 left-0 right-0 z-[5000] w-full bg-nexus-surface/90 backdrop-blur-xl border-b border-nexus-border flex flex-col transition-all duration-300">
            <div className="h-[44px] sm:mt-[30px] flex items-center justify-between px-4 relative">
              {/* Left Action */}
              <button className="text-nexus-accent-blue font-medium text-[17px] active:opacity-70 transition-opacity">
                Edit
              </button>
              
              {/* Title */}
              <h1 className="text-[17px] font-semibold text-nexus-ink absolute left-1/2 -translate-x-1/2">
                {currentView === 'CHAT' ? 'Chats' : currentView === 'NODES' ? 'Radar' : 'Settings'}
              </h1>
              
              {/* Right Actions */}
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                  className="text-nexus-accent-blue active:opacity-70 transition-opacity flex items-center"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {currentView === 'CHAT' && (
                  <button className="text-nexus-accent-blue active:opacity-70 transition-opacity flex items-center">
                    <Plus size={24} />
                  </button>
                )}
              </div>
            </div>

            {/* iOS Search Bar (Only on CHAT) */}
            {currentView === 'CHAT' && (
              <div className="px-4 pb-2 pt-1">
                <div className="h-9 bg-black/5 dark:bg-white/10 rounded-[10px] flex items-center px-2 space-x-1.5">
                  <Search size={16} className="text-nexus-ink-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-[17px] text-nexus-ink placeholder:text-nexus-ink-muted"
                    placeholder="Search"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-nexus-ink-muted hover:text-nexus-ink bg-black/10 dark:bg-white/20 rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screen Content */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col transition-colors duration-300 
          ${!isConversationOpen ? 
            (isInitialized ? (currentView === 'CHAT' ? 'pt-[134px] sm:pt-[164px]' : 'pt-[44px] sm:pt-[74px]') : 'pt-0') 
            : 'pt-0'} pb-[83px]`}
        >
          {!isInitialized ? (
            <SecuritySetup onComplete={handleSetupComplete} />
          ) : (
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                {!isConversationOpen ? (
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex-col flex shrink-0 min-h-max"
                  >
                    {currentView === 'CHAT' && (
                      <ChatList 
                        contacts={filteredContacts} 
                        onLightningCall={startMediaCall} 
                        onSelectContact={handleSelectContact}
                        onNavigateToNodes={() => setCurrentView('NODES')}
                        searchQuery={searchQuery}
                      />
                    )}
                    {currentView === 'NODES' && <NodeRegistry contacts={MOCK_CONTACTS} onDiscovery={() => {}} />}
                    {currentView === 'SECURITY' && <ProfileSettings did={myDid || "did:key:mOCK_1234567890"} devices={MOCK_DEVICES} />}
                  </motion.div>
                ) : (
                  <motion.div
                    key="Conversation"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute inset-0 z-50 flex flex-col bg-nexus-surface"
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

        {/* iOS Tab Bar */}
        {isInitialized && !isConversationOpen && (
            <div className="absolute bottom-0 inset-x-0 h-[64px] sm:h-[83px] bg-nexus-surface/90 backdrop-blur-xl border-t border-nexus-border flex items-start pt-1.5 justify-around z-[300] pb-safe">
                <button 
                  onClick={() => setCurrentView('CHAT')} 
                  className={`flex flex-col items-center space-y-0.5 w-16 ${currentView === 'CHAT' ? 'text-nexus-accent-blue' : 'text-nexus-ink-muted'}`}
                >
                    <MessageSquare size={22} className={currentView === 'CHAT' ? 'fill-current' : ''} />
                    <span className="text-[10px] font-medium">Chats</span>
                </button>
                <button 
                  onClick={() => setCurrentView('NODES')} 
                  className={`flex flex-col items-center space-y-0.5 w-16 ${currentView === 'NODES' ? 'text-nexus-accent-blue' : 'text-nexus-ink-muted'}`}
                >
                    <Radar size={22} />
                    <span className="text-[10px] font-medium">Radar</span>
                </button>
                <button 
                  onClick={() => setCurrentView('SECURITY')} 
                  className={`flex flex-col items-center space-y-0.5 w-16 ${currentView === 'SECURITY' ? 'text-nexus-accent-blue' : 'text-nexus-ink-muted'}`}
                >
                    <Shield size={22} />
                    <span className="text-[10px] font-medium">Settings</span>
                </button>
            </div>
        )}

        {/* Home Indicator (Mock for Desktop view) */}
        <div className="hidden sm:flex absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-nexus-ink rounded-full z-[5000] pointer-events-none" />

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
                initialMode={callMode}
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


