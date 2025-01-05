import { create } from "zustand";
import { User } from "@/types/user";
import { authService } from "@/services/auth";
import { STRINGS } from "@/constants/strings";

interface LogoutOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: (options?: LogoutOptions) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: async (options = {}) => {
    const { redirectTo = "/login", onSuccess, onError } = options;

    try {
      await authService.logout();
      set({ user: null });
      onSuccess?.();

      if (typeof window !== "undefined" && redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (error) {
      onError?.(error as Error);
      // Still clear user state even if API call fails
      set({ user: null });

      if (typeof window !== "undefined" && redirectTo) {
        window.location.href = redirectTo;
      }
    }
  },
}));
