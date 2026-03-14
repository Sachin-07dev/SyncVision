'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'teacher' | 'interviewer' | 'interviewee' | 'org_admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  orgId?: string;
  timezone: string;
  locale: string;
  createdAt: string;
  lastActiveAt: string;
  preferences: { theme: 'light' | 'dark' | 'system'; notifications: boolean; soundEffects: boolean; compactMode: boolean };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: Notification[];
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'meeting_invite', title: 'Team Standup', message: 'Daily standup meeting starts in 15 minutes', timestamp: new Date(Date.now() - 900000).toISOString(), isRead: false, actionUrl: '/meeting/mtg_001' },
  { id: 'n2', type: 'interview_scheduled', title: 'Interview Scheduled', message: 'Technical interview with candidate at 2:00 PM', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false, actionUrl: '/interview/int_001' },
  { id: 'n3', type: 'board_shared', title: 'Board Shared', message: 'A new board has been shared with you', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: true, actionUrl: '/whiteboard' },
  { id: 'n4', type: 'lecture_starting', title: 'Lecture Starting', message: 'Advanced Algorithms lecture begins in 30 minutes', timestamp: new Date(Date.now() - 1800000).toISOString(), isRead: false, actionUrl: '/lecture/lec_001' },
];

// In-memory user store (server-side this would be a DB)
const registeredUsers: Map<string, { password: string; user: User }> = new Map();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  useEffect(() => {
    const stored = localStorage.getItem('exceliboard_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('exceliboard_user'); }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const existing = registeredUsers.get(email);
    const loggedInUser: User = existing
      ? { ...existing.user, role, lastActiveAt: new Date().toISOString() }
      : {
          id: `usr_${Date.now()}`,
          email,
          displayName: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          role,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          preferences: { theme: 'dark', notifications: true, soundEffects: true, compactMode: false },
        };

    setUser(loggedInUser);
    localStorage.setItem('exceliboard_user', JSON.stringify(loggedInUser));
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      displayName: name,
      role,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      preferences: { theme: 'dark', notifications: true, soundEffects: true, compactMode: false },
    };

    registeredUsers.set(email, { password, user: newUser });
    setUser(newUser);
    localStorage.setItem('exceliboard_user', JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('exceliboard_user');
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, notifications, login, signup, logout, markNotificationRead, unreadCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
