// Central API client for the Carevia backend (Express + MongoDB).
// In development Vite proxies "/api" to http://localhost:5000 (see vite.config.js).
// For production builds set VITE_API_URL in Frontend/.env, e.g. VITE_API_URL=https://your-backend.onrender.com/api
import { saveCurrentUser, getCurrentUser, clearCurrentUser } from '../utils/storage';

export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'carevia_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getSessionUser = () => (getToken() ? getCurrentUser() : null);

export function saveSession({ token, user }) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
  saveCurrentUser(user);
}

export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  clearCurrentUser();
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the Carevia server. Please make sure the backend is running.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) logout(); // expired / invalid session
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const qs = (params = {}) => {
  const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return clean.length ? `?${new URLSearchParams(clean).toString()}` : '';
};

export const api = {
  // auth
  login: (identifier, password, role) => request('/auth/login', { method: 'POST', body: { identifier, password, role }, auth: false }),
  register: (name, identifier, password, role) => request('/auth/register', { method: 'POST', body: { name, identifier, password, role }, auth: false }),
  me: () => request('/auth/me'),
  updateMe: (data) => request('/auth/me', { method: 'PUT', body: data }),

  // providers
  getProviders: (params) => request(`/providers${qs(params)}`),
  getProvider: (id) => request(`/providers/${id}`),
  getMyProvider: () => request('/providers/me'),
  submitOnboarding: (data) => request('/providers/onboarding', { method: 'POST', body: data }),
  createProvider: (data) => request('/providers', { method: 'POST', body: data }),
  updateProvider: (id, data) => request(`/providers/${id}`, { method: 'PUT', body: data }),
  setProviderStatus: (id, status) => request(`/providers/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteProvider: (id) => request(`/providers/${id}`, { method: 'DELETE' }),

  // appointments
  getAppointments: (params) => request(`/appointments${qs(params)}`),
  bookAppointment: (data) => request('/appointments', { method: 'POST', body: data }),
  rescheduleAppointment: (id, date, time) => request(`/appointments/${id}/reschedule`, { method: 'PATCH', body: { date, time } }),
  completeAppointment: (id, notes) => request(`/appointments/${id}/complete`, { method: 'PATCH', body: notes }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),
  setAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, { method: 'PATCH', body: { status } }),

  // admin
  getStats: () => request('/admin/stats'),
  getPatients: (params) => request(`/admin/patients${qs(params)}`),
  getPatient: (id) => request(`/admin/patients/${id}`),
  updatePatient: (id, data) => request(`/admin/patients/${id}`, { method: 'PATCH', body: data }),
  getPayments: (params) => request(`/admin/payments${qs(params)}`),
  refundPayment: (id) => request(`/admin/payments/${id}/refund`, { method: 'POST' }),
  getPayouts: () => request('/admin/payouts'),
  processPayout: (providerId) => request(`/admin/payouts/${providerId}`, { method: 'POST' }),

  // catalog
  getSpecializations: () => request('/specializations', { auth: false }),
  createSpecialization: (data) => request('/specializations', { method: 'POST', body: data }),
  updateSpecialization: (id, data) => request(`/specializations/${id}`, { method: 'PUT', body: data }),
  deleteSpecialization: (id) => request(`/specializations/${id}`, { method: 'DELETE' }),
  getServices: () => request('/services', { auth: false }),

  // reviews
  getReviews: (params) => request(`/reviews${qs(params)}`, { auth: false }),
  createReview: (appointmentId, rating, comment) => request('/reviews', { method: 'POST', body: { appointmentId, rating, comment } }),

  // website content stored in the database (testimonials, cities, jobs ...)
  getContent: (key) => request(`/content/${key}`, { auth: false }),
  saveContent: (key, items) => request(`/content/${key}`, { method: 'PUT', body: { items } }),

  // emergency requests
  createEmergency: (data) => request('/emergency', { method: 'POST', body: data }),
  getEmergencies: () => request('/emergency'),
  updateEmergency: (id, data) => request(`/emergency/${id}`, { method: 'PATCH', body: data }),

  // job applications
  applyForJob: (data) => request('/applications', { method: 'POST', body: data, auth: false }),
  getApplications: () => request('/applications'),
};

export default api;
