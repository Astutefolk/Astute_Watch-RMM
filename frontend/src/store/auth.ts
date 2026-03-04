import { create } from 'zustand';
import { User } from '@/types/index';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
    get().saveToStorage();
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    set({ accessToken, refreshToken });
    get().saveToStorage();
  },

  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth');
    }
  },

  saveToStorage: () => {
    if (typeof window !== 'undefined') {
      const state = get();
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        })
      );
    }
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const { user, accessToken, refreshToken } = JSON.parse(stored);
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: !!user,
          });
        } catch (e) {
          console.error('Failed to load auth from storage:', e);
        }
      }
    }
  },
}));
