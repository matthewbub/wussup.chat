import { createRoute } from "@hono/zod-openapi";
import { z as zOpenApi } from "@hono/zod-openapi";

export const sessionRouteDefinition = createRoute({
  method: "post",
  path: "/api/v1/sessions",
  request: {
    body: {
      content: {
        "application/json": {
          schema: zOpenApi.object({
            userId: zOpenApi.string().openapi({
              example: "123",
              description: "User's id",
            }),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: zOpenApi.object({
            success: zOpenApi.boolean().openapi({
              example: true,
              description: "Whether the request was successful",
            }),
            message: zOpenApi.string().openapi({
              example: "Signup successful",
              description:
                "Message describing the result of the signup request",
            }),
            code: zOpenApi.string().openapi({
              example: "200",
              description: "HTTP status code",
            }),
            data: zOpenApi
              .object({
                access_token: zOpenApi.string(),
                token_type: zOpenApi.literal("Bearer"),
                expires_in: zOpenApi.number(),
                verificationToken: zOpenApi.string().optional(),
              })
              .optional(),
          }),
        },
      },
      description: "Signup successful",
    },
  },
});
