import { fetchWithAuth } from "@/utils/auth-helpers";
import { create } from "zustand";

interface NullTime {
  time: Date | null;
  valid: boolean;
}

type AuthStore = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  isSecurityQuestionsAnswered: boolean;
  error: string | null;
  user: {
    id: string;
    username: string;
    email: string;
    applicationEnvironmentRole: string;
    securityQuestionsAnswered: boolean;
    inactiveAt: NullTime;
  } | null;
  checkAuth: () => Promise<boolean>;
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
};

export const useAuthStore = create<AuthStore>((set) => ({
  isInitializing: true,
  isAuthenticated: false,
  isLoading: false,
  isSecurityQuestionsAnswered: false,
  error: null,
  user: null,
  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/v1/jwt/auth-check", {
        credentials: "include",
      });
      const json = (await response.json()) as {
        ok: boolean;
        user?: {
          id: string;
          username: string;
          email: string;
          applicationEnvironmentRole?: string;
          securityQuestionsAnswered?: boolean;
          inactiveAt?: {
            Valid: boolean;
            value: Date;
          };
        };
        error?: string;
      };

      if (json.ok) {
        if (json?.user?.inactiveAt?.Valid) {
          set({
            error: "This account has been deactivated. Please contact support.",
            isAuthenticated: false,
            user: null,
          });
          return false;
        }
        console.log(json?.user);

        set({
          isAuthenticated: true,
          user: {
            id: json?.user?.id ?? "",
            username: json?.user?.username ?? "",
            email: json?.user?.email ?? "",
            applicationEnvironmentRole:
              json?.user?.applicationEnvironmentRole ?? "",
            securityQuestionsAnswered:
              json?.user?.securityQuestionsAnswered || false,
            inactiveAt: {
              valid: json?.user?.inactiveAt?.Valid || false,
              time: json?.user?.inactiveAt?.value || null,
            },
          },
          error: null,
        });

        return true;
      } else {
        set({
          error:
            json?.error ||
            "An error occurred during auth check. Please sign in.",
          isAuthenticated: false,
          user: null,
          isSecurityQuestionsAnswered: false,
        });

        return false;
      }
    } catch (error) {
      set({
        error: "An error occurred during auth check. Please sign in.",
        isAuthenticated: false,
        user: null,
        isSecurityQuestionsAnswered: false,
      });

      return false;
    } finally {
      set({ isLoading: false, isInitializing: false });
    }
  },

  useLogin: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/v1/account/login", {
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
          isSecurityQuestionsAnswered: json?.securityQuestionsAnswered ?? false,
          error: null,
        });
      } else {
        set({
          error: json.message || "Invalid username or password",
          isAuthenticated: false,
          user: null,
          isSecurityQuestionsAnswered: false,
        });
      }
    } catch (error) {
      set({
        error: "An error occurred during login",
        isAuthenticated: false,
        user: null,
        isSecurityQuestionsAnswered: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  useLogout: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch("/api/v1/account/logout", {
        method: "POST",
        credentials: "include",
      });
      const json = await response.json();

      if (json.ok) {
        set({
          isAuthenticated: false,
          user: null,
          isSecurityQuestionsAnswered: false,
        });
      } else {
        set({
          error: "An error occurred during logout",
          user: null,
          isSecurityQuestionsAnswered: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      set({
        error: "An error occurred during logout",
        user: null,
        isSecurityQuestionsAnswered: false,
        isAuthenticated: false,
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
      const response = await fetch("/api/v1/account/sign-up", {
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
          error: null,
        });
      } else {
        set({
          error: json.message || "Signup failed",
          isAuthenticated: false,
          user: null,
          isSecurityQuestionsAnswered: false,
        });
      }
    } catch {
      set({
        error: "An error occurred during signup",
        isAuthenticated: false,
        user: null,
        isSecurityQuestionsAnswered: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  useSecurityQuestions: async (
    questions: { question: string; answer: string }[]
  ) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetchWithAuth(
        "/api/v1/account/security-questions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions }),
        }
      );
      const json = await response.json();
      if (json.ok) {
        set({
          isSecurityQuestionsAnswered: true,
          error: null,
        });
      } else {
        set({
          error: json.message || "An error occurred during security questions",
        });
      }
    } catch (error) {
      set({ error: "An error occurred during security questions" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
