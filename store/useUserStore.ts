import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User as AuthUser } from '../lib/auth';

export type User = AuthUser & {
  downloadsLeft?: number;
};

type UserStore = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
  refreshUser: () => Promise<void>;
  decrementDownload: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { user } = await authService.login({ email, password });
          set({ user: { ...user, downloadsLeft: 10 }, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          await authService.register({ email, password, name });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null });
      },

      loadUser: () => {
        const user = authService.getUser();
        if (user) {
          set({ user: { ...user, downloadsLeft: 10 } });
        }
      },

      refreshUser: async () => {
        try {
          const user = authService.getUser();
          if (user) {
            const updatedUser = await authService.getProfile();
            set({ user: { ...updatedUser, downloadsLeft: 10 } });
          }
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },

      decrementDownload: () =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  downloadsLeft: Math.max(0, (state.user.downloadsLeft || 0) - 1),
                },
              }
            : state
        ),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ user: state.user }),
    }
  )
); 