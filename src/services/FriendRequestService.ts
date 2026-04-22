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

  // 3. 实时监听 (保留，用于 UI 自动弹窗)
  static listenToRequests(myUid: string, callback: (requests: any[]) => void) {
    // 这里依然使用 Firestore SDK 的 onSnapshot，但权限在 firestore.rules 中设为只读
    return onSnapshot(
      query(collection(db, "friend_requests"), where("toUid", "==", myUid), where("status", "==", "pending")),
      (snapshot) => {
        const reqs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(reqs);
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
}
