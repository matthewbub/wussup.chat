import { describe, it, expect } from "vitest";
import { createFakeUser } from "../../src/helpers";
import constants from "../../src/constants";

const API_URL = constants.API_URL;

describe("Public Auth Endpoints - Login", () => {
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
