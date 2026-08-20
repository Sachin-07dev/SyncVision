const isSecure = window.location.protocol === 'https:';
const API_BASE = import.meta.env.VITE_API_URL ||
  (isSecure ? '' : `http://${window.location.hostname}:3001`);
// When HTTPS: API calls go to /api/* on same origin (Vite proxy → localhost:3001)
// When HTTP:  direct to localhost:3001

function getToken(): string | null {
  return localStorage.getItem('SyncVision_token');
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
    signup: (email: string, password: string, displayName: string, role: string, customRoleName?: string) =>
      request<AuthResponse>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName, role, customRoleName }),
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

    update: (id: string, data: { title?: string; startTime?: string; scheduledDuration?: number; description?: string }) =>
      request<any>(`/api/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    join: (id: string) =>
      request<any>(`/api/sessions/${id}/join`, { method: 'POST' }),
  },

  ai: {
    chat: (messages: { role: string; content: string }[], subject?: string) =>
      request<{ message: { role: string; content: string } }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages, subject }),
      }),

    explain: (topic: string, level?: string) =>
      request<{ message: { role: string; content: string } }>('/api/ai/explain', {
        method: 'POST',
        body: JSON.stringify({ topic, level }),
      }),
  },
};
