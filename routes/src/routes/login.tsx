import { useAuthStore } from "@/stores/auth";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { LoginFormComponent } from "@/components/Login";

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
