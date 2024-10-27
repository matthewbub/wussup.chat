import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { fetchSecureTest } from "@/utils/auth-helpers";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [token, setToken] = React.useState("");
  const login = useAuthStore((state) => state.login);
  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>

      <button
        onClick={async () => {
          await login("admin", "P@ss12345");
          // fetch("/api/v1/login/jwt", {
          //   method: "POST",
          //   credentials: "include",
          //   body: JSON.stringify({
          //     username: "admin",
          //     password: "P@ss12345",
          //   }),
          // })
          //   .then((res) => res.json())
          //   .then((data) => {
          //     if (data.ok) {
          //       setToken(data.token);
          //     }
          //   });
        }}
      >
        Test Login
      </button>

      {/* {token && ( */}
      <>
        <div>
          <button onClick={fetchSecureTest}>Test Example</button>
        </div>
        <button
          onClick={() => {
            fetch("/api/v1/logout/jwt", {
              method: "POST",
              credentials: "include",
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.ok) {
                  setToken("");
                }
              });
          }}
        >
          Logout
        </button>
      </>
      {/* )} */}
    </div>
  );
}
