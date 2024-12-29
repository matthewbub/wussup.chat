import { describe, it, expect } from "vitest";
import { createFakeUser } from "../../src/helpers";
import constants from "../../src/constants";
import { getRegularUser } from "../../src/getRegularUser";

const API_URL = constants.API_URL;

describe("Public Auth Endpoints - Reset Password", () => {
  it("should successfully reset the password", async () => {
    const fakeUser = await getRegularUser();

    // Initiate forgot password to get the reset token
    const forgotPasswordResponse = await fetch(
      `${API_URL}/v3/public/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fakeUser.userData.email,
        }),
      }
    );

    const forgotPasswordData = await forgotPasswordResponse.json();
    console.log("forgotPasswordResponse", forgotPasswordData);
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
    expect(resetPasswordResponse.status).toBe(401);
    expect(resetPasswordData).toMatchObject({
      success: false,
      message: "Invalid or expired reset token",
      code: "INVALID_RESET_TOKEN",
      data: null,
    });
  });
});
