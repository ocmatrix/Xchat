import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatList } from './components/mobile/ChatList';
import { Conversation } from './components/mobile/Conversation';
import { ProfileSettings } from './components/mobile/ProfileSettings';

// Mock Data
const MOCK_CONTACTS = [
  { did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76', online: true, lastCiphertext: '8f2a9b3c4d5e6f7a', paddingBucket: '512B', timestamp: '14:22' },
  { did: 'did:key:z6MkqY8xXyGZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg', online: false, lastCiphertext: '1a2b3c4d5e6f7a8b', paddingBucket: '256B', timestamp: '11:05' },
  { did: 'did:key:z6MkpBZDvotDkL5257faiztiuC2ZXQTu16ciAoeqgg76xYz', online: true, lastCiphertext: 'c4d5e6f7a8b9c0d1', paddingBucket: '1KB', timestamp: 'YESTERDAY' },
];

const MOCK_MESSAGES = [
  { id: '1', text: 'Initiating secure channel. Double Ratchet state synchronized.', sender: 'them', mlsEpoch: '4A9F' },
  { id: '2', text: 'Acknowledged. Key material rotated. Ready for transmission.', sender: 'me', mlsEpoch: '4A9F' },
  { id: '3', text: 'Sending payload chunk 1/3...', sender: 'them', mlsEpoch: '4AA0' },
];

const MOCK_DEVICES = [
  { id: '1', name: 'Primary Node (iPhone 14 Pro)', lastSeen: 'NOW', ip: '192.168.1.42', isCurrent: true },
  { id: '2', name: 'Backup Node (MacBook Pro)', lastSeen: '2 HOURS AGO', ip: '10.0.0.15', isCurrent: false },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'ChatList' | 'Conversation' | 'Settings'>('ChatList');
  const [activeContact, setActiveContact] = useState<any>(null);

  const handleSelectContact = (contact: any) => {
    setActiveContact(contact);
    setCurrentScreen('Conversation');
  };

  const handleBack = () => {
    setCurrentScreen('ChatList');
    setActiveContact(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans">
      {/* Mobile Device Container */}
      <div className="w-[393px] h-[852px] bg-[#0A0A0A] border-[8px] border-[#1A1A1A] rounded-[40px] overflow-hidden relative shadow-2xl flex flex-col">
        
        {/* Dynamic Island / Status Bar Area */}
        <div className="h-[50px] w-full flex justify-center items-start pt-2 bg-[#0A0A0A] z-50">
          <div className="w-[120px] h-[30px] bg-black rounded-full" />
        </div>

        {/* App Header (Navigation) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A] border-b border-[#1A1A1A] shrink-0">
          <button 
            onClick={() => setCurrentScreen('ChatList')}
            className={`font-mono text-[10px] tracking-widest ${currentScreen === 'ChatList' ? 'text-[#D4AF37]' : 'text-[#A9A9A9]'}`}
          >
            CHATS
          </button>
          <button 
            onClick={() => setCurrentScreen('Settings')}
            className={`font-mono text-[10px] tracking-widest ${currentScreen === 'Settings' ? 'text-[#D4AF37]' : 'text-[#A9A9A9]'}`}
          >
            SOVEREIGNTY
          </button>
        </div>

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
                  onLightningCall={() => console.log('Lightning Call')} 
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
                  onLightningCall={() => console.log('Lightning Call')}
                  onBack={handleBack}
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
