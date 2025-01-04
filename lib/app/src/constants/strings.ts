export const STRINGS = {
  // Login screen strings
  LOGIN_TITLE: "Sign in to your account",
  LOGIN_EMAIL_LABEL: "Email address",
  LOGIN_PASSWORD_LABEL: "Password",
  LOGIN_FORGOT_PASSWORD: "Forgot password?",
  LOGIN_SUBMIT: "Sign in",
  LOGIN_NOT_MEMBER: "Not a member?",
  LOGIN_FREE_TRIAL: "Start a 14 day free trial",

  // Register screen strings
  REGISTER_TITLE: "Create your account",
  REGISTER_EMAIL_LABEL: "Email address",
  REGISTER_PASSWORD_LABEL: "Password",
  REGISTER_SUBMIT: "Create account",
  REGISTER_ALREADY_MEMBER: "Already have an account?",
  REGISTER_SIGN_IN: "Sign in to your account",
  REGISTER_ERROR_EMAIL_REQUIRED: "Email is required",
  REGISTER_ERROR_EMAIL_INVALID: "Invalid email address",
  REGISTER_ERROR_PASSWORD_REQUIRED: "Password is required",
  REGISTER_ERROR_PASSWORD_LENGTH: "Password must be at least 8 characters",
  REGISTER_LOADING: "Creating account...",
  REGISTER_ERROR_GENERIC: "An error occurred during registration",
  REGISTER_ERROR_EMAIL_EXISTS: "This email is already registered",
  REGISTER_ERROR_PASSWORD_TOO_LONG: "Password must be less than 20 characters",
  REGISTER_ERROR_CONFIRM_PASSWORD_REQUIRED: "Please confirm your password",
  REGISTER_ERROR_PASSWORDS_DONT_MATCH: "Passwords do not match",
  REGISTER_CONFIRM_PASSWORD_LABEL: "Confirm password",

  // Verify account screen strings
  VERIFY_TITLE: "Check your email",
  VERIFY_MESSAGE: "We sent a verification link to",
  VERIFY_INSTRUCTIONS:
    "Click the link in the email to verify your account and continue.",
  VERIFY_RESEND: "Didn't receive the email?",
  VERIFY_RESEND_BUTTON: "Click to resend",
  VERIFY_WRONG_EMAIL: "Wrong email address?",
  VERIFY_SIGN_IN: "Back to sign in",
  VERIFY_LOADING: "Sending verification email...",
  VERIFY_ERROR_GENERIC: "Failed to send verification email",
  VERIFY_ERROR_MISSING_TOKEN:
    "Invalid verification link. Missing verification token.",
  VERIFY_ERROR_MISSING_APP_ID:
    "Invalid verification link. Missing application ID.",
  VERIFY_SUCCESS: "Verification email sent successfully",
  VERIFY_SUCCESS_TITLE: "Email verified successfully",
  VERIFY_SUCCESS_MESSAGE: "Your email has been verified successfully",
  VERIFY_ERROR_RATE_LIMIT: "Too many attempts. Please try again later.",
  VERIFY_ERROR_VALIDATION: "Please provide a valid email address.",
  VERIFY_REDIRECT_MESSAGE:
    "You will be redirected to dashboard in 10 seconds. Or click here to go now:",
  VERIFY_GO_TO_DASHBOARD: "Go to Dashboard",

  // Common error messages
  ERROR_GENERIC: "Something went wrong. Please try again.",
  ERROR_NETWORK: "Network error. Please check your connection.",
  ERROR_UNAUTHORIZED: "Unauthorized access. Please sign in.",
  ERROR_FORBIDDEN: "You don't have permission to perform this action.",
  ERROR_NOT_FOUND: "Resource not found.",
  ERROR_SERVER: "Server error. Please try again later.",

  // Common action buttons
  BUTTON_SUBMIT: "Submit",
  BUTTON_CANCEL: "Cancel",
  BUTTON_SAVE: "Save",
  BUTTON_DELETE: "Delete",
  BUTTON_CONTINUE: "Continue",
  BUTTON_BACK: "Back",
  BUTTON_CLOSE: "Close",
} as const;
