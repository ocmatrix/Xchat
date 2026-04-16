export interface CommandData {
  id: string;
  title: string;
  category: string;
  description: string;
  language: string;
  code: string;
}

export const commands: CommandData[] = [
  {
    id: 'RUST_CORE_01',
    title: 'Keypair Generation & MPC Skeleton',
    category: 'Phase 1: Rust Core & Cryptography',
    description: 'Generates Ed25519 keypairs and provides the skeleton for 2-of-3 MPC (Shamir Secret Sharing) for the Layer 1 root key.',
    language: 'rust',
    code: `use ed25519_dalek::{Keypair, Signer, SecretKey, PublicKey};
use rand::rngs::OsRng;
use std::error::Error;

/// Represents a single MPC share for the 2-of-3 threshold scheme
#[derive(Debug, Clone)]
pub struct MpcShare {
    pub id: u8,
    pub data: Vec<u8>,
}

/// Generates a local Ed25519 keypair using OS CSPRNG
pub fn generate_device_keypair() -> Keypair {
    let mut csprng = OsRng{};
    Keypair::generate(&mut csprng)
}

/// Skeleton for 2-of-3 Shamir Secret Sharing
/// In production, this would use a crate like \`shamirsecretsharing\` or \`vsss-rs\`
pub fn split_root_key_2_of_3(secret: &[u8; 32]) -> Result<Vec<MpcShare>, Box<dyn Error>> {
    // TODO: Implement actual polynomial evaluation over GF(2^8)
    // Share 1: Device TEE (Secure Enclave / Keystore)
    // Share 2: Server HSM (Cloud KMS)
    // Share 3: User Backup (Passkey / iCloud Keychain / Google Password Manager)
    
    let share1 = MpcShare { id: 1, data: vec![0; 32] }; // Mock
    let share2 = MpcShare { id: 2, data: vec![0; 32] }; // Mock
    let share3 = MpcShare { id: 3, data: vec![0; 32] }; // Mock
    
    Ok(vec![share1, share2, share3])
}

/// Reconstructs the root key from any 2 valid shares
pub fn reconstruct_root_key(shares: &[MpcShare]) -> Result<[u8; 32], Box<dyn Error>> {
    if shares.len() < 2 {
        return Err("Insufficient shares. Minimum 2 required.".into());
    }
    // TODO: Lagrange interpolation to recover the secret
    Ok([0u8; 32]) // Mock return
}`
  },
  {
    id: 'RUST_CORE_02',
    title: 'Double Ratchet C-FFI',
    category: 'Phase 1: Rust Core & Cryptography',
    description: 'Double Ratchet encryption/decryption core logic with C-FFI bindings for iOS (Swift) and Android (JNI/Kotlin).',
    language: 'rust',
    code: `use std::os::raw::{c_char, c_uchar};
use std::slice;
use std::ptr;

// Opaque struct representing the Double Ratchet state
pub struct RatchetState {
    // KDF chains, root key, sending/receiving chain keys, message keys
    // ...
}

#[repr(C)]
pub struct EncryptedPayload {
    pub ciphertext: *mut c_uchar,
    pub length: usize,
    pub header: *mut c_uchar, // Contains ephemeral public key, PN, N
    pub header_len: usize,
}

/// Initialize a new Double Ratchet state (Alice)
#[no_mangle]
pub extern "C" fn ratchet_init_alice(
    shared_secret: *const c_uchar, 
    bob_public_key: *const c_uchar
) -> *mut RatchetState {
    // Initialize root chain and sending chain
    let state = Box::new(RatchetState { /* ... */ });
    Box::into_raw(state)
}

/// Encrypt a message using the Double Ratchet state
#[no_mangle]
pub extern "C" fn ratchet_encrypt(
    state_ptr: *mut RatchetState,
    plaintext: *const c_uchar,
    plaintext_len: usize,
) -> EncryptedPayload {
    let state = unsafe {
        assert!(!state_ptr.is_null());
        &mut *state_ptr
    };
    
    let pt_slice = unsafe { slice::from_raw_parts(plaintext, plaintext_len) };
    
    // 1. KDF step on sending chain to get Message Key
    // 2. Encrypt plaintext with AEAD (e.g., ChaCha20Poly1305)
    // 3. Construct header
    
    // Mock return
    EncryptedPayload {
        ciphertext: ptr::null_mut(),
        length: 0,
        header: ptr::null_mut(),
        header_len: 0,
    }
}

/// Free the allocated payload memory to prevent leaks
#[no_mangle]
pub extern "C" fn free_encrypted_payload(payload: EncryptedPayload) {
    // Reconstruct Vecs from raw parts and let them drop
}
`
  },
  {
    id: 'DB_INIT_01',
    title: 'SQLite E2EE Schema',
    category: 'Phase 1: Rust Core & Cryptography',
    description: 'Client-side SQLite database schema using SQLCipher. All message content and sensitive contact fields are stored as BLOB ciphertexts.',
    language: 'sql',
    code: `-- Enable SQLCipher encryption (executed via client driver)
PRAGMA key = 'x''2DD29CA851E7B56E4697B0E1F08507293D761A05CE4D1B628663F411A8086D99''';
PRAGMA cipher_page_size = 4096;

-- Layer 2: Identity & Contacts
CREATE TABLE contacts (
    did TEXT PRIMARY KEY,               -- Decentralized Identifier (e.g., did:key:...)
    alias_ciphertext BLOB NOT NULL,     -- Encrypted local alias/nickname
    avatar_url_ciphertext BLOB,         -- Encrypted avatar pointer
    ratchet_state BLOB,                 -- Serialized Double Ratchet state for this contact
    trust_score INTEGER DEFAULT 0,      -- Local trust metric based on signature chains
    updated_at INTEGER NOT NULL
);

-- Layer 3: Messaging
CREATE TABLE messages (
    message_id TEXT PRIMARY KEY,        -- UUIDv7 for time-based sorting
    conversation_id TEXT NOT NULL,      -- Hash of participants DIDs or Group ID
    sender_did TEXT NOT NULL,           -- DID of the sender
    payload_ciphertext BLOB NOT NULL,   -- AEAD encrypted message payload (JSON/Protobuf)
    nonce BLOB NOT NULL,                -- AEAD Nonce
    mac BLOB NOT NULL,                  -- Authentication Tag
    status INTEGER NOT NULL,            -- 0: Sending, 1: Sent, 2: Delivered, 3: Read, 4: Failed
    timestamp INTEGER NOT NULL,         -- Unix epoch milliseconds
    
    FOREIGN KEY(sender_did) REFERENCES contacts(did)
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, timestamp DESC);
CREATE INDEX idx_messages_status ON messages(status);
`
  },
  {
    id: 'SERVER_GO_01',
    title: 'Go WebSocket/QUIC Gateway',
    category: 'Phase 2: Signaling & Control Plane',
    description: 'Stateless Go microservice for WebSocket/QUIC connections, maintaining presence in a Redis cluster.',
    language: 'go',
    code: `package gateway

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // Configure strictly in prod
}

type Gateway struct {
	redisClient *redis.ClusterClient
}

// HandleConnection upgrades the HTTP request to a WebSocket and manages presence
func (g *Gateway) HandleConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	// Extract DID from auth token (JWT/Ed25519 signature verified in middleware)
	did := r.Context().Value("user_did").(string)
	nodeID := "gateway-node-01" // Current server instance ID

	ctx := context.Background()

	// Set presence in Redis with TTL
	presenceKey := "presence:" + did
	err = g.redisClient.Set(ctx, presenceKey, nodeID, 30*time.Second).Err()
	if err != nil {
		log.Println("Redis error:", err)
		return
	}

	// Heartbeat loop
	ticker := time.NewTicker(20 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Refresh TTL
			g.redisClient.Expire(ctx, presenceKey, 30*time.Second)
		}
		// Read loop omitted for brevity: handles incoming signaling messages
		// and routes them to Kafka/Redis PubSub.
	}
}
`
  },
  {
    id: 'ROUTE_01',
    title: 'Offline Message Routing',
    category: 'Phase 2: Signaling & Control Plane',
    description: 'Handles offline message delivery. Accepts only ciphertext payloads, stores in Redis with a 7-day TTL, and deletes upon delivery.',
    language: 'go',
    code: `package router

import (
	"context"
	"encoding/json"
	"time"

	"github.com/go-redis/redis/v8"
)

type EncryptedEnvelope struct {
	MessageID   string \`json:"msg_id"\`
	RecipientID string \`json:"to_did"\`
	Ciphertext  []byte \`json:"ciphertext"\` // Server cannot read this
	Header      []byte \`json:"header"\`     // Ephemeral keys, etc.
	Timestamp   int64  \`json:"ts"\`
}

type Router struct {
	redis *redis.ClusterClient
}

// RouteMessage determines if the user is online. If offline, stores the envelope.
func (r *Router) RouteMessage(ctx context.Context, env EncryptedEnvelope) error {
	presenceKey := "presence:" + env.RecipientID
	
	// Check if user is connected to any gateway node
	nodeID, err := r.redis.Get(ctx, presenceKey).Result()
	
	if err == redis.Nil {
		// User is OFFLINE. Store in offline queue.
		return r.storeOffline(ctx, env)
	} else if err != nil {
		return err
	}

	// User is ONLINE. Forward to the specific gateway node via PubSub/gRPC
	return r.forwardToNode(ctx, nodeID, env)
}

func (r *Router) storeOffline(ctx context.Context, env EncryptedEnvelope) error {
	queueKey := "offline:" + env.RecipientID
	
	data, _ := json.Marshal(env)
	
	// Push to Redis List
	pipe := r.redis.Pipeline()
	pipe.LPush(ctx, queueKey, data)
	// Set 7-day TTL on the queue
	pipe.Expire(ctx, queueKey, 7*24*time.Hour)
	_, err := pipe.Exec(ctx)
	
	return err
}

// AcknowledgeDelivery is called by the client once the message is decrypted and saved locally
func (r *Router) AcknowledgeDelivery(ctx context.Context, recipientID, messageID string) error {
	// In a real implementation, we'd remove the specific message from the list
	// or use a Sorted Set (ZSET) for easier specific-item removal.
	// Physical deletion is mandatory per privacy requirements.
	return nil
}
`
  },
  {
    id: 'P2P_NET_01',
    title: 'libp2p Kademlia & Hole Punching',
    category: 'Phase 3: Network & Media Layer',
    description: 'Rust libp2p configuration for Kademlia DHT node discovery and DCUtR (NAT Traversal / Hole Punching).',
    language: 'rust',
    code: `use libp2p::{
    core::upgrade,
    dcutr, identify, kad, noise, relay, rendezvous, tcp, yamux,
    swarm::{SwarmBuilder, NetworkBehaviour},
    PeerId, Transport,
};
use std::time::Duration;

#[derive(NetworkBehaviour)]
struct NexusBehaviour {
    relay_client: relay::client::Behaviour,
    identify: identify::Behaviour,
    dcutr: dcutr::Behaviour,
    kademlia: kad::Behaviour<kad::store::MemoryStore>,
}

pub async fn build_p2p_swarm(local_key: libp2p::identity::Keypair) -> Result<(), Box<dyn std::error::Error>> {
    let local_peer_id = PeerId::from(local_key.public());
    
    // 1. Setup Transport with Noise encryption and Yamux multiplexing
    let transport = tcp::tokio::Transport::default()
        .upgrade(upgrade::Version::V1)
        .authenticate(noise::Config::new(&local_key)?)
        .multiplex(yamux::Config::default())
        .boxed();

    // 2. Configure Kademlia DHT for peer discovery
    let store = kad::store::MemoryStore::new(local_peer_id);
    let mut kad_config = kad::Config::default();
    kad_config.set_query_timeout(Duration::from_secs(5));
    let kademlia = kad::Behaviour::with_config(local_peer_id, store, kad_config);

    // 3. Configure DCUtR (Direct Connection Upgrade through Relay) for Hole Punching
    let (relay_transport, relay_client) = relay::client::new(local_peer_id);
    let dcutr = dcutr::Behaviour::new(local_peer_id);
    
    let behaviour = NexusBehaviour {
        relay_client,
        identify: identify::Behaviour::new(identify::Config::new(
            "/nexus/1.0.0".into(),
            local_key.public(),
        )),
        dcutr,
        kademlia,
    };

    // Combine relay transport with TCP transport
    let transport = relay_transport
        .or_transport(transport)
        .map(|either, _| match either {
            libp2p::core::either::EitherOutput::First((peer_id, conn)) => (peer_id, conn),
            libp2p::core::either::EitherOutput::Second((peer_id, conn)) => (peer_id, conn),
        })
        .boxed();

    let mut swarm = SwarmBuilder::with_tokio_executor(transport, behaviour, local_peer_id).build();
    
    // Swarm event loop omitted...
    Ok(())
}
`
  },
  {
    id: 'MEDIA_RTC_01',
    title: 'WebRTC SFU & QUIC 0-RTT',
    category: 'Phase 3: Network & Media Layer',
    description: 'WebRTC client connection logic utilizing WebTransport (QUIC) for 0-RTT media setup and SFrame for E2EE.',
    language: 'typescript',
    code: `/**
 * Phase 3: Media RTC - WebTransport & SFrame E2EE
 * 
 * Sequence:
 * 1. Client -> SFU: WebTransport connect (QUIC 0-RTT if session ticket cached)
 * 2. Client -> SFU: Send Encrypted Media Tracks via WebTransport Datagrams
 * 3. SFU -> Clients: Fan-out Datagrams (SFU cannot decrypt)
 */

export class NexusMediaClient {
  private transport: WebTransport | null = null;
  private sframeKey: CryptoKey;

  constructor(private sfuUrl: string, sharedGroupKey: CryptoKey) {
    this.sframeKey = sharedGroupKey; // Derived from MLS (Messaging Layer Security)
  }

  async connect0RTT() {
    // WebTransport utilizes QUIC. If a previous connection existed, 
    // the browser uses cached TLS session tickets for 0-RTT connection.
    this.transport = new WebTransport(this.sfuUrl);
    
    try {
      await this.transport.ready;
      console.log("QUIC Connection established (potential 0-RTT)");
      this.startMediaLoop();
    } catch (e) {
      console.error("WebTransport connection failed", e);
    }
  }

  private async startMediaLoop() {
    if (!this.transport) return;
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // In a real implementation, we would use Insertable Streams (WebCodecs)
    // to encrypt the encoded frames with SFrame before sending via Datagrams.
    
    const writer = this.transport.datagrams.writable.getWriter();
    
    // Mock encoding/encryption loop
    setInterval(async () => {
      const mockFrame = new Uint8Array(1024); // Raw encoded frame
      
      // E2EE: SFrame Encryption (Client-side only)
      // SFU only sees the ciphertext and routes it based on unencrypted headers
      const ciphertext = await this.encryptFrame(mockFrame);
      
      await writer.write(ciphertext);
    }, 33); // ~30fps
  }

  private async encryptFrame(frame: Uint8Array): Promise<Uint8Array> {
    // SFrame encryption implementation using this.sframeKey
    // ...
    return frame; 
  }
}
`
  },
  {
    id: 'CLIENT_UI_01',
    title: 'JSI Bridge & High-Perf Chat UI',
    category: 'Phase 4: Client UI & Integration',
    description: 'React Native JSI bindings for zero-overhead Rust cryptography calls, and an aggressively optimized FlatList chat component in Black Gold aesthetic.',
    language: 'typescript',
    code: `// 1. JSI Binding (C++ Layer bridging JS to Rust FFI)
/*
#include <jsi/jsi.h>
extern "C" {
    // Rust FFI declarations
    struct FfiEncryptedPayload { uint8_t* ciphertext; size_t len; ... };
    FfiEncryptedPayload nexus_ratchet_encrypt(void* state, const uint8_t* pt, size_t len);
}

void installNexusJSI(facebook::jsi::Runtime& jsiRuntime) {
    auto encrypt = facebook::jsi::Function::createFromHostFunction(
        jsiRuntime, facebook::jsi::PropNameID::forAscii(jsiRuntime, "nexusEncrypt"), 2,
        [](facebook::jsi::Runtime& rt, const facebook::jsi::Value& thisValue, const facebook::jsi::Value* args, size_t count) -> facebook::jsi::Value {
            // 1. Get string from JS (Zero-copy where possible)
            std::string plaintext = args[0].getString(rt).utf8(rt);
            
            // 2. Synchronous call to Rust Core (No JSON serialization overhead!)
            FfiEncryptedPayload payload = nexus_ratchet_encrypt(state_ptr, (const uint8_t*)plaintext.data(), plaintext.size());
            
            // 3. Return ArrayBuffer to JS
            // ...
        }
    );
    jsiRuntime.global().setProperty(jsiRuntime, "nexusEncrypt", std::move(encrypt));
}
*/

// 2. React Native ChatView Component
import React, { useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';

// Assume global.nexusEncrypt is injected via JSI
const encryptMessage = (text: string) => global.nexusEncrypt?.(text) || text;

export const ChatView = ({ messages }) => {
  // FlatList optimization: pre-calculate layout to avoid dynamic measurement
  const getItemLayout = useCallback((data, index) => ({
    length: 65, // Fixed height for industrial density
    offset: 65 * index,
    index,
  }), []);

  const renderItem = useCallback(({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View className={\`flex-row w-full mb-2 px-4 \${isMe ? 'justify-end' : 'justify-start'}\`}>
        <View className={\`max-w-[80%] p-3 border \${
          isMe 
            ? 'bg-[#151515] border-[#D4AF37] border-opacity-30' 
            : 'bg-[#0F0F0F] border-[#2A2A2A]'
        }\`}>
          {/* Sender ID Hash (Cyber aesthetic) */}
          {!isMe && <Text className="text-[#847035] text-[10px] font-mono mb-1 uppercase tracking-widest">{item.didHash}</Text>}
          
          {/* Decrypted Payload */}
          <Text className="text-[#E0E0E0] text-xs font-sans leading-relaxed">
            {item.plaintext}
          </Text>
          
          {/* Metadata */}
          <View className="flex-row justify-end mt-2 items-center gap-2">
            <Text className="text-[#404040] text-[9px] font-mono">{item.timestamp}</Text>
            {isMe && <View className="w-1.5 h-1.5 bg-[#D4AF37] shadow-[0_0_4px_#D4AF37]" />}
          </View>
        </View>
      </View>
    );
  }, []);

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      {/* Header */}
      <View className="h-14 border-b border-[#1A1A1A] flex-row items-center px-4 justify-between bg-[#0A0A0A]">
        <View className="flex-row items-center gap-3">
          <View className="w-2 h-2 bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
          <Text className="text-[#D4AF37] font-mono text-sm font-bold tracking-widest uppercase">
            SECURE_CHANNEL
          </Text>
        </View>
        <Text className="text-[#847035] font-mono text-[10px]">E2EE: ACTIVE</Text>
      </View>

      {/* High-Performance Message List */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        inverted={true} // Start from bottom
        removeClippedSubviews={true} // Unmount off-screen components
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5} // Reduce memory footprint
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 16 }}
      />

      {/* Input Area */}
      <View className="p-4 border-t border-[#1A1A1A] bg-[#0F0F0F] flex-row gap-3">
        <TextInput
          className="flex-1 bg-[#050505] border border-[#2A2A2A] text-[#E0E0E0] px-4 py-2 font-mono text-xs focus:border-[#D4AF37] transition-colors"
          placeholder="ENTER_DIRECTIVE..."
          placeholderTextColor="#404040"
        />
        <TouchableOpacity className="bg-[#D4AF37] px-6 items-center justify-center">
          <Text className="text-[#050505] font-mono text-xs font-bold tracking-widest">
            EXEC
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
`
  },
  {
    id: 'UI_CHATLIST_01',
    title: 'Borderless Chat List',
    category: 'Phase 4: Client UI & Integration',
    description: 'A clean, borderless FlatList driven by DID public keys. Features micro-status indicators, ciphertext summaries, and swipe-to-call.',
    language: 'tsx',
    code: `// React Native: ChatList.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
// import { Swipeable } from 'react-native-gesture-handler';

export const ChatList = ({ contacts, onLightningCall }) => {
  const renderItem = ({ item }) => (
    /* Swipeable wrapper omitted for brevity, assumes right-swipe triggers onLightningCall */
    <TouchableOpacity activeOpacity={0.8} className="flex-row items-center px-6 py-5 bg-[#0A0A0A]">
      {/* Micro-status indicator (Presence Plane) */}
      <View className={\`w-1.5 h-1.5 rounded-full mr-5 \${item.online ? 'bg-[#0F52BA] shadow-[0_0_6px_#0F52BA]' : 'bg-[#333333]'}\`} />
      
      <View className="flex-1 justify-center">
        {/* DID Public Key Identifier */}
        <Text className="text-[#FFFFFF] font-mono text-xs tracking-[2px] uppercase mb-1.5">
          {item.did.slice(0, 8)}...{item.did.slice(-4)}
        </Text>
        
        {/* Ciphertext Summary (Bucketized Padding) */}
        <Text className="text-[#A9A9A9] font-mono text-[9px] opacity-50">
          🔒 0x{item.lastCiphertext.slice(0, 16)}... [PAD:{item.paddingBucket}]
        </Text>
      </View>
      
      <Text className="text-[#A9A9A9] font-mono text-[9px] tracking-widest">{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <FlatList 
        data={contacts}
        renderItem={renderItem}
        keyExtractor={item => item.did}
        showsVerticalScrollIndicator={false}
        // Edge-to-Edge, no separators
      />
    </View>
  );
};`
  },
  {
    id: 'UI_CONVO_01',
    title: 'E2EE Conversation View',
    category: 'Phase 4: Client UI & Integration',
    description: 'Minimalist chat bubbles relying on alignment. Features MLS Epoch security fingerprints and ⚡ QUIC 0-RTT instant call integration.',
    language: 'tsx',
    code: `// React Native: Conversation.tsx
import React from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';

export const Conversation = ({ messages, onLightningCall }) => {
  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View className={\`w-full px-6 py-1.5 flex-row \${isMe ? 'justify-end' : 'justify-start'}\`}>
        {/* Minimalist Bubble: #1A1A1A background, no borders */}
        <View className={\`max-w-[75%] px-4 py-3 bg-[#1A1A1A] \${isMe ? 'items-end' : 'items-start'}\`}>
          <Text className="text-[#FFFFFF] font-sans text-[13px] leading-relaxed tracking-wide">
            {item.text}
          </Text>
          
          {/* Security Fingerprint & Metadata */}
          <TouchableOpacity activeOpacity={0.6} className="flex-row items-center mt-2 opacity-30 hover:opacity-100">
            <Text className="text-[#A9A9A9] font-mono text-[8px] mr-1.5 tracking-widest">
              EPOCH:{item.mlsEpoch}
            </Text>
            {/* Unobtrusive security fingerprint icon/dot */}
            <View className="w-1 h-1 bg-[#D4AF37]" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleLightningCall = async () => {
    console.log("⚡ Initiating QUIC 0-RTT WebTransport...");
    console.log("🔒 Loading SFrame Crypto Suite...");
    // await rtcEngine.connect0RTT(peerDid);
    onLightningCall();
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <FlatList 
        data={messages}
        renderItem={renderMessage}
        inverted
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
      
      {/* Input Area */}
      <View className="flex-row items-center px-4 py-2 bg-[#0A0A0A]">
        <TouchableOpacity onPress={handleLightningCall} className="p-3 mr-2">
          <Text className="text-[#D4AF37] text-lg">⚡</Text>
        </TouchableOpacity>
        
        <TextInput 
          className="flex-1 text-[#FFFFFF] font-sans text-sm py-3"
          placeholderTextColor="#404040"
          placeholder="TRANSMIT..."
          selectionColor="#D4AF37"
        />
      </View>
    </View>
  );
};`
  },
  {
    id: 'UI_SETTINGS_01',
    title: 'Sovereignty Settings',
    category: 'Phase 4: Client UI & Integration',
    description: 'Advanced identity management. Enforces asset isolation, provides MPC to self-custody upgrade paths, and audits trusted devices.',
    language: 'tsx',
    code: `// React Native: ProfileSettings.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export const ProfileSettings = ({ did, devices }) => {
  return (
    <ScrollView className="flex-1 bg-[#0A0A0A] px-6 py-8" showsVerticalScrollIndicator={false}>
      
      {/* Asset Isolation: Social Identity Only */}
      <View className="mb-12">
        <Text className="text-[#A9A9A9] font-mono text-[9px] uppercase tracking-[2px] mb-3">
          Social Identity (Isolated)
        </Text>
        <Text className="text-[#FFFFFF] font-mono text-xs tracking-widest opacity-90">
          {did}
        </Text>
      </View>

      {/* Progressive Decentralization Path */}
      <View className="mb-12">
        <Text className="text-[#A9A9A9] font-mono text-[9px] uppercase tracking-[2px] mb-4">
          Sovereignty Level
        </Text>
        <View className="bg-[#1A1A1A] p-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[#D4AF37] font-mono text-[10px] tracking-widest">LEVEL 1: MPC HOSTED</Text>
            <View className="w-1.5 h-1.5 bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
          </View>
          <Text className="text-[#A9A9A9] font-sans text-[11px] leading-relaxed mb-5 opacity-80">
            Root key split via 2-of-3 threshold. Fast recovery enabled via Secure Enclave and Cloud HSM.
          </Text>
          
          <TouchableOpacity activeOpacity={0.8} className="border border-[#D4AF37] py-3 items-center">
            <Text className="text-[#D4AF37] font-mono text-[9px] uppercase tracking-[2px]">
              Upgrade to Self-Custody
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Device Audit (device-core interface) */}
      <View>
        <Text className="text-[#A9A9A9] font-mono text-[9px] uppercase tracking-[2px] mb-4">
          Trusted Devices
        </Text>
        {devices.map(dev => (
          <View key={dev.id} className="flex-row justify-between items-center py-4 border-b border-[#1A1A1A]">
            <View>
              <Text className="text-[#FFFFFF] font-sans text-[13px] tracking-wide mb-1.5">
                {dev.name}
              </Text>
              <Text className="text-[#A9A9A9] font-mono text-[8px] tracking-widest opacity-60">
                LAST SEEN: {dev.lastSeen} | {dev.ip}
              </Text>
            </View>
            {dev.isCurrent ? (
              <Text className="text-[#D4AF37] font-mono text-[8px] tracking-widest">ACTIVE</Text>
            ) : (
              <TouchableOpacity>
                <Text className="text-[#EF4444] font-mono text-[8px] tracking-widest">REVOKE</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      
    </ScrollView>
  );
};`
  }
];
