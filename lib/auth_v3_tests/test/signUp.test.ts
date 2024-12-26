import { describe, it, expect, beforeAll } from "vitest";
import { createFakeUser } from "../src/helpers";

const API_URL = "http://localhost:8787"; // adjust this to match your dev server

describe("Public Auth Endpoints - Sign Up", () => {
  const validPassword = "TestPassword123!";
  const invalidEmail = "invalid-email";
  const weakPassword = "123";
  const mismatchedPassword = "Mismatch123!";
  const existingEmail = "existing@example.com";

  beforeAll(async () => {
    // ensure the existing email is in the database for duplicate email test
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
      message: "Validation error",
      code: "VALIDATION_ERROR",
      data: {
        issues: [
          {
            message: "Invalid email",
            path: ["email"],
            code: "invalid_string",
          },
        ],
      },
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
      message: "Validation error",
      code: "VALIDATION_ERROR",
      data: {
        issues: [
          {
            message: "Password must be at least 8 characters",
            path: ["password"],
            code: "too_small",
          },
          {
            message: "Password must contain at least one uppercase letter",
            path: ["password"],
            code: "custom",
          },
          {
            message: "Password must contain at least one lowercase letter",
            path: ["password"],
            code: "custom",
          },
          {
            message:
              "Password must contain at least one special character (!@#$%^&*)",
            path: ["password"],
            code: "custom",
          },
          {
            message: "Password must be at least 8 characters",
            path: ["confirmPassword"],
            code: "too_small",
          },
          {
            message: "Password must contain at least one uppercase letter",
            path: ["confirmPassword"],
            code: "custom",
          },
          {
            message: "Password must contain at least one lowercase letter",
            path: ["confirmPassword"],
            code: "custom",
          },
          {
            message:
              "Password must contain at least one special character (!@#$%^&*)",
            path: ["confirmPassword"],
            code: "custom",
          },
        ],
      },
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
      message: "Validation error",
      code: "VALIDATION_ERROR",
      data: {
        issues: [
          {
            message: "Passwords don't match",
            path: ["confirmPassword"],
            code: "custom",
          },
        ],
      },
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
