import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile, AuthTokens } from "@/types/auth/auth.types";

interface AuthStore {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  _hasHydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (isLoading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isLoading: false,
      _hasHydrated: false,
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      logout: () => set({ user: null, tokens: null, isLoading: false }),
    }),
    {
      name: "fishing-saas-auth",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
