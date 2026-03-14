import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, UserRole, Notification } from '@/types';

// ── Mock Users for Demo ──────────────────────

const DEMO_USERS: Record<string, User> = {
  teacher: {
    id: 'usr_teacher_001',
    email: 'sarah.chen@exceliboard.com',
    displayName: 'Dr. Sarah Chen',
    avatarUrl: '',
    role: 'teacher',
    orgId: 'org_001',
    timezone: 'America/New_York',
    locale: 'en-US',
    createdAt: '2025-09-01T00:00:00Z',
    lastActiveAt: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, soundEffects: true, compactMode: false },
  },
  student: {
    id: 'usr_student_001',
    email: 'alex.johnson@university.edu',
    displayName: 'Alex Johnson',
    avatarUrl: '',
    role: 'student',
    orgId: 'org_001',
    timezone: 'America/Chicago',
    locale: 'en-US',
    createdAt: '2025-10-15T00:00:00Z',
    lastActiveAt: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, soundEffects: true, compactMode: false },
  },
  interviewer: {
    id: 'usr_interviewer_001',
    email: 'michael.park@techcorp.com',
    displayName: 'Michael Park',
    avatarUrl: '',
    role: 'interviewer',
    orgId: 'org_002',
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    createdAt: '2025-08-20T00:00:00Z',
    lastActiveAt: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, soundEffects: true, compactMode: false },
  },
  org_admin: {
    id: 'usr_admin_001',
    email: 'admin@exceliboard.com',
    displayName: 'Admin User',
    avatarUrl: '',
    role: 'org_admin',
    orgId: 'org_001',
    timezone: 'America/New_York',
    locale: 'en-US',
    createdAt: '2025-06-01T00:00:00Z',
    lastActiveAt: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, soundEffects: true, compactMode: false },
  },
  interviewee: {
    id: 'usr_interviewee_001',
    email: 'jane.smith@candidate.com',
    displayName: 'Jane Smith',
    avatarUrl: '',
    role: 'interviewee',
    orgId: 'org_002',
    timezone: 'America/New_York',
    locale: 'en-US',
    createdAt: '2025-11-01T00:00:00Z',
    lastActiveAt: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, soundEffects: true, compactMode: false },
  },
};

// ── Context Shape ────────────────────────────

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: Notification[];
  login: (email: string, password: string) => Promise<void>;
  loginAsRole: (role: UserRole) => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Mock Notifications ───────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    type: 'meeting_invite',
    title: 'Team Standup',
    message: 'Daily standup meeting starts in 15 minutes',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    isRead: false,
    actionUrl: '/meeting/mtg_001',
  },
  {
    id: 'notif_2',
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: 'Technical interview with Jane Smith at 2:00 PM',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
    actionUrl: '/interview/int_001',
  },
  {
    id: 'notif_3',
    type: 'board_shared',
    title: 'Board Shared',
    message: 'Dr. Chen shared "System Design" board with you',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isRead: true,
    actionUrl: '/whiteboard/brd_001',
  },
  {
    id: 'notif_4',
    type: 'lecture_starting',
    title: 'Lecture Starting',
    message: 'Advanced Algorithms lecture begins in 30 minutes',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    isRead: false,
    actionUrl: '/lecture/lec_001',
  },
];

// ── Provider ─────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  useEffect(() => {
    // Check for persisted session
    const stored = localStorage.getItem('exceliboard_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('exceliboard_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    
    // Find demo user by email or default to teacher
    const matchedUser = Object.values(DEMO_USERS).find(u => u.email === email) || DEMO_USERS.teacher;
    const loggedInUser = { ...matchedUser, email, lastActiveAt: new Date().toISOString() };
    
    setUser(loggedInUser);
    localStorage.setItem('exceliboard_user', JSON.stringify(loggedInUser));
    setIsLoading(false);
  }, []);

  const loginAsRole = useCallback((role: UserRole) => {
    const roleKey = role === 'super_admin' ? 'org_admin' : role === 'interviewee' ? 'student' : role;
    const demoUser = DEMO_USERS[roleKey] || DEMO_USERS.teacher;
    const loggedInUser = { ...demoUser, role, lastActiveAt: new Date().toISOString() };
    
    setUser(loggedInUser);
    localStorage.setItem('exceliboard_user', JSON.stringify(loggedInUser));
  }, []);

  const signup = useCallback(async (email: string, _password: string, name: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      displayName: name,
      role: 'student',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      preferences: { theme: 'dark', notifications: true, soundEffects: true, compactMode: false },
    };
    
    setUser(newUser);
    localStorage.setItem('exceliboard_user', JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('exceliboard_user');
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        notifications,
        login,
        loginAsRole,
        signup,
        logout,
        markNotificationRead,
        unreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
