"use client";

import { useForm } from "react-hook-form";
import { STRINGS } from "@/constants/strings";
import { useRegisterStore } from "@/stores/registerStore";
import EmailVerification from "@/components/system/EmailVerification";
import { Input, PasswordInput } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{STRINGS.REGISTER_TITLE}</h1>
                <p className="text-balance text-muted-foreground">
                  Create an account to get started
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
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
                  placeholder="m@example.com"
                  className={cn(
                    errors.email && "border-destructive",
                    validationErrors.some((e) => e.path.includes("email")) &&
                      "border-destructive"
                  )}
                />
                {(errors.email ||
                  validationErrors.some((e) => e.path.includes("email"))) && (
                  <p className="text-sm text-destructive">
                    {errors.email?.message ||
                      validationErrors.find((e) => e.path.includes("email"))
                        ?.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
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
                  className={cn(
                    (errors.password ||
                      validationErrors.some((e) =>
                        e.path.includes("password")
                      )) &&
                      "border-destructive"
                  )}
                />
                {(errors.password ||
                  validationErrors.some((e) =>
                    e.path.includes("password")
                  )) && (
                  <p className="text-sm text-destructive">
                    {errors.password?.message ||
                      validationErrors.find((e) => e.path.includes("password"))
                        ?.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  {...register("confirmPassword", {
                    required: STRINGS.REGISTER_ERROR_CONFIRM_PASSWORD_REQUIRED,
                    validate: (value) =>
                      value === password ||
                      STRINGS.REGISTER_ERROR_PASSWORDS_DONT_MATCH,
                  })}
                  id="confirmPassword"
                  className={cn(errors.confirmPassword && "border-destructive")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? STRINGS.REGISTER_LOADING : STRINGS.REGISTER_SUBMIT}
              </Button>

              <div className="text-center text-sm">
                {STRINGS.REGISTER_ALREADY_MEMBER}{" "}
                <Link
                  href={STRINGS.REGISTER_SIGN_IN_URL}
                  className="underline underline-offset-4"
                >
                  {STRINGS.REGISTER_SIGN_IN}
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/rolling-hills-2.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              width={500}
              height={500}
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <Link href="/legal/terms">Terms of Service</Link> and{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </div>
    </div>
  );
}
