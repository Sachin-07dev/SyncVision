// ═══════════════════════════════════════════════
// ExceliBoard — Real-Time Signaling Server
// Socket.IO + WebRTC Signaling + Whiteboard Sync
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
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'http://[::]:8080'],
    methods: ['GET', 'POST'],
  },
});

// ── In-memory stores ────────────────────────

/** @type {Map<string, Map<string, object>>} roomId → Map<socketId, userInfo> */
const rooms = new Map();

/** @type {Map<string, object[]>} roomId → chat messages */
const roomChats = new Map();

/** @type {Map<string, object[]>} roomId → whiteboard draw strokes */
const roomWhiteboards = new Map();

/** @type {Map<string, object[]>} roomId → questions */
const roomQuestions = new Map();

/** @type {Map<string, object[]>} roomId → reactions */
const roomReactions = new Map();

// ── Test accounts (mirrored from frontend) ──

const TEST_ACCOUNTS = {
  'sarah.chen@exceliboard.com':   { password: 'password123', id: 'usr_teacher_001',      displayName: 'Dr. Sarah Chen',  role: 'teacher' },
  'alex.johnson@university.edu':  { password: 'password123', id: 'usr_student_001',      displayName: 'Alex Johnson',    role: 'student' },
  'michael.park@techcorp.com':    { password: 'password123', id: 'usr_interviewer_001',   displayName: 'Michael Park',    role: 'interviewer' },
  'admin@exceliboard.com':        { password: 'password123', id: 'usr_admin_001',         displayName: 'Admin User',      role: 'org_admin' },
  'jane.smith@candidate.com':     { password: 'password123', id: 'usr_interviewee_001',   displayName: 'Jane Smith',      role: 'interviewee' },
};

// ── REST API  ────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const account = TEST_ACCOUNTS[email];

  if (!account) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (account.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.json({
    id: account.id,
    email,
    displayName: account.displayName,
    role: account.role,
    avatarUrl: '',
    timezone: 'America/New_York',
    locale: 'en-US',
    createdAt: '2025-01-01T00:00:00Z',
    lastActiveAt: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, soundEffects: true, compactMode: false },
  });
});

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

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Socket.IO Event Handling ─────────────────

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  let currentRoom = null;
  let currentUser = null;

  // ─── Join a room ───

  socket.on('join-room', ({ roomId, user }) => {
    currentRoom = roomId;
    currentUser = { ...user, socketId: socket.id, isAudioEnabled: true, isVideoEnabled: true, isScreenSharing: false, isHandRaised: false, joinedAt: new Date().toISOString() };

    socket.join(roomId);

    // Track user in room
    if (!rooms.has(roomId)) rooms.set(roomId, new Map());
    rooms.get(roomId).set(socket.id, currentUser);

    // Initialize stores if needed
    if (!roomChats.has(roomId)) roomChats.set(roomId, []);
    if (!roomWhiteboards.has(roomId)) roomWhiteboards.set(roomId, []);
    if (!roomQuestions.has(roomId)) roomQuestions.set(roomId, []);

    // Send existing participants & history to the new joiner
    const existingParticipants = Array.from(rooms.get(roomId).values());
    socket.emit('room-state', {
      participants: existingParticipants,
      chatHistory: roomChats.get(roomId),
      whiteboardStrokes: roomWhiteboards.get(roomId),
      questions: roomQuestions.get(roomId),
    });

    // Notify everyone else
    socket.to(roomId).emit('user-joined', currentUser);

    // System message
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

  // ─── WebRTC Signaling (Mesh) ───

  socket.on('webrtc-offer', ({ to, offer }) => {
    io.to(to).emit('webrtc-offer', { from: socket.id, offer, user: currentUser });
  });

  socket.on('webrtc-answer', ({ to, answer }) => {
    io.to(to).emit('webrtc-answer', { from: socket.id, answer });
  });

  socket.on('webrtc-ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('webrtc-ice-candidate', { from: socket.id, candidate });
  });

  // ─── Media Toggles ───

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

  // ─── Chat ───

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

  // ─── Whiteboard Collaboration ───

  socket.on('draw-stroke', ({ stroke }) => {
    if (!currentRoom) return;
    const strokeData = { ...stroke, userId: currentUser?.id, userName: currentUser?.displayName, id: `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    roomWhiteboards.get(currentRoom)?.push(strokeData);
    socket.to(currentRoom).emit('draw-stroke', strokeData);
  });

  socket.on('clear-canvas', () => {
    if (!currentRoom) return;
    roomWhiteboards.set(currentRoom, []);
    socket.to(currentRoom).emit('clear-canvas');
  });

  // ─── Q&A (Lectures) ───

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
      const q = questions.find(q => q.id === questionId);
      if (q) q.upvotes += 1;
      io.to(currentRoom).emit('question-upvoted', { questionId, upvotes: q?.upvotes });
    }
  });

  // ─── Reactions ───

  socket.on('send-reaction', ({ emoji }) => {
    if (!currentRoom || !currentUser) return;
    io.to(currentRoom).emit('user-reaction', { userId: currentUser.id, userName: currentUser.displayName, emoji, timestamp: new Date().toISOString() });
  });

  // ─── Disconnect ───

  socket.on('disconnect', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(socket.id);

      // Notify others
      socket.to(currentRoom).emit('user-left', { socketId: socket.id, user: currentUser });

      // System message
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

      // Clean up empty rooms
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

// ── Start Server ─────────────────────────────

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 ExceliBoard Signaling Server running on http://localhost:${PORT}`);
  console.log(`   Socket.IO ready for WebRTC signaling`);
  console.log(`\n📋 Test Accounts:`);
  Object.entries(TEST_ACCOUNTS).forEach(([email, info]) => {
    console.log(`   ${info.role.padEnd(14)} → ${email} / ${info.password}`);
  });
  console.log('');
});
