// /cloud-functions/index.js
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

/**
 * Cloud Function: 监听好友请求状态变更，自动推送通知给接收方
 */
exports.onFriendRequestAccepted = onDocumentUpdated(
  'friend_requests/{requestId}',
  async (event) => {
    const after = event.data.after.data();
    const before = event.data.before.data();

    // 状态闭环逻辑检查: 仅处理 pending -> accepted 的变更
    if (before.status === 'pending' && after.status === 'accepted') {
      const fromUid = after.fromUid;
      const toUid = after.toUid;

      console.log(`🚀 [BACKEND_SYNC] 握手协议闭环：节点 ${fromUid} 与节点 ${toUid} 已正式关联。`);

      // 自动写入通知集合，前端 SDK 监听此记录以在 UI 上显示弹窗
      await db.collection('notifications').add({
        userId: fromUid,
        type: 'FRIEND_ACCEPTED',
        peerDid: toUid,
        timestamp: new Date().getTime(),
        read: false
      });
      
      return { success: true };
    }
  }
);
