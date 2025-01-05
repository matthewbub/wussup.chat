export const STRINGS = {
  // Login screen strings
  LOGIN_TITLE: "Sign in to your account",
  LOGIN_EMAIL_LABEL: "Email address",
  LOGIN_PASSWORD_LABEL: "Password",
  LOGIN_FORGOT_PASSWORD: "Forgot password?",
  LOGIN_SUBMIT: "Sign in",
  LOGIN_NOT_MEMBER: "Not a member?",
  LOGIN_FREE_TRIAL: "Start a 14 day free trial",
  LOGIN_ERROR_EMAIL_REQUIRED: "Email is required",
  LOGIN_ERROR_EMAIL_INVALID: "Invalid email address",
  LOGIN_ERROR_PASSWORD_REQUIRED: "Password is required",
  LOGIN_ERROR_INVALID_CREDENTIALS: "Invalid email or password",
  LOGIN_ERROR_ACCOUNT_LOCKED:
    "Account is temporarily locked. Please try again later.",
  LOGIN_ERROR_ACCOUNT_SUSPENDED: "This account has been suspended",
  LOGIN_ERROR_ACCOUNT_NOT_FOUND: "Account not found",
  LOGIN_ERROR_GENERIC: "An error occurred during login",
  LOGIN_LOADING: "Signing in...",

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
    "You will be redirected to login in 10 seconds. Or click here to go now:",
  VERIFY_GO_TO_LOGIN: "Go to Login",

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

  // Logout related strings
  LOGOUT_BUTTON: "Sign out",
  LOGOUT_LOADING: "Signing out...",
  LOGOUT_ERROR_GENERIC: "Failed to sign out",
  LOGOUT_ERROR_NO_TOKEN: "No access token found",
  LOGOUT_SUCCESS: "Successfully signed out",

  // Password Reset
  PASSWORD_RESET_TITLE: "Reset Your Password",
  PASSWORD_RESET_DESCRIPTION:
    "Enter your email address and we'll send you instructions to reset your password.",
  PASSWORD_RESET_EMAIL_LABEL: "Email Address",
  PASSWORD_RESET_SUBMIT: "Send Reset Link",
  PASSWORD_RESET_LOADING: "Sending...",
  PASSWORD_RESET_CHECK_EMAIL: "Check Your Email",
  PASSWORD_RESET_EMAIL_SENT:
    "If an account exists with this email, we've sent password reset instructions.",
  PASSWORD_RESET_ERROR_EMAIL_REQUIRED: "Email is required",
  PASSWORD_RESET_ERROR_EMAIL_INVALID: "Please enter a valid email address",
  PASSWORD_RESET_ERROR_GENERIC:
    "Unable to process your request. Please try again.",

  PASSWORD_RESET_NEW_PASSWORD_TITLE: "Create New Password",
  PASSWORD_RESET_NEW_PASSWORD_LABEL: "New Password",
  PASSWORD_RESET_CONFIRM_PASSWORD_LABEL: "Confirm New Password",
  PASSWORD_RESET_ERROR_PASSWORD_REQUIRED: "Password is required",
  PASSWORD_RESET_ERROR_PASSWORD_LENGTH:
    "Password must be at least 8 characters",
  PASSWORD_RESET_ERROR_PASSWORD_TOO_LONG:
    "Password must not exceed 20 characters",
  PASSWORD_RESET_ERROR_CONFIRM_PASSWORD_REQUIRED:
    "Please confirm your password",
  PASSWORD_RESET_ERROR_PASSWORDS_DONT_MATCH: "Passwords do not match",
  PASSWORD_RESET_ERROR_INVALID_TOKEN: "Invalid or expired reset token",
  PASSWORD_RESET_SUCCESS_TITLE: "Password Reset Complete",
  PASSWORD_RESET_SUCCESS_DESCRIPTION:
    "Your password has been reset successfully. Redirecting to login...",
} as const;
