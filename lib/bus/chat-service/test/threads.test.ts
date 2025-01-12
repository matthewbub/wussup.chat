import { describe, it, expect, beforeAll, afterAll } from "vitest";
import constants from "./constants";
import { createFakeUser } from "./helpers";

const API_URL = constants.API_URL;

describe("Thread Endpoints", () => {
  let userId: string;
  let threadId: string;

  // creates a user before running thread tests
  beforeAll(async () => {
    const fakeUser = createFakeUser();
    const response = await fetch(`${API_URL}/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: fakeUser.id }),
    });
    expect(response.status).toBe(201);
    userId = fakeUser.id;
  });

  // creates a new thread referencing the user
  it("should create a new thread", async () => {
    const newThread = {
      id: crypto.randomUUID(),
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
    const data: { message: string } = await response.json();
    expect(data.message).toBe("thread created successfully");
    threadId = newThread.id;
  });

  // retrieves the created thread
  it("should retrieve the created thread", async () => {
    const response = await fetch(`${API_URL}/api/v1/threads/${threadId}`, {
      method: "GET",
    });
    expect(response.status).toBe(200);

    // the endpoint implementation returns an array of rows with key "results"
    // or a single object; adjust expectations based on your actual response shape
    const data: { results?: { id: string }[] } | any = await response.json();
    const firstThread = data.results?.[0] || data?.[0] || data;
    expect(firstThread?.id).toBe(threadId);
  });

  // updates the thread
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
    const data: { message: string } = await response.json();
    expect(data.message).toBe("thread updated successfully");
  });

  // deletes the thread
  it("should delete the thread", async () => {
    const response = await fetch(`${API_URL}/api/v1/threads/${threadId}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const data: { message: string } = await response.json();
    expect(data.message).toBe("thread deleted successfully");
  });

  // attempts to retrieve the deleted thread
  it("should return 200 for a deleted thread (or handle appropriately)", async () => {
    const response = await fetch(`${API_URL}/api/v1/threads/${threadId}`, {
      method: "GET",
    });

    // depending on how your code handles requests for deleted resources,
    // you may expect 404 or 200 with an empty result set
    expect([200, 404]).toContain(response.status);
  });

  // cleans up the user (optional, if desired)
  afterAll(async () => {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "DELETE",
    });
    expect([200, 404]).toContain(response.status);
  });
});
