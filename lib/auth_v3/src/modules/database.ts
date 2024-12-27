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

	// execute a single query with error handling
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

	// execute multiple queries in a transaction
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
