"use client";
import { useForm } from "react-hook-form";
import { STRINGS } from "@/constants/strings";
import { usePasswordResetStore } from "@/stores/passwordResetStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";

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
        <h2 className="text-xl font-semibold text-stone-200 mb-4">
          {STRINGS.PASSWORD_RESET_CHECK_EMAIL}
        </h2>
        <p className="text-stone-400">{STRINGS.PASSWORD_RESET_EMAIL_SENT}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-stone-200 mb-4">
        {STRINGS.PASSWORD_RESET_TITLE}
      </h2>
      <p className="text-stone-400 mb-6">
        {STRINGS.PASSWORD_RESET_DESCRIPTION}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-200"
          >
            {STRINGS.PASSWORD_RESET_EMAIL_LABEL}
          </label>
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
            className={errors.email ? "outline-red-500" : ""}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button type="submit" disabled={isLoading} className="ch-button w-full">
          {isLoading
            ? STRINGS.PASSWORD_RESET_LOADING
            : STRINGS.PASSWORD_RESET_SUBMIT}
        </button>
      </form>
    </Card>
  );
}
