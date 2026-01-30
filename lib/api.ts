const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
  data?: T;
  errors?: string[];
  error?: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
}

// Get stored auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Set auth token
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

// Clear auth token
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

// Base fetch wrapper with auth
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        errors: data.errors || [data.error || 'An error occurred'],
      };
    }

    return { data };
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : 'Network error'],
    };
  }
}

// Auth endpoints
export const authApi = {
  signup: (email: string, password: string, name: string) =>
    apiFetch<{ user: any; token: string }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ data: any }>('/auth/sign_in', {
      method: 'POST',
      body: JSON.stringify({ email, password }), // flat params
    }),

  logout: () => {
    clearAuthToken();
    return Promise.resolve({ data: { success: true } });
  },

  getCurrentUser: () =>
    apiFetch<{ id: string; email: string; name: string; admin: boolean }>('/users/me'),
};

// Ideas endpoints
export const ideasApi = {
  list: (params?: { page?: number; status?: string; category?: string }) =>
    apiFetch<any[]>(`/ideas${new URLSearchParams(params as any).toString()}`),

  trending: (page = 1) =>
    apiFetch<any[]>(`/ideas/trending?page=${page}`),

  recent: (page = 1) =>
    apiFetch<any[]>(`/ideas/recent?page=${page}`),

  getById: (id: string) =>
    apiFetch<any>(`/ideas/${id}`),

  create: (title: string, description: string, category: string) =>
    apiFetch<any>('/ideas', {
      method: 'POST',
      body: JSON.stringify({ idea: { title, description, category } }),
    }),

  update: (id: string, data: any) =>
    apiFetch<any>(`/ideas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ idea: data }),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/ideas/${id}`, { method: 'DELETE' }),

  vote: (id: string) =>
    apiFetch<any>(`/ideas/${id}/vote`, { method: 'POST' }),

  unvote: (id: string) =>
    apiFetch<any>(`/ideas/${id}/unvote`, { method: 'DELETE' }),
};

// Comments endpoints
export const commentsApi = {
  list: (ideaId: string, page = 1) =>
    apiFetch<any[]>(`/ideas/${ideaId}/comments?page=${page}`),

  create: (ideaId: string, content: string) =>
    apiFetch<any>(`/ideas/${ideaId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment: { content } }),
    }),

  delete: (ideaId: string, commentId: string) =>
    apiFetch<void>(`/ideas/${ideaId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
};

// Roadmap endpoints
export const roadmapApi = {
  list: (page = 1) =>
    apiFetch<any[]>(`/roadmap_items?page=${page}`),

  getById: (id: string) =>
    apiFetch<any>(`/roadmap_items/${id}`),
};

// Admin endpoints
export const adminApi = {
  ideasList: (page = 1) =>
    apiFetch<any[]>(`/admin/ideas?page=${page}`),

  ideaUpdate: (id: string, data: any) =>
    apiFetch<any>(`/admin/ideas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ idea: data }),
    }),

  ideaDelete: (id: string) =>
    apiFetch<void>(`/admin/ideas/${id}`, { method: 'DELETE' }),

  changeIdeaStatus: (id: string, status: string) =>
    apiFetch<any>(`/admin/ideas/${id}/change_status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  roadmapList: (page = 1) =>
    apiFetch<any[]>(`/admin/roadmap_items?page=${page}`),

  roadmapCreate: (data: any) =>
    apiFetch<any>('/admin/roadmap_items', {
      method: 'POST',
      body: JSON.stringify({ roadmap_item: data }),
    }),

  roadmapUpdate: (id: string, data: any) =>
    apiFetch<any>(`/admin/roadmap_items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ roadmap_item: data }),
    }),

  roadmapDelete: (id: string) =>
    apiFetch<void>(`/admin/roadmap_items/${id}`, {
      method: 'DELETE',
    }),
};
