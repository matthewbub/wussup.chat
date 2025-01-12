import { describe, it, expect, beforeAll, afterAll } from "vitest";
import constants from "./constants";
import { createFakeUser } from "./helpers";

const API_URL = constants.API_URL;

describe("Message Endpoints", () => {
  let userId: string;
  let threadId: string;
  let messageId: string;

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
    const userData = await userResponse.json();
    expect(userData.success).toBe(true);
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
    const threadData = await threadResponse.json();
    expect(threadData.success).toBe(true);
    threadId = newThread.id;
  });

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
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("MESSAGE_CREATED");
    expect(data.message).toBe("message created successfully");
    messageId = newMessage.id;
  });

  it("should retrieve the created message", async () => {
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}`, {
      method: "GET",
    });
    expect(response.status).toBe(200);

    const data: {
      success: boolean;
      code: string;
      message: string;
      data: any;
    } = await response.json();

    expect(data.success).toBe(true);
    expect(data.code).toBe("MESSAGE_RETRIEVED");
    const firstMessage = Array.isArray(data.data) ? data.data[0] : data.data;
    expect(firstMessage.id).toBe(messageId);
  });

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
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("MESSAGE_UPDATED");
    expect(data.message).toBe("message updated successfully");
  });

  it("should delete the message", async () => {
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.code).toBe("MESSAGE_DELETED");
    expect(data.message).toBe("message deleted successfully");
  });

  it("should return 200 for a deleted message (or handle appropriately)", async () => {
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}`, {
      method: "GET",
    });
    expect([200, 404]).toContain(response.status);
    // adapt the checks below if you expect 404 or an empty result
  });

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
