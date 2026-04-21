import { FirebaseService } from './FirebaseService';
import { auth } from '../lib/firebase';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private convId: string;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onConnectionStateChange: ((state: RTCPeerConnectionState) => void) | null = null;

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

  public async startLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
      return this.localStream;
    } catch (err) {
      console.error("WebRTC Error: Could not get user media", err);
      throw err;
    }
  }

  private initPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

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
        this.sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate.toJSON()
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection!.connectionState);
      }
    };
  }

  public async createOffer() {
    this.initPeerConnection();
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignal({
        type: 'offer',
        sdp: offer.sdp
      });
    } catch (err) {
      console.error("WebRTC Error creating offer:", err);
    }
  }

  public async handleIncomingSignal(signalPayload: string) {
    let payload;
    try {
      payload = JSON.parse(signalPayload);
    } catch (e) { return; }

    if (!this.peerConnection) {
      if (payload.type === 'offer') {
        this.initPeerConnection();
      } else {
        return; // Ignore other signals if no peer connection is active
      }
    }

    try {
      if (payload.type === 'offer') {
        const remoteDesc = new RTCSessionDescription({ type: 'offer', sdp: payload.sdp });
        await this.peerConnection!.setRemoteDescription(remoteDesc);
      } else if (payload.type === 'answer') {
        const remoteDesc = new RTCSessionDescription({ type: 'answer', sdp: payload.sdp });
        await this.peerConnection!.setRemoteDescription(remoteDesc);
      } else if (payload.type === 'ice-candidate') {
        const candidate = new RTCIceCandidate(payload.candidate);
        await this.peerConnection!.addIceCandidate(candidate);
      }
    } catch (err) {
      console.error("WebRTC Error handling signal:", err);
    }
  }

  public async acceptCall() {
    if (!this.peerConnection) return;
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.sendSignal({
        type: 'answer',
        sdp: answer.sdp
      });
    } catch (err) {
      console.error("WebRTC Error accepting call:", err);
    }
  }

  private sendSignal(payload: any) {
    if (!auth.currentUser) return;
    
    // Encrypt or serialize the signal payload
    const content = JSON.stringify(payload);
    
    FirebaseService.sendMessage(this.convId, {
      content,
      protocol: 'webrtc-signaling',
      nonce: Math.random().toString(36).slice(2),
      type: 'signal'
    });
  }

  public stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
