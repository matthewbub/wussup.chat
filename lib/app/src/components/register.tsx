"use client";

import { useForm } from "react-hook-form";
import { STRINGS } from "@/constants/strings";
import { API_CONSTANTS } from "@/constants/api";
import { useRegisterStore } from "@/stores/registerStore";
import EmailVerification from "@/components/EmailVerification";

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
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
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
            {STRINGS.REGISTER_TITLE}
          </h2>
        </div>

        <div className="ch-card mt-10 sm:mx-auto sm:w-full sm:max-w-sm ">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-white"
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
                  className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 ${
                    errors.email ? "outline-red-500" : ""
                  }`}
                />
                {validationErrors.some((e) => e.path.includes("email")) && (
                  <p className="mt-1 text-sm text-red-500">
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
                className="block text-sm/6 font-medium text-white"
              >
                {STRINGS.REGISTER_PASSWORD_LABEL}
              </label>
              <div className="mt-2">
                <input
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
                  className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-white ${
                    errors.password ||
                    validationErrors.some((e) => e.path.includes("password"))
                      ? "outline-red-500"
                      : "outline-white/10"
                  }`}
                />
                {(errors.password ||
                  validationErrors.some((e) =>
                    e.path.includes("password")
                  )) && (
                  <p className="mt-1 text-sm text-red-500">
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
                className="block text-sm/6 font-medium text-white"
              >
                {STRINGS.REGISTER_CONFIRM_PASSWORD_LABEL}
              </label>
              <div className="mt-2">
                <input
                  {...register("confirmPassword", {
                    required: STRINGS.REGISTER_ERROR_CONFIRM_PASSWORD_REQUIRED,
                    validate: (value) =>
                      value === password ||
                      STRINGS.REGISTER_ERROR_PASSWORDS_DONT_MATCH,
                  })}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-white ${
                    errors.confirmPassword
                      ? "outline-red-500"
                      : "outline-white/10"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword.message}
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
                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? STRINGS.REGISTER_LOADING : STRINGS.REGISTER_SUBMIT}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-400">
            {STRINGS.REGISTER_ALREADY_MEMBER}{" "}
            <a
              href="#"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {STRINGS.REGISTER_SIGN_IN}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
