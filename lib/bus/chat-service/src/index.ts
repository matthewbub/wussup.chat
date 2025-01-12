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

const postUserHandler = (c: Context) => {
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

app.post("/api/v1/users", createUserHandler);
app.get("/api/v1/users/:userId", defaultHandler);
app.put("/api/v1/users/:userId", defaultHandler);
app.delete("/api/v1/users/:userId", defaultHandler);

app.get("/api/v1/sessions", defaultHandler);
app.get("/api/v1/sessions/:sessionId", defaultHandler);
app.post("/api/v1/sessions", defaultHandler);
app.put("/api/v1/sessions/:sessionId", defaultHandler);
app.delete("/api/v1/sessions/:sessionId", defaultHandler);

app.get("/api/v1/messages", defaultHandler);
app.get("/api/v1/messages/:messageId", defaultHandler);
app.post("/api/v1/messages", defaultHandler);
app.put("/api/v1/messages/:messageId", defaultHandler);
app.delete("/api/v1/messages/:messageId", defaultHandler);

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
