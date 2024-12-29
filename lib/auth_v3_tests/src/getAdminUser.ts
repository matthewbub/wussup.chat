import { createFakeUser } from "./helpers.js";
import constants from "./constants.js";

const API_URL = constants.API_URL;

/**
 * creates a new user and promotes them to admin, returns the user data and access token
 * @returns {Promise<{userData: any, accessToken: string}>}
 */
export async function createAdminUser() {
  const fakeUser = createFakeUser();
  const password = "TestPassword123!";

  // Sign up the user
  const signUpResponse = await fetch(`${API_URL}/v3/public/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: fakeUser.email,
      password,
      confirmPassword: password,
    }),
  });

  const signUpData = await signUpResponse.json();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Verify email
  await fetch(`${API_URL}/v3/public/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: signUpData.data.verificationToken,
    }),
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Login
  const loginResponse = await fetch(`${API_URL}/v3/public/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: fakeUser.email, password }),
  });
  const loginData = await loginResponse.json();

  // Get user data
  const meResponse = await fetch(`${API_URL}/v3/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginData.data.access_token}`,
    },
  });
  const userData = await meResponse.json();

  // Promote to admin
  await fetch(`${API_URL}/v3/auth/promote-test-user/${userData.data.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginData.data.access_token}`,
    },
  });

  return {
    userData: userData.data,
    accessToken: loginData.data.access_token,
  };
}
