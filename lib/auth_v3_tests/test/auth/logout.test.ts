import { describe, it, expect } from "vitest";
import { createFakeUser } from "../../src/helpers";
import constants from "../../src/constants";

const API_URL = constants.API_URL;

describe("Auth Endpoints - Logout", () => {
  it("should successfully log out a user", async () => {
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
    const verificationToken = signUpData.data.verificationToken;

    // Simulate email verification
    await fetch(`${API_URL}/v3/public/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: verificationToken,
      }),
    });

    // Wait for the verification process to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log out the user
    const token = signUpData.data.access_token;

    const logoutResponse = await fetch(`${API_URL}/v3/auth/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const logoutData = await logoutResponse.json();

    expect(logoutResponse.status).toBe(200);
    expect(logoutData).toMatchObject({
      success: true,
      message: "Successfully logged out",
    });
  });

  it("should fail to log out without a token", async () => {
    const logoutResponse = await fetch(`${API_URL}/v3/auth/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseText = await logoutResponse.text();

    expect(logoutResponse.status).toBe(401);
    expect(responseText).toContain("Unauthorized");
  });
});
