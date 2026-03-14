import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const PORT = process.env.SIGNALING_PORT || 3002;

const wss = new WebSocketServer({ port: PORT });

// Room -> Set of { ws, peerId, userId, displayName }
const rooms = new Map();

wss.on('connection', (ws) => {
  let peerId = uuidv4();
  let currentRoom = null;

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'join': {
        const { roomId, userId, displayName } = msg;
        currentRoom = roomId;
        if (!rooms.has(roomId)) rooms.set(roomId, new Map());

        const room = rooms.get(roomId);
        room.set(peerId, { ws, peerId, userId, displayName });

        // Notify new peer about existing peers
        const existingPeers = [];
        for (const [pid, peer] of room) {
          if (pid !== peerId) {
            existingPeers.push({ peerId: pid, userId: peer.userId, displayName: peer.displayName });
          }
        }
        ws.send(JSON.stringify({ type: 'room-peers', peers: existingPeers, yourPeerId: peerId }));

        // Notify existing peers about new peer
        broadcast(roomId, peerId, {
          type: 'peer-joined',
          peerId,
          userId,
          displayName,
        });

        console.log(`[${roomId}] ${displayName} (${peerId}) joined. Peers: ${room.size}`);
        break;
      }

      case 'signal': {
        // Relay WebRTC signal to target peer
        const { targetPeerId, signal } = msg;
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        const target = room?.get(targetPeerId);
        if (target) {
          target.ws.send(JSON.stringify({
            type: 'signal',
            fromPeerId: peerId,
            signal,
          }));
        }
        break;
      }

      case 'board-update': {
        // Relay board data to all other peers in the room
        if (!currentRoom) return;
        broadcast(currentRoom, peerId, {
          type: 'board-update',
          fromPeerId: peerId,
          data: msg.data,
        });
        break;
      }

      case 'chat': {
        if (!currentRoom) return;
        broadcast(currentRoom, peerId, {
          type: 'chat',
          fromPeerId: peerId,
          message: msg.message,
          displayName: msg.displayName,
          timestamp: Date.now(),
        });
        break;
      }

      case 'screen-share-started': {
        if (!currentRoom) return;
        broadcast(currentRoom, peerId, {
          type: 'screen-share-started',
          fromPeerId: peerId,
        });
        break;
      }

      case 'screen-share-stopped': {
        if (!currentRoom) return;
        broadcast(currentRoom, peerId, {
          type: 'screen-share-stopped',
          fromPeerId: peerId,
        });
        break;
      }
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      room.delete(peerId);

      broadcast(currentRoom, peerId, {
        type: 'peer-left',
        peerId,
      });

      if (room.size === 0) {
        rooms.delete(currentRoom);
      }

      console.log(`[${currentRoom}] ${peerId} left. Peers: ${room.size}`);
    }
  });
});

function broadcast(roomId, excludePeerId, message) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(message);
  for (const [pid, peer] of room) {
    if (pid !== excludePeerId && peer.ws.readyState === 1) {
      peer.ws.send(data);
    }
  }
}

console.log(`📡 Signaling server running on ws://localhost:${PORT}`);
