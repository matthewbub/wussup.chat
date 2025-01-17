"use client";
import { useForm } from "react-hook-form";
import { STRINGS } from "@/constants/strings";
import { usePasswordResetStore } from "@/stores/passwordResetStore";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";

type ForgotPasswordFormData = {
  email: string;
};

export function ForgotPassword() {
  const { isLoading, error, success, requestReset } = usePasswordResetStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await requestReset(data.email);
  };

  if (success) {
    return (
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {STRINGS.PASSWORD_RESET_CHECK_EMAIL}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {STRINGS.PASSWORD_RESET_EMAIL_SENT}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {STRINGS.PASSWORD_RESET_TITLE}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {STRINGS.PASSWORD_RESET_DESCRIPTION}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {STRINGS.PASSWORD_RESET_EMAIL_LABEL}
              </label>
              <div className="mt-2">
                <Input
                  {...register("email", {
                    required: STRINGS.PASSWORD_RESET_ERROR_EMAIL_REQUIRED,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: STRINGS.PASSWORD_RESET_ERROR_EMAIL_INVALID,
                    },
                  })}
                  type="email"
                  id="email"
                  className={clsx(
                    errors.email && "border-red-500 dark:border-red-500"
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
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
