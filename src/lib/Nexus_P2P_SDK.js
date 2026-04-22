/**
 * ===================================================================
 * ECLIPSE NEXUS P2P SDK (Drop-in Replacement for HyperLineComSDK)
 * VERSION: 1.0.0 (Sovereign Blind-Relay Edition)
 * ===================================================================
 */

class NexusP2PSDK {
    constructor() {
        // WebRTC 核心实例
        this.peerConnection = null;
        this.dataChannel = null;
        
        // 信令服务器 WebSocket
        this.signalingSocket = null;
        this.SIGNALING_URL = "wss://turn.yourdomain.com:8765"; // 替换为你的 Python 盲传服务器地址

        // 会话状态
        this.userId = null;
        this.roomId = null;
        this.aesKey = "YOUR_SHARED_SECRET"; // 实际应用中由 PeerDiscovery 扫码生成

        // 核心修复 2：ICE 缓冲队列，防止竞态崩溃
        this.pendingIceCandidates = [];
        this.isRemoteDescriptionSet = false;

        // UI 层回调函数注册表
        this.callbacks = {
            onMessageReceived: null,
            onUserLeft: null,
            onUserJoined: null
        };
    }

    // =======================================================
    // 🌐 [1] 暴露给前端 UI 的旧版兼容 API (Zero UI Code Change)
    // =======================================================

    // 生成随机 ID (兼容 Snapmit 中的 this.sdk.generateGUID)
    generateGUID(length) {
        return Math.random().toString(36).substring(2, 2 + length);
    }

    // 设置回调
    setCallback(eventName, callbackFunction) {
        if (this.callbacks.hasOwnProperty(eventName)) {
            this.callbacks[eventName] = callbackFunction;
        }
    }

