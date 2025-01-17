"use client";

import { useForm } from "react-hook-form";
import { STRINGS } from "@/constants/strings";
import { usePasswordResetStore } from "@/stores/passwordResetStore";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PasswordInput } from "@/components/ui/input";
import { clsx } from "clsx";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { isLoading, error, success, resetPassword } = usePasswordResetStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    await resetPassword(token, data.password);
  };

  if (success) {
    return (
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {STRINGS.PASSWORD_RESET_SUCCESS_TITLE}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {STRINGS.PASSWORD_RESET_SUCCESS_DESCRIPTION}
          </p>
          <a
            href="/login"
            className="inline-block w-full text-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md 
            hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors duration-200"
          >
            {STRINGS.PASSWORD_RESET_RETURN_TO_LOGIN}
          </a>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {STRINGS.PASSWORD_RESET_NEW_PASSWORD_TITLE}
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {STRINGS.PASSWORD_RESET_NEW_PASSWORD_LABEL}
              </label>
              <div className="mt-2">
                <PasswordInput
                  {...register("password", {
                    required: STRINGS.PASSWORD_RESET_ERROR_PASSWORD_REQUIRED,
                    minLength: {
                      value: 8,
                      message: STRINGS.PASSWORD_RESET_ERROR_PASSWORD_LENGTH,
                    },
                  })}
                  id="password"
                  autoComplete="new-password"
                  className={clsx(
                    errors.password && "border-red-500 dark:border-red-500"
                  )}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {STRINGS.PASSWORD_RESET_CONFIRM_PASSWORD_LABEL}
              </label>
              <div className="mt-2">
                <PasswordInput
                  {...register("confirmPassword", {
                    required:
                      STRINGS.PASSWORD_RESET_ERROR_CONFIRM_PASSWORD_REQUIRED,
                    validate: (value) =>
                      value === password ||
                      STRINGS.PASSWORD_RESET_ERROR_PASSWORDS_DONT_MATCH,
                  })}
                  id="confirmPassword"
                  autoComplete="new-password"
                  className={clsx(
                    errors.confirmPassword &&
                      "border-red-500 dark:border-red-500"
                  )}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md 
              hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200"
            >
              {isLoading
                ? STRINGS.PASSWORD_RESET_LOADING
                : STRINGS.PASSWORD_RESET_SUBMIT}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
