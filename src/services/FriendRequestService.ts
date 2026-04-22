// src/services/FriendRequestService.ts
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { NexusContactService } from './NexusContactService';

export class FriendRequestService {
  private static API_BASE = "/api"; 

  // 1. 发起请求 (改用 API)
  static async sendRequest(fromUid: string, toUid: string) {
    const response = await fetch(`${this.API_BASE}/friends/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUid, toUid })
    });
    return response.json();
  }

  // 2. 接受请求并同步本地存储 (关键修复：双向闭环)
  static async acceptRequest(requestId: string, myUid: string) {
    const response = await fetch(`${this.API_BASE}/friends/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, myUid })
    });

    const data = await response.json();
    if (data.success) {
      // 核心修复：调用 NexusContactService 将对方存入 Local Storage
      await NexusContactService.saveContact({
        uid: data.peerId,
        chatId: data.conversationId,
        status: 'active'
      });
    }
    return data;
  }

  // 3. 实时监听: 订阅好友请求
  static subscribeToFriendRequests(
    toUid: string, 
    onRequestsUpdated: (requests: any[]) => void,
    onNewRequest?: (request: any) => void
  ) {
    // 监听 FriendRequests 状态为 pending
    return onSnapshot(
      query(collection(db, "friend_requests"), where("toUid", "==", toUid), where("status", "==", "pending")),
      (snapshot) => {
        if (onNewRequest) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' && !snapshot.metadata.fromCache) {
              onNewRequest({ id: change.doc.id, ...change.doc.data() });
            }
          });
        }

        const reqs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onRequestsUpdated(reqs);
      }
    );
  }

  static async p2pHandshake(initiatorDid: string, targetDid: string, encryptionKey: string) {
    const response = await fetch(`${this.API_BASE}/p2p/handshake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initiatorDid, targetDid, encryptionKey })
    });
    return response.json();
  }

  static listenForAclConfirmations(myUid: string, onAccepted: (requestId: string, peerDid: string) => void) {
    const q = query(
      collection(db, "friend_requests"),
      where("fromUid", "==", myUid),
      where("status", "==", "accepted")
    );

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified' && !snapshot.metadata.fromCache) {
          onAccepted(change.doc.id, change.doc.data().toUid);
        }
      });
    });
  }
}
