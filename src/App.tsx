import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatList } from './components/mobile/ChatList';
import { Conversation } from './components/mobile/Conversation';
import { ProfileSettings } from './components/mobile/ProfileSettings';
import { MediaCall } from './components/mobile/MediaCall';
import { InitiateGroup } from './components/mobile/InitiateGroup';

// Mock Data
const MOCK_CONTACTS = [
  { did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76', online: true, lastCiphertext: '8f2a9b3c4d5e6f7a', paddingBucket: '512B', timestamp: '14:22', isGroup: false },
  { did: 'did:key:z6MkqY8xXyGZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg', online: false, lastCiphertext: '1a2b3c4d5e6f7a8b', paddingBucket: '256B', timestamp: '11:05', isGroup: false },
  { did: 'CORE_SYNDICATE', online: true, lastCiphertext: 'c4d5e6f7a8b9c0d1', paddingBucket: '1KB', timestamp: 'YESTERDAY', isGroup: true, isIsolated: true },
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'ChatList' | 'Conversation' | 'Settings' | 'MediaCall' | 'InitiateGroup'>('ChatList');
  const [activeContact, setActiveContact] = useState<any>(null);

  const handleSelectContact = (contact: any) => {
    setActiveContact(contact);
    setCurrentScreen('Conversation');
  };

  const handleBack = () => {
    setCurrentScreen('ChatList');
    setActiveContact(null);
  };

  const startMediaCall = () => {
    setCurrentScreen('MediaCall');
  };

  const endMediaCall = () => {
    setCurrentScreen('Conversation');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans">
      {/* Mobile Device Container */}
      <div className="w-[393px] h-[852px] bg-[#0A0A0A] border-[8px] border-[#1A1A1A] rounded-[40px] overflow-hidden relative shadow-2xl flex flex-col">
        
        {/* Dynamic Island / Status Bar Area */}
        <div className="h-[50px] w-full flex justify-center items-start pt-2 bg-[#0A0A0A] z-[300] pointer-events-none">
          <div className="w-[120px] h-[30px] bg-black rounded-full" />
        </div>

        {/* App Header (Navigation) */}
        {currentScreen !== 'MediaCall' && (
          <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A] border-b border-[#1A1A1A] shrink-0">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setCurrentScreen('ChatList')}
                className={`font-mono text-[10px] tracking-widest ${currentScreen === 'ChatList' || currentScreen === 'Conversation' ? 'text-[#D4AF37]' : 'text-[#A9A9A9]'}`}
              >
                CHATS
              </button>
              {currentScreen === 'ChatList' && (
                <button 
                  onClick={() => setCurrentScreen('InitiateGroup')}
                  className="text-[#D4AF37] font-mono text-sm hover:scale-110 transition-transform bg-transparent border-none cursor-pointer p-0"
                >
                  [ + ]
                </button>
              )}
            </div>
            <button 
              onClick={() => setCurrentScreen('Settings')}
              className={`font-mono text-[10px] tracking-widest ${currentScreen === 'Settings' ? 'text-[#D4AF37]' : 'text-[#A9A9A9]'}`}
            >
              SOVEREIGNTY
            </button>
          </div>
        )}

        {/* Screen Content */}
        <div className="flex-1 overflow-hidden relative bg-[#0A0A0A]">
          <AnimatePresence mode="wait">
            {currentScreen === 'ChatList' && (
              <motion.div
                key="ChatList"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 flex flex-col"
              >
                <ChatList 
                  contacts={MOCK_CONTACTS} 
                  onLightningCall={startMediaCall} 
                  onSelectContact={handleSelectContact}
                />
              </motion.div>
            )}

            {currentScreen === 'Conversation' && (
              <motion.div
                key="Conversation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0 flex flex-col"
              >
                <Conversation 
                  messages={MOCK_MESSAGES} 
                  onLightningCall={startMediaCall}
                  onBack={handleBack}
                  isGroup={activeContact?.isGroup}
                  isIsolated={activeContact?.isIsolated}
                  targetName={activeContact?.did.includes(':') ? `${activeContact.did.slice(0, 12)}...` : activeContact?.did}
                />
              </motion.div>
            )}

            {currentScreen === 'Settings' && (
              <motion.div
                key="Settings"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex flex-col"
              >
                <ProfileSettings 
                  did="did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76" 
                  devices={MOCK_DEVICES} 
                />
              </motion.div>
            )}

            {currentScreen === 'MediaCall' && (
              <motion.div
                key="MediaCall"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-[200]"
              >
                <MediaCall 
                  targetName={activeContact?.did.includes(':') ? `${activeContact.did.slice(0, 12)}...` : activeContact?.did || "EXTERNAL_NODE"} 
                  onEndCall={endMediaCall} 
                />
              </motion.div>
            )}

            {currentScreen === 'InitiateGroup' && (
              <motion.div
                key="InitiateGroup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 z-[500]"
              >
                <InitiateGroup 
                  contacts={MOCK_CONTACTS.filter(c => !c.isGroup)} 
                  onClose={() => setCurrentScreen('ChatList')} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Home Indicator */}
        <div className="h-[34px] w-full bg-[#0A0A0A] flex items-center justify-center pb-2">
          <div className="w-[134px] h-[5px] bg-[#333333] rounded-full" />
        </div>

      </div>
    </div>
  );
}
