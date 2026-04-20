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

  const filteredContacts = MOCK_CONTACTS.filter(c => {
    if (activeTab === 'ONLINE') return c.online;
    return true;
  }).sort((a, b) => {
    if (activeTab === 'A-Z') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className={`min-h-screen w-full flex items-center justify-center font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-[#F4F4F5] bg-[radial-gradient(#D4D4D8_1px,transparent_1px)] [background-size:12px_12px]'}`}>
      {/* Container - Command Center Architecture */}
      <div className={`w-full h-[100dvh] sm:w-[393px] sm:h-[852px] ${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-transparent'} flex flex-col relative sm:border sm:border-black/10 dark:sm:border-white/10 sm:rounded-[6px] overflow-hidden transition-colors duration-500 shadow-2xl`}>
        
        {/* Row 1: System Telemetry & Status (h-9) - HIDDEN UNTIL INITIALIZED */}
        {isInitialized && (
          <div className="absolute top-0 left-0 right-0 z-[5000] w-full bg-white/40 dark:bg-black/40 backdrop-blur-md border-b flex items-center justify-between h-9 px-4 transition-all duration-500" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            
            {/* Left: Brand + Active Dot + Telemetry */}
            <div className="flex items-center space-x-3">
              <h1 className="text-[14px] font-black text-black dark:text-white uppercase tracking-tight font-sans leading-none">
                DOTCOM
              </h1>
              <div className="flex items-center space-x-2 font-mono leading-none">
                  <div className="w-1.5 h-1.5 bg-[#00FF41] rounded-full shadow-[0_0_8px_rgba(0,255,65,0.6)] shrink-0"></div>
                  <span className="text-[#6B7280] dark:text-[#9CA3AF] text-[10px] font-bold tracking-tighter">L: 14MS S: 0x4B2</span>
              </div>
            </div>
            
            {/* Right: System Utilities */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-all cursor-pointer active:scale-90"
              >
                <Moon size={12} strokeWidth={2.5} />
              </button>
              <button 
                className="flex items-center justify-center text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-all cursor-pointer active:scale-90"
              >
                <Activity size={12} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Row 2: Command Toolbar (h-9) - HIDDEN UNTIL INITIALIZED */}
        {isInitialized && !isConversationOpen && (
          <div className="absolute top-9 left-0 right-0 z-[4000] h-9 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b flex items-center justify-between px-4 transition-all duration-500" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            {/* Left: Navigation Segments */}
            <div className="flex items-center space-x-1">
                {(['LATEST', 'ONLINE', 'A-Z'] as MainTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 h-6 flex items-center justify-center text-[9px] font-sans font-bold uppercase tracking-wider transition-colors border ${activeTab === tab ? 'border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-[2px]' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white cursor-pointer'}`}
                  >
                    {tab}
                  </button>
                ))}
            </div>

            {/* Right: Interactive Utilities - ONLY ON CHAT TAB */}
            {currentView === 'CHAT' && (
              <div className="flex items-center space-x-2">
                  <button 
                      onClick={() => {
                        setIsSearchExpanded(!isSearchExpanded);
                        if (isSearchExpanded) setSearchQuery("");
                      }} 
                      className={`text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center mr-1 ${isSearchExpanded ? 'text-[#1E40AF]' : ''}`}
                  >
                      <Search size={12} strokeWidth={2.5} />
                  </button>

                  <button className="w-5 h-5 bg-[#1E40AF] hover:bg-[#1D4ED8] flex items-center justify-center rounded-[2px] text-white shadow-sm transition-colors cursor-pointer border border-[#1E3A8A]">
                      <UserPlus size={10} strokeWidth={2.5} />
                  </button>

                  <div className="flex items-center justify-center space-x-1 ml-1 text-[#6B7280] dark:text-[#9CA3AF] bg-black/5 dark:bg-white/5 h-5 px-1.5 rounded-[2px] border border-black/10 dark:border-white/10" title="Active Entities">
                      <Hexagon size={9} strokeWidth={2.5} />
                      <span className="font-mono text-[10px] font-bold leading-none mt-px tracking-tighter">
                          {filteredContacts.length}
                      </span>
                  </div>
              </div>
            )}
          </div>
        )}

        {/* Row 3: Search Buffer (h-9) - ONLY WHEN EXPANDED */}
        {!isConversationOpen && isSearchExpanded && (
           <div className="absolute top-[72px] left-0 right-0 z-[3500] h-9 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b flex items-center px-4 transition-all duration-300" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div className="flex items-center w-full space-x-2">
                 <Search size={10} className="text-black/30 dark:text-white/30" />
                 <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-[10px] font-mono text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20 uppercase tracking-widest"
                    placeholder="INITIATE_SEARCH_PROTOCOL..."
                    autoFocus
                 />
                 {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white">
                       <X size={10} />
                    </button>
                 )}
              </div>
           </div>
        )}

        {/* Screen Content - Reclaimed Space */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col transition-colors duration-500 ${!isConversationOpen ? (isSearchExpanded ? 'pt-[108px]' : 'pt-[72px]') : 'pt-[36px]'}`}>
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-0 top-[36px] z-50 flex flex-col bg-nexus-bg"
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

        {/* Home Indicator */}
        <div className="hidden sm:flex absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[60px] h-[3px] bg-black/10 dark:bg-white/10 rounded-full z-[310] pointer-events-none" />
        
        {/* Bottom Nav */}
        {isInitialized && (
            <div className="absolute bottom-0 inset-x-0 h-12 bg-white/50 dark:bg-black/50 backdrop-blur-lg border-t border-black/10 dark:border-white/10 flex items-center justify-around z-[300]">
                {/* Chat Tab */}
                <button onClick={() => { setCurrentView('CHAT'); setIsConversationOpen(false); }} className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                    <MessageSquare size={20} />
                </button>
                {/* Nodes Tab */}
                <button onClick={() => { setCurrentView('NODES'); setIsConversationOpen(false); }} className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                    <Radar size={20} />
                </button>
                {/* Security/Settings Tab */}
                <button onClick={() => { setCurrentView('SECURITY'); setIsConversationOpen(false); }} className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                    <Shield size={20} />
                </button>
            </div>
        )}

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


