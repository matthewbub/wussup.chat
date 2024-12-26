import { describe, it, expect, beforeAll } from "vitest";
import { createFakeUser } from "../src/helpers";

const API_URL = "http://localhost:8787"; // adjust this to match your dev server

describe("Public Auth Endpoints", () => {
  describe("Sign Up", () => {
    const validPassword = "TestPassword123!";
    const invalidEmail = "invalid-email";
    const weakPassword = "123";
    const mismatchedPassword = "Mismatch123!";
    const existingEmail = "existing@example.com";

    beforeAll(async () => {
      // Ensure the existing email is in the database for duplicate email test
      await fetch(`${API_URL}/v3/public/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: existingEmail,
          password: validPassword,
          confirmPassword: validPassword,
        }),
      });
    });

    it("should successfully sign up a new user", async () => {
      const fakeUser = createFakeUser();

      const response = await fetch(`${API_URL}/v3/public/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fakeUser.email,
          password: validPassword,
          confirmPassword: validPassword,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        message: expect.any(String),
        data: {
          access_token: expect.any(String),
          token_type: "Bearer",
          expires_in: expect.any(Number),
          verificationToken: expect.any(String),
        },
      });
    });

    it("should fail with invalid email format", async () => {
      const response = await fetch(`${API_URL}/v3/public/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: invalidEmail,
          password: validPassword,
          confirmPassword: validPassword,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        message: "Validation error: Invalid email",
        code: "VALIDATION_ERROR",
        data: null,
      });
    });

    it("should fail with weak password", async () => {
      const fakeUser = createFakeUser();

      const response = await fetch(`${API_URL}/v3/public/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fakeUser.email,
          password: weakPassword,
          confirmPassword: weakPassword,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        message:
          "Validation error: Password must be at least 8 characters, Password must contain at least one uppercase letter, Password must contain at least one lowercase letter, Password must contain at least one special character (!@#$%^&*), Password must be at least 8 characters, Password must contain at least one uppercase letter, Password must contain at least one lowercase letter, Password must contain at least one special character (!@#$%^&*)",
        code: "VALIDATION_ERROR",
        data: null,
      });
    });

    it("should fail with mismatched passwords", async () => {
      const fakeUser = createFakeUser();

      const response = await fetch(`${API_URL}/v3/public/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fakeUser.email,
          password: validPassword,
          confirmPassword: mismatchedPassword,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        message: "Validation error: Passwords don't match",
        code: "VALIDATION_ERROR",
        data: null,
      });
    });

    it("should fail with duplicate email", async () => {
      const response = await fetch(`${API_URL}/v3/public/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: existingEmail,
          password: validPassword,
          confirmPassword: validPassword,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(409);
      expect(data).toMatchObject({
        success: false,
        message: "Email already in use",
        code: "EMAIL_ALREADY_IN_USE",
      });
    });
  });

  describe("Login", () => {
    it("should successfully login an existing user", async () => {
      const fakeUser = createFakeUser();
      const password = "TestPassword123!";

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

      if (signUpResponse.ok && signUpData.verificationToken) {
        await fetch(`${API_URL}/v3/public/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: signUpData.verificationToken,
          }),
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const loginResponse = await fetch(`${API_URL}/v3/public/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fakeUser.email,
          password: password,
        }),
      });

      const loginData = await loginResponse.json();

      expect(loginResponse.status).toBe(200);
      expect(loginData).toMatchObject({
        success: true,
        message: expect.any(String),
        data: {
          access_token: expect.any(String),
          token_type: "Bearer",
          expires_in: expect.any(Number),
        },
      });
    });

    it("should fail with incorrect password", async () => {
      const fakeUser = createFakeUser();
      const password = "TestPassword123!";

      const signUpResponse = await fetch(`${API_URL}/v3/public/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fakeUser.email,
          password: password,
          confirmPassword: password,
        }),
      });

      await signUpResponse.json();

      const loginResponse = await fetch(`${API_URL}/v3/public/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fakeUser.email,
          password: "WrongPassword123!",
        }),
      });

      const loginData = await loginResponse.json();

      expect(loginResponse.status).toBe(401);
      expect(loginData).toMatchObject({
        success: false,
        message: "Invalid password",
        code: "LOGIN_ATTEMPT_FAILED",
      });
    });

    it("should fail with non-existent user", async () => {
      const loginResponse = await fetch(`${API_URL}/v3/public/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "TestPassword123!",
        }),
      });

      const loginData = await loginResponse.json();
      expect(loginResponse.status).toBe(404);
      expect(loginData).toMatchObject({
        success: false,
        message: "Invalid email or password",
        code: "USER_NOT_FOUND",
      });
    });
  });

  describe("Refresh Token", () => {
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
      const refreshResponse = await fetch(
        `${API_URL}/v3/public/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refreshToken: refreshToken,
          }),
        }
      );

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

      const refreshResponse = await fetch(
        `${API_URL}/v3/public/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refreshToken: "invalidToken",
          }),
        }
      );

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

  describe("Verify Email", () => {
    it("should successfully verify the email", async () => {
      // const verifyData = await verifyResponse.json();
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
      // if (signUpResponse.ok && signUpData.verificationToken) {
      const verifyResponse = await fetch(`${API_URL}/v3/public/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: signUpData.data.verificationToken,
        }),
      });

      // Wait for the verification to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const verifyData = await verifyResponse.json();
      expect(verifyResponse.status).toBe(200);
      expect(verifyData).toMatchObject({
        success: true,
        message: "Email verified successfully",
        code: "SUCCESS",
      });
    });

    it("should fail with invalid verification token", async () => {
      const verifyResponse = await fetch(`${API_URL}/v3/public/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "invalidToken",
        }),
      });

      const verifyData = await verifyResponse.json();

      expect(verifyResponse.status).toBe(401);
      expect(verifyData).toMatchObject({
        success: false,
        message: "Token expired or already used",
        code: "TOKEN_INVALID",
      });
    });
  });

  describe("Forgot Password", () => {
    it("should successfully initiate a password reset", async () => {
      const fakeUser = createFakeUser();
      const password = "TestPassword123!";

      // Sign up the user
      await fetch(`${API_URL}/v3/public/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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

  describe("Reset Password", () => {
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
});
