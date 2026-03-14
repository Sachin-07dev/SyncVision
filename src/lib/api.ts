const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('exceliboard_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const raw = await res.text();
  let data: any = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return (data ?? {}) as T;
}

// ── Auth ─────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export interface ApiUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
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

export const api = {
  auth: {
    signup: (email: string, password: string, displayName: string, role: string) =>
      request<AuthResponse>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName, role }),
      }),

    login: (email: string, password: string) =>
      request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () => request<ApiUser>('/api/auth/me'),
  },

  boards: {
    list: () => request<any[]>('/api/boards'),

    get: (id: string) => request<any>(`/api/boards/${id}`),

    create: (name: string, type = 'whiteboard', data = {}) =>
      request<any>('/api/boards', {
        method: 'POST',
        body: JSON.stringify({ name, type, data }),
      }),

    update: (id: string, updates: { name?: string; data?: any; isPublic?: boolean }) =>
      request<any>(`/api/boards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),

    delete: (id: string) =>
      request<any>(`/api/boards/${id}`, { method: 'DELETE' }),

    addCollaborator: (boardId: string, email: string, role = 'editor') =>
      request<any>(`/api/boards/${boardId}/collaborators`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      }),
  },

  sessions: {
    list: (type?: string) =>
      request<any[]>(`/api/sessions${type ? `?type=${type}` : ''}`),

    get: (id: string) => request<any>(`/api/sessions/${id}`),

    create: (data: { type: string; title: string; description?: string; startTime?: string; scheduledDuration?: number; roomConfig?: any }) =>
      request<any>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: string) =>
      request<any>(`/api/sessions/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    join: (id: string) =>
      request<any>(`/api/sessions/${id}/join`, { method: 'POST' }),
  },
};
