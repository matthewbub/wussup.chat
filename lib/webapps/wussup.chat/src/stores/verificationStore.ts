import { create } from "zustand";
import { API_CONSTANTS } from "../constants/api";
import { STRINGS } from "../constants/strings";

interface ApiResponse {
  success: boolean;
  message: string;
  code: string;
  data: null;
}

interface VerificationStore {
  status: "idle" | "loading" | "success" | "error";
  errorMessage: string;
  verifyEmail: (token: string, appId: string) => Promise<void>;
  resendVerification: (email: string) => Promise<boolean>;
  reset: () => void;
  setError: (message: string) => void;
}

export const useVerificationStore = create<VerificationStore>((set) => ({
  status: "idle",
  errorMessage: "",

  verifyEmail: async (token: string, appId: string) => {
    set({ status: "loading" });
    try {
      const response = await fetch(
        `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.VERIFY_EMAIL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, appId }),
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || STRINGS.ERROR_GENERIC);
      }

      if (data.success) {
        set({ status: "success", errorMessage: "" });
      } else {
        throw new Error(data.message || STRINGS.ERROR_GENERIC);
      }
    } catch (error) {
      set({
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : STRINGS.ERROR_GENERIC,
      });
    }
  },

  resendVerification: async (email: string) => {
    set({ status: "loading" });
    try {
      const response = await fetch(
        `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.RESEND_VERIFICATION_EMAIL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-App-Id": API_CONSTANTS.APP_ID,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        // Handle specific error cases based on status code
        if (response.status === 401) {
          throw new Error(STRINGS.VERIFY_ERROR_RATE_LIMIT);
        } else if (response.status === 400) {
          throw new Error(data.message || STRINGS.VERIFY_ERROR_VALIDATION);
        }
        throw new Error(data.message || STRINGS.VERIFY_ERROR_GENERIC);
      }

      if (!data.success) {
        throw new Error(data.message || STRINGS.VERIFY_ERROR_GENERIC);
      }

      set({ status: "idle", errorMessage: "" });
      return true;
    } catch (error) {
      set({
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : STRINGS.VERIFY_ERROR_GENERIC,
      });
      return false;
    }
  },

  setError: (message: string) => {
    set({ status: "error", errorMessage: message });
  },

  reset: () => {
    set({ status: "idle", errorMessage: "" });
  },
}));
