import { describe, it, expect, beforeAll } from "vitest";
import { createFakeUser } from "../src/helpers";

const API_URL = "http://localhost:8787"; // adjust this to match your dev server

describe("Public Auth Endpoints - Reset Password", () => {
  it("should successfully reset the password", async () => {
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

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify the email
    const verifyEmailResponse = await fetch(
      `${API_URL}/v3/public/verify-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: signUpData.data.verificationToken,
        }),
      }
    );

    const verifyEmailData = await verifyEmailResponse.json();

    expect(verifyEmailResponse.status).toBe(200);
    expect(verifyEmailData).toMatchObject({
      success: true,
      message: "Email verified successfully",
    });

    // Wait for the email verification process to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Initiate forgot password to get the reset token
    const forgotPasswordResponse = await fetch(
      `${API_URL}/v3/public/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fakeUser.email,
        }),
      }
    );

    const forgotPasswordData = await forgotPasswordResponse.json();
    const resetToken = forgotPasswordData.data?.resetToken; // Ensure resetToken is available
    if (!resetToken) {
      throw new Error("Reset token not provided in response");
    }

    // Wait for the reset token to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reset the password
    const newPassword = "NewTestPassword123!";
    const resetPasswordResponse = await fetch(
      `${API_URL}/v3/public/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken,
          password: newPassword,
          confirmPassword: newPassword,
        }),
      }
    );

    const resetPasswordData = await resetPasswordResponse.json();
    expect(resetPasswordResponse.status).toBe(200);
    expect(resetPasswordData).toMatchObject({
      success: true,
      message: "Password has been reset successfully",
    });
  });

  it("should fail with invalid reset token", async () => {
    const resetPasswordResponse = await fetch(
      `${API_URL}/v3/public/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "invalidToken",
          password: "NewTestPassword123!",
          confirmPassword: "NewTestPassword123!",
        }),
      }
    );

    const resetPasswordData = await resetPasswordResponse.json();
    expect(resetPasswordResponse.status).toBe(200);
    expect(resetPasswordData).toMatchObject({
      success: false,
      message: "Invalid or expired reset token",
      code: "TOKEN_INVALID",
    });
  });
});
