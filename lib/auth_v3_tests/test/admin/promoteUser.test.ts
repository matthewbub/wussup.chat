import { describe, it, expect } from "vitest";
import constants from "../../src/constants";

const API_URL = constants.API_URL;

describe("Admin Endpoints - Promote User", () => {
  it("should promote a user to admin using the test route", async () => {
    const userId = "some-user-id"; // replace with a valid test user ID

    const response = await fetch(
      `${API_URL}/test/v3/test/admin/test/users/test/${userId}/test/promote/test`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your-test-token", // replace with a valid test token
        },
      }
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      message: "User promoted to admin successfully",
      code: "SUCCESS",
    });
  });
});
