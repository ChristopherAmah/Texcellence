import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => { const token = localStorage.getItem('texcellence_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export const authApi = { login: (credentials) => api.post('/auth/login', credentials), register: (details) => api.post('/auth/register', details), me: () => api.get('/auth/me') };
export const eventApi = { list: (params) => api.get('/events', { params }), create: (details) => api.post('/events', details), update: (eventId, details) => api.patch(`/events/${eventId}`, details) };
export const sponsorApi = { list: (params) => api.get('/sponsors', { params }), create: (details) => api.post('/sponsors', details), remove: (sponsorId) => api.delete(`/sponsors/${encodeURIComponent(sponsorId)}`) };
export const analyticsApi = { executive: () => api.get('/analytics/executive') };
export const attendeeApi = { create: (details) => api.post('/attendees', details), me: () => api.get('/attendees/me'), list: (params) => api.get('/attendees', { params }) };
export const interactionApi = { scan: (attendeeId) => api.get(`/interactions/scan/${encodeURIComponent(attendeeId)}`), create: (details) => api.post('/interactions', details) };
export const interactionAdminApi = { list: (params) => api.get('/interactions', { params }) };
export const leadApi = { list: (params) => api.get('/leads', { params }) };
export const activityApi = { list: (params) => api.get('/activity', { params }) };
export default api;
