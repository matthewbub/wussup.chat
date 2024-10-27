import { useAuthStore } from "../stores/auth";
import * as React from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(username, password); // Call login from Zustand
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
