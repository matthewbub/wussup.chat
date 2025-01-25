"use client";

import { useForm } from "react-hook-form";
import { STRINGS } from "@/constants/strings";
import { useRegisterStore } from "@/stores/registerStore";
import EmailVerification from "@/components/system/EmailVerification";
import { Input, PasswordInput } from "@/components/ui/input";
import { clsx } from "clsx";

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function Registration() {
  const {
    isLoading,
    error,
    validationErrors,
    isEmailSent,
    userEmail,
    submitRegistration,
  } = useRegisterStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    await submitRegistration(data);
  };

  if (isEmailSent) {
    return <EmailVerification userEmail={userEmail} />;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {STRINGS.REGISTER_TITLE}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {STRINGS.REGISTER_EMAIL_LABEL}
              </label>
              <div className="mt-2">
                <Input
                  {...register("email", {
                    required: STRINGS.REGISTER_ERROR_EMAIL_REQUIRED,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: STRINGS.REGISTER_ERROR_EMAIL_INVALID,
                    },
                  })}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={clsx(
                    errors.email && "border-red-500 dark:border-red-500"
                  )}
                />
                {validationErrors.some((e) => e.path.includes("email")) && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {
                      validationErrors.find((e) => e.path.includes("email"))
                        ?.message
                    }
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {STRINGS.REGISTER_PASSWORD_LABEL}
              </label>
              <div className="mt-2">
                <PasswordInput
                  {...register("password", {
                    required: STRINGS.REGISTER_ERROR_PASSWORD_REQUIRED,
                    minLength: {
                      value: 8,
                      message: STRINGS.REGISTER_ERROR_PASSWORD_LENGTH,
                    },
                    maxLength: {
                      value: 20,
                      message: STRINGS.REGISTER_ERROR_PASSWORD_TOO_LONG,
                    },
                  })}
                  id="password"
                  autoComplete="new-password"
                  className={clsx(
                    (errors.password ||
                      validationErrors.some((e) =>
                        e.path.includes("password")
                      )) &&
                      "border-red-500 dark:border-red-500"
                  )}
                />
                {(errors.password ||
                  validationErrors.some((e) =>
                    e.path.includes("password")
                  )) && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password?.message ||
                      validationErrors.find((e) => e.path.includes("password"))
                        ?.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {STRINGS.REGISTER_CONFIRM_PASSWORD_LABEL}
              </label>
              <div className="mt-2">
                <PasswordInput
                  {...register("confirmPassword", {
                    required: STRINGS.REGISTER_ERROR_CONFIRM_PASSWORD_REQUIRED,
                    validate: (value) =>
                      value === password ||
                      STRINGS.REGISTER_ERROR_PASSWORDS_DONT_MATCH,
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

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md 
                hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200"
              >
                {isLoading ? STRINGS.REGISTER_LOADING : STRINGS.REGISTER_SUBMIT}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
            {STRINGS.REGISTER_ALREADY_MEMBER}{" "}
            <a
              href={STRINGS.REGISTER_SIGN_IN_URL}
              className="font-semibold text-blue-600 hover:text-blue-700 
              dark:text-blue-400 dark:hover:text-blue-300"
            >
              {STRINGS.REGISTER_SIGN_IN}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
