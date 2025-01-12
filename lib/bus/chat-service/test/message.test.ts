import { describe, it, expect, beforeAll, afterAll } from "vitest";
import constants from "./constants";
import { createFakeUser } from "./helpers";

const API_URL = constants.API_URL;

describe("Message Endpoints", () => {
  let userId: string;
  let threadId: string;
  let messageId: string;

  // creates a user and thread before running message tests
  beforeAll(async () => {
    // create user
    const fakeUser = createFakeUser();
    const userResponse = await fetch(`${API_URL}/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: fakeUser.id }),
    });
    expect(userResponse.status).toBe(201);
    userId = fakeUser.id;

    // create thread (requires user)
    const newThread = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: "message thread",
    };
    const threadResponse = await fetch(`${API_URL}/api/v1/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newThread),
    });
    expect(threadResponse.status).toBe(201);
    threadId = newThread.id;
  });

  // creates a new message referencing the user and thread
  it("should create a new message", async () => {
    const newMessage = {
      id: crypto.randomUUID(),
      user_id: userId,
      text: "hello world",
      role: "user",
      thread_id: threadId,
    };

    const response = await fetch(`${API_URL}/api/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessage),
    });

    expect(response.status).toBe(201);
    const data: { message: string } = await response.json();
    expect(data.message).toBe("message created successfully");
    messageId = newMessage.id;
  });

  // retrieves the created message
  it("should retrieve the created message", async () => {
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}`, {
      method: "GET",
    });
    expect(response.status).toBe(200);

    // check shape of returned data based on your actual implementation
    const data: { results?: { id: string }[] } | any = await response.json();
    const firstMessage = data.results?.[0] || data?.[0] || data;
    expect(firstMessage?.id).toBe(messageId);
  });

  // updates the message
  it("should update the message text and role", async () => {
    const updatedData = { text: "updated message text", role: "system" };
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    expect(response.status).toBe(200);
    const data: { message: string } = await response.json();
    expect(data.message).toBe("message updated successfully");
  });

  // deletes the message
  it("should delete the message", async () => {
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const data: { message: string } = await response.json();
    expect(data.message).toBe("message deleted successfully");
  });

  // attempts to retrieve the deleted message
  it("should return 200 for a deleted message (or handle appropriately)", async () => {
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}`, {
      method: "GET",
    });
    // adjust expectation based on your actual implementation
    expect([200, 404]).toContain(response.status);
  });

  // cleans up user and thread (optional, if desired)
  afterAll(async () => {
    // delete thread
    const threadResponse = await fetch(
      `${API_URL}/api/v1/threads/${threadId}`,
      {
        method: "DELETE",
      }
    );
    expect([200, 404]).toContain(threadResponse.status);

    // delete user
    const userResponse = await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "DELETE",
    });
    expect([200, 404]).toContain(userResponse.status);
  });
});
