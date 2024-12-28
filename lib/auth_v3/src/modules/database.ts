import { Context } from 'hono';
import { env } from 'hono/adapter';
import { D1Database } from '@cloudflare/workers-types';

// database service for centralized db operations
const dbService = {
	// get database instance from context
	getDb: (c: Context): D1Database => {
		const db = env(c).DB;
		if (!db) {
			throw new Error('Database connection not found in context');
		}
		return db;
	},

	/**
	 * Executes a single query with error handling
	 * @param c - Context
	 * @param sql - SQL query to execute
	 * @param params - Parameters for the query
	 * @returns - Result of the query
	 * @throws - Error if the query fails
	 *
	 * @example
	 * const result = await dbService.query<{ results: { role: string }[] }>(c, 'SELECT role FROM users WHERE id = ?', [payload.id]);
	 */
	async query<T>(c: Context, sql: string, params: any[] = []): Promise<{ success: boolean; data?: T; error?: string }> {
		try {
			const db = this.getDb(c);
			const result = await db
				.prepare(sql)
				.bind(...params)
				.run();

			return {
				success: result.success,
				data: result as T,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Database error',
			};
		}
	},

	/**
	 * Executes multiple queries in a transaction
	 * @param c - Context
	 * @param queries - Array of queries to execute
	 * @returns - Result of the transaction
	 * @throws - Error if the transaction fails
	 *
	 * @example
	 * const result = await dbService.transaction(c, [
	 * 	{ sql: 'INSERT INTO users (email, password) VALUES (?, ?)', params: ['test@example.com', 'password'] },
	 * 	{ sql: 'INSERT INTO roles (name) VALUES (?)', params: ['admin'] }
	 * ]);
	 */
	async transaction(c: Context, queries: { sql: string; params: any[] }[]): Promise<{ success: boolean; error?: string }> {
		try {
			const db = this.getDb(c);
			const batch = db.batch(queries.map(({ sql, params }) => db.prepare(sql).bind(...params)));

			const results = await batch;
			const success = results.every((result) => result.success);

			return { success };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Transaction failed',
			};
		}
	},
};

export default dbService;
