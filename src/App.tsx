import React, { useState, useEffect, Component, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthWall } from './components/mobile/AuthWall';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { FirebaseService } from './services/FirebaseService';
import { NexusSecurityService } from './services/NexusSecurityService';
import { NexusUtilityService } from './services/NexusUtilityService';
import { ChatList } from './components/mobile/ChatList';
import { Conversation } from './components/mobile/Conversation';
import { ProfileSettings } from './components/mobile/ProfileSettings';
import { IdentityCard } from './components/mobile/IdentityCard';
import { MediaCall } from './components/mobile/MediaCall';
import { InitiateGroup } from './components/mobile/InitiateGroup';
import { PeerDiscovery } from './components/mobile/PeerDiscovery';
import { NodeRegistry } from './components/mobile/NodeRegistry';
import { AuditoriumMeeting } from './components/mobile/AuditoriumMeeting';
import { SecuritySetup } from './components/mobile/SecuritySetup';
import LogoIcon from './components/LogoIcon';
import { MessageSquare, Users, Shield, ShieldAlert, Plus, Radar, Sun, Moon, Battery, Wifi, Signal, Activity, Cpu, Hexagon, Search, UserPlus, X, PhoneOff, RefreshCw, QrCode, Network } from 'lucide-react';

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

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, errorDetail: string }> {
  declare state: { hasError: boolean, errorDetail: string };
  declare props: { children: ReactNode };

  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorDetail: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorDetail: error?.message || String(error) };
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
      const isHardwareError = this.state.errorDetail.toLowerCase().includes('media') || 
                               this.state.errorDetail.toLowerCase().includes('permission') ||
                               this.state.errorDetail.toLowerCase().includes('device');
      const isProtocolError = this.state.errorDetail.toLowerCase().includes('firebase') ||
                               this.state.errorDetail.toLowerCase().includes('firestore') ||
                               this.state.errorDetail.toLowerCase().includes('network');

      return (
        <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center border-[8px] border-[#1A1A1A] rounded-[40px] overflow-hidden">
          <ShieldAlert size={48} className="text-[#EF4444] mb-4 opacity-50" />
          <h2 className="text-[#D4AF37] font-mono text-xs tracking-[4px] uppercase mb-4">Kernel_Panic</h2>
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-1 mb-4 rounded-full">
            <span className="text-[#EF4444] font-mono text-[9px] uppercase tracking-widest font-bold">
              {isHardwareError ? 'Hardware_Access_Denied' : isProtocolError ? 'Core_Protocol_Failure' : 'Unexpected_Runtime_Exception'}
            </span>
          </div>
          <p className="text-[#A9A9A9] font-mono text-[8px] tracking-[1.5px] uppercase opacity-40 leading-loose max-w-xs">
            {isHardwareError 
              ? 'Critical failure: Secure node unable to interface with biometric or media hardware. Check browser permissions.'
              : 'Network integrity compromised: Core protocol handshake failed or database link severed.'
            } 
            <br/>
            Attempting automatic node recovery...
          </p>
          <div className="mt-4 p-4 bg-black/50 border border-red-500/30 rounded max-w-[80vw] overflow-auto">
            <span className="text-red-400 font-mono text-[9px] text-left">{this.state.errorDetail.substring(0, 150)}</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 border border-white/10 px-6 py-2 text-white font-sans text-xs font-semibold uppercase tracking-wider active:bg-white/5 bg-white/10 hover:bg-white/20 cursor-pointer rounded-full transition-all flex items-center gap-2"
          >
            <RefreshCw size={12} className="animate-spin-slow" />
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
  { id: '4_1', type: 'file', fileName: 'kernel_exploit.exe', fileSize: '14.2 MB', fileType: 'EXE', sender: 'me', mlsEpoch: '4A9F' },
  { id: '4_2', type: 'file', fileName: 'project_brief.pdf', fileSize: '2.1 MB', fileType: 'PDF', sender: 'them', mlsEpoch: '4A9F', isOffline: true, ttl: '72H', nodes: ['RELAY_X1', 'RELAY_Y2'] },
  { id: '4_3', type: 'call', callType: 'video', callState: 'missed', sender: 'them', timestamp: Date.now() - 3600000 },
  { id: '5', text: 'Sending payload chunk 1/3...', sender: 'them', mlsEpoch: '4AA0' },
];
  
  const MOCK_DEVICES = [
    { id: '1', name: 'Primary Node (iPhone 14 Pro)', lastSeen: 'NOW', ip: '192.168.1.42', isCurrent: true },
    { id: '2', name: 'Backup Node (MacBook Pro)', lastSeen: '2 HOURS AGO', ip: '10.0.0.15', isCurrent: false },
  ];
  
  type MainTab = 'LATEST' | 'ONLINE' | 'A-Z';
  
  const IOSInstallPrompt = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = ('standalone' in navigator) && (navigator.standalone);
    
    if (!isIOS || isStandalone) return null;
    
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg p-6 border-t border-white/10 z-[10000] text-center text-white flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37]">Install Sovereign Node</span>
            <p className="text-[9px] text-white/60">Tap <span className="font-bold">Share</span> then <span className="font-bold">Add to Home Screen</span></p>
        </div>
    );
};

