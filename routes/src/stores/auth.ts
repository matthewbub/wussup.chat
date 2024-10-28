import { create } from "zustand";

type AuthStore = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSecurityQuestionsAnswered: boolean;
  error: string | null;
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
  checkAuth: () => Promise<void>;
  useLogin: (username: string, password: string) => Promise<void>;
  useLogout: () => Promise<void>;
  useSignup: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    termsAccepted: boolean
  ) => Promise<void>;
  useSecurityQuestions: (
    questions: { question: string; answer: string }[]
  ) => Promise<void>;
  useAuthCheck: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  isSecurityQuestionsAnswered: false,
  error: null,
  user: null,
  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/v1/auth-check/jwt", {
        credentials: "include",
      });
      const json = (await response.json()) as {
        ok: boolean;
        user?: { id: string; username: string; email: string };
        error?: string;
      };
      if (json.ok) {
        set({
          isAuthenticated: true,
          user: json?.user,
        });
      } else {
        set({
          error: json?.error || "An error occurred during auth check",
          isAuthenticated: false,
          user: null,
        });
      }
    } catch (error) {
      set({
        error: "An error occurred during auth check",
        isAuthenticated: false,
        user: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  useLogin: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/v1/login/jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const json = (await response.json()) as {
        ok: boolean;
        message: string;
        securityQuestionsAnswered?: boolean;
      };

      if (json.ok) {
        set({
          isAuthenticated: true,
          isSecurityQuestionsAnswered: json?.securityQuestionsAnswered,
        });
      } else {
        set({ error: json.message || "Invalid username or password" });
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
        set({
          error: "An error occurred during logout",
          user: null,
        });
      }
    } catch (error) {
      set({
        error: "An error occurred during logout",
        user: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  useSignup: async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    termsAccepted: boolean
  ) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/v1/sign-up/jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
          termsAccepted,
        }),
      });
      const json = (await response.json()) as {
        ok: boolean;
        message: string;
        securityQuestionsAnswered?: boolean;
      };

      if (json.ok) {
        set({
          isAuthenticated: true,
          isSecurityQuestionsAnswered: json?.securityQuestionsAnswered,
        });
      } else {
        set({ error: json.message || "Signup failed" });
      }
    } catch {
      set({ error: "An error occurred during signup" });
    } finally {
      set({ isLoading: false });
    }
  },

  useSecurityQuestions: async (
    questions: { question: string; answer: string }[]
  ) => {
    console.log(questions);
  },

  useAuthCheck: async () => {
    // get the cookie expiry date

    const cookie = document.cookie;
    const cookieExpiry = cookie
      .split("; ")
      .find((row) => row.startsWith("jwt_expiry="))
      ?.split("=")[1];
    console.log(cookieExpiry);
  },
}));
