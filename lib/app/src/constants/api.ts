export const API_CONSTANTS = {
  BASE_URL: "https://auth.6matbub.workers.dev",
  ENDPOINTS: {
    REGISTER: "/v3/public/sign-up",
    LOGIN: "/v3/public/login",
    VERIFY_EMAIL: "/v3/public/verify-email",
    RESEND_VERIFICATION_EMAIL: "/v3/public/resend-verification-email",
    AUTH_ME: "/v3/auth/me",
    LOGOUT: "/v3/auth/logout",
    FORGOT_PASSWORD: "/v3/public/forgot-password",
    RESET_PASSWORD: "/v3/public/reset-password",
  },
  APP_ID: "0000001",
} as const;
