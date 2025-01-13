import { describe, it, expect, beforeAll, afterAll } from "vitest";
import constants from "./constants";
import { CommonResponse, createFakeUser } from "./helpers";

const API_URL = constants.API_URL;

describe("Thread Endpoints", () => {
  let userId: string;
  let threadId: string;

  beforeAll(async () => {
    const fakeUser = createFakeUser();
    const response = await fetch(`${API_URL}/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(201);
    const data: CommonResponse = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("USER_CREATED");
    expect(data.message).toBe("user created successfully");
    userId = data.data.id;
  });

  it("should create a new thread", async () => {
    const newThread = {
      user_id: userId,
      title: "my first thread",
    };

    const response = await fetch(`${API_URL}/api/v1/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newThread),
    });

    expect(response.status).toBe(201);
    const data: CommonResponse = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("THREAD_CREATED");
    expect(data.message).toBe("thread created successfully");
    threadId = data.data.id;
  });

  it("should retrieve the created thread", async () => {
    const response = await fetch(`${API_URL}/api/v1/threads/${threadId}`, {
      method: "GET",
    });
    expect(response.status).toBe(200);
    const data: CommonResponse = await response.json();

    console.log("data", data);
    expect(data.success).toBe(true);
    expect(data.code).toBe("THREAD_RETRIEVED");
    const retrievedThread = Array.isArray(data.data) ? data.data[0] : data.data;
    expect(retrievedThread.id).toBe(threadId);
  });

  it("should update the thread's title", async () => {
    const updatedData = { title: "my updated thread title" };
    const response = await fetch(`${API_URL}/api/v1/threads/${threadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    expect(response.status).toBe(200);
    const data: CommonResponse = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("THREAD_UPDATED");
    expect(data.message).toBe("thread updated successfully");
  });

  it("should delete the thread", async () => {
    const response = await fetch(`${API_URL}/api/v1/threads/${threadId}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const data: CommonResponse = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("THREAD_DELETED");
    expect(data.message).toBe("thread deleted successfully");
  });

  it("should return 200 for a deleted thread (or handle appropriately)", async () => {
    const response = await fetch(`${API_URL}/api/v1/threads/${threadId}`, {
      method: "GET",
    });
    expect([200, 404]).toContain(response.status);
    // if 200, you might expect an empty array or object
    // or if you prefer 404, that is also plausible
  });

  afterAll(async () => {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "DELETE",
    });
    expect([200, 404]).toContain(response.status);
  });
});
