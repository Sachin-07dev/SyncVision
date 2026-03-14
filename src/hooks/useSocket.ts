// ═══════════════════════════════════════════════
// Socket.IO connection manager hook
// ═══════════════════════════════════════════════

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export interface SocketUser {
  id: string;
  socketId: string;
  displayName: string;
  email?: string;
  role: string;
  avatarUrl?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  joinedAt: string;
}

export interface ChatMsg {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'code' | 'system';
  timestamp: string;
  reactions: { emoji: string; count: number; userIds: string[] }[];
}

export interface DrawStroke {
  id?: string;
  userId?: string;
  userName?: string;
  tool: string;
  color: string;
  lineWidth: number;
  points: { x: number; y: number }[];
}

export interface QuestionItem {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  isAnswered: boolean;
  upvotes: number;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[socket] disconnected');
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const getSocket = useCallback(() => socketRef.current, []);

  return { socket: socketRef.current, isConnected, getSocket };
}
