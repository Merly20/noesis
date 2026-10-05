import { create } from 'zustand';
import api from '../api/client.js';

export const useAuthStore = create((set, get) => ({
  user:  null,
  token: localStorage.getItem('noesis_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('noesis_token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      set({ loading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      localStorage.setItem('noesis_token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      set({ loading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  guestLogin: () => {
    const mockToken = "guest_token_123";
    const mockUser = { username: "Guest Explorer", role: "guest" };
    localStorage.setItem('noesis_token', mockToken);
    set({ token: mockToken, user: mockUser });
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem('noesis_token');
    set({ user: null, token: null, error: null });
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
    } catch {
      // Token invalid — clear
      localStorage.removeItem('noesis_token');
      set({ user: null, token: null });
    }
  },

  // Called by Exam page after points award to refresh user points live
  refreshPoints: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
    } catch { /* silent */ }
  },

  clearError: () => set({ error: null }),
}));
