// ═══════════════════════════════════════════════
// ExceliBoard — WebSocket Signaling Server
// Handles: room management, WebRTC signaling,
// real-time chat, whiteboard sync, Q&A
// ═══════════════════════════════════════════════

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
    methods: ['GET', 'POST'],
  },
});

// In-memory stores
const rooms = new Map();            // roomId → Map<socketId, userInfo>
const roomChats = new Map();        // roomId → ChatMessage[]
const roomWhiteboards = new Map();  // roomId → DrawStroke[]
const roomQuestions = new Map();    // roomId → Question[]

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Room info
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const members = rooms.get(roomId);
  if (!members) return res.json({ participants: [], chatHistory: [], whiteboardStrokes: [] });
  return res.json({
    participants: Array.from(members.values()),
    chatHistory: roomChats.get(roomId) || [],
    whiteboardStrokes: roomWhiteboards.get(roomId) || [],
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);
  let currentRoom = null;
  let currentUser = null;

  socket.on('join-room', ({ roomId, user }) => {
    currentRoom = roomId;
    currentUser = {
      ...user,
      socketId: socket.id,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      isHandRaised: false,
      joinedAt: new Date().toISOString(),
    };

    socket.join(roomId);
    if (!rooms.has(roomId)) rooms.set(roomId, new Map());
    rooms.get(roomId).set(socket.id, currentUser);
    if (!roomChats.has(roomId)) roomChats.set(roomId, []);
    if (!roomWhiteboards.has(roomId)) roomWhiteboards.set(roomId, []);
    if (!roomQuestions.has(roomId)) roomQuestions.set(roomId, []);

    const existingParticipants = Array.from(rooms.get(roomId).values());
    socket.emit('room-state', {
      participants: existingParticipants,
      chatHistory: roomChats.get(roomId),
      whiteboardStrokes: roomWhiteboards.get(roomId),
      questions: roomQuestions.get(roomId),
    });

    socket.to(roomId).emit('user-joined', currentUser);

    const sysMsg = {
      id: `msg_sys_${Date.now()}`,
      channelId: roomId,
      senderId: 'system',
      senderName: 'System',
      content: `${currentUser.displayName} joined the room`,
      type: 'system',
      timestamp: new Date().toISOString(),
      reactions: [],
    };
    roomChats.get(roomId).push(sysMsg);
    io.to(roomId).emit('chat-message', sysMsg);
    console.log(`[join] ${currentUser.displayName} → room=${roomId} (${rooms.get(roomId).size} users)`);
  });

  // WebRTC signaling
  socket.on('webrtc-offer', ({ to, offer }) => {
    io.to(to).emit('webrtc-offer', { from: socket.id, offer, user: currentUser });
  });
  socket.on('webrtc-answer', ({ to, answer }) => {
    io.to(to).emit('webrtc-answer', { from: socket.id, answer });
  });
  socket.on('webrtc-ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('webrtc-ice-candidate', { from: socket.id, candidate });
  });

  // Media toggles
  socket.on('toggle-audio', ({ enabled }) => {
    if (!currentRoom || !currentUser) return;
    currentUser.isAudioEnabled = enabled;
    rooms.get(currentRoom)?.set(socket.id, currentUser);
    socket.to(currentRoom).emit('user-toggle-audio', { socketId: socket.id, enabled });
  });
  socket.on('toggle-video', ({ enabled }) => {
    if (!currentRoom || !currentUser) return;
    currentUser.isVideoEnabled = enabled;
    rooms.get(currentRoom)?.set(socket.id, currentUser);
    socket.to(currentRoom).emit('user-toggle-video', { socketId: socket.id, enabled });
  });
  socket.on('toggle-screen-share', ({ enabled }) => {
    if (!currentRoom || !currentUser) return;
    currentUser.isScreenSharing = enabled;
    rooms.get(currentRoom)?.set(socket.id, currentUser);
    socket.to(currentRoom).emit('user-toggle-screen-share', { socketId: socket.id, enabled });
  });
  socket.on('toggle-hand', ({ raised }) => {
    if (!currentRoom || !currentUser) return;
    currentUser.isHandRaised = raised;
    rooms.get(currentRoom)?.set(socket.id, currentUser);
    socket.to(currentRoom).emit('user-toggle-hand', { socketId: socket.id, raised });
  });

  // Chat
  socket.on('send-chat', ({ message }) => {
    if (!currentRoom || !currentUser) return;
    const chatMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      channelId: currentRoom,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      content: message,
      type: 'text',
      timestamp: new Date().toISOString(),
      reactions: [],
    };
    roomChats.get(currentRoom)?.push(chatMsg);
    io.to(currentRoom).emit('chat-message', chatMsg);
  });

  // Whiteboard
  socket.on('draw-stroke', ({ stroke }) => {
    if (!currentRoom) return;
    const strokeData = {
      ...stroke,
      userId: currentUser?.id,
      userName: currentUser?.displayName,
      id: `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    roomWhiteboards.get(currentRoom)?.push(strokeData);
    socket.to(currentRoom).emit('draw-stroke', strokeData);
  });
  socket.on('clear-canvas', () => {
    if (!currentRoom) return;
    roomWhiteboards.set(currentRoom, []);
    socket.to(currentRoom).emit('clear-canvas');
  });

  // Q&A
  socket.on('ask-question', ({ text }) => {
    if (!currentRoom || !currentUser) return;
    const question = {
      id: `q_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      text,
      timestamp: new Date().toISOString(),
      isAnswered: false,
      upvotes: 0,
    };
    roomQuestions.get(currentRoom)?.push(question);
    io.to(currentRoom).emit('new-question', question);
  });
  socket.on('upvote-question', ({ questionId }) => {
    if (!currentRoom) return;
    const questions = roomQuestions.get(currentRoom);
    if (questions) {
      const q = questions.find((q) => q.id === questionId);
      if (q) q.upvotes += 1;
      io.to(currentRoom).emit('question-upvoted', { questionId, upvotes: q?.upvotes });
    }
  });

  // Reactions
  socket.on('send-reaction', ({ emoji }) => {
    if (!currentRoom || !currentUser) return;
    io.to(currentRoom).emit('user-reaction', {
      userId: currentUser.id,
      userName: currentUser.displayName,
      emoji,
      timestamp: new Date().toISOString(),
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(socket.id);
      socket.to(currentRoom).emit('user-left', { socketId: socket.id, user: currentUser });
      if (currentUser) {
        const sysMsg = {
          id: `msg_sys_${Date.now()}`,
          channelId: currentRoom,
          senderId: 'system',
          senderName: 'System',
          content: `${currentUser.displayName} left the room`,
          type: 'system',
          timestamp: new Date().toISOString(),
          reactions: [],
        };
        roomChats.get(currentRoom)?.push(sysMsg);
        io.to(currentRoom).emit('chat-message', sysMsg);
      }
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
        roomChats.delete(currentRoom);
        roomWhiteboards.delete(currentRoom);
        roomQuestions.delete(currentRoom);
      }
      console.log(`[leave] ${currentUser?.displayName || socket.id} ← room=${currentRoom}`);
    }
    console.log(`[disconnect] ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n  ExceliBoard Signaling Server running on http://localhost:${PORT}`);
  console.log(`  Socket.IO ready for WebRTC signaling\n`);
});
