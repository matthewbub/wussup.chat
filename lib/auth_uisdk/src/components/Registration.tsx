import React from "react";
import { useForm } from "react-hook-form";
import { STRINGS } from "../constants/strings";
import { useRegisterStore } from "../stores/registerStore";
import EmailVerification from "./EmailVerification";
import { PasswordInput } from "./ui/input";

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Registration({ history }: { history: any }) {
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
    return <EmailVerification userEmail={userEmail} history={history} />;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold text-base-content">
          {STRINGS.REGISTER_TITLE}
        </h2>
      </div>

      <div className="card bg-base-200 mt-10 sm:mx-auto sm:w-full sm:max-w-sm p-6">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-base-content"
            >
              {STRINGS.REGISTER_EMAIL_LABEL}
            </label>
            <div className="mt-2">
              <input
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
                className={`input input-bordered w-full ${
                  errors.email ? "input-error" : ""
                }`}
              />
              {validationErrors.some((e) => e.path.includes("email")) && (
                <p className="mt-1 text-sm text-error">
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
              className="block text-sm font-medium text-base-content"
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
                type="password"
                autoComplete="new-password"
                className={`w-full ${
                  errors.password ||
                  validationErrors.some((e) => e.path.includes("password"))
                    ? "input-error"
                    : ""
                }`}
              />
              {(errors.password ||
                validationErrors.some((e) => e.path.includes("password"))) && (
                <p className="mt-1 text-sm text-error">
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
              className="block text-sm font-medium text-base-content"
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
                type="password"
                autoComplete="new-password"
                className={`w-full ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-error text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? STRINGS.REGISTER_LOADING : STRINGS.REGISTER_SUBMIT}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-base-content/60">
          {STRINGS.REGISTER_ALREADY_MEMBER}{" "}
          <a
            href={STRINGS.REGISTER_SIGN_IN_URL}
            className="font-semibold text-primary hover:text-primary-focus"
          >
            {STRINGS.REGISTER_SIGN_IN}
          </a>
        </p>
      </div>
    </div>
  );
}
