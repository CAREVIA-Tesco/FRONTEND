// Central API client for the Carevaa backend (Express + MongoDB).
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
    throw new Error('Cannot reach the Carevaa server. Please make sure the backend is running.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) logout(); // expired / invalid session
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
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
  register: (name, identifier, password, role, details = {}) => request('/auth/register', { method: 'POST', body: { ...details, name, identifier, password, role }, auth: false }),
  me: () => request('/auth/me'),
  // patient visit management (doctor, nurse, admin)
  clinicSummary: (params = {}) => request(`/clinic/summary${qs(params)}`),
  clinicReport: (params = {}) => request(`/clinic/report${qs(params)}`),
  clinicPatients: (params = {}) => request(`/clinic/patients${qs(params)}`),
  clinicMatch: (phone) => request(`/clinic/patients/match${qs({ phone })}`),
  clinicPatient: (id) => request(`/clinic/patients/${id}`),
  updateClinicPatient: (id, data) => request(`/clinic/patients/${id}`, { method: 'PUT', body: data }),
  clinicVisits: (params = {}) => request(`/clinic/visits${qs(params)}`),
  addClinicVisit: (data) => request('/clinic/visits', { method: 'POST', body: data }),
  updateClinicVisit: (id, data) => request(`/clinic/visits/${id}`, { method: 'PUT', body: data }),
  deleteClinicVisit: (id) => request(`/clinic/visits/${id}`, { method: 'DELETE' }),
  clinicStaff: (params = {}) => request(`/clinic/staff${qs(params)}`),
  addClinicStaff: (data) => request('/clinic/staff', { method: 'POST', body: data }),
  updateClinicStaff: (id, data) => request(`/clinic/staff/${id}`, { method: 'PATCH', body: data }),
  adminClinicReport: (params = {}) => request(`/admin/clinic/report${qs(params)}`),
  // notifications (bell icon)
  notifications: (limit = 30) => request(`/notifications?limit=${limit}`),
  readNotification: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  readAllNotifications: () => request('/notifications/read-all', { method: 'POST' }),
  clearNotifications: () => request('/notifications', { method: 'DELETE' }),
  updateMe: (data) => request('/auth/me', { method: 'PUT', body: data }),
  // forgot password (SMS OTP)
  forgotPassword: (phone) => request('/auth/forgot-password', { method: 'POST', body: { phone }, auth: false }),
  verifyOtp: (phone, code) => request('/auth/verify-otp', { method: 'POST', body: { phone, code }, auth: false }),
  resetPassword: (resetToken, password) => request('/auth/reset-password', { method: 'POST', body: { resetToken, password }, auth: false }),

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
  getAppointment: (id) => request(`/appointments/${id}`),
  bookAppointment: (data) => request('/appointments', { method: 'POST', body: data }),
  rescheduleAppointment: (id, date, time) => request(`/appointments/${id}/reschedule`, { method: 'PATCH', body: { date, time } }),
  completeAppointment: (id, notes) => request(`/appointments/${id}/complete`, { method: 'PATCH', body: notes }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),
  setAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, { method: 'PATCH', body: { status } }),

  // admin
  getStats: () => request('/admin/stats'),
  getPatients: (params) => request(`/admin/patients${qs(params)}`),
  getPatient: (id) => request(`/admin/patients/${id}`),
  createPatient: (data) => request('/admin/patients', { method: 'POST', body: data }),
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
  createService: (data) => request('/services', { method: 'POST', body: data }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: data }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

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
  updateApplication: (id, status) => request(`/applications/${id}`, { method: 'PATCH', body: { status } }),

  // enquiries / callback requests
  createEnquiry: (data) => request('/enquiries', { method: 'POST', body: data }),
  // PIN code -> city, district, state and post offices (works for every PIN code in India)
  pincode: (pin) => request(`/pincode/${encodeURIComponent(pin)}`, { auth: false }),
  trackEnquiry: (code, phone) => request(`/enquiries/track${qs({ code, phone })}`, { auth: false }),
  myEnquiries: () => request('/enquiries/mine'),
  cancelEnquiry: (id, phone) => request(`/enquiries/${id}/cancel`, { method: 'PATCH', body: { phone } }),
  getEnquiries: (params) => request(`/enquiries${qs(params)}`),
  updateEnquiry: (id, data) => request(`/enquiries/${id}`, { method: 'PATCH', body: data }),
  // routing requests to professionals
  openRequests: () => request('/enquiries/open'),
  acceptRequest: (id, data = {}) => request(`/enquiries/${id}/accept`, { method: 'POST', body: data }),
  declineRequest: (id) => request(`/enquiries/${id}/decline`, { method: 'POST' }),
  requestMatches: (id) => request(`/enquiries/${id}/matches`),
  assignRequest: (id, data) => request(`/enquiries/${id}/assign`, { method: 'POST', body: data }),
  broadcastRequest: (id, on = true) => request(`/enquiries/${id}/broadcast`, { method: 'POST', body: { on } }),
};

export default api;