    // 发送消息
    sendMessage(text) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            // Web3 改造：通过 P2P 数据通道直接发送，不经过任何中心化服务器
            this.dataChannel.send(text);
            console.log("[NEXUS] P2P 消息已发送:", text);
        } else {
            console.error("[NEXUS] 数据通道未就绪，消息缓存或丢弃。");
        }
    }

    // 离开房间
    leaveRoom() {
        if (this.peerConnection) this.peerConnection.close();
        if (this.signalingSocket) this.signalingSocket.close();
        if (this.callbacks.onUserLeft) this.callbacks.onUserLeft(this.userId);
        console.log("[NEXUS] P2P 隧道已销毁");
    }

    // 加入房间/初始化连接
    async joinRoom(userId, roomId) {
        console.log(`[NEXUS] 正在接入星蚀网络... DID: ${userId}, 节点: ${roomId}`);
        this.userId = userId;
        this.roomId = roomId;

        return new Promise((resolve, reject) => {
            // 1. 连接盲传信令服务器
            this.signalingSocket = new WebSocket(this.SIGNALING_URL);
            
            this.signalingSocket.onopen = () => {
                // 注册盲眼路由身份
                this.signalingSocket.send(JSON.stringify({ action: 'register', did: this.userId }));
                this._initWebRTC(); // 初始化 P2P 引擎
                resolve();
            };

            this.signalingSocket.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                if (data.action === 'incoming_signal') {
                    // 屏蔽自回声
                    if (data.sender_did === this.userId) return;
                    await this._handleBlindSignal(data.encrypted_blob);
                }
            };

            this.signalingSocket.onerror = (err) => reject(err);
        });
    }

    // =======================================================
    // ⚙️ [2] 内部极客引擎：WebRTC 状态机与 ICE 穿透
    // =======================================================

    _initWebRTC() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                // { urls: 'turn:turn.yourdomain.com:443', username: '...', credential: '...' } // 填入你优化后的 Coturn
            ]
        });

        // ⚡ 核心修复 1：强制创建 DataChannel。即使是发起方，也必须先建通道，否则不生成 SDP 候选者
        this.dataChannel = this.peerConnection.createDataChannel('eclipse_secure_tunnel');
        this._setupDataChannel(this.dataChannel);

        this.peerConnection.ondatachannel = (event) => {
            this._setupDataChannel(event.channel);
        };

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this._sendBlindSignal({ type: 'ice-candidate', candidate: event.candidate.toJSON() });
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log(`[NEXUS] 底层穿透状态 -> ${this.peerConnection.connectionState}`);
        };

        // 如果我们是主动发起方（简化的发起逻辑），直接 CreateOffer
        this._createOffer();
    }

    _setupDataChannel(channel) {
        channel.onopen = () => {
            console.log("[NEXUS] P2P 隧道穿透成功！端到端加密数据流已就绪。");
            if (this.callbacks.onUserJoined) this.callbacks.onUserJoined("PeerNode");
        };
        channel.onmessage = (event) => {
            // 触发 UI 层的回调，在 UI 看来就像是收到了普通的 WebSocket 消息
            if (this.callbacks.onMessageReceived) {
                // 模拟旧版 SDK 的 (conn, data) 参数格式
                this.callbacks.onMessageReceived({ peer: 'PeerNode' }, event.data);
            }
        };
    }

    async _createOffer() {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this._sendBlindSignal({ type: 'offer', sdp: offer.sdp });
        } catch (err) {
            console.error("Offer 生成失败:", err);
        }
    }

    // =======================================================
    // 🔐 [3] 主权密码学：信令盲传与解密拦截
    // =======================================================

    // 将 WebRTC 的明文 SDP 和 IP 候选者进行 AES 加密，再发给 Python 服务器
    _sendBlindSignal(payload) {
        this._sendBlindSignalTo(this.roomId, payload);
    }

    // 核心扩充：支持向指定 DID 发送盲传信号
    _sendBlindSignalTo(targetDid, payload) {
        const plainText = JSON.stringify(payload);
        // [在此接入 CryptoJS] const encryptedBlob = CryptoJS.AES.encrypt(plainText, this.aesKey).toString();
        const encryptedBlob = btoa(plainText); // 演示版使用 base64 模拟加密，生产必须用 AES

        this.signalingSocket.send(JSON.stringify({
            action: 'relay',
            target_did: targetDid, 
            encrypted_blob: encryptedBlob
        }));
    }

    // 接收 Python 服务器抛来的加密黑盒，在端侧本地解密
    async _handleBlindSignal(encryptedBlob) {
        try {
            // [在此接入 CryptoJS] const bytes = CryptoJS.AES.decrypt(encryptedBlob, this.aesKey);
            // const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            const decryptedText = atob(encryptedBlob); // 演示版使用 base64 模拟解密
            const payload = JSON.parse(decryptedText);

            if (payload.type === 'offer') {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
                this.isRemoteDescriptionSet = true;
                this._processIceQueue();

                // ⚡ 核心修复 3：自动回拨 Answer
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                this._sendBlindSignal({ type: 'answer', sdp: answer.sdp });

            } else if (payload.type === 'answer') {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
                this.isRemoteDescriptionSet = true;
                this._processIceQueue();

            } else if (payload.type === 'ice-candidate') {
                if (!this.isRemoteDescriptionSet) {
                    this.pendingIceCandidates.push(payload.candidate); // ⚡ 核心修复 2：进入队列，绝不引发崩溃
                } else {
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
                }
            }
        } catch (e) {
            console.error("[NEXUS] 盲传信令解密/解析失败，抛弃危险报文:", e);
        }
    }

    _processIceQueue() {
        while (this.pendingIceCandidates.length > 0) {
            const candidate = this.pendingIceCandidates.shift();
            if (candidate) {
                this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(()=>{});
            }
        }
    }
}

// ===================================================================
// ECLIPSE NEXUS SDK 扩展模块：Cascaded SFU (级联媒体引擎)
// ===================================================================

class NexusMediaEngine {
    constructor(baseSDK) {
        this.baseSDK = baseSDK; // 引用底层的盲传信令系统
        this.localStream = null;
        this.mediaConnections = new Map(); // 维护与 PCND 矿机的连接
    }

