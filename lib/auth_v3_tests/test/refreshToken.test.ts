import { describe, it, expect } from "vitest";
import { createFakeUser } from "../src/helpers";

const API_URL = "http://localhost:8787"; // adjust this to match your dev server

describe("Public Auth Endpoints - Refresh Token", () => {
  it("should successfully refresh the token", async () => {
    const fakeUser = createFakeUser();
    const password = "TestPassword123!";

    // Sign up the user
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

    // Wait for the email verification process to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify the email
    if (signUpResponse.ok && signUpData.verificationToken) {
      await fetch(`${API_URL}/v3/public/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: signUpData.verificationToken,
        }),
      });

      // Wait for the verification to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Login to get the refresh token
    const loginResponse = await fetch(`${API_URL}/v3/public/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fakeUser.email,
        password: password,
      }),
    });

    const loginData = await loginResponse.json();
    const refreshToken = loginData.data.access_token;

    // Wait before testing the refresh token endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test the refresh token endpoint
    const refreshResponse = await fetch(`${API_URL}/v3/public/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    const refreshData = await refreshResponse.json();

    expect(refreshResponse.status).toBe(200);
    expect(refreshData).toMatchObject({
      success: true,
      message: "Token refreshed successfully",
      code: "SUCCESS",
      data: {
        access_token: expect.any(String),
        token_type: "Bearer",
        expires_in: expect.any(Number),
      },
    });
  });

  it("should fail with invalid refresh token", async () => {
    // Wait before testing with an invalid token
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const refreshResponse = await fetch(`${API_URL}/v3/public/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: "invalidToken",
      }),
    });

    const refreshData = await refreshResponse.json();

    expect(refreshResponse.status).toBe(401);
    expect(refreshData).toMatchObject({
      success: false,
      message: "Invalid refresh token",
      code: "INVALID_REFRESH_TOKEN",
      data: null,
    });
  });
});
