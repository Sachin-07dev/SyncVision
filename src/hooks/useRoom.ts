// ═══════════════════════════════════════════════
// Real-Time Room Hook
// Manages Socket.IO room events, participants,
// chat, WebRTC signaling (mesh), and media.
// ═══════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SocketUser, ChatMsg, DrawStroke, QuestionItem } from './useSocket';

const isSecure = window.location.protocol === 'https:';
const SOCKET_URL = isSecure ? window.location.origin : `http://${window.location.hostname}:3001`;

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

interface PeerEntry {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
  user: SocketUser;
}

interface UseRoomOptions {
  roomId: string;
  user: { id: string; displayName: string; email?: string; role: string; avatarUrl?: string };
  autoJoin?: boolean;
}

export function useRoom({ roomId, user, autoJoin = true }: UseRoomOptions) {
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, PeerEntry>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<SocketUser[]>([]);
  const [peerStreams, setPeerStreams] = useState<Map<string, { stream: MediaStream; user: SocketUser }>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [whiteboardStrokes, setWhiteboardStrokes] = useState<DrawStroke[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  // ── Get local media ───────────────────────

  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn('[media] camera/mic not available, trying audio only...', err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsVideoEnabled(false);
        return stream;
      } catch (err2) {
        console.warn('[media] no media devices available', err2);
        return null;
      }
    }
  }, []);

  // ── Create peer connection ────────────────

  const createPeerConnection = useCallback((remoteSocketId: string, remoteUser: SocketUser, initiator: boolean) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setPeerStreams((prev) => {
          const next = new Map(prev);
          next.set(remoteSocketId, { stream: remoteStream, user: remoteUser });
          return next;
        });
      }
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('webrtc-ice-candidate', { to: remoteSocketId, candidate: event.candidate });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[webrtc] ICE state for ${remoteUser.displayName}:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        removePeer(remoteSocketId);
      }
    };

    peersRef.current.set(remoteSocketId, { pc, stream: null, user: remoteUser });

    if (initiator) {
      // Create offer
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socketRef.current?.emit('webrtc-offer', { to: remoteSocketId, offer: pc.localDescription });
        })
        .catch(console.error);
    }

    return pc;
  }, []);

  const removePeer = useCallback((socketId: string) => {
    const entry = peersRef.current.get(socketId);
    if (entry) {
      entry.pc.close();
      peersRef.current.delete(socketId);
    }
    setPeerStreams((prev) => {
      const next = new Map(prev);
      next.delete(socketId);
      return next;
    });
  }, []);

  // ── Socket setup ──────────────────────────

  useEffect(() => {
    if (!roomId || !user || !autoJoin) return;

    let mounted = true;

    const init = async () => {
      await startMedia();

      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        if (!mounted) return;
        setIsConnected(true);
        console.log('[socket] connected:', socket.id);

        // Join room
        socket.emit('join-room', { roomId, user });
      });

      socket.on('disconnect', () => {
        if (!mounted) return;
        setIsConnected(false);
      });

      // ─── Room state (on join) ───
      socket.on('room-state', (state: { participants: SocketUser[]; chatHistory: ChatMsg[]; whiteboardStrokes: DrawStroke[]; questions: QuestionItem[] }) => {
        if (!mounted) return;
        setParticipants(state.participants);
        setChatMessages(state.chatHistory);
        setWhiteboardStrokes(state.whiteboardStrokes || []);
        setQuestions(state.questions || []);

        // Initiate WebRTC with existing peers
        state.participants.forEach((p) => {
          if (p.socketId !== socket.id) {
            createPeerConnection(p.socketId, p, true);
          }
        });
      });

      // ─── User joined ───
      socket.on('user-joined', (newUser: SocketUser) => {
        if (!mounted) return;
        setParticipants((prev) => {
          if (prev.find(p => p.socketId === newUser.socketId)) return prev;
          return [...prev, newUser];
        });
        // Don't initiate — they will send us an offer
      });

      // ─── User left ───
      socket.on('user-left', ({ socketId }: { socketId: string }) => {
        if (!mounted) return;
        setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
        removePeer(socketId);
      });

      // ─── WebRTC Signaling ───
      socket.on('webrtc-offer', async ({ from, offer, user: remoteUser }: { from: string; offer: RTCSessionDescriptionInit; user: SocketUser }) => {
        if (!mounted) return;
        const pc = createPeerConnection(from, remoteUser, false);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { to: from, answer: pc.localDescription });
      });

      socket.on('webrtc-answer', async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
        const entry = peersRef.current.get(from);
        if (entry) {
          await entry.pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on('webrtc-ice-candidate', ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
        const entry = peersRef.current.get(from);
        if (entry) {
          entry.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.warn);
        }
      });

      // ─── Media toggles from others ───
      socket.on('user-toggle-audio', ({ socketId, enabled }: { socketId: string; enabled: boolean }) => {
        setParticipants((prev) => prev.map((p) => p.socketId === socketId ? { ...p, isAudioEnabled: enabled } : p));
      });

      socket.on('user-toggle-video', ({ socketId, enabled }: { socketId: string; enabled: boolean }) => {
        setParticipants((prev) => prev.map((p) => p.socketId === socketId ? { ...p, isVideoEnabled: enabled } : p));
      });

      socket.on('user-toggle-screen-share', ({ socketId, enabled }: { socketId: string; enabled: boolean }) => {
        setParticipants((prev) => prev.map((p) => p.socketId === socketId ? { ...p, isScreenSharing: enabled } : p));
      });

      socket.on('user-toggle-hand', ({ socketId, raised }: { socketId: string; raised: boolean }) => {
        setParticipants((prev) => prev.map((p) => p.socketId === socketId ? { ...p, isHandRaised: raised } : p));
      });

      // ─── Chat ───
      socket.on('chat-message', (msg: ChatMsg) => {
        if (!mounted) return;
        setChatMessages((prev) => [...prev, msg]);
      });

      // ─── Whiteboard ───
      socket.on('draw-stroke', (stroke: DrawStroke) => {
        if (!mounted) return;
        setWhiteboardStrokes((prev) => [...prev, stroke]);
      });

      socket.on('clear-canvas', () => {
        if (!mounted) return;
        setWhiteboardStrokes([]);
      });

      // ─── Questions ───
      socket.on('new-question', (q: QuestionItem) => {
        if (!mounted) return;
        setQuestions((prev) => [...prev, q]);
      });

      socket.on('question-upvoted', ({ questionId, upvotes }: { questionId: string; upvotes: number }) => {
        if (!mounted) return;
        setQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, upvotes } : q));
      });

      // ─── Reactions ───
      socket.on('user-reaction', (reaction: { userId: string; userName: string; emoji: string }) => {
        // Handled in component directly
        window.dispatchEvent(new CustomEvent('room-reaction', { detail: reaction }));
      });
    };

    init();

    return () => {
      mounted = false;
      // Stop local tracks
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      // Close all peers
      peersRef.current.forEach((entry) => entry.pc.close());
      peersRef.current.clear();
      setPeerStreams(new Map());
      // Disconnect socket
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId, user?.id, autoJoin]);

  // ── Actions ───────────────────────────────

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
      socketRef.current?.emit('toggle-audio', { enabled: track.enabled });
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
      socketRef.current?.emit('toggle-video', { enabled: track.enabled });
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share, revert to camera
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTrack = camStream.getVideoTracks()[0];
      // Replace track in all peer connections
      peersRef.current.forEach((entry) => {
        const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && videoTrack) sender.replaceTrack(videoTrack);
      });
      // Replace in local stream
      const oldTrack = localStreamRef.current?.getVideoTracks()[0];
      if (oldTrack) oldTrack.stop();
      if (localStreamRef.current) {
        localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
        localStreamRef.current.addTrack(videoTrack);
      }
      setIsScreenSharing(false);
      socketRef.current?.emit('toggle-screen-share', { enabled: false });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        // Replace track in all peer connections
        peersRef.current.forEach((entry) => {
          const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        // Replace in local stream
        const oldTrack = localStreamRef.current?.getVideoTracks()[0];
        if (oldTrack) oldTrack.stop();
        if (localStreamRef.current) {
          localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
          localStreamRef.current.addTrack(screenTrack);
        }
        setLocalStream(localStreamRef.current);
        setIsScreenSharing(true);
        socketRef.current?.emit('toggle-screen-share', { enabled: true });

        // When user stops sharing via browser UI
        screenTrack.onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.warn('[screenshare] user cancelled or error:', err);
      }
    }
  }, [isScreenSharing]);

  const sendChat = useCallback((message: string) => {
    socketRef.current?.emit('send-chat', { message });
  }, []);

  const sendDrawStroke = useCallback((stroke: DrawStroke) => {
    socketRef.current?.emit('draw-stroke', { stroke });
  }, []);

  const clearWhiteboard = useCallback(() => {
    socketRef.current?.emit('clear-canvas');
    setWhiteboardStrokes([]);
  }, []);

  const askQuestion = useCallback((text: string) => {
    socketRef.current?.emit('ask-question', { text });
  }, []);

  const upvoteQuestion = useCallback((questionId: string) => {
    socketRef.current?.emit('upvote-question', { questionId });
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    socketRef.current?.emit('send-reaction', { emoji });
  }, []);

  const raiseHand = useCallback((raised: boolean) => {
    socketRef.current?.emit('toggle-hand', { raised });
  }, []);

  return {
    // State
    isConnected,
    participants,
    localStream,
    peerStreams,
    chatMessages,
    whiteboardStrokes,
    questions,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    // Actions
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    sendChat,
    sendDrawStroke,
    clearWhiteboard,
    askQuestion,
    upvoteQuestion,
    sendReaction,
    raiseHand,
  };
}
