import { useAuthStore } from "@/stores/auth";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Button } from "@/components/catalyst/button";
import { Input } from "@/components/catalyst/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { config } from "@/app_config";
import { PublicLayout } from "@/components/PublicLayout";

type LoginFormInputs = {
  username: string;
  password: string;
};

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <PublicLayout noRegister>
      <div className="flex justify-center items-center h-100">
        <LoginFormComponent />
      </div>
    </PublicLayout>
  );
}

function LoginFormComponent() {
  const useLogin = useAuthStore((state) => state.useLogin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    await useLogin(data.username, data.password);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              {...register("username", {
                required: "Please enter your username",
                maxLength: {
                  value: config.__PRIVATE__.MAX_USERNAME_LENGTH,
                  message: `Username must be less than ${config.__PRIVATE__.MAX_USERNAME_LENGTH} characters`,
                },
              })}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: "Please enter your password",
                maxLength: {
                  value: config.__PRIVATE__.MAX_PASSWORD_LENGTH,
                  message: `Password must be less than ${config.__PRIVATE__.MAX_PASSWORD_LENGTH} characters`,
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            color="teal"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot password?
        </Link>
        <Link href="/sign-up" className="text-sm text-blue-600 hover:underline">
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}