export default function App() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);

    const [activeTab, setActiveTab] = useState<MainTab>('LATEST');
    const [currentView, setCurrentView] = useState<'CHAT' | 'NODES' | 'SECURITY'>('CHAT'); 
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isConversationOpen, setIsConversationOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [myDid, setMyDid] = useState("");
    const [activeContact, setActiveContact] = useState<any>(null);
    const [overlayScreen, setOverlayScreen] = useState<'MediaCall' | 'InitiateGroup' | 'PeerDiscovery' | 'AuditoriumMeeting' | 'MyIdentity' | null>(null);
    const [callMode, setCallMode] = useState<'voice' | 'video'>('video');
    const [isMeetingMinimized, setIsMeetingMinimized] = useState(false);
  const [callParticipantsCount, setCallParticipantsCount] = useState(1);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeNodes, setActiveNodes] = useState<any[]>([]);
  const [dataReady, setDataReady] = useState(false);

  // Row 1: App Boot & Mesh Synchronization
  useEffect(() => {
    // 1. HARDCORE_GEEK_BOOT::Check local hardware enclave
    const stored = NexusSecurityService.getStoredIdentity();
    if (stored) {
      setMyDid(stored.did);
      setIsInitialized(true);
      console.log(`🔌 SOVEREIGN_BOOT_SUCCESS::DID=${stored.did}`);
    }

    // 2. NETWORK_BRIDGE::Maintain anonymous transport layer
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        console.log(`🌐 MESH_BRIDGE_ACTIVE::ID=${user.uid}`);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsub();
  }, []);

  // Row 2: Distributed Node Discovery - Listen only to MY contacts
  useEffect(() => {
    if (!currentUser) return;
    
    // Query my own contacts collection
    const q = query(collection(db, 'users', currentUser.uid, 'contacts'));
    const unsub = onSnapshot(q, (snapshot) => {
      const contacts = snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id, // DID
        isGroup: false,
        online: true, 
        lastCiphertext: 'Secure Link Established',
        timestamp: d.data().addedAt ? new Date(d.data().addedAt).toLocaleTimeString() : 'NOW'
      }));
      setActiveNodes(contacts);
      setDataReady(true);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    }
  }, [theme]);

  const handleSelectContact = async (contact: any) => {
    setIsConversationOpen(true);
    
    setActiveContact({ 
      ...contact,
      isInitiator: true 
    });
  };

  const handleBack = () => {
    setIsConversationOpen(false);
    setActiveContact(null);
  };

  const handleSetupComplete = (did: string) => {
    setMyDid(did);
    setIsInitialized(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsInitialized(false);
    setActiveContact(null);
    setIsConversationOpen(false);
  };

  const startMediaCall = (mode: 'voice' | 'video' = 'video') => {
    setCallMode(mode);
    if (activeContact && activeContact.isGroup) {
      setOverlayScreen('AuditoriumMeeting');
    } else {
      setOverlayScreen('MediaCall');
    }
  };

  const filteredContacts = activeNodes.filter(c => {
    if (activeTab === 'ONLINE') return c.online;
    return true;
  }).sort((a, b) => {
    if (activeTab === 'A-Z') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  return (
    <div className={`min-h-screen w-full flex items-center justify-center font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-[#F4F4F5] bg-[radial-gradient(#D4D4D8_1px,transparent_1px)] [background-size:12px_12px]'}`}>
      
      {/* PWA Progressive Splash Overlay */}
      <AnimatePresence>
        {!isInitialized && currentUser && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center"
          >
            <div className="relative w-24 h-24 mb-12 flex items-center justify-center">
              <LogoIcon className="text-[96px]" />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-nexus-accent-gold font-mono text-[9px] tracking-[4px] uppercase font-bold animate-pulse">
                Establishing_Secure_Enclave
              </span>
              <div className="w-48 h-[1px] bg-white/5 relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-nexus-accent-gold/40"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container - Command Center Architecture */}
      <div className={`w-full h-[100dvh] sm:w-[393px] sm:h-[852px] ${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-transparent'} flex flex-col relative sm:border sm:border-black/10 dark:sm:border-white/10 sm:rounded-[6px] overflow-hidden transition-colors duration-500 shadow-2xl safe-area-container`}>
        
        
        {/* iOS Install Prompt */}
        <IOSInstallPrompt />

        {(!currentUser && !isInitialized) ? (
          <AuthWall onSuccess={handleSetupComplete} />
        ) : (
          <>
            {/* Row 1: System Telemetry & Status (h-9) - HIDDEN WHEN IN CONVERSATION */}
            {!isConversationOpen && (
              <div className="absolute top-0 left-0 right-0 z-[5000] w-full bg-white/40 dark:bg-black/40 backdrop-blur-md border-b flex items-center justify-between transition-all duration-500 pt-4" style={{ transform: 'translateZ(10px)', height: 'calc(2.25rem + 0.5rem)', paddingLeft: 'calc(1rem + env(safe-area-inset-left))', paddingRight: 'calc(1rem + env(safe-area-inset-right))', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                
                {/* Left: Brand + Active Dot + Telemetry */}
                <div className="flex items-center space-x-3">
                  <div className="text-[20px] text-black dark:text-white flex items-center justify-center">
                      <LogoIcon />
                  </div>
                  <h1 className="text-[14px] font-black text-black dark:text-white uppercase tracking-tight font-sans leading-none">
                    DotCom
                  </h1>
                  <div className="flex items-center space-x-2 font-mono leading-none">
                      <div className={`w-1.5 h-1.5 ${currentUser ? 'bg-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.6)]' : 'bg-[#FF9500] shadow-[0_0_8px_rgba(255,149,0,0.6)]'} rounded-full shrink-0`}></div>
                      <span className={`text-[#6B7280] dark:text-[#9CA3AF] text-[10px] font-bold tracking-tighter ${!currentUser && 'animate-pulse'}`}>
                        {currentUser ? 'L: 14MS S: 0x4B2' : 'ISOLATED_NODE_OFFLINE'}
                      </span>
                  </div>
                </div>
            
                {/* Right: System Utilities */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setOverlayScreen('PeerDiscovery')}
                    className="flex items-center justify-center w-6 h-6 text-nexus-accent-blue transition-all cursor-pointer active:scale-90"
                    title="Manual Handshake"
                  >
                    <Network size={14} strokeWidth={2} />
                  </button>
                  {currentView === 'SECURITY' && isInitialized && (
                    <button 
                      onClick={() => setOverlayScreen('MyIdentity')}
                      className="flex items-center justify-center w-6 h-6 text-nexus-accent-gold transition-all cursor-pointer active:scale-90"
                      title="Show Identity Card"
                    >
                      <QrCode size={14} strokeWidth={2} />
                    </button>
                  )}
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

        {/* Row 2: Command Toolbar (h-9) - ONLY ON CHAT TAB */}
        {isInitialized && !isConversationOpen && currentView === 'CHAT' && (
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

            {/* Right: Interactive Utilities */}
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

                <div className="flex items-center justify-center space-x-1 ml-1 text-[#6B7280] dark:text-[#9CA3AF] bg-black/5 dark:bg-white/5 h-5 px-1.5 rounded-[2px] border border-black/10 dark:border-white/10" title="Active Entities">
                    <Hexagon size={9} strokeWidth={2.5} />
                    <span className="font-mono text-[10px] font-bold leading-none mt-px tracking-tighter">
                        {filteredContacts.length}
                    </span>
                </div>
            </div>
          </div>
        )}

        {/* Row 3: Search Buffer (h-9) - ONLY WHEN EXPANDED AND ON CHAT TAB */}
        <AnimatePresence>
          {!isConversationOpen && isSearchExpanded && currentView === 'CHAT' && (
             <motion.div 
                initial={{ opacity: 0, y: -10, originY: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-[72px] left-0 right-0 z-[3500] h-9 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b flex items-center px-4" 
                style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
             >
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
                      <button onClick={() => setSearchQuery("")} className="text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">
                         <X size={10} />
                      </button>
                   )}
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* Screen Content - Reclaimed Space */}
        <div className={`flex-1 overflow-hidden relative flex flex-col transition-colors duration-500 pt-0`}>
          <ErrorBoundary>
            <AnimatePresence mode="wait">
                {!isConversationOpen ? (
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`w-full flex-col flex flex-1 min-h-0 ${!isConversationOpen ? (currentView === 'CHAT' ? (isSearchExpanded ? 'pt-[108px]' : 'pt-[72px]') : 'pt-[36px]') : 'pt-0'}`}
                  >
                    {currentView === 'CHAT' && (
                      <ChatList 
                        contacts={filteredContacts} 
                        dataReady={dataReady}
                        onLightningCall={startMediaCall} 
                        onSelectContact={handleSelectContact}
                        onNavigateToNodes={() => setCurrentView('NODES')}
                        searchQuery={searchQuery}
                      />
                    )}
                    {currentView === 'NODES' && <NodeRegistry contacts={activeNodes} onDiscovery={() => {}} />}
                    {currentView === 'SECURITY' && (
                      <ProfileSettings 
                        did={myDid || "did:key:mOCK_1234567890"} 
                        displayName={currentUser?.displayName}
                        email={currentUser?.email}
                        devices={MOCK_DEVICES} 
                        onLogout={handleLogout}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="Conversation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-0 top-0 z-[6000] flex flex-col bg-nexus-bg"
                  >
                    <Conversation 
                      onLightningCall={startMediaCall}
                      onBack={handleBack}
                      isGroup={activeContact?.isGroup}
                      convId={activeContact?.convId}
                      isIsolated={activeContact?.isIsolated}
                      myDid={myDid}
                      targetName={activeContact?.name || (activeContact?.did && activeContact.did.includes(':') ? `${activeContact.did.slice(0, 12)}...` : activeContact?.did)}
                    />
                  </motion.div>
                )}
          </AnimatePresence>
        </ErrorBoundary>
      </div>

        {/* Home Indicator */}
        <div className="hidden sm:flex absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[60px] h-[3px] bg-black/10 dark:bg-white/10 rounded-full z-[310] pointer-events-none" />
        
        {/* Bottom Nav */}
        {!isConversationOpen && (
            <div className="absolute bottom-0 inset-x-0 bg-white/50 dark:bg-black/50 backdrop-blur-lg border-t border-black/10 dark:border-white/10 flex items-center justify-around z-[300] pb-[env(safe-area-inset-bottom)]" style={{ height: 'calc(3rem + env(safe-area-inset-bottom))' }}>
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
              className="absolute inset-0 z-[8000]"
            >
              <MediaCall 
                targetName={activeContact?.name || activeContact?.did || "EXTERNAL_NODE"} 
                participantCount={callParticipantsCount}
                callMode={callMode}
                onEndCall={() => {
                  setOverlayScreen(null);
                  setCallParticipantsCount(1);
                }} 
              />
            </motion.div>
          )}
          {overlayScreen === 'AuditoriumMeeting' && (
            <motion.div
              initial={isMeetingMinimized ? false : { opacity: 0, scale: 1.1, backdropFilter: 'blur(0px)' }}
              animate={isMeetingMinimized 
                ? { top: 40, right: 16, bottom: 'auto', left: 'auto', scale: 0.25, width: '100%', height: '100%', borderRadius: 64, opacity: 0, pointerEvents: 'none' } 
                : { top: 0, right: 0, bottom: 0, left: 0, scale: 1, width: 'auto', height: 'auto', borderRadius: 0, opacity: 1, backdropFilter: 'blur(20px)', pointerEvents: 'auto' }}
              exit={{ opacity: 0, scale: 0.9, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3, type: "spring", bounce: 0 }}
              className="absolute z-[8000] flex flex-col bg-nexus-bg overflow-hidden"
              style={isMeetingMinimized ? { transformOrigin: 'top right' } : {}}
            >
              <AuditoriumMeeting
                roomName={activeContact?.name || "ENCRYPTED GROUP"}
                initialRole="HOST"
                onDisconnect={() => {
                  setOverlayScreen(null);
                  setIsMeetingMinimized(false);
                }}
                onMinimize={() => setIsMeetingMinimized(true)}
              />
            </motion.div>
          )}

          {/* Minimized Floating Active Call Widget */}
          {overlayScreen === 'AuditoriumMeeting' && isMeetingMinimized && (
             <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-12 right-4 z-[8001] bg-[#0A0A0A] border border-[#00D1FF]/40 rounded-full px-3 py-2 flex items-center space-x-3 shadow-[0_0_20px_rgba(0,209,255,0.2)] cursor-pointer"
                onClick={() => setIsMeetingMinimized(false)}
             >
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse" />
                   <span className="text-[#00D1FF] font-black text-[10px] tracking-widest uppercase truncate max-w-[80px]">
                      {activeContact?.name || "MEETING"}
                   </span>
                </div>
                <div 
                   onClick={(e) => {
                     e.stopPropagation();
                     setOverlayScreen(null);
                     setIsMeetingMinimized(false);
                   }}
                   className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500 group transition-colors"
                >
                   <PhoneOff size={10} className="text-red-500 group-hover:text-white" />
                </div>
             </motion.div>
          )}
          {overlayScreen === 'PeerDiscovery' && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute inset-0 z-[8000]"
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
               className="absolute inset-0 z-[8000]"
            >
               <InitiateGroup 
                  contacts={activeNodes.filter(c => !c.isGroup)} 
                  onClose={() => setOverlayScreen(null)} 
                  onStartCall={(peers) => {
                    setCallParticipantsCount(peers.length + 1);
                    setOverlayScreen('MediaCall');
                  }}
               />
            </motion.div>
          )}
          {overlayScreen === 'MyIdentity' && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-[8000] bg-[#0A0A0B]/95 backdrop-blur-3xl flex flex-col items-center p-6"
            >
               <div className="absolute top-12 left-0 right-0 px-8 flex justify-between items-center z-50">
                  <div className="flex flex-col">
                    <span className="text-nexus-accent-gold font-mono text-[9px] tracking-[4px] uppercase font-black">Identity_Matrix_V4</span>
                    <span className="text-white/20 text-[7px] uppercase tracking-[2px]">Terminal_Verification_Mode</span>
                  </div>
                  <button 
                    onClick={() => setOverlayScreen(null)}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white transition-all cursor-pointer backdrop-blur-md"
                  >
                    <X size={24} />
                  </button>
               </div>
               
               <div className="flex-1 w-full flex flex-col items-center justify-center pt-8">
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="w-full max-w-sm"
                 >
                   <IdentityCard did={myDid} />
                 </motion.div>

                 <div className="mt-16 flex flex-col items-center space-y-4 opacity-30 select-none">
                    <div className="flex items-center space-x-2">
                      <Shield size={10} className="text-nexus-accent-gold" />
                      <span className="text-[7px] tracking-[3px] uppercase font-black">Encrypted_Peer_Handshake_Active</span>
                    </div>
                    <p className="text-[6px] text-center max-w-[200px] leading-relaxed uppercase tracking-widest text-nexus-ink-muted">
                      This matrix is used for local p2p handshake only. Never share with untrusted or centralized entities.
                    </p>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

          </>
        )}
      </div>
    </div>
  );
}


