import { Hono } from 'hono';
import { logger } from 'hono/logger';

export interface Env {}

const app = new Hono<{ Bindings: Env }>();

// middleware
app.use(logger());

// routes
app.get('/', (c) => {
	return c.text('Hello World');
});

export default app;
