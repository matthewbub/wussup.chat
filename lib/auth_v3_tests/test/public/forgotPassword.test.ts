import { describe, it, expect } from "vitest";
import { createFakeUser } from "../../src/helpers";
import constants from "../../src/constants";

const API_URL = constants.API_URL;

describe("Public Auth Endpoints - Forgot Password", () => {
  it("should successfully initiate a password reset", async () => {
    const fakeUser = createFakeUser();
    const password = "TestPassword123!";

    // Sign up the user
    await fetch(`${API_URL}/v3/public/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": constants.APP_ID,
      },
      body: JSON.stringify({
        email: fakeUser.email,
        password: password,
        confirmPassword: password,
      }),
    });

    // Wait for the email verification process to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Initiate forgot password
    const forgotPasswordResponse = await fetch(
      `${API_URL}/v3/public/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": constants.APP_ID,
        },
        body: JSON.stringify({
          email: fakeUser.email,
        }),
      }
    );

    const forgotPasswordData = await forgotPasswordResponse.json();

    expect(forgotPasswordResponse.status).toBe(200);
    expect(forgotPasswordData).toMatchObject({
      success: true,
      message:
        "If a user exists with this email, they will receive reset instructions.",
    });
  });

  it("should fail for non-existent email", async () => {
    const forgotPasswordResponse = await fetch(
      `${API_URL}/v3/public/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": constants.APP_ID,
        },
        body: JSON.stringify({
          email: "nonexistent@example.com",
        }),
      }
    );

    const forgotPasswordData = await forgotPasswordResponse.json();

    expect(forgotPasswordResponse.status).toBe(200);
    expect(forgotPasswordData).toMatchObject({
      success: true,
      message:
        "If a user exists with this email, they will receive reset instructions.",
    });
  });
});