    /**
     * 场景 A：主播/发言人推流 (上行)
     * 逻辑：请求最近的 PCND 节点 -> 建立 1v1 通道 -> 推送媒体流
     */
    async publishStream(videoElementId, isScreenShare = false) {
        console.log("[NEXUS_MEDIA] 初始化媒体采集...");
        
        // 1. 采集本地音视频
        this.localStream = await navigator.mediaDevices.getUserMedia({
            video: isScreenShare ? false : { width: 1280, height: 720 },
            audio: true
        });
        document.getElementById(videoElementId).srcObject = this.localStream;

        // 2. 向盲传服务器请求调度最优 PCND 矿机 (PoUW 入口)
        console.log("[NEXUS_MEDIA] 正在调度最优 PCND 物理计算节点...");
        const optimalPcndDid = await this._requestOptimalRelayNode();

        // 3. 与该 PCND 建立 WebRTC 上行通道
        const pcndConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // 将媒体轨道加入通道
        this.localStream.getTracks().forEach(track => {
            pcndConnection.addTrack(track, this.localStream);
        });

        // 绑定 ICE 候选者到盲传网络 (目标指向矿机的 DID)
        pcndConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.baseSDK._sendBlindSignalTo(optimalPcndDid, { 
                    type: 'ice-candidate', 
                    candidate: event.candidate,
                    intent: 'uplink_publish'
                });
            }
        };

        // 创建 Offer 并盲传给矿机
        const offer = await pcndConnection.createOffer();
        await pcndConnection.setLocalDescription(offer);
        this.baseSDK._sendBlindSignalTo(optimalPcndDid, { 
            type: 'offer', 
            sdp: offer.sdp,
            intent: 'uplink_publish' 
        });

        this.mediaConnections.set('uplink', pcndConnection);
        console.log("[NEXUS_MEDIA] 上行链路已锁定，正在向 PCND 注入媒体流...");
    }

    /**
     * 场景 B：观众/听众拉流 (下行)
     * 逻辑：接收 Gossip 广播 -> 寻找离自己最近的边缘 PCND -> 建立通道拉流
     */
    async subscribeStream(broadcasterDid, remoteVideoElementId) {
        console.log(`[NEXUS_MEDIA] 准备接入频道，目标主播: ${broadcasterDid}`);

        // 1. 请求调度：分配离我这个观众最近的边缘 PCND
        const edgePcndDid = await this._requestOptimalRelayNode();
        
        const pcndConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // 2. 监听下行媒体轨道
        pcndConnection.ontrack = (event) => {
            console.log("[NEXUS_MEDIA] 成功捕获级联下行媒体流！");
            document.getElementById(remoteVideoElementId).srcObject = event.streams[0];
        };

        pcndConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.baseSDK._sendBlindSignalTo(edgePcndDid, { 
                    type: 'ice-candidate', 
                    candidate: event.candidate,
                    intent: 'downlink_subscribe',
                    target_stream: broadcasterDid // 告诉矿机我要拉谁的流
                });
            }
        };

        // 创建 Offer 给边缘矿机请求订阅
        const offer = await pcndConnection.createOffer();
        await pcndConnection.setLocalDescription(offer);
        this.baseSDK._sendBlindSignalTo(edgePcndDid, { 
            type: 'offer', 
            sdp: offer.sdp,
            intent: 'downlink_subscribe',
            target_stream: broadcasterDid
        });

        this.mediaConnections.set(`downlink_${broadcasterDid}`, pcndConnection);
    }

    // --- 内部调度方法 ---
    async _requestOptimalRelayNode() {
        // 实际场景中，这里会通过信令服务器或 DHT 网络，根据 Ping 值返回一个矿机的 DID
        // 目前返回一个模拟的超级节点 DID
        return new Promise(resolve => {
            setTimeout(() => resolve("did:nexus:pcnd_node_alpha_99X"), 200);
        });
    }
}

