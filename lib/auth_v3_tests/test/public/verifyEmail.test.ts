import { describe, it, expect } from "vitest";
import { createFakeUser } from "../../src/helpers";
import constants from "../../src/constants";

const API_URL = constants.API_URL;

describe("Public Auth Endpoints", () => {
  describe("Verify Email", () => {
    it("should successfully verify the email", async () => {
      // const verifyData = await verifyResponse.json();
      const fakeUser = createFakeUser();
      const password = "TestPassword123!";

      // Sign up the user
      const signUpResponse = await fetch(`${API_URL}/v3/public/sign-up`, {
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

      const signUpData = await signUpResponse.json();

      // Wait for the email verification process to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify the email
      // if (signUpResponse.ok && signUpData.verificationToken) {
      const verifyResponse = await fetch(`${API_URL}/v3/public/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": constants.APP_ID,
        },
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
        headers: {
          "Content-Type": "application/json",
          "x-app-id": constants.APP_ID,
        },
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

    it("should fail with validation error when token is missing", async () => {
      const verifyResponse = await fetch(`${API_URL}/v3/public/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": constants.APP_ID,
        },
        body: JSON.stringify({}),
      });

      const verifyData = await verifyResponse.json();

      expect(verifyResponse.status).toBe(400);
      expect(verifyData).toMatchObject({
        success: false,
        message: "Validation error",
        code: "VALIDATION_ERROR",
        data: {
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
            }),
          ]),
        },
      });
    });
  });
});
