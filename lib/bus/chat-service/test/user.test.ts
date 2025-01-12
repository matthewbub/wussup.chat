import { describe, it, expect } from "vitest";
import constants from "./constants";
import { createFakeUser } from "./helpers";

const API_URL = constants.API_URL;

describe("User Endpoints", () => {
  let userId: string;

  it("should create a new user", async () => {
    const fakeUser = createFakeUser();
    const response = await fetch(`${API_URL}/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: fakeUser.id }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("USER_CREATED");
    expect(data.message).toBe("user created successfully");
    userId = fakeUser.id;
  });

  it("should retrieve the created user", async () => {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const data: {
      success: boolean;
      code: string;
      message: string;
      data: any;
    } = await response.json();

    console.log("data", data);
    expect(data.success).toBe(true);
    expect(data.code).toBe("USER_RETRIEVED");
    const retrievedUser = Array.isArray(data.data) ? data.data[0] : data.data;
    expect(retrievedUser.id).toBe(userId);
  });

  it("should update the user's preferences", async () => {
    const updatedData = { prefer_dark_mode: true };
    const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    expect(response.status).toBe(200);
    const data: {
      success: boolean;
      code: string;
      message: string;
      data: any;
    } = await response.json();

    expect(data.success).toBe(true);
    expect(data.code).toBe("USER_UPDATED");
    expect(data.message).toBe("user updated successfully");
  });

  it("should delete the user", async () => {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("USER_DELETED");
    expect(data.message).toBe("user deleted successfully");
  });

  it("should return 200 for a deleted user", async () => {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("USER_RETRIEVED");
  });
});
