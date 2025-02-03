"use client";

import { useForm } from "react-hook-form";
import { STRINGS } from "@/constants/strings";
import { useLoginStore } from "@/stores/loginStore";
import { useRouter } from "next/navigation";
import { Input, PasswordInput } from "@/components/ui/input";
import { clsx } from "clsx";

type LoginFormData = {
  email: string;
  password: string;
};

export function Login() {
  const { isLoading, error, submitLogin } = useLoginStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    await submitLogin(data, router);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {STRINGS.LOGIN_TITLE}
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
                {STRINGS.LOGIN_EMAIL_LABEL}
              </label>
              <div className="mt-2">
                <Input
                  {...register("email", {
                    required: STRINGS.LOGIN_ERROR_EMAIL_REQUIRED,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: STRINGS.LOGIN_ERROR_EMAIL_INVALID,
                    },
                  })}
                  id="email"
                  type="email"
                  autoComplete="email"
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

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {STRINGS.LOGIN_PASSWORD_LABEL}
                </label>
                <div className="text-sm">
                  <a
                    href={STRINGS.LOGIN_FORGOT_PASSWORD_URL}
                    className="font-semibold text-blue-600 hover:text-blue-700 
                    dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {STRINGS.LOGIN_FORGOT_PASSWORD}
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <PasswordInput
                  {...register("password", {
                    required: STRINGS.LOGIN_ERROR_PASSWORD_REQUIRED,
                  })}
                  id="password"
                  autoComplete="current-password"
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
                {isLoading ? STRINGS.LOGIN_LOADING : STRINGS.LOGIN_SUBMIT}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
            {STRINGS.LOGIN_NOT_MEMBER}{" "}
            <a
              href={STRINGS.LOGIN_SIGN_IN_URL}
              className="font-semibold text-blue-600 hover:text-blue-700 
              dark:text-blue-400 dark:hover:text-blue-300"
            >
              {STRINGS.LOGIN_FREE_TRIAL}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
