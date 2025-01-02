export const API_CONSTANTS = {
  BASE_URL: "https://auth.6matbub.workers.dev",
  ENDPOINTS: {
    REGISTER: "/v3/public/sign-up",
    LOGIN: "/v3/public/login",
    VERIFY_EMAIL: "/v3/public/verify-email",
    RESEND_VERIFICATION_EMAIL: "/v3/public/resend-verification-email",
  },
} as const;
