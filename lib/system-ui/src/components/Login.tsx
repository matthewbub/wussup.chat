import React from "react";
import { useForm } from "react-hook-form";
import { STRINGS } from "../constants/strings";
import { useLoginStore } from "../stores/loginStore";
import { PasswordInput } from "../components/ui/input";

type LoginFormData = {
  email: string;
  password: string;
};

export default function Login({ history }: { history: any }) {
  const { isLoading, error, submitLogin } = useLoginStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    await submitLogin(data, history);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold text-base-content">
          {STRINGS.LOGIN_TITLE}
        </h2>
      </div>

      <div className="card bg-base-200 mt-10 sm:mx-auto sm:w-full sm:max-w-sm p-6">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-base-content"
            >
              {STRINGS.LOGIN_EMAIL_LABEL}
            </label>
            <div className="mt-2">
              <input
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
                className={`input input-bordered w-full ${
                  errors.email ? "input-error" : ""
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-base-content"
              >
                {STRINGS.LOGIN_PASSWORD_LABEL}
              </label>
              <div className="text-sm">
                <a
                  href={STRINGS.LOGIN_FORGOT_PASSWORD_URL}
                  className="font-semibold text-primary hover:text-primary-focus"
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
                className={`w-full ${errors.password ? "input-error" : ""}`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-error text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? STRINGS.LOGIN_LOADING : STRINGS.LOGIN_SUBMIT}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-base-content/60">
          {STRINGS.LOGIN_NOT_MEMBER}{" "}
          <a
            href={STRINGS.LOGIN_SIGN_IN_URL}
            className="font-semibold text-primary hover:text-primary-focus"
          >
            {STRINGS.LOGIN_FREE_TRIAL}
          </a>
        </p>
      </div>
    </div>
  );
}
