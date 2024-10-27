import { create } from "zustand";

type AuthStore = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,

  // Login function, sets isAuthenticated to true if login succeeds
  login: async (username: string, password: string) => {
    try {
      const response = await fetch("/api/v1/login/jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensures cookies are included
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        set({ isAuthenticated: true });
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  },

  // Logout function, clears isAuthenticated state
  logout: async () => {
    try {
      const response = await fetch("/api/v1/logout/jwt", {
        method: "POST",
        credentials: "include", // Include cookies to access the server
      });

      if (response.ok) {
        set({ isAuthenticated: false });
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  },
}));
