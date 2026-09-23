// API client for connecting frontend to backend
const API_BASE_URL = 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: FetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Services API
export const servicesAPI = {
  getAll: () => fetchAPI('/services'),
  getById: (id: string) => fetchAPI(`/services/${id}`),
  create: (service: any) => fetchAPI('/services', { method: 'POST', body: JSON.stringify(service) }),
  update: (id: string, service: any) => fetchAPI(`/services/${id}`, { method: 'PUT', body: JSON.stringify(service) }),
  delete: (id: string) => fetchAPI(`/services/${id}`, { method: 'DELETE' }),
};

// Sessions API
export const sessionsAPI = {
  getAll: (status?: string) => fetchAPI(`/sessions${status ? `?status=${status}` : ''}`),
  getById: (id: string) => fetchAPI(`/sessions/${id}`),
  getByChair: (chairId: string) => fetchAPI(`/sessions/chair/${chairId}`),
  create: (session: any) => fetchAPI('/sessions', { method: 'POST', body: JSON.stringify(session) }),
  addDetectedService: (sessionId: string, service: any) =>
    fetchAPI(`/sessions/${sessionId}/detected-services`, { method: 'POST', body: JSON.stringify(service) }),
  updateDetectedServiceStatus: (serviceId: string, status: string) =>
    fetchAPI(`/sessions/detected-services/${serviceId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  complete: (id: string) => fetchAPI(`/sessions/${id}/complete`, { method: 'POST' }),
};

// Transactions API
export const transactionsAPI = {
  getAll: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters).toString();
    return fetchAPI(`/transactions${params ? `?${params}` : ''}`);
  },
  getById: (id: string) => fetchAPI(`/transactions/${id}`),
  getByTxId: (txId: string) => fetchAPI(`/transactions/tx/${txId}`),
  create: (transaction: any) => fetchAPI('/transactions', { method: 'POST', body: JSON.stringify(transaction) }),
  getStats: (period?: string) => fetchAPI(`/transactions/stats${period ? `?period=${period}` : ''}`),
};

// Cameras API
export const camerasAPI = {
  getAll: () => fetchAPI('/cameras'),
  getById: (id: string) => fetchAPI(`/cameras/${id}`),
  getByChair: (chairId: string) => fetchAPI(`/cameras/chair/${chairId}`),
  updateStatus: (id: string, status: any) => fetchAPI(`/cameras/${id}`, { method: 'PATCH', body: JSON.stringify(status) }),
  getSystemStatus: () => fetchAPI('/cameras/status'),
};

// Activity API
export const activityAPI = {
  getAll: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters).toString();
    return fetchAPI(`/activity${params ? `?${params}` : ''}`);
  },
  add: (activity: any) => fetchAPI('/activity', { method: 'POST', body: JSON.stringify(activity) }),
  clear: () => fetchAPI('/activity', { method: 'DELETE' }),
};

// AI API
export const aiAPI = {
  simulateDetection: (chairId: string) => fetchAPI('/ai/detect', { method: 'POST', body: JSON.stringify({ chairId }) }),
  runDemo: (chairId: string) => fetchAPI('/ai/demo', { method: 'POST', body: JSON.stringify({ chairId }) }),
  getThreshold: () => fetchAPI('/ai/threshold'),
};

// Health check
export const healthAPI = {
  check: () => fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(res => res.json()),
};
