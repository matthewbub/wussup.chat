"use client";

import { useForm } from "react-hook-form";
import { STRINGS } from "@/constants/strings";
import { useLoginStore } from "@/stores/loginStore";
import { useRouter } from "next/navigation";
import { Input, PasswordInput } from "@/components/ui/input";
import { ErrorText, Label } from "./ui/prose";

type LoginFormData = {
  email: string;
  password: string;
};

export default function Login() {
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
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
            {STRINGS.LOGIN_TITLE}
          </h2>
        </div>

        <div className="ch-card p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-white"
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
                  className={`ch-input ${
                    errors.email ? "outline-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-white"
                >
                  {STRINGS.LOGIN_PASSWORD_LABEL}
                </label>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-indigo-400 hover:text-indigo-300"
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
                  type="password"
                  autoComplete="current-password"
                  className={`ch-input ${
                    errors.password ? "outline-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="ch-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? STRINGS.LOGIN_LOADING : STRINGS.LOGIN_SUBMIT}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-400">
            {STRINGS.LOGIN_NOT_MEMBER}{" "}
            <a
              href="#"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {STRINGS.LOGIN_FREE_TRIAL}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
