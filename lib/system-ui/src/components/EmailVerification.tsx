import React, { useEffect } from "react";
import { STRINGS } from "../constants/strings";
import { useVerificationStore } from "../stores/verificationStore";

interface EmailVerificationProps {
  userEmail: string | null;
  history: any; // Custom history object
}

export default function EmailVerification({
  userEmail = null,
  history,
}: EmailVerificationProps) {
  const { status, errorMessage, verifyEmail, resendVerification } =
    useVerificationStore();

  useEffect(() => {
    const token = new URLSearchParams(history.location.search).get("token");
    const appId = new URLSearchParams(history.location.search).get("appId");

    if (token && !appId) {
      useVerificationStore
        .getState()
        .setError(STRINGS.VERIFY_ERROR_MISSING_APP_ID);
      return;
    }

    if (!token && appId) {
      useVerificationStore
        .getState()
        .setError(STRINGS.VERIFY_ERROR_MISSING_TOKEN);
      return;
    }

    if (token && appId) {
      verifyEmail(token, appId);
    }

    return () => {
      useVerificationStore.getState().reset();
    };
  }, [history, verifyEmail]);

  useEffect(() => {
    if (status === "success") {
      const redirectTimer = setTimeout(() => {
        history.push("/login");
      }, 10000);

      return () => clearTimeout(redirectTimer);
    }
  }, [status, history]);

  const handleResendVerification = async () => {
    if (!userEmail) {
      return;
    }
    const success = await resendVerification(userEmail);
    if (success) {
      alert(STRINGS.VERIFY_SUCCESS);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold text-base-content">
          {status === "success"
            ? STRINGS.VERIFY_SUCCESS_TITLE
            : STRINGS.VERIFY_TITLE}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-6 text-center">
          {status === "loading" && (
            <p className="text-sm text-base-content/60">
              {STRINGS.VERIFY_LOADING}
            </p>
          )}

          {status === "success" && (
            <div className="mt-4 text-center">
              <p className="text-sm text-success">
                {STRINGS.VERIFY_SUCCESS_MESSAGE}
              </p>
              <p className="text-sm text-base-content/60 mt-2">
                {STRINGS.VERIFY_REDIRECT_MESSAGE}{" "}
                <a
                  href="/login"
                  className="font-semibold text-primary hover:text-primary-focus"
                >
                  {STRINGS.VERIFY_GO_TO_LOGIN}
                </a>
              </p>
            </div>
          )}

          {status === "error" && (
            <p className="text-sm text-error">{errorMessage}</p>
          )}

          {status === "idle" && (
            <>
              <p className="text-sm text-base-content/60">
                {STRINGS.VERIFY_MESSAGE}{" "}
                <span className="font-medium text-base-content">
                  {userEmail}
                </span>
              </p>

              <p className="text-sm text-base-content/60">
                {STRINGS.VERIFY_INSTRUCTIONS}
              </p>
            </>
          )}

          {status !== "success" && (
            <div className="mt-8">
              <p className="text-sm text-base-content/60">
                {STRINGS.VERIFY_RESEND}{" "}
                <button
                  onClick={handleResendVerification}
                  disabled={status === "loading" || !userEmail}
                  className="font-semibold text-primary hover:text-primary-focus disabled:opacity-50"
                >
                  {STRINGS.VERIFY_RESEND_BUTTON}
                </button>
              </p>
            </div>
          )}

          {status !== "success" && (
            <div className="mt-4">
              <p className="text-sm text-base-content/60">
                {STRINGS.VERIFY_WRONG_EMAIL}{" "}
                <a
                  href="/login"
                  className="font-semibold text-primary hover:text-primary-focus"
                >
                  {STRINGS.VERIFY_SIGN_IN}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
