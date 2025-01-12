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

export const CHAT_SERVICE_API_CONSTANTS = {
  BASE_URL: "https://chat-service.6matbub.workers.dev",
  ENDPOINTS: {
    CREATE_USER_V1: "/api/v1/users",
    GET_USER_V1: "/api/v1/users/:userId",
    UPDATE_USER_V1: "/api/v1/users/:userId",
    DELETE_USER_V1: "/api/v1/users/:userId",

    CREATE_THREAD_V1: "/api/v1/threads",
    GET_THREAD_V1: "/api/v1/threads/:threadId",
    UPDATE_THREAD_V1: "/api/v1/threads/:threadId",
    DELETE_THREAD_V1: "/api/v1/threads/:threadId",

    CREATE_MESSAGE_V1: "/api/v1/messages",
    GET_MESSAGE_V1: "/api/v1/messages/:messageId",
    UPDATE_MESSAGE_V1: "/api/v1/messages/:messageId",
    DELETE_MESSAGE_V1: "/api/v1/messages/:messageId",
  },
} as const;
