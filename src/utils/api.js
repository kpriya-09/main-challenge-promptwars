import { store } from './store.js';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = store.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    if (res.status === 401 && auth) {
      store.clearSession();
      location.hash = '#/login';
    }
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  return data;
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  googleAuth: (credential) => request('/auth/google', { method: 'POST', body: { credential }, auth: false }),
  me: () => request('/auth/me'),
  getProfile: () => request('/profile'),
  saveProfile: (profile) => request('/profile', { method: 'PUT', body: profile }),
  generatePlan: (profile) => request('/plan', { method: 'POST', body: profile ? { profile } : {} }),
  getAlerts: () => request('/alerts'),
  getAdvisory: (trip) => request('/advisory', { method: 'POST', body: trip }),
  history: (limit = 10) => request(`/history?limit=${limit}`)
};

export { ApiError };
