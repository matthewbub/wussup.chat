"use client";
import { useForm } from "react-hook-form";
import { STRINGS } from "@/constants/strings";
import { usePasswordResetStore } from "@/stores/passwordResetStore";
import { Card } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export function ResetPassword({
  token,
  appId,
}: {
  token: string;
  appId: string;
}) {
  const router = useRouter();
  const { isLoading, error, success, resetPassword } = usePasswordResetStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    await resetPassword({ ...data, token, appId });
  };

  if (success) {
    setTimeout(() => router.push("/login"), 3000);
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-stone-200 mb-4">
          {STRINGS.PASSWORD_RESET_SUCCESS_TITLE}
        </h2>
        <p className="text-stone-400">
          {STRINGS.PASSWORD_RESET_SUCCESS_DESCRIPTION}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-stone-200 mb-4">
        {STRINGS.PASSWORD_RESET_NEW_PASSWORD_TITLE}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-stone-200"
          >
            {STRINGS.PASSWORD_RESET_NEW_PASSWORD_LABEL}
          </label>
          <PasswordInput
            {...register("password", {
              required: STRINGS.PASSWORD_RESET_ERROR_PASSWORD_REQUIRED,
              minLength: {
                value: 8,
                message: STRINGS.PASSWORD_RESET_ERROR_PASSWORD_LENGTH,
              },
              maxLength: {
                value: 20,
                message: STRINGS.PASSWORD_RESET_ERROR_PASSWORD_TOO_LONG,
              },
            })}
            id="password"
            className={errors.password ? "outline-red-500" : ""}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-stone-200"
          >
            {STRINGS.PASSWORD_RESET_CONFIRM_PASSWORD_LABEL}
          </label>
          <PasswordInput
            {...register("confirmPassword", {
              required: STRINGS.PASSWORD_RESET_ERROR_CONFIRM_PASSWORD_REQUIRED,
              validate: (value) =>
                value === password ||
                STRINGS.PASSWORD_RESET_ERROR_PASSWORDS_DONT_MATCH,
            })}
            id="confirmPassword"
            className={errors.confirmPassword ? "outline-red-500" : ""}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
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
