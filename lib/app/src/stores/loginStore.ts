import { create } from "zustand";
import { API_CONSTANTS } from "@/constants/api";
import { STRINGS } from "@/constants/strings";
import { authService } from "@/services/auth";

interface LoginStore {
  isLoading: boolean;
  error: string | null;
  lockedUntil: string | null;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLockedUntil: (time: string | null) => void;
  reset: () => void;
  submitLogin: (
    data: { email: string; password: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router: any
  ) => Promise<void>;
}

export const useLoginStore = create<LoginStore>((set) => ({
  isLoading: false,
  error: null,
  lockedUntil: null,
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setLockedUntil: (time) => set({ lockedUntil: time }),
  reset: () =>
    set({
      isLoading: false,
      error: null,
      lockedUntil: null,
    }),
  submitLogin: async (data, router) => {
    try {
      set({
        isLoading: true,
        error: null,
        lockedUntil: null,
      });

      const response = await fetch(
        `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-App-Id": API_CONSTANTS.APP_ID,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(STRINGS.LOGIN_ERROR_INVALID_CREDENTIALS);
        }
        if (response.status === 403) {
          throw new Error(STRINGS.LOGIN_ERROR_ACCOUNT_SUSPENDED);
        }
        if (response.status === 404) {
          throw new Error(STRINGS.LOGIN_ERROR_ACCOUNT_NOT_FOUND);
        }
        if (result.data?.lockedUntil) {
          set({ lockedUntil: result.data.lockedUntil });
          throw new Error(STRINGS.LOGIN_ERROR_ACCOUNT_LOCKED);
        }
        throw new Error(result.message || STRINGS.LOGIN_ERROR_GENERIC);
      }

      authService.setTokens(result.data.access_token, result.data.expires_in);
      router.push("/dashboard");
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : STRINGS.ERROR_GENERIC,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
