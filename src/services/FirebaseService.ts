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
  // User Management
  async syncUserProfile(did: string, name: string, avatar?: string) {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      const avatarApi = import.meta.env.VITE_AVATAR_API || 'https://api.dicebear.com/7.x/pixel-art/svg';
      await setDoc(userRef, {
        did,
        name,
        avatar: avatar || `${avatarApi}?seed=${did}`,
        status: 'online',
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) { handleFirestoreError(e, 'write', `users/${auth.currentUser.uid}`); }
  },

  // Conversation Management
  async getOrCreateDirectConversation(targetDid: string) {
    if (!auth.currentUser) return null;
    const myUid = auth.currentUser.uid;
    
    // Check for existing conversation with these participants
    const q = query(
      collection(db, 'conversations'),
      where('type', '==', 'direct'),
      where('participants', 'array-contains', myUid)
    );
    
    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find(d => d.data().participants.includes(targetDid));
    
    if (existing) return existing.id;

    // Create new
    const convRef = await addDoc(collection(db, 'conversations'), {
      type: 'direct',
      participants: [myUid, targetDid],
      updatedAt: serverTimestamp(),
      isIsolated: false
    });
    return convRef.id;
  },

  // Messaging
  async sendMessage(convId: string, encryptedPayload: { content: string, protocol: string, nonce: string, type: string, ttl?: number }) {
    if (!auth.currentUser) return;
    const msgRef = collection(db, 'conversations', convId, 'messages');
    try {
      await addDoc(msgRef, {
        senderId: auth.currentUser.uid,
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
