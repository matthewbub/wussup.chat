import { useAuthStore } from "../stores/auth";

export async function fetchWithAuth(
  url: string | URL | globalThis.Request,
  options: Omit<RequestInit, "credentials"> = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Ensure cookies are included
  });

  if (response.status === 401) {
    // Handle 401 Unauthorized by calling the logout function
    console.log("Unauthorized, logging out");
    useAuthStore.getState().logout();
  }

  return response;
}

export async function fetchSecureTest() {
  const response = await fetchWithAuth("/api/v1/example/jwt");
  if (response.ok) {
    const data = await response.json();
    console.log("User data:", data);
  }
}
