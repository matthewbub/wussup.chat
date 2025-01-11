import { create } from "zustand";
import { API_CONSTANTS } from "../constants/api";
import { STRINGS } from "../constants/strings";

interface PasswordResetStore {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  validationErrors: Array<{ message: string; path: string[] }>;

  // Request password reset
  requestReset: (email: string) => Promise<void>;

  // Reset password with token
  resetPassword: (data: {
    token: string;
    password: string;
    confirmPassword: string;
    appId: string;
  }) => Promise<void>;

  reset: () => void;
}

export const usePasswordResetStore = create<PasswordResetStore>((set) => ({
  isLoading: false,
  error: null,
  success: false,
  validationErrors: [],

  requestReset: async (email: string) => {
    try {
      set({
        isLoading: true,
        error: null,
        success: false,
        validationErrors: [],
      });

      const response = await fetch(
        `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.FORGOT_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-App-Id": API_CONSTANTS.APP_ID,
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        if (response.status === 400 && result.data?.errors) {
          set({ validationErrors: result.data.errors });
          return;
        }
        throw new Error(result.message || STRINGS.PASSWORD_RESET_ERROR_GENERIC);
      }

      set({ success: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : STRINGS.ERROR_GENERIC,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (data) => {
    try {
      set({
        isLoading: true,
        error: null,
        success: false,
        validationErrors: [],
      });

      const response = await fetch(
        `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.RESET_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-App-Id": data.appId,
          },
          body: JSON.stringify({
            token: data.token,
            password: data.password,
            confirmPassword: data.confirmPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.data?.errors) {
          set({ validationErrors: result.data.errors });
          return;
        }
        if (response.status === 401) {
          throw new Error(STRINGS.PASSWORD_RESET_ERROR_INVALID_TOKEN);
        }
        throw new Error(result.message || STRINGS.PASSWORD_RESET_ERROR_GENERIC);
      }

      set({ success: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : STRINGS.ERROR_GENERIC,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () =>
    set({
      isLoading: false,
      error: null,
      success: false,
      validationErrors: [],
    }),
}));
