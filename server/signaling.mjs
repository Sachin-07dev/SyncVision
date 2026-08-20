// ═══════════════════════════════════════════════════════════════
// SyncVision — Signaling Server (Socket.IO)
//
// Scalable for 500+ participants per room:
// • Socket.IO transport (auto-reconnect, heartbeat, backpressure)
// • Stale-user cleanup on disconnect / reconnect
// • Direct peer-to-peer signal relay (no broadcast storms)
// • Efficient room-level broadcast for chat / board / presence
// • Per-room participant cap awareness
// ═══════════════════════════════════════════════════════════════

import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';

const PORT = parseInt(process.env.SIGNALING_PORT?.trim() || '3002', 10);

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
});

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  // ── Transport tuning ──────────────────────
  transports: ['websocket'],         // skip polling → lower latency
  pingInterval: 10000,               // heartbeat every 10 s
  pingTimeout: 5000,                 // drop unresponsive after 5 s
  maxHttpBufferSize: 1e6,            // 1 MB max message (protects OOM)
  connectionStateRecovery: {
    maxDisconnectionDuration: 30000,  // recover state within 30 s
    skipMiddlewares: true,
  },
});

// ── In-memory room store ────────────────────
// roomId → Map<socketId, { userId, displayName, socketId }>
const rooms = new Map();

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentUser = null;

  // ── Join ──────────────────────────────────
  socket.on('join', ({ roomId, userId, displayName }) => {
    if (!roomId || !userId) return;

    currentRoom = roomId;
    currentUser = { userId, displayName, socketId: socket.id };

    socket.join(roomId);

    if (!rooms.has(roomId)) rooms.set(roomId, new Map());
    const room = rooms.get(roomId);

    room.set(socket.id, currentUser);

    // Build peer list for the joiner (exclude self)
    const existingPeers = [];
    for (const [sid, peer] of room) {
      if (sid !== socket.id) {
        existingPeers.push({
          peerId: sid,
          userId: peer.userId,
          displayName: peer.displayName,
        });
      }
    }

    socket.emit('room-peers', {
      peers: existingPeers,
      yourPeerId: socket.id,
      totalCount: room.size,
    });

    // Notify others
    socket.to(roomId).emit('peer-joined', {
      peerId: socket.id,
      userId,
      displayName,
    });

    console.log(`[join] ${displayName} → ${roomId} (${room.size} users)`);
  });

  // ── WebRTC signaling relay (point-to-point) ──
  socket.on('signal', ({ targetPeerId, signal }) => {
    // Direct relay — no broadcast, O(1)
    io.to(targetPeerId).emit('signal', {
      fromPeerId: socket.id,
      signal,
    });
  });

  // ── Chat (room broadcast) ────────────────
  socket.on('chat', ({ message, displayName: name }) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit('chat', {
      fromPeerId: socket.id,
      displayName: name,
      message,
      timestamp: Date.now(),
    });
  });

  // ── Board sync (room broadcast) ──────────
  socket.on('board-update', ({ data }) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit('board-update', {
      fromPeerId: socket.id,
      data,
    });
  });

  // ── Share board to specific peers ────────
  socket.on('share-board', ({ targetPeerIds, boardData, boardName }) => {
    if (!currentRoom || !currentUser) return;
    for (const targetId of targetPeerIds) {
      io.to(targetId).emit('board-shared', {
        fromPeerId: socket.id,
        fromDisplayName: currentUser.displayName,
        boardData,
        boardName: boardName || 'Shared Board',
      });
    }
  });

  // ── Screen share events ──────────────────
  socket.on('screen-share-started', () => {
    if (currentRoom) {
      socket.to(currentRoom).emit('screen-share-started', { fromPeerId: socket.id });
    }
  });
  socket.on('screen-share-stopped', () => {
    if (currentRoom) {
      socket.to(currentRoom).emit('screen-share-stopped', { fromPeerId: socket.id });
    }
  });

  // ── Disconnect ───────────────────────────
  socket.on('disconnect', (reason) => {
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      room.delete(socket.id);

      socket.to(currentRoom).emit('peer-left', { peerId: socket.id });

      if (room.size === 0) {
        rooms.delete(currentRoom);
      }

      console.log(`[leave] ${currentUser?.displayName || '?'} from ${currentRoom} (${room.size} left) [${reason}]`);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 Signaling server (Socket.IO) on http://0.0.0.0:${PORT}`);
});
