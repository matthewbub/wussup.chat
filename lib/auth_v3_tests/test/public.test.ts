import { describe, it, expect, beforeAll } from "vitest";
import { createFakeUser } from "../src/helpers";

const API_URL = "http://localhost:8787"; // adjust this to match your dev server

describe("Public Auth Endpoints", () => {
  describe("Public Auth Endpoints - Sign Up", () => {
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
      console.log(data);
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
        access_token: expect.any(String),
        token_type: "Bearer",
        expires_in: expect.any(Number),
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
      expect(loginData).toHaveProperty("error");
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
      expect(loginData).toHaveProperty("error");
    });
  });
});
