import { create } from "zustand";
import { API_CONSTANTS } from "@/constants/api";
import { STRINGS } from "@/constants/strings";

type ValidationError = {
  message: string;
  path: string[];
  code: string;
  validation?: string;
  type?: string;
  exact?: boolean;
  inclusive?: boolean;
  minimum?: number;
};

interface RegisterStore {
  isLoading: boolean;
  error: string | null;
  validationErrors: ValidationError[];
  isEmailSent: boolean;
  userEmail: string;
  verificationToken?: string;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setIsEmailSent: (sent: boolean) => void;
  setUserEmail: (email: string) => void;
  setVerificationToken: (token: string) => void;
  reset: () => void;
  submitRegistration: (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
}

export const useRegisterStore = create<RegisterStore>((set, get) => ({
  isLoading: false,
  error: null,
  validationErrors: [],
  isEmailSent: false,
  userEmail: "",
  verificationToken: undefined,
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, validationErrors: [] }),
  setValidationErrors: (errors) =>
    set({ validationErrors: errors, error: null }),
  setIsEmailSent: (sent) => set({ isEmailSent: sent }),
  setUserEmail: (email) => set({ userEmail: email }),
  setVerificationToken: (token) => set({ verificationToken: token }),
  reset: () =>
    set({
      isLoading: false,
      error: null,
      validationErrors: [],
      isEmailSent: false,
      userEmail: "",
      verificationToken: undefined,
    }),
  submitRegistration: async (data) => {
    const store = get();
    try {
      set({
        isLoading: true,
        error: null,
        validationErrors: [],
        userEmail: data.email,
      });

      const response = await fetch(
        `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.REGISTER}`,
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
        if (response.status === 409) {
          throw new Error(STRINGS.REGISTER_ERROR_EMAIL_EXISTS);
        }

        if (response.status === 400 && result.data?.errors) {
          set({ validationErrors: result.data.errors });
          return;
        }

        throw new Error(result.message || STRINGS.REGISTER_ERROR_GENERIC);
      }

      if (result.data?.verificationToken) {
        set({ verificationToken: result.data.verificationToken });
      }

      set({ isEmailSent: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : STRINGS.ERROR_GENERIC,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
