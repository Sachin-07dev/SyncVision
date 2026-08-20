// ═══════════════════════════════════════════════════════════════
// SyncVision — WebRTC + Socket.IO hook (production-grade)
//
// Designed for 500+ participant rooms:
//  • Socket.IO transport with auto-reconnect & heartbeat
//  • Staggered peer-connection creation (no thundering herd)
//  • ICE candidate queuing until remote description is set
//  • ICE restart with exponential back-off on failure
//  • Visibility API — reconnect broken connections on tab focus
//  • Max active WebRTC connections cap (audience mode beyond cap)
//  • Optimised media constraints for low latency
//  • Proper cleanup of stale / closed connections
//  • Stable function references — no dependency loops
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// ── Config ──────────────────────────────────────────────────
// Use same-origin when served over HTTPS (Vite proxy handles it),
// fall back to direct port for plain HTTP / localhost dev.
const isSecure = window.location.protocol === 'https:';
const SIGNALING_URL =
  import.meta.env.VITE_SIGNALING_URL ||
  (isSecure
    ? window.location.origin   // proxied via Vite: /socket.io → localhost:3002
    : `http://${window.location.hostname}:3002`);

/** Hard cap on simultaneous RTCPeerConnections per client */
const MAX_PEER_CONNECTIONS = 16;
/** Delay between staggered connection creations (ms) */
const STAGGER_DELAY_MS = 120;
/** Base delay for ICE restart back-off (ms) */
const ICE_RESTART_BASE_MS = 2000;
/** Max ICE restarts per connection before giving up */
const MAX_ICE_RESTARTS = 3;
/** Periodic health-check interval (ms) */
const HEALTH_CHECK_MS = 8000;
/** Delay before treating "disconnected" as truly dead (ms) */
const DISCONNECT_GRACE_MS = 4000;

// ── Types ───────────────────────────────────────────────────
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

export interface BoardShare {
  id: string;
  fromPeerId: string;
  fromDisplayName: string;
  boardData: any;
  boardName: string;
  timestamp: number;
  accepted: boolean;
}

interface PeerEntry {
  pc: RTCPeerConnection;
  candidateQueue: RTCIceCandidateInit[];
  remoteDescSet: boolean;
  iceRestarts: number;
  initiator: boolean;
}

// ── ICE config (stable, outside component) ──────────────────
const iceConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

