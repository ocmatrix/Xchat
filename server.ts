import express from 'express';
import { Firestore } from '@google-cloud/firestore';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = new Firestore(); // GCP IAM credentials used automatically

  app.use(express.json());
  app.use(cors());

  // API Endpoints
  // 发起好友请求：后端校验并写入
  app.post('/api/friends/request', async (req, res) => {
    const { fromUid, toUid, message } = req.body;
    try {
      const existing = await db.collection('friend_requests')
          .where('fromUid', '==', fromUid)
          .where('toUid', '==', toUid)
          .get();

      if (!existing.empty) return res.status(400).send('请求已存在');

      await db.collection('friend_requests').add({
          fromUid,
          toUid,
          message,
          status: 'pending',
          timestamp: new Date()
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 接受好友请求：实现双向握手闭环
  app.post('/api/friends/accept', async (req, res) => {
    const { requestId, myUid } = req.body;
    try {
      const requestRef = db.collection('friend_requests').doc(requestId);
      const doc = await requestRef.get();

      if (!doc.exists || doc.data()!.toUid !== myUid) {
          return res.status(403).send('无权操作');
      }

      const { fromUid } = doc.data()!;

      // 原子操作：更新状态并建立双向好友关系
      const conversationId = [fromUid, myUid].sort().join('_');
      await db.runTransaction(async (t) => {
          t.update(requestRef, { status: 'accepted' });
          t.set(db.collection('conversations').doc(conversationId), {
              members: [fromUid, myUid],
              createdAt: new Date()
          }, { merge: true });
      });

      res.status(200).json({ success: true, conversationId, peerId: fromUid });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // P2P Handshake: Direct encrypted connection bootstrap
  app.post('/api/p2p/handshake', async (req, res) => {
    const { initiatorDid, targetDid, encryptionKey } = req.body;
    try {
      // Basic validation
      if (!initiatorDid || !targetDid || !encryptionKey) {
        return res.status(400).send('Missing handshake parameters');
      }
      
      // LOG: Perform secure signal routing logic here
      console.log(`📡 [P2P_HANDSHAKE] ${initiatorDid} -> ${targetDid}`);

      res.status(200).json({ success: true, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
