import { FirebaseService } from './FirebaseService';
import { auth } from '../lib/firebase';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private convId: string;
  
  // 核心修复 2：ICE 缓冲队列
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private isRemoteDescriptionSet: boolean = false;

  private onMessageCallback: ((msg: string) => void) | null = null;
  private onConnectionStateChange: ((info: { state: RTCPeerConnectionState, message: string, health: 'green' | 'yellow' | 'red' }) => void) | null = null;

  constructor(convId: string) {
    this.convId = convId;
  }

  public setCallbacks(
    onMessage: (msg: string) => void,
    onStateChange: (info: { state: RTCPeerConnectionState, message: string, health: 'green' | 'yellow' | 'red' }) => void
  ) {
    this.onMessageCallback = onMessage;
    this.onConnectionStateChange = onStateChange;
  }

  private getStatusInfo(state: RTCPeerConnectionState): { message: string, health: 'green' | 'yellow' | 'red' } {
    switch (state) {
      case 'connecting': return { message: "Establishing P2P tunnel...", health: 'yellow' };
      case 'connected': return { message: "Tunnel active & secure.", health: 'green' };
      case 'disconnected': return { message: "Link interrupted. Recovering...", health: 'yellow' };
      case 'failed': return { message: "Connection failed. Network restrictive.", health: 'red' };
      case 'closed': return { message: "Tunnel destroyed.", health: 'red' };
      default: return { message: "Initializing...", health: 'yellow' };
    }
  }

  private initPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // 核心修复 1：即使没有音视频，也必须创建数据通道，否则不生成 SDP 候选者
    this.dataChannel = this.peerConnection.createDataChannel('chat');
    this.setupDataChannel(this.dataChannel);

    // 监听对方创建的数据通道
    this.peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate.toJSON()
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state && this.onConnectionStateChange) {
        this.onConnectionStateChange({ state, ...this.getStatusInfo(state) });
      }
    };
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => console.log("[WebRTC] DataChannel OPENED! P2P Ready.");
    channel.onmessage = (event) => {
      if (this.onMessageCallback) this.onMessageCallback(event.data);
    };
  }

  public async createOffer() {
    this.initPeerConnection();
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignal({ type: 'offer', sdp: offer.sdp });
    } catch (err) {
      console.error("WebRTC Error creating offer:", err);
    }
  }

  // UI 层监听到 Firebase 消息时，调用此方法 (务必在 UI 过滤掉自己的消息)
  public async handleIncomingSignal(payload: any, senderId: string) {
    // 核心修复 4：拦截自己的信令反射
    if (senderId === auth.currentUser?.uid) return;

    if (!this.peerConnection) {
      if (payload.type === 'offer') {
        this.initPeerConnection();
      } else {
        return; 
      }
    }

    try {
      if (payload.type === 'offer') {
        const remoteDesc = new RTCSessionDescription({ type: 'offer', sdp: payload.sdp });
        await this.peerConnection!.setRemoteDescription(remoteDesc);
        this.isRemoteDescriptionSet = true;
        
        // 处理之前积压的 ICE 候选者
        this.processIceQueue();
        
        // 核心修复 3：收到 Offer 后自动回拨 Answer
        await this.acceptCall();

      } else if (payload.type === 'answer') {
        const remoteDesc = new RTCSessionDescription({ type: 'answer', sdp: payload.sdp });
        await this.peerConnection!.setRemoteDescription(remoteDesc);
        this.isRemoteDescriptionSet = true;
        this.processIceQueue();

      } else if (payload.type === 'ice-candidate') {
        // 核心修复 2：如果 RemoteDescription 还没好，先入队列
        if (!this.isRemoteDescriptionSet) {
          this.pendingIceCandidates.push(payload.candidate);
        } else {
          await this.peerConnection!.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      }
    } catch (err) {
      console.error("[WebRTC] Signal handling error:", err);
    }
  }

  private async processIceQueue() {
    while (this.pendingIceCandidates.length > 0) {
      const candidateInit = this.pendingIceCandidates.shift();
      if (candidateInit) {
        await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidateInit))
          .catch(e => console.error("Error adding queued ICE:", e));
      }
    }
  }

  private async acceptCall() {
    if (!this.peerConnection) return;
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.sendSignal({ type: 'answer', sdp: answer.sdp });
    } catch (err) {
      console.error("WebRTC Error accepting call:", err);
    }
  }

  private sendSignal(payload: any) {
    if (!auth.currentUser) return;
    
    // TODO: 核心修复 5 - 这里需要使用 PeerDiscovery 生成的 AES key 将 payload 加密
    const content = JSON.stringify(payload); 
    
    FirebaseService.sendMessage(this.convId, {
      content,
      protocol: 'webrtc-signaling',
      nonce: Math.random().toString(36).slice(2),
      type: 'signal'
    });
  }
}
