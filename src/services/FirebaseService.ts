import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  addDoc,
  Timestamp,
  updateDoc,
  deleteDoc,
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: any;
}

const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  if (error.code === 'permission-denied') {
    const info: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid || 'anonymous',
        email: auth.currentUser?.email || 'N/A',
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser?.isAnonymous || true,
        providerInfo: auth.currentUser?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName,
          email: p.email
        }))
      }
    };
    throw new Error(JSON.stringify(info));
  }
  throw error;
};

export const FirebaseService = {
  // Node Discovery & Presence
  async syncUserProfile(did: string, name: string, avatar?: string) {
    if (!auth.currentUser) return;
    const nodeRef = doc(db, 'users', auth.currentUser.uid);
    try {
      const avatarApi = import.meta.env.VITE_AVATAR_API || 'https://api.dicebear.com/7.x/pixel-art/svg';
      await setDoc(nodeRef, {
        did,
        name: name || "NOMAD_" + did.slice(-4).toUpperCase(),
        avatar: avatar || `${avatarApi}?seed=${did}`,
        status: 'online',
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
        meshTransportId: auth.currentUser?.uid || 'isolated_internal'
      }, { merge: true });
      console.log(`🌐 MESH_REGISTRY_UPDATED::DID=${did}`);
    } catch (e) { 
      console.warn("MESH_REGISTRY_UNAVAILABLE (Offline Mode)");
      // We don't throw here to allow Isolated Mode to function
    }
  },

  // Peer-to-Peer Signaling Handshake
  async getOrCreateDirectConversation(targetDid: string) {
    const myDid = localStorage.getItem('NXS_IDENTITY_DID');
    if (!myDid) return null;
    
    // Sort DIDs to create a deterministic conversation ID for the channel
    const channelId = [myDid, targetDid].sort().join('_').replace(/[:.]/g, '-');
    const convRef = doc(db, 'conversations', channelId);
    
    try {
      const snap = await getDoc(convRef);
      if (snap.exists()) return snap.id;

      await setDoc(convRef, {
        type: 'direct',
        participants: [myDid, targetDid],
        updatedAt: serverTimestamp(),
        isIsolated: false,
        protocol: 'REALEX_P2P_v3'
      });
      return channelId;
    } catch (e) { 
      handleFirestoreError(e, 'write', `conversations/${channelId}`);
      return null;
    }
  },

  // Messaging
  async sendMessage(convId: string, encryptedPayload: { content: string, protocol: string, nonce: string, type: string, ttl?: number }) {
    const myDid = localStorage.getItem('NXS_IDENTITY_DID');
    if (!myDid) return;
    
    const msgRef = collection(db, 'conversations', convId, 'messages');
    try {
      await addDoc(msgRef, {
        senderId: myDid,
        ...encryptedPayload,
        timestamp: serverTimestamp()
      });
      
      // Update conversation timestamp
      await updateDoc(doc(db, 'conversations', convId), {
        updatedAt: serverTimestamp()
      });
    } catch (e) { handleFirestoreError(e, 'create', `conversations/${convId}/messages`); }
  },

  subscribeToMessages(convId: string, callback: (messages: any[]) => void) {
    const q = query(
      collection(db, 'conversations', convId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    
    return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const messages = snapshot.docs.map(d => {
        const data = d.data();
        // Optimistic rendering resilience: when serverTimestamp hasn't round-tripped yet
        const timestamp = data.timestamp ? (data.timestamp as Timestamp).toDate().getTime() : Date.now();
        return {
          id: d.id,
          ...data,
          timestamp,
          isPending: snapshot.metadata.hasPendingWrites
        };
      });
      callback(messages);
    }, (e) => handleFirestoreError(e, 'list', `conversations/${convId}/messages`));
  },

  async saveContact(contactData: { did: string, sharedKey: string, convId: string, addedAt?: number }) {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'contacts', contactData.did), {
        ...contactData,
        addedAt: contactData.addedAt || Date.now(),
        name: "NOMAD_" + contactData.did.slice(-4).toUpperCase() // Default name
      });
      console.log(`✅ CONTACT_SAVED::DID=${contactData.did}`);
    } catch (e) {
      handleFirestoreError(e, 'write', `users/${auth.currentUser.uid}/contacts/${contactData.did}`);
    }
  },

  // Invites
  async createInvite(groupId: string, ttlHours: number = 72) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);
    
    try {
      await setDoc(doc(db, 'invites', code), {
        groupId,
        code,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdBy: auth.currentUser?.uid || 'system'
      });
      return code;
    } catch (e) { handleFirestoreError(e, 'create', 'invites'); }
  }
};
