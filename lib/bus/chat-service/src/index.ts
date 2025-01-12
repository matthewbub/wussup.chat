import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { D1Database } from "@cloudflare/workers-types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "hono";
import { createResponse, commonErrorResponse } from "./helpers";
import dbService from "./modules/database";

export interface Env {
  AUTH_KEY: string;
  DB: D1Database;
  ENV: string;
}

const app = new OpenAPIHono<{ Bindings: Env }>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        createResponse({
          success: false,
          message: "Validation error",
          code: "VALIDATION_ERROR",
          data: {
            errors: result.error.errors,
          },
          status: 400,
        }),
        400
      );
    }
  },
});

app.onError(commonErrorResponse);

// middleware
app.use(logger());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://zcauldron.vercel.app",
      "https://zcauldron.com",
      "https://www.zcauldron.com",
    ],
    allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "X-App-Id"],
    maxAge: 86400,
  })
);

// creates a new user
async function createUserHandler(c: Context) {
  const { id } = await c.req.json();
  const result = await dbService.query(c, "INSERT INTO users (id) VALUES (?)", [
    id,
  ]);

  if (result.success) {
    return c.json(
      createResponse({
        success: true,
        message: "user created successfully",
        code: "USER_CREATED",
        data: { id },
        status: 201,
      }),
      201
    );
  }

  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "USER_CREATION_ERROR",
      status: 500,
    }),
    500
  );
}

// retrieves a user
async function getUserHandler(c: Context) {
  const userId = c.req.param("userId");
  const result = await dbService.query(c, "SELECT * FROM users WHERE id = ?", [
    userId,
  ]);
  if (result.success) {
    const row = (result.data as any)?.results?.[0];
    return c.json(
      createResponse({
        success: true,
        message: "user retrieved successfully",
        code: "USER_RETRIEVED",
        data: row,
        status: 200,
      }),
      200
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "USER_RETRIEVAL_ERROR",
      status: 500,
    }),
    500
  );
}

// updates a user
async function updateUserHandler(c: Context) {
  const userId = c.req.param("userId");
  const { prefer_dark_mode } = await c.req.json();
  const result = await dbService.query(
    c,
    "UPDATE users SET prefer_dark_mode = ? WHERE id = ?",
    [prefer_dark_mode, userId]
  );

  if (result.success) {
    return c.json(
      createResponse({
        success: true,
        message: "user updated successfully",
        code: "USER_UPDATED",
        status: 200,
      }),
      200
    );
  }

  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "USER_UPDATE_ERROR",
      status: 500,
    }),
    500
  );
}

// deletes a user
async function deleteUserHandler(c: Context) {
  const userId = c.req.param("userId");
  const result = await dbService.query(c, "DELETE FROM users WHERE id = ?", [
    userId,
  ]);
  if (result.success) {
    return c.json(
      createResponse({
        success: true,
        message: "user deleted successfully",
        code: "USER_DELETED",
        status: 200,
      }),
      200
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "USER_DELETE_ERROR",
      status: 500,
    }),
    500
  );
}

// creates a new thread
async function createThreadHandler(c: Context) {
  const { id, user_id, title } = await c.req.json();
  const result = await dbService.query(
    c,
    "INSERT INTO threads (id, user_id, title) VALUES (?, ?, ?)",
    [id, user_id, title]
  );

  if (result.success) {
    return c.json(
      createResponse({
        success: true,
        message: "thread created successfully",
        code: "THREAD_CREATED",
        data: { id },
        status: 201,
      }),
      201
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "THREAD_CREATION_ERROR",
      status: 500,
    }),
    500
  );
}

// retrieves a thread
async function getThreadHandler(c: Context) {
  const threadId = c.req.param("threadId");
  const result = await dbService.query(
    c,
    "SELECT * FROM threads WHERE id = ?",
    [threadId]
  );

  if (result.success) {
    const row = (result.data as any)?.results?.[0];

    return c.json(
      createResponse({
        success: true,
        message: "thread retrieved successfully",
        code: "THREAD_RETRIEVED",
        data: row,
        status: 200,
      }),
      200
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "THREAD_RETRIEVAL_ERROR",
      status: 500,
    }),
    500
  );
}

