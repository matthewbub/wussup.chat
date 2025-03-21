import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
  const myIp = c.req.header("cf-connecting-ip");
  return c.text(`Hello Honoz! ${myIp}`);
});

export default app;
