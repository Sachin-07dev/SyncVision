import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import type { UserRole } from '@/types';

// ── Types ────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  customRoleName?: string;
  orgId?: string;
  timezone: string;
  locale: string;
  createdAt: string;
  lastActiveAt: string;
  preferences: {
    theme: string;
    notifications: boolean;
    soundEffects: boolean;
    compactMode: boolean;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role: string, customRoleName?: string) => Promise<void>;
  loginAsDemo: (role: string, customRoleName?: string) => void;
  logout: () => void;
}

// ── Demo persona data ─────────────────────────

const DEMO_PERSONAS: Record<string, Omit<AuthUser, 'createdAt' | 'lastActiveAt'>> = {
  student: {
    id: 'demo_student',
    email: 'demo+student@SyncVision.app',
    displayName: 'Alex (Demo Student)',
    role: 'student',
    timezone: 'UTC', locale: 'en',
    preferences: { theme: 'dark', notifications: true, soundEffects: false, compactMode: false },
  },
  teacher: {
    id: 'demo_teacher',
    email: 'demo+teacher@SyncVision.app',
    displayName: 'Dr. Sarah (Demo Teacher)',
    role: 'teacher',
    timezone: 'UTC', locale: 'en',
    preferences: { theme: 'dark', notifications: true, soundEffects: false, compactMode: false },
  },
  interviewer: {
    id: 'demo_interviewer',
    email: 'demo+interviewer@SyncVision.app',
    displayName: 'James (Demo Interviewer)',
    role: 'interviewer',
    timezone: 'UTC', locale: 'en',
    preferences: { theme: 'dark', notifications: true, soundEffects: false, compactMode: false },
  },
  org_admin: {
    id: 'demo_admin',
    email: 'demo+admin@SyncVision.app',
    displayName: 'Maria (Demo Admin)',
    role: 'org_admin',
    timezone: 'UTC', locale: 'en',
    preferences: { theme: 'dark', notifications: true, soundEffects: false, compactMode: false },
  },
  other: {
    id: 'demo_other',
    email: 'demo+other@SyncVision.app',
    displayName: 'Pat (Demo Other)',
    role: 'other',
    customRoleName: 'Freelancer',
    timezone: 'UTC', locale: 'en',
    preferences: { theme: 'dark', notifications: true, soundEffects: false, compactMode: false },
  },
};

function buildDemoUser(role: string): AuthUser {
  const now = new Date().toISOString();
  const base = DEMO_PERSONAS[role] ?? DEMO_PERSONAS.student;
  // Unique ID per tab/session — prevents signaling collision when
  // two demo users with the same role join the same room.
  const sessionSuffix = Math.random().toString(36).slice(2, 8);
  return { ...base, id: `${base.id}_${sessionSuffix}`, createdAt: now, lastActiveAt: now };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // On mount, restore demo session OR real token session
  useEffect(() => {
    const demoRole = localStorage.getItem('SyncVision_demo_role');
    if (demoRole) {
      const demoUser = buildDemoUser(demoRole);
      const customRole = localStorage.getItem('SyncVision_demo_custom_role');
      if (demoRole === 'other' && customRole) {
        demoUser.customRoleName = customRole;
        demoUser.displayName = `${customRole} (Demo)`;
      }
      setUser(demoUser);
      setIsDemo(true);
      setIsLoading(false);
      return;
    }
    const token = localStorage.getItem('SyncVision_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.auth.me()
      .then((u) => setUser(u as unknown as AuthUser))
      .catch(() => {
        localStorage.removeItem('SyncVision_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user: u } = await api.auth.login(email, password);
      localStorage.removeItem('SyncVision_demo_role');
      localStorage.setItem('SyncVision_token', token);
      setIsDemo(false);
      setUser(u as unknown as AuthUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string, role: string, customRoleName?: string) => {
    setIsLoading(true);
    try {
      const { token, user: u } = await api.auth.signup(email, password, displayName, role, customRoleName);
      localStorage.removeItem('SyncVision_demo_role');
      localStorage.setItem('SyncVision_token', token);
      setIsDemo(false);
      setUser(u as unknown as AuthUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsDemo = useCallback((role: string, customRoleName?: string) => {
    localStorage.removeItem('SyncVision_token');
    localStorage.setItem('SyncVision_demo_role', role);
    if (customRoleName) localStorage.setItem('SyncVision_demo_custom_role', customRoleName);
    else localStorage.removeItem('SyncVision_demo_custom_role');
    setIsDemo(true);
    const demoUser = buildDemoUser(role);
    if (role === 'other' && customRoleName) {
      demoUser.customRoleName = customRoleName;
      demoUser.displayName = `${customRoleName} (Demo)`;
    }
    setUser(demoUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsDemo(false);
    localStorage.removeItem('SyncVision_token');
    localStorage.removeItem('SyncVision_demo_role');
    localStorage.removeItem('SyncVision_demo_custom_role');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isDemo,
        login,
        signup,
        loginAsDemo,
        logout,
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