// updates a thread
async function updateThreadHandler(c: Context) {
  const threadId = c.req.param("threadId");
  const { title } = await c.req.json();
  const result = await dbService.query(
    c,
    "UPDATE threads SET title = ? WHERE id = ?",
    [title, threadId]
  );
  if (result.success) {
    return c.json(
      createResponse({
        success: true,
        message: "thread updated successfully",
        code: "THREAD_UPDATED",
        status: 200,
      }),
      200
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "THREAD_UPDATE_ERROR",
      status: 500,
    }),
    500
  );
}

// deletes a thread
async function deleteThreadHandler(c: Context) {
  const threadId = c.req.param("threadId");
  const result = await dbService.query(c, "DELETE FROM threads WHERE id = ?", [
    threadId,
  ]);
  if (result.success) {
    return c.json(
      createResponse({
        success: true,
        message: "thread deleted successfully",
        code: "THREAD_DELETED",
        status: 200,
      }),
      200
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "THREAD_DELETE_ERROR",
      status: 500,
    }),
    500
  );
}

// creates a new message
async function createMessageHandler(c: Context) {
  const { id, user_id, text, role, thread_id } = await c.req.json();
  const result = await dbService.query(
    c,
    "INSERT INTO message (id, user_id, text, role, thread_id) VALUES (?, ?, ?, ?, ?)",
    [id, user_id, text, role, thread_id]
  );

  if (result.success) {
    return c.json(
      createResponse({
        success: true,
        message: "message created successfully",
        code: "MESSAGE_CREATED",
        data: { id },
        status: 201,
      }),
      201
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "MESSAGE_CREATION_ERROR",
      status: 500,
    }),
    500
  );
}

// retrieves a message
async function getMessageHandler(c: Context) {
  const messageId = c.req.param("messageId");
  const result = await dbService.query(
    c,
    "SELECT * FROM message WHERE id = ?",
    [messageId]
  );
  if (result.success) {
    const row = (result.data as any)?.results?.[0];
    return c.json(
      createResponse({
        success: true,
        message: "message retrieved successfully",
        code: "MESSAGE_RETRIEVED",
        data: row,
        status: 200,
      }),
      200
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "MESSAGE_RETRIEVAL_ERROR",
      status: 500,
    }),
    500
  );
}

// updates a message
async function updateMessageHandler(c: Context) {
  const messageId = c.req.param("messageId");
  const { text, role } = await c.req.json();
  const result = await dbService.query(
    c,
    "UPDATE message SET text = ?, role = ? WHERE id = ?",
    [text, role, messageId]
  );
  if (result.success) {
    return c.json(
      createResponse({
        success: true,
        message: "message updated successfully",
        code: "MESSAGE_UPDATED",
        status: 200,
      }),
      200
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "MESSAGE_UPDATE_ERROR",
      status: 500,
    }),
    500
  );
}

// deletes a message
async function deleteMessageHandler(c: Context) {
  const messageId = c.req.param("messageId");
  const result = await dbService.query(c, "DELETE FROM message WHERE id = ?", [
    messageId,
  ]);
  if (result.success) {
    return c.json(
      createResponse({
        success: true,
        message: "message deleted successfully",
        code: "MESSAGE_DELETED",
        status: 200,
      }),
      200
    );
  }
  return c.json(
    createResponse({
      success: false,
      message: String(result.error),
      code: "MESSAGE_DELETE_ERROR",
      status: 500,
    }),
    500
  );
}

app.post("/api/v1/users", createUserHandler);
app.get("/api/v1/users/:userId", getUserHandler);
app.put("/api/v1/users/:userId", updateUserHandler);
app.delete("/api/v1/users/:userId", deleteUserHandler);

app.post("/api/v1/threads", createThreadHandler);
app.get("/api/v1/threads/:threadId", getThreadHandler);
app.put("/api/v1/threads/:threadId", updateThreadHandler);
app.delete("/api/v1/threads/:threadId", deleteThreadHandler);

app.post("/api/v1/messages", createMessageHandler);
app.get("/api/v1/messages/:messageId", getMessageHandler);
app.put("/api/v1/messages/:messageId", updateMessageHandler);
app.delete("/api/v1/messages/:messageId", deleteMessageHandler);

// app.openapi(sessionRouteDefinition, publicService.routes.signUpRoute, validationErrorHook);

app.doc("/api/v1/documentation", {
  openapi: "3.0.0",
  info: {
    title: "Chat API",
    version: "1.0.0",
    description: "Chat service API",
  },
});

export default app;
