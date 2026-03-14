import { useEffect, useRef, useState, useCallback } from 'react';

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:3002';

export interface PeerInfo {
  peerId: string;
  userId: string;
  displayName: string;
}

export interface ChatMsg {
  fromPeerId: string;
  displayName: string;
  message: string;
  timestamp: number;
}

export function useWebRTC(roomId: string, userId: string, displayName: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  const [myPeerId, setMyPeerId] = useState<string>('');
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);

  const sendSocketMessage = useCallback((payload: Record<string, any>) => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    try {
      socket.send(JSON.stringify(payload));
      return true;
    } catch (err) {
      console.warn('[webrtc] socket send failed', err);
      return false;
    }
  }, []);

  // ICE servers
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  const createPeerConnection = useCallback((remotePeerId: string, initiator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers });

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSocketMessage({
          type: 'signal',
          targetPeerId: remotePeerId,
          signal: { type: 'candidate', candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        remoteStreamsRef.current.set(remotePeerId, stream);
        setRemoteStreams(new Map(remoteStreamsRef.current));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        peersRef.current.delete(remotePeerId);
        remoteStreamsRef.current.delete(remotePeerId);
        setRemoteStreams(new Map(remoteStreamsRef.current));
      }
    };

    peersRef.current.set(remotePeerId, pc);

    if (initiator) {
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        sendSocketMessage({
          type: 'signal',
          targetPeerId: remotePeerId,
          signal: { type: 'offer', sdp: offer },
        });
      });
    }

    return pc;
  }, [sendSocketMessage]);

  // Start local media
  const startMedia = useCallback(async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsAudioEnabled(audio);
      setIsVideoEnabled(video);
      return stream;
    } catch (err) {
      console.error('Failed to get media:', err);
      // Try audio only
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsAudioEnabled(true);
        setIsVideoEnabled(false);
        return stream;
      } catch {
        console.error('No media devices available');
        return null;
      }
    }
  }, []);

  // Connect to signaling server
  const connect = useCallback(async () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    await startMedia();

    const ws = new WebSocket(SIGNALING_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      sendSocketMessage({ type: 'join', roomId, userId, displayName });
    };

    ws.onerror = (err) => {
      console.warn('[webrtc] websocket error', err);
    };

    ws.onmessage = (event) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case 'room-peers': {
          setMyPeerId(msg.yourPeerId);
          const peerInfos: PeerInfo[] = msg.peers;
          setPeers(peerInfos);
          // Create connections to existing peers (we are the initiator)
          peerInfos.forEach(p => {
            createPeerConnection(p.peerId, true);
          });
          break;
        }

        case 'peer-joined': {
          setPeers(prev => [...prev, { peerId: msg.peerId, userId: msg.userId, displayName: msg.displayName }]);
          // They will initiate, we just prepare
          createPeerConnection(msg.peerId, false);
          break;
        }

        case 'peer-left': {
          setPeers(prev => prev.filter(p => p.peerId !== msg.peerId));
          const pc = peersRef.current.get(msg.peerId);
          if (pc) pc.close();
          peersRef.current.delete(msg.peerId);
          remoteStreamsRef.current.delete(msg.peerId);
          setRemoteStreams(new Map(remoteStreamsRef.current));
          break;
        }

        case 'signal': {
          const { fromPeerId, signal } = msg;
          let pc = peersRef.current.get(fromPeerId);
          if (!pc) pc = createPeerConnection(fromPeerId, false);

          if (signal.type === 'offer') {
            pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            pc.createAnswer().then(answer => {
              pc!.setLocalDescription(answer);
              sendSocketMessage({
                type: 'signal',
                targetPeerId: fromPeerId,
                signal: { type: 'answer', sdp: answer },
              });
            });
          } else if (signal.type === 'answer') {
            pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else if (signal.type === 'candidate') {
            pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
          break;
        }

        case 'chat': {
          setChatMessages(prev => [...prev, {
            fromPeerId: msg.fromPeerId,
            displayName: msg.displayName,
            message: msg.message,
            timestamp: msg.timestamp,
          }]);
          break;
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };
  }, [roomId, userId, displayName, startMedia, createPeerConnection]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore close errors
      }
      wsRef.current = null;
    }
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    remoteStreamsRef.current.clear();
    setRemoteStreams(new Map());
    setPeers([]);
    
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    setLocalStream(null);
    setIsConnected(false);
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Screen share
  const startScreenShare = useCallback(async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(screen);

      // Replace video track in all peer connections
      const videoTrack = screen.getVideoTracks()[0];
      peersRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });

      videoTrack.onended = () => {
        stopScreenShare();
      };

      sendSocketMessage({ type: 'screen-share-started' });
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  }, [sendSocketMessage]);

  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);

      // Restore camera video track
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack) {
        peersRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(cameraTrack);
        });
      }

      sendSocketMessage({ type: 'screen-share-stopped' });
    }
  }, [screenStream, sendSocketMessage]);

  // Send chat
  const sendChat = useCallback((message: string) => {
    sendSocketMessage({ type: 'chat', message, displayName });
    setChatMessages(prev => [...prev, {
      fromPeerId: myPeerId,
      displayName,
      message,
      timestamp: Date.now(),
    }]);
  }, [displayName, myPeerId, sendSocketMessage]);

  // Send board update
  const sendBoardUpdate = useCallback((data: any) => {
    sendSocketMessage({ type: 'board-update', data });
  }, [sendSocketMessage]);

  // Cleanup
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    myPeerId,
    peers,
    localStream,
    remoteStreams,
    screenStream,
    chatMessages,
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendChat,
    sendBoardUpdate,
  };
}
