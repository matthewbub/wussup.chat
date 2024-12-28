import constants from "./constants";
import { createFakeUser } from "./helpers";

const API_URL = constants.API_URL;

// helper function to sign up, verify, and log in a user, returning the refresh token
export const getRefreshTokenForTestUser = async () => {
  const fakeUser = createFakeUser();
  const password = "TestPassword123!";

  // sign up the user
  const signUpResponse = await fetch(`${API_URL}/v3/public/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: fakeUser.email,
      password: password,
      confirmPassword: password,
    }),
  });

  const signUpData = await signUpResponse.json();

  // wait for the email verification process to complete
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // verify the email
  if (signUpResponse.ok && signUpData.verificationToken) {
    await fetch(`${API_URL}/v3/public/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: signUpData.verificationToken,
      }),
    });

    // wait for the verification to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // login to get the refresh token
  const loginResponse = await fetch(`${API_URL}/v3/public/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: fakeUser.email,
      password: password,
    }),
  });

  const loginData = await loginResponse.json();
  return loginData.data.access_token;
};
