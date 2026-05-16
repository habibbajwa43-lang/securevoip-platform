import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPin: (userId: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  login: async (email, password) => {
    const { data } = await axios.post(`${API_URL}/v1/auth/login`, { email, password });
    await AsyncStorage.multiSet([
      ['accessToken', data.accessToken],
      ['refreshToken', data.refreshToken],
      ['user', JSON.stringify(data.user)],
    ]);
    set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
  },

  loginWithPin: async (userId, pin) => {
    const { data } = await axios.post(`${API_URL}/v1/auth/pin-login`, { userId, pin });
    await AsyncStorage.multiSet([
      ['accessToken', data.accessToken],
      ['refreshToken', data.refreshToken],
      ['user', JSON.stringify(data.user)],
    ]);
    set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    set({ user: null, accessToken: null, refreshToken: null });
  },

  loadStoredAuth: async () => {
    const [[, token], [, refresh], [, userStr]] = await AsyncStorage.multiGet(['accessToken', 'refreshToken', 'user']);
    if (token && userStr) {
      set({ accessToken: token, refreshToken: refresh, user: JSON.parse(userStr) });
    }
  },
}));
