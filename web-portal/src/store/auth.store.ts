// store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  walletBalance: number;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPin: (email: string, pin: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshBalance: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await apiClient.post('/auth/login', { email, password });
        const { user, tokens } = data.data;

        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);

        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      loginWithPin: async (email, pin) => {
        const { data } = await apiClient.post('/auth/login/pin', { email, pin });
        const { user, tokens } = data.data;

        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);

        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        apiClient.post('/auth/logout').catch(() => {});
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        window.location.href = '/auth/login';
      },

      updateUser: (data) => {
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null }));
      },

      refreshBalance: async () => {
        try {
          const { data } = await apiClient.get('/billing/wallet');
          set((state) => ({
            user: state.user
              ? { ...state.user, walletBalance: data.data.balance }
              : null,
          }));
        } catch {}
      },
    }),
    {
      name: 'voip-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
