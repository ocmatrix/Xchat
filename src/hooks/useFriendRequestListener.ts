import { useEffect } from 'react';
import { FriendRequestService } from '../services/FriendRequestService';
import { NexusContactService } from '../services/NexusContactService';

export const useFriendRequestListener = (userId: string | null) => {
  useEffect(() => {
    if (!userId) return;

    // B-side: Listen for requests
    const unsubscribeRequests = FriendRequestService.subscribeToFriendRequests(
      userId,
      (allRequests) => {
        console.log("🔄 [GCP_SYNC] 好友请求列表更新:", allRequests.length);
      },
      (newReq) => {
        console.log("💌 [NEW_REQUEST] 检测到新请求:", newReq.fromUid);
        // 此处可接入您应用内的 Toast 通讯系统
      }
    );

    // A-side: Listen for accepted confirmations
    const unsubscribeAcl = FriendRequestService.listenForAclConfirmations(
      userId,
      (requestId, peerDid) => {
         console.log("🔥 收到握手回执，自动写入本地:", peerDid);
         NexusContactService.saveContactLocally({ 
           did: peerDid, 
           sharedKey: 'PENDING_HANDSHAKE', // placeholder
           convId: `p2p_${[peerDid, userId].sort().join('_')}` // need generated convId
         });
      }
    );

    return () => {
      unsubscribeRequests();
      unsubscribeAcl();
    };
  }, [userId]);
};
