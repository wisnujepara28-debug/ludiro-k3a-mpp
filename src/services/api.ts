import {
  User,
  Ship,
  Voyage,
  Cargo,
  Crew,
  ActivityLog,
  SystemStats,
} from '../types';

let currentAuthToken: string | null = null;

try {
  currentAuthToken = sessionStorage.getItem('jvn_session_token');
} catch (e) {
  currentAuthToken = null;
}

export function setSessionToken(token: string | null) {
  currentAuthToken = token;
  try {
    if (token) {
      sessionStorage.setItem('jvn_session_token', token);
    } else {
      sessionStorage.removeItem('jvn_session_token');
    }
  } catch (e) {
    // sessionStorage fallback
  }
}

export function getSessionToken(): string | null {
  return currentAuthToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (currentAuthToken) {
    headers.set('Authorization', `Bearer ${currentAuthToken}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Terjadi kesalahan.`);
  }

  return data as T;
}

export const api = {
  // Real-time Event Subscription via Server-Sent Events (SSE)
  subscribeToEvents(onEvent: (eventData: any) => void): () => void {
    let eventSource: EventSource | null = null;
    let isCancelled = false;

    const connect = () => {
      if (isCancelled) return;
      try {
        eventSource = new EventSource('/api/events');

        eventSource.addEventListener('database_sync', (e) => {
          try {
            const parsed = JSON.parse(e.data);
            onEvent(parsed);
          } catch (err) {
            console.error('SSE parse error:', err);
          }
        });

        eventSource.addEventListener('activity_log', (e) => {
          try {
            const parsed = JSON.parse(e.data);
            onEvent(parsed);
          } catch (err) {
            console.error('SSE parse error:', err);
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (!isCancelled) {
            setTimeout(connect, 3000);
          }
        };
      } catch (err) {
        if (!isCancelled) {
          setTimeout(connect, 4000);
        }
      }
    };

    connect();

    return () => {
      isCancelled = true;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  },

  // Auth: Bebas tanpa ada batasan
  async login(identifier: string, password: string): Promise<{ success: boolean; token: string; user: User; message: string }> {
    const res = await request<{ success: boolean; token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    setSessionToken(res.token);
    return res;
  },

  async checkAuth(): Promise<{ success: boolean; user: User }> {
    if (!currentAuthToken) {
      throw new Error('Tidak ada sesi tersimpan.');
    }
    return request<{ success: boolean; user: User }>('/api/auth/me', {
      method: 'GET',
    });
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setSessionToken(null);
    }
  },

  // Stats & Logs
  async getStats(): Promise<{ success: boolean; stats: SystemStats }> {
    return request<{ success: boolean; stats: SystemStats }>('/api/stats');
  },

  async getLogs(): Promise<{ success: boolean; logs: ActivityLog[] }> {
    return request<{ success: boolean; logs: ActivityLog[] }>('/api/logs');
  },

  // Ships CRUD
  async getShips(params?: { q?: string; status?: string; type?: string }): Promise<{ success: boolean; data: Ship[] }> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; data: Ship[] }>(`/api/ships${qs}`);
  },

  async getShipById(id: string): Promise<{ success: boolean; data: Ship }> {
    return request<{ success: boolean; data: Ship }>(`/api/ships/${id}`);
  },

  async createShip(shipData: Partial<Ship>, userName?: string): Promise<{ success: boolean; data: Ship; message: string }> {
    return request<{ success: boolean; data: Ship; message: string }>('/api/ships', {
      method: 'POST',
      body: JSON.stringify({ ...shipData, userName }),
    });
  },

  async updateShip(id: string, shipData: Partial<Ship>, userName?: string): Promise<{ success: boolean; data: Ship; message: string }> {
    return request<{ success: boolean; data: Ship; message: string }>(`/api/ships/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...shipData, userName }),
    });
  },

  async deleteShip(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/ships/${id}`, {
      method: 'DELETE',
    });
  },

  // Voyages CRUD
  async getVoyages(): Promise<{ success: boolean; data: Voyage[] }> {
    return request<{ success: boolean; data: Voyage[] }>('/api/voyages');
  },

  async createVoyage(voyageData: Partial<Voyage>, userName?: string): Promise<{ success: boolean; data: Voyage; message: string }> {
    return request<{ success: boolean; data: Voyage; message: string }>('/api/voyages', {
      method: 'POST',
      body: JSON.stringify({ ...voyageData, userName }),
    });
  },

  async updateVoyage(id: string, voyageData: Partial<Voyage>, userName?: string): Promise<{ success: boolean; data: Voyage; message: string }> {
    return request<{ success: boolean; data: Voyage; message: string }>(`/api/voyages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...voyageData, userName }),
    });
  },

  async deleteVoyage(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/voyages/${id}`, {
      method: 'DELETE',
    });
  },

  // Cargo CRUD
  async getCargo(): Promise<{ success: boolean; data: Cargo[] }> {
    return request<{ success: boolean; data: Cargo[] }>('/api/cargo');
  },

  async createCargo(cargoData: Partial<Cargo>, userName?: string): Promise<{ success: boolean; data: Cargo; message: string }> {
    return request<{ success: boolean; data: Cargo; message: string }>('/api/cargo', {
      method: 'POST',
      body: JSON.stringify({ ...cargoData, userName }),
    });
  },

  async updateCargo(id: string, cargoData: Partial<Cargo>, userName?: string): Promise<{ success: boolean; data: Cargo; message: string }> {
    return request<{ success: boolean; data: Cargo; message: string }>(`/api/cargo/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...cargoData, userName }),
    });
  },

  async deleteCargo(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/cargo/${id}`, {
      method: 'DELETE',
    });
  },

  // Crew CRUD
  async getCrew(): Promise<{ success: boolean; data: Crew[] }> {
    return request<{ success: boolean; data: Crew[] }>('/api/crew');
  },

  async createCrew(crewData: Partial<Crew>, userName?: string): Promise<{ success: boolean; data: Crew; message: string }> {
    return request<{ success: boolean; data: Crew; message: string }>('/api/crew', {
      method: 'POST',
      body: JSON.stringify({ ...crewData, userName }),
    });
  },

  async updateCrew(id: string, crewData: Partial<Crew>, userName?: string): Promise<{ success: boolean; data: Crew; message: string }> {
    return request<{ success: boolean; data: Crew; message: string }>(`/api/crew/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...crewData, userName }),
    });
  },

  async deleteCrew(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/crew/${id}`, {
      method: 'DELETE',
    });
  },
};
