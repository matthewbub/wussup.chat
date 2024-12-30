import constants from "./constants";
import { createFakeUser } from "./helpers";
import initApp from "./initApp";

const API_URL = constants.API_URL;

// helper function to sign up, verify, and log in a user, returning the refresh token
export const getRegularUser = async () => {
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

  return {
    userData: userData.data,
    accessToken: loginData.data.access_token,
  };
};

export const getRegularUserWithAppId = async (overrideId?: string) => {
  const { appId } = await initApp();
  const fakeUser = createFakeUser();
  const password = "TestPassword123!";

  const signUpResponse = await fetch(`${API_URL}/v3/public/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app-id": overrideId || appId,
    },
    body: JSON.stringify({
      email: fakeUser.email,
      password: password,
      confirmPassword: password,
    }),
  });

  const signUpData = await signUpResponse.json();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!signUpData.success) {
    return {
      userData: null,
      appId,
      loginData: null,
      error: signUpData.message,
      code: signUpData.code,
    };
  }

  const verifyEmailResponse = await fetch(`${API_URL}/v3/public/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: signUpData.data.verificationToken,
    }),
  });

  const verifyEmailData = await verifyEmailResponse.json();
  if (!verifyEmailData.success) {
    return {
      userData: null,
      appId,
      loginData: null,
      error: verifyEmailData.message,
      code: verifyEmailData.code,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const loginResponse = await fetch(`${API_URL}/v3/public/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-app-id": appId },
    body: JSON.stringify({
      email: fakeUser.email,
      password: password,
    }),
  });

  const loginData = await loginResponse.json();

  return {
    userData: fakeUser,
    appId,
    loginData,
    error: null,
    code: null,
  };
};
