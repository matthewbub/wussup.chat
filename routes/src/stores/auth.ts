import { create } from "zustand";

type AuthStore = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  useLogin: (username: string, password: string) => Promise<void>;
  useLogout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  useLogin: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/v1/login/jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const json = await response.json();

      if (json.ok) {
        set({ isAuthenticated: true });
      } else {
        set({ error: "Invalid username or password" });
      }
    } catch (error) {
      set({ error: "An error occurred during login" });
    } finally {
      set({ isLoading: false });
    }
  },

  useLogout: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch("/api/v1/logout/jwt", {
        method: "POST",
        credentials: "include",
      });
      const json = await response.json();

      if (json.ok) {
        set({ isAuthenticated: false });
      } else {
        set({ error: "An error occurred during logout" });
      }
    } catch (error) {
      set({ error: "An error occurred during logout" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
