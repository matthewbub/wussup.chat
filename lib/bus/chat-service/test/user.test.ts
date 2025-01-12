import { describe, it, expect, beforeAll, afterAll } from "vitest";
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
      body: JSON.stringify(fakeUser),
    });

    expect(response.status).toBe(201);
    const data: { message: string } = await response.json();
    expect(data.message).toBe("user created successfully");
    userId = fakeUser.id;
  });

  it("should retrieve the created user", async () => {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const data: { results: { id: string }[] } = await response.json();
    expect(data.results[0].id).toBe(userId);
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
    const data: { message: string } = await response.json();
    expect(data.message).toBe("user updated successfully");
  });

  it("should delete the user", async () => {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const data: { message: string } = await response.json();
    expect(data.message).toBe("user deleted successfully");
  });

  it("should return 200 for a deleted user", async () => {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const data: { error?: string } = await response.json();
    expect(data?.error).toBeUndefined();
  });
});