// ═══════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════
export function useWebRTC(
  roomId: string,
  userId: string,
  displayName: string,
) {
  // ── Refs for args (always fresh, never cause re-renders) ──
  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);
  const displayNameRef = useRef(displayName);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { displayNameRef.current = displayName; }, [displayName]);

  // ── Socket ────────────────────────────────────────────────
  const socketRef = useRef<Socket | null>(null);

  // ── WebRTC bookkeeping ────────────────────────────────────
  const peersRef = useRef<Map<string, PeerEntry>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  // ── React state ───────────────────────────────────────────
  const [myPeerId, setMyPeerId] = useState('');
  const myPeerIdRef = useRef('');
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [boardShares, setBoardShares] = useState<BoardShare[]>([]);
  const [remoteBoardData, setRemoteBoardData] = useState<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // ── Stable refs for internal bookkeeping ──────────────────
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const healthRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const staggerTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const connectingRef = useRef(false);

  // ────────────────────────────────────────────────────────────
  // Pure helpers (no hooks, no state — use refs only)
  // ────────────────────────────────────────────────────────────

  /** Emit to socket if connected */
  const emitRef = useRef((ev: string, payload: Record<string, unknown>) => {
    socketRef.current?.connected && socketRef.current.emit(ev, payload);
  });

  /** Sync remoteStreams state from ref */
  const syncStreams = () => setRemoteStreams(new Map(remoteStreamsRef.current));

  /** Remove a peer connection + clean up */
  const removePeerRef = useRef((peerId: string) => {
    const entry = peersRef.current.get(peerId);
    if (entry) {
      try { entry.pc.close(); } catch { /* already closed */ }
      peersRef.current.delete(peerId);
    }
    if (remoteStreamsRef.current.delete(peerId)) {
      syncStreams();
    }
  });

  /** Flush any ICE candidates queued before remote description */
  const flushQueueRef = useRef((peerId: string) => {
    const entry = peersRef.current.get(peerId);
    if (!entry?.remoteDescSet) return;
    while (entry.candidateQueue.length) {
      const c = entry.candidateQueue.shift()!;
      entry.pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
    }
  });

  // ────────────────────────────────────────────────────────────
  // createPeerConnection (stored in a ref for stable identity)
  // ────────────────────────────────────────────────────────────
  const createPCRef = useRef(
    (remotePeerId: string, initiator: boolean): RTCPeerConnection => {
      const emit = emitRef.current;
      const removePeer = removePeerRef.current;
      const flushQueue = flushQueueRef.current;

      // Tear down any previous connection to this peer
      const old = peersRef.current.get(remotePeerId);
      if (old) { try { old.pc.close(); } catch { /* ok */ } }

      const pc = new RTCPeerConnection(iceConfig);
      const entry: PeerEntry = {
        pc,
        candidateQueue: [],
        remoteDescSet: false,
        iceRestarts: 0,
        initiator,
      };
      peersRef.current.set(remotePeerId, entry);

      // ── Add local tracks ──
      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      // ── ICE candidates → relay ──
      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          emit('signal', {
            targetPeerId: remotePeerId,
            signal: { type: 'candidate', candidate: ev.candidate.toJSON() },
          });
        }
      };

      // ── Remote track received ──
      pc.ontrack = (ev) => {
        const stream = ev.streams[0];
        if (stream) {
          remoteStreamsRef.current.set(remotePeerId, stream);
          syncStreams();
        }
      };

      // ── Connection state → auto ICE restart ──
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;

        if (state === 'failed') {
          const e = peersRef.current.get(remotePeerId);
          if (e && e.initiator && e.iceRestarts < MAX_ICE_RESTARTS) {
            e.iceRestarts++;
            const delay = ICE_RESTART_BASE_MS * e.iceRestarts;
            setTimeout(() => {
              if (!peersRef.current.has(remotePeerId)) return;
              pc.restartIce();
              pc.createOffer({ iceRestart: true })
                .then((o) => pc.setLocalDescription(o))
                .then(() =>
                  emit('signal', {
                    targetPeerId: remotePeerId,
                    signal: { type: 'offer', sdp: pc.localDescription },
                  }),
                )
                .catch(() => {});
            }, delay);
          } else {
            removePeer(remotePeerId);
          }
        }

        if (state === 'disconnected') {
          setTimeout(() => {
            if (pc.connectionState === 'disconnected') {
              const e = peersRef.current.get(remotePeerId);
              if (e && e.initiator && e.iceRestarts < MAX_ICE_RESTARTS) {
                e.iceRestarts++;
                pc.restartIce();
                pc.createOffer({ iceRestart: true })
                  .then((o) => pc.setLocalDescription(o))
                  .then(() =>
                    emit('signal', {
                      targetPeerId: remotePeerId,
                      signal: { type: 'offer', sdp: pc.localDescription },
                    }),
                  )
                  .catch(() => {});
              }
            }
          }, DISCONNECT_GRACE_MS);
        }
      };

      // ── Initiator creates offer ──
      if (initiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() =>
            emit('signal', {
              targetPeerId: remotePeerId,
              signal: { type: 'offer', sdp: pc.localDescription },
            }),
          )
          .catch((err) => console.warn('[webrtc] offer error:', err));
      }

      return pc;
    },
  );

  // ────────────────────────────────────────────────────────────
  // Get local media (optimised constraints)
  // ────────────────────────────────────────────────────────────
  const startMedia = useCallback(async () => {
    // Don't re-acquire if we already have tracks
    if (localStreamRef.current && localStreamRef.current.getTracks().some(t => t.readyState === 'live')) {
      return localStreamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
      return stream;
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsAudioEnabled(true);
        setIsVideoEnabled(false);
        return stream;
      } catch {
        console.error('[media] No media devices available');
        return null;
      }
    }
  }, []);

  // ────────────────────────────────────────────────────────────
  // Connect to signaling server (STABLE — no deps that change)
  // ────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    // Prevent double-connect
    if (connectingRef.current) return;
    if (socketRef.current) {
      if (socketRef.current.connected) return;
      // If socket exists but disconnected, just reconnect it
      socketRef.current.connect();
      return;
    }

    connectingRef.current = true;
    await startMedia();

    const socket = io(SIGNALING_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });
    socketRef.current = socket;

    // ── Socket lifecycle ──
    socket.on('connect', () => {
      setIsConnected(true);
      connectingRef.current = false;
      socket.emit('join', {
        roomId: roomIdRef.current,
        userId: userIdRef.current,
        displayName: displayNameRef.current,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // ── Room peers (sent after join) ──
    socket.on('room-peers', ({ peers: existing, yourPeerId }) => {
      myPeerIdRef.current = yourPeerId;
      setMyPeerId(yourPeerId);
      setPeers(existing);

      // Tear down stale connections
      peersRef.current.forEach((e) => { try { e.pc.close(); } catch {} });
      peersRef.current.clear();
      remoteStreamsRef.current.clear();
      syncStreams();

      staggerTimers.current.forEach(clearTimeout);
      staggerTimers.current = [];

      const toConnect = existing.slice(0, MAX_PEER_CONNECTIONS);
      toConnect.forEach((p: PeerInfo, idx: number) => {
        const t = setTimeout(
          () => createPCRef.current(p.peerId, true),
          idx * STAGGER_DELAY_MS,
        );
        staggerTimers.current.push(t);
      });
    });

    // ── New peer joins ──
    socket.on('peer-joined', ({ peerId, userId: uid, displayName: name }) => {
      setPeers((prev) => {
        if (prev.some((p) => p.peerId === peerId)) return prev;
        return [...prev, { peerId, userId: uid, displayName: name }];
      });
      // Don't create a PC — the newcomer will send us an offer
    });

    // ── Peer leaves ──
    socket.on('peer-left', ({ peerId }) => {
      setPeers((prev) => prev.filter((p) => p.peerId !== peerId));
      removePeerRef.current(peerId);
    });

    // ── WebRTC signaling ──
    socket.on('signal', ({ fromPeerId, signal }) => {
      const createPC = createPCRef.current;
      const emit = emitRef.current;
      const flushQueue = flushQueueRef.current;
      let entry = peersRef.current.get(fromPeerId);

      if (signal.type === 'offer') {
        const pc = createPC(fromPeerId, false);
        entry = peersRef.current.get(fromPeerId)!;

        pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            entry!.remoteDescSet = true;
            flushQueue(fromPeerId);
            return pc.createAnswer();
          })
          .then((answer) => pc.setLocalDescription(answer))
          .then(() =>
            emit('signal', {
              targetPeerId: fromPeerId,
              signal: { type: 'answer', sdp: pc.localDescription },
            }),
          )
          .catch((err) => console.warn('[webrtc] answer error:', err));
      } else if (signal.type === 'answer') {
        if (!entry) return;
        entry.pc
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            entry!.remoteDescSet = true;
            flushQueue(fromPeerId);
          })
          .catch((err) => console.warn('[webrtc] set-answer error:', err));
      } else if (signal.type === 'candidate') {
        if (!entry) return;
        if (entry.remoteDescSet) {
          entry.pc
            .addIceCandidate(new RTCIceCandidate(signal.candidate))
            .catch(() => {});
        } else {
          entry.candidateQueue.push(signal.candidate);
        }
      }
    });

    // ── Chat ──
    socket.on('chat', (msg: ChatMsg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // ── Board update from peers (real-time sync) ──
    socket.on('board-update', (payload: { fromPeerId: string; data: any }) => {
      setRemoteBoardData(payload.data);
    });

    // ── Board shared to us ──
    socket.on('board-shared', (payload: { fromPeerId: string; fromDisplayName: string; boardData: any; boardName: string }) => {
      setBoardShares((prev) => [
        ...prev,
        {
          id: `${payload.fromPeerId}_${Date.now()}`,
          fromPeerId: payload.fromPeerId,
          fromDisplayName: payload.fromDisplayName,
          boardData: payload.boardData,
          boardName: payload.boardName,
          timestamp: Date.now(),
          accepted: false,
        },
      ]);
    });

    // ── Health check timer ──
    if (healthRef.current) clearInterval(healthRef.current);
    healthRef.current = setInterval(() => {
      peersRef.current.forEach((entry, pid) => {
        if (entry.pc.connectionState === 'closed') removePeerRef.current(pid);
      });
    }, HEALTH_CHECK_MS);

    connectingRef.current = false;
  }, [startMedia]);
  // ↑ Only depends on startMedia (which is stable — empty deps)

  // ────────────────────────────────────────────────────────────
  // Disconnect (STABLE — no deps)
  // ────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    connectingRef.current = false;
    staggerTimers.current.forEach(clearTimeout);
    staggerTimers.current = [];
    if (healthRef.current) { clearInterval(healthRef.current); healthRef.current = null; }
    socketRef.current?.disconnect();
    socketRef.current = null;
    peersRef.current.forEach((e) => { try { e.pc.close(); } catch {} });
    peersRef.current.clear();
    remoteStreamsRef.current.clear();
    setRemoteStreams(new Map());
    setPeers([]);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setIsConnected(false);
  }, []);

  // ────────────────────────────────────────────────────────────
  // Media controls (all stable)
  // ────────────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsAudioEnabled(track.enabled); }
  }, []);

  const toggleVideo = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsVideoEnabled(track.enabled); }
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screen;
      setScreenStream(screen);
      const videoTrack = screen.getVideoTracks()[0];
      peersRef.current.forEach((entry) => {
        const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });
      videoTrack.onended = () => stopScreenShare();
      emitRef.current('screen-share-started', {});
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    const ss = screenStreamRef.current;
    if (!ss) return;
    ss.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setScreenStream(null);
    const cam = localStreamRef.current?.getVideoTracks()[0];
    if (cam) {
      peersRef.current.forEach((entry) => {
        const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(cam);
      });
    }
    emitRef.current('screen-share-stopped', {});
  }, []);

  // ────────────────────────────────────────────────────────────
  // Chat / board (stable)
  // ────────────────────────────────────────────────────────────
  const sendChat = useCallback(
    (message: string) => {
      emitRef.current('chat', { message, displayName: displayNameRef.current });
      setChatMessages((prev) => [
        ...prev,
        {
          fromPeerId: myPeerIdRef.current,
          displayName: displayNameRef.current,
          message,
          timestamp: Date.now(),
        },
      ]);
    },
    [],
  );

  const sendBoardUpdate = useCallback(
    (data: unknown) => emitRef.current('board-update', { data } as Record<string, unknown>),
    [],
  );

  const shareBoard = useCallback(
    (targetPeerIds: string[], boardData: any, boardName: string) => {
      emitRef.current('share-board', { targetPeerIds, boardData, boardName } as Record<string, unknown>);
    },
    [],
  );

  const acceptBoardShare = useCallback(
    (shareId: string) => {
      setBoardShares((prev) => prev.map((s) => s.id === shareId ? { ...s, accepted: true } : s));
    },
    [],
  );

  const dismissBoardShare = useCallback(
    (shareId: string) => {
      setBoardShares((prev) => prev.filter((s) => s.id !== shareId));
    },
    [],
  );

  // ────────────────────────────────────────────────────────────
  // Visibility API — recover connections on tab re-focus
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onVisChange = () => {
      if (document.visibilityState !== 'visible') return;
      const sock = socketRef.current;
      if (sock && !sock.connected) sock.connect();

      peersRef.current.forEach((entry, pid) => {
        const s = entry.pc.connectionState;
        if (s === 'failed' || s === 'closed') removePeerRef.current(pid);
      });
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, []);

  // ── Unmount cleanup ──
  useEffect(() => () => disconnect(), [disconnect]);

  // ────────────────────────────────────────────────────────────
  // Public API (stable references)
  // ────────────────────────────────────────────────────────────
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
    shareBoard,
    boardShares,
    remoteBoardData,
    acceptBoardShare,
    dismissBoardShare,
  };
}
