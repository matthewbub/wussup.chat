import { describe, it, expect, beforeAll } from "vitest";
import constants from "../../src/constants";
import { getRegularUser } from "../../src/getRegularUser.js";
import { createAdminUser } from "../../src/getAdminUser.js";

const API_URL = constants.API_URL;

describe("Admin Endpoints", () => {
  describe("List Users", () => {
    it("should list all users when authenticated as admin", async () => {
      const { accessToken: adminAccessToken } = await createAdminUser();

      const response = await fetch(`${API_URL}/v3/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.code).toBe("SUCCESS");
      expect(Array.isArray(data.data.results)).toBe(true);
      expect(data.data.results.length).toBeGreaterThan(0);
    });
  });

  describe("Promote User", () => {
    it("should promote a regular user to admin", async () => {
      const { accessToken: adminAccessToken } = await createAdminUser();

      // Create and verify a regular user
      const { userData: regularUserData } = await getRegularUser();

      // Promote the regular user
      const promoteResponse = await fetch(
        `${API_URL}/v3/admin/users/${regularUserData.id}/promote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminAccessToken}`,
          },
        }
      );

      const promoteData = await promoteResponse.json();
      expect(promoteResponse.status).toBe(200);
      expect(promoteData.success).toBe(true);
      expect(promoteData.message).toBe("User promoted to admin successfully");
    });
  });

  describe("Suspend User", () => {
    it("should suspend a user account", async () => {
      const { accessToken: adminAccessToken } = await createAdminUser();
      const { accessToken: regularUserAccessToken, userData: regularUserData } =
        await getRegularUser();

      // Suspend the user
      const suspendResponse = await fetch(
        `${API_URL}/v3/admin/users/${regularUserData.id}/suspend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminAccessToken}`,
          },
        }
      );

      const suspendData = await suspendResponse.json();
      expect(suspendResponse.status).toBe(200);
      expect(suspendData.success).toBe(true);
      expect(suspendData.message).toBe("User suspended successfully");

      // Verify the user can't use their token after suspension
      const postSuspensionMeResponse = await fetch(`${API_URL}/v3/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${regularUserAccessToken}`,
        },
      });

      const postSuspensionData = await postSuspensionMeResponse.json();

      console.log("postSuspensionData", postSuspensionData);
      // Check either for 401 status or for an error response
      expect(postSuspensionData.success).toBe(false);
      expect(postSuspensionData.code).toBe("ACCOUNT_SUSPENDED");
    });
  });
});
