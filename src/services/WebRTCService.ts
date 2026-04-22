import { FirebaseService } from './FirebaseService';
import { auth } from '../lib/firebase';

type SignalPayload =
  | { type: 'offer'; sdp: string | null }
  | { type: 'answer'; sdp: string | null }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit };

interface EncryptedSignalEnvelope {
  v: 1;
  alg: 'AES-GCM';
  iv: string;
  data: string;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private convId: string;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onConnectionStateChange: ((state: RTCPeerConnectionState) => void) | null = null;
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private isRemoteDescriptionSet = false;
  private signalEncryptionKey: CryptoKey | null = null;

  constructor(convId: string) {
    this.convId = convId;
  }

  public setCallbacks(
    onRemote: (stream: MediaStream) => void,
    onStateChange: (state: RTCPeerConnectionState) => void
  ) {
    this.onRemoteStreamCallback = onRemote;
    this.onConnectionStateChange = onStateChange;
  }

  public async setSignalEncryptionKey(base64Key?: string) {
    if (!base64Key) {
      this.signalEncryptionKey = null;
      return;
    }
    this.signalEncryptionKey = await this.importAesKey(base64Key);
  }

  public async startLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
      if (this.peerConnection) {
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }
      return this.localStream;
    } catch (err) {
      console.error("WebRTC Error: Could not get user media", err);
      throw err;
    }
  }

  private initPeerConnection(createDataChannel: boolean = false) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    this.pendingIceCandidates = [];
    this.isRemoteDescriptionSet = false;

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    if (createDataChannel) {
      this.dataChannel = this.peerConnection.createDataChannel('nexus-secure-channel');
    }

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
    };

    // Handle remote tracks
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        void this.sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate.toJSON()
        } as SignalPayload);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection!.connectionState);
      }
    };
  }

  public async createOffer() {
    this.initPeerConnection(true);
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      await this.sendSignal({
        type: 'offer',
        sdp: offer.sdp
      } as SignalPayload);
    } catch (err) {
      console.error("WebRTC Error creating offer:", err);
    }
  }

  public async handleIncomingSignal(
    signalPayload: string | SignalPayload,
    senderId?: string
  ): Promise<SignalPayload['type'] | null> {
    if (senderId && senderId === auth.currentUser?.uid) return null;

    const payload = await this.decodeSignalPayload(signalPayload);
    if (!payload) return null;

    if (!this.peerConnection) {
      if (payload.type === 'offer') {
        this.initPeerConnection(false);
      } else {
        return payload.type; // Ignore other signals if no peer connection is active
      }
    }

    try {
      if (payload.type === 'offer') {
        const remoteDesc = new RTCSessionDescription({ type: 'offer', sdp: payload.sdp });
        await this.peerConnection!.setRemoteDescription(remoteDesc);
        this.isRemoteDescriptionSet = true;
        await this.processIceQueue();
        await this.acceptCall();
      } else if (payload.type === 'answer') {
        const remoteDesc = new RTCSessionDescription({ type: 'answer', sdp: payload.sdp });
        await this.peerConnection!.setRemoteDescription(remoteDesc);
        this.isRemoteDescriptionSet = true;
        await this.processIceQueue();
      } else if (payload.type === 'ice-candidate') {
        if (!this.isRemoteDescriptionSet || !this.peerConnection.remoteDescription) {
          this.pendingIceCandidates.push(payload.candidate);
          return payload.type;
        }
        const candidate = new RTCIceCandidate(payload.candidate);
        await this.peerConnection!.addIceCandidate(candidate);
      }
    } catch (err) {
      console.error("WebRTC Error handling signal:", err);
    }
    return payload.type;
  }

  public async acceptCall() {
    if (!this.peerConnection) return;
    if (this.peerConnection.signalingState !== 'have-remote-offer') return;
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      await this.sendSignal({
        type: 'answer',
        sdp: answer.sdp
      } as SignalPayload);
    } catch (err) {
      console.error("WebRTC Error accepting call:", err);
    }
  }

  private async decodeSignalPayload(signalPayload: string | SignalPayload): Promise<SignalPayload | null> {
    if (typeof signalPayload !== 'string') return signalPayload;

    try {
      const parsed = JSON.parse(signalPayload);
      if (this.isEncryptedEnvelope(parsed)) {
        if (!this.signalEncryptionKey) {
          console.warn('WebRTC Warning: encrypted signal received without session key');
          return null;
        }
        const decrypted = await this.decryptSignal(parsed);
        return JSON.parse(decrypted) as SignalPayload;
      }
      return this.isSignalPayload(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  private isSignalPayload(payload: any): payload is SignalPayload {
    if (!payload || typeof payload !== 'object' || typeof payload.type !== 'string') return false;
    if (payload.type === 'offer' || payload.type === 'answer') {
      return typeof payload.sdp === 'string' || payload.sdp === null;
    }
    if (payload.type === 'ice-candidate') {
      return !!payload.candidate && typeof payload.candidate === 'object';
    }
    return false;
  }

  private isEncryptedEnvelope(payload: any): payload is EncryptedSignalEnvelope {
    return payload?.alg === 'AES-GCM' && typeof payload?.iv === 'string' && typeof payload?.data === 'string';
  }

  private async processIceQueue() {
    while (this.pendingIceCandidates.length > 0) {
      const candidateInit = this.pendingIceCandidates.shift();
      if (!candidateInit) continue;
      try {
        await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidateInit));
      } catch (e) {
        console.error("WebRTC Error processing queued ICE:", e);
      }
    }
  }

  private async sendSignal(payload: SignalPayload) {
    if (!auth.currentUser) return;
    
    const rawContent = JSON.stringify(payload);
    const content = this.signalEncryptionKey
      ? JSON.stringify(await this.encryptSignal(rawContent))
      : rawContent;
    
    await FirebaseService.sendMessage(this.convId, {
      content,
      protocol: 'webrtc-signaling',
      nonce: Math.random().toString(36).slice(2),
      type: 'signal'
    });
  }

  private async importAesKey(base64Key: string): Promise<CryptoKey> {
    const normalized = base64Key.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return window.crypto.subtle.importKey(
      'raw',
      bytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async encryptSignal(plain: string): Promise<EncryptedSignalEnvelope> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.signalEncryptionKey!,
      new TextEncoder().encode(plain)
    );
    return {
      v: 1,
      alg: 'AES-GCM',
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)))
    };
  }

  private async decryptSignal(envelope: EncryptedSignalEnvelope): Promise<string> {
    const iv = Uint8Array.from(atob(envelope.iv), (char) => char.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(envelope.data), (char) => char.charCodeAt(0));
    const plainBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.signalEncryptionKey!,
      encrypted
    );
    return new TextDecoder().decode(plainBuffer);
  }

  public stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.pendingIceCandidates = [];
    this.isRemoteDescriptionSet = false;
  }
}
