import { describe, it, expect, beforeAll } from "vitest";
import { createFakeUser } from "../../src/helpers";

const API_URL = "http://localhost:8787"; // adjust this to match your dev server

describe("Auth Endpoints - /v3/auth/me", () => {
  let token: string;
  let fakeUser: { email: string; username: string };

  beforeAll(async () => {
    fakeUser = createFakeUser();
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
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Store the access token for further tests
    token = signUpData.data.access_token;
  });

  it("should retrieve the current user", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(`${API_URL}/v3/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      message: "User retrieved successfully",
      data: {
        email: fakeUser.email,
        username: fakeUser.email,
        status: "active",
        id: expect.any(String),
        created_at: expect.any(String),
        email_verified: 1,
        last_login_at: null,
        role: "user",
      },
    });
  });

  it("should fail to retrieve user without a token", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(`${API_URL}/v3/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();

    expect(response.status).toBe(401);
    expect(responseText).toContain("Unauthorized");
  });

  it("should update the current user with a unique username", async () => {
    // Generate a unique username
    const uniqueUsername = `newUsername_${Date.now()}`;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(`${API_URL}/v3/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: uniqueUsername,
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      message: "Profile updated successfully",
      code: "SUCCESS",
      data: {
        user: {
          email: fakeUser.email,
          username: uniqueUsername,
        },
      },
    });
  });

  it("should fail to update user with existing email", async () => {
    const existingEmail = "existing@example.com";

    // Ensure the existing email is in the database
    await fetch(`${API_URL}/v3/public/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: existingEmail,
        password: "AnotherPassword123!",
        confirmPassword: "AnotherPassword123!",
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(`${API_URL}/v3/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: existingEmail,
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: false,
      message: "Email already registered",
      code: "ERR_EMAIL_REGISTERED",
      data: null,
    });
  });

  it("should delete the current user account", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(`${API_URL}/v3/auth/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      message: "Account successfully deleted",
    });
  });

  it("should fail to delete account without a token", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(`${API_URL}/v3/auth/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();

    expect(response.status).toBe(401);
    expect(responseText).toContain("Unauthorized");
  });

  it("should fail to retrieve user with an invalid token", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(`${API_URL}/v3/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalidtoken",
      },
    });

    const responseText = await response.text();

    expect(response.status).toBe(401);
    expect(responseText).toContain("Unauthorized");
  });
});
