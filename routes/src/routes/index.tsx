import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [token, setToken] = React.useState("");
  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>

      <button
        onClick={() => {
          fetch("/api/v1/login/jwt", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
              username: "",
              password: "",
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.ok) {
                setToken(data.token);
              }
            });
        }}
      >
        Test JWT
      </button>

      {token && (
        <div>
          <code className="text-xs text-gray-500">{token}</code>
          <button
            onClick={() => {
              setToken("");
            }}
          >
            Clear Token
          </button>
          <button
            onClick={() => {
              fetch("/api/v1/example", {
                credentials: "include",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            }}
          >
            Test Example
          </button>
        </div>
      )}
    </div>
  );
}