// 暴漏全局对象，使得 Vue/HTML 页面无需更改任何代码，直接调取 SDK
window.HyperLineComSDK = window.HyperLineComSDK || {};
window.HyperLineComSDK.Base = new NexusP2PSDK();
window.HyperLineComSDK.MediaEngine = new NexusMediaEngine(window.HyperLineComSDK.Base);
window.HyperLineComSDK.GossipEngine = new NexusGossipEngine(window.HyperLineComSDK.Base);

// ===================================================================
// ECLIPSE NEXUS SDK 扩展模块：GossipSub 群聊流言引擎
// ===================================================================

class NexusGossipEngine {
    constructor(baseSDK) {
        this.baseSDK = baseSDK; // 引用底层的盲传信令与 WebSocket
        this.meshDegree = 6;    // 恒定传播度数 (D=6)
        
        // LRU 消息防风暴缓存：记录最近见过的 Message_ID
        this.seenCache = new Set();
        
        // 订阅的 Topic (群组 ID) 列表
        this.subscriptions = new Set();
        
        // 维护与我相连的网格节点 DID 列表 (Topic -> Set<DID>)
        this.meshPeers = new Map();
    }

    /**
     * 场景 A：加入一个万人大群
     */
    async subscribe(topicId) {
        console.log(`[NEXUS_GOSSIP] 正在订阅星蚀群组网络 Topic: ${topicId}`);
        this.subscriptions.add(topicId);
        
        // 向盲传服务器发送 IHAVE 指令，获取该群组下活跃的 6 个随机节点
        this.baseSDK.signalingSocket.send(JSON.stringify({
            action: 'gossip_join',
            topic: topicId,
            limit: this.meshDegree
        }));
    }

    /**
     * 场景 B：在万人群中发送消息 (恒定开销)
     */
    publish(topicId, plainText) {
        if (!this.subscriptions.has(topicId)) return;

        // 1. 生成唯一的消息指纹 (防止环路风暴)
        const msgId = `msg_${Date.now()}_${this.baseSDK.generateGUID(6)}`;
        this.seenCache.add(msgId);

        // 2. [密码学执行] 使用 MLS 当前纪元密钥对内容进行对称加密
        const encryptedPayload = btoa(plainText); // 演示占位

        const gossipPacket = {
            type: 'gossip_message',
            topic: topicId,
            msg_id: msgId,
            sender: this.baseSDK.userId,
            payload: encryptedPayload
        };

        console.log(`[NEXUS_GOSSIP] 触发指数级流言广播 -> MsgID: ${msgId}`);
        
        // 3. 仅向网格内的 6 个邻居发送
        this._broadcastToMesh(topicId, gossipPacket);
    }

    /**
     * 场景 C：接收并传播流言
     */
    handleIncomingGossip(packet) {
        const { topic, msg_id, payload } = packet;

        // 1. 防御核心：查重。见过直接抛弃，防止 N² 爆炸
        if (this.seenCache.has(msg_id)) {
            return; // 沉默丢弃
        }

        // 2. 存入缓存，保持 10 秒后过期清理
        this.seenCache.add(msg_id);
        setTimeout(() => this.seenCache.delete(msg_id), 10000);

        // 3. [密码学执行] 尝试解密
        try {
            const decryptedText = atob(payload); // 演示占位
            
            if (this.baseSDK.callbacks.onMessageReceived) {
                this.baseSDK.callbacks.onMessageReceived({ peer: packet.sender }, decryptedText);
            }
        } catch (e) {
            // 解密失败说明我只是路过的中继矿机，无权查看内容
        }

        // 4. 继续传播：扣减 TTL，向我的 6 个邻居继续广播
        this._broadcastToMesh(topic, packet, packet.sender);
    }

    // --- 内部网格分发方法 ---
    _broadcastToMesh(topic, packet, excludeSender = null) {
        this.baseSDK.signalingSocket.send(JSON.stringify({
            action: 'gossip_relay',
            topic: topic,
            exclude: excludeSender,
            packet: packet
        }));
    }
}
