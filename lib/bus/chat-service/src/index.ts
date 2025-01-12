import { logger } from "hono/logger";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { D1Database } from "@cloudflare/workers-types";
import publicService from "./modules/lib/public";
import jwtService from "./modules/jwt";
import { createResponse } from "./helpers/createResponse";
import { OpenAPIHono } from "@hono/zod-openapi";
import validationErrorHook from "./hooks/validationError.hook";
import { commonErrorResponse } from "./helpers/commonErrorHandler";
import { sessionRouteDefinition } from "./routeDefinitions/sessions";
import { Context } from "hono";
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
        createResponse(
          false,
          "Validation error",
          "VALIDATION_ERROR",
          {
            errors: result.error.errors,
          },
          400
        )
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
// app.use(
//   "/v3/auth/*",
//   bearerAuth({
//     verifyToken: async (token, c) => {
//       try {
//         return await jwtService.verifyRefreshToken(token, c);
//       } catch {
//         return false;
//       }
//     },
//   })
// );
const defaultHandler = (c) => {
  return c.json({
    message: "Hello World",
  });
};

const createUserHandler = async (c: Context) => {
  // parse user id from request body
  const { id } = await c.req.json();

  // insert new user into database
  const result = await dbService.query(c, "INSERT INTO users (id) VALUES (?)", [
    id,
  ]);

  if (result.success) {
    // respond with success message
    return c.json({ message: "user created successfully" }, 201);
  } else {
    // respond with error message
    return c.json({ error: result.error }, 500);
  }
};

const getUserHandler = async (c: Context) => {
  const userId = c.req.param("userId");
  const result = await dbService.query(c, "SELECT * FROM users WHERE id = ?", [
    userId,
  ]);
  if (result.success) {
    return c.json(result.data);
  } else {
    return c.json({ error: result.error }, 500);
  }
};

const updateUserHandler = async (c: Context) => {
  const userId = c.req.param("userId");
  const { prefer_dark_mode } = await c.req.json();
  const result = await dbService.query(
    c,
    "UPDATE users SET prefer_dark_mode = ? WHERE id = ?",
    [prefer_dark_mode, userId]
  );
  if (result.success) {
    return c.json({ message: "user updated successfully" }, 200);
  } else {
    return c.json({ error: result.error }, 500);
  }
};

const deleteUserHandler = async (c: Context) => {
  const userId = c.req.param("userId");
  const result = await dbService.query(c, "DELETE FROM users WHERE id = ?", [
    userId,
  ]);
  if (result.success) {
    return c.json({ message: "user deleted successfully" }, 200);
  } else {
    return c.json({ error: result.error }, 500);
  }
};

const createThreadHandler = async (c: Context) => {
  // parse thread data from request body
  const { id, user_id, title } = await c.req.json();

  // insert new thread into database
  const result = await dbService.query(
    c,
    "INSERT INTO threads (id, user_id, title) VALUES (?, ?, ?)",
    [id, user_id, title]
  );

  if (result.success) {
    // respond with success message
    return c.json({ message: "thread created successfully" }, 201);
  } else {
    // respond with error message
    return c.json({ error: result.error }, 500);
  }
};

const getThreadHandler = async (c: Context) => {
  const threadId = c.req.param("threadId");
  const result = await dbService.query(
    c,
    "SELECT * FROM threads WHERE id = ?",
    [threadId]
  );
  if (result.success) {
    return c.json(result.data);
  } else {
    return c.json({ error: result.error }, 500);
  }
};

const updateThreadHandler = async (c: Context) => {
  const threadId = c.req.param("threadId");
  const { title } = await c.req.json();
  const result = await dbService.query(
    c,
    "UPDATE threads SET title = ? WHERE id = ?",
    [title, threadId]
  );
  if (result.success) {
    return c.json({ message: "thread updated successfully" }, 200);
  } else {
    return c.json({ error: result.error }, 500);
  }
};

const deleteThreadHandler = async (c: Context) => {
  const threadId = c.req.param("threadId");
  const result = await dbService.query(c, "DELETE FROM threads WHERE id = ?", [
    threadId,
  ]);
  if (result.success) {
    return c.json({ message: "thread deleted successfully" }, 200);
  } else {
    return c.json({ error: result.error }, 500);
  }
};

const createMessageHandler = async (c: Context) => {
  // parse message data from request body
  const { id, user_id, text, role, thread_id } = await c.req.json();

  // insert new message into database
  const result = await dbService.query(
    c,
    "INSERT INTO message (id, user_id, text, role, thread_id) VALUES (?, ?, ?, ?, ?)",
    [id, user_id, text, role, thread_id]
  );

  if (result.success) {
    // respond with success message
    return c.json({ message: "message created successfully" }, 201);
  } else {
    // respond with error message
    return c.json({ error: result.error }, 500);
  }
};

const getMessageHandler = async (c: Context) => {
  const messageId = c.req.param("messageId");
  const result = await dbService.query(
    c,
    "SELECT * FROM message WHERE id = ?",
    [messageId]
  );
  if (result.success) {
    return c.json(result.data);
  } else {
    return c.json({ error: result.error }, 500);
  }
};

const updateMessageHandler = async (c: Context) => {
  const messageId = c.req.param("messageId");
  const { text, role } = await c.req.json();
  const result = await dbService.query(
    c,
    "UPDATE message SET text = ?, role = ? WHERE id = ?",
    [text, role, messageId]
  );
  if (result.success) {
    return c.json({ message: "message updated successfully" }, 200);
  } else {
    return c.json({ error: result.error }, 500);
  }
};

const deleteMessageHandler = async (c: Context) => {
  const messageId = c.req.param("messageId");
  const result = await dbService.query(c, "DELETE FROM message WHERE id = ?", [
    messageId,
  ]);
  if (result.success) {
    return c.json({ message: "message deleted successfully" }, 200);
  } else {
    return c.json({ error: result.error }, 500);
  }
};

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
