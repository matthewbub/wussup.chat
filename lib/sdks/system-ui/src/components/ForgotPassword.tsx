import React from "react";
import { useForm } from "react-hook-form";
import { STRINGS } from "../constants/strings";
import { usePasswordResetStore } from "../stores/passwordResetStore";
import { Card } from "./ui/Card";

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
      <Card className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-base-content mb-4">
          {STRINGS.PASSWORD_RESET_CHECK_EMAIL}
        </h2>
        <p className="text-base-content/60">
          {STRINGS.PASSWORD_RESET_EMAIL_SENT}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-base-content mb-4">
        {STRINGS.PASSWORD_RESET_TITLE}
      </h2>
      <p className="text-base-content/60 mb-6">
        {STRINGS.PASSWORD_RESET_DESCRIPTION}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-base-content"
          >
            {STRINGS.PASSWORD_RESET_EMAIL_LABEL}
          </label>
          <input
            {...register("email", {
              required: STRINGS.PASSWORD_RESET_ERROR_EMAIL_REQUIRED,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: STRINGS.PASSWORD_RESET_ERROR_EMAIL_INVALID,
              },
            })}
            type="email"
            id="email"
            className={
              "input input-bordered w-full" +
              (errors.email ? "input-error" : "")
            }
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-error text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading
            ? STRINGS.PASSWORD_RESET_LOADING
            : STRINGS.PASSWORD_RESET_SUBMIT}
        </button>
      </form>
    </Card>
  );
}
