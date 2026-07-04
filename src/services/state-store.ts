import { Pool } from "pg";
import type { PersistedSession } from "../types/index.js";

interface RowShape {
	payload: PersistedSession[];
}

const DB_INIT_MAX_ATTEMPTS = 20;
const DB_INIT_RETRY_MS = 3_000;

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isTransientDatabaseStartupError(error: unknown): boolean {
	if (!error || typeof error !== "object") return false;
	const codeValue = (error as { code?: unknown }).code;
	const code =
		typeof codeValue === "string" || typeof codeValue === "number" ? codeValue : undefined;
	return code === "57P03" || code === "ETIMEDOUT" || code === "ECONNREFUSED";
}

export class SessionStateStore {
	private readonly pool: Pool;

	constructor(databaseUrl: string) {
		const ssl =
			databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
				? undefined
				: { rejectUnauthorized: false };
		this.pool = new Pool({ connectionString: databaseUrl, ssl });
	}

	async init(): Promise<void> {
		for (let attempt = 1; attempt <= DB_INIT_MAX_ATTEMPTS; attempt++) {
			try {
				await this.pool.query(`
					CREATE TABLE IF NOT EXISTS session_state (
						id SMALLINT PRIMARY KEY CHECK (id = 1),
						payload JSONB NOT NULL,
						updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
					)
				`);
				return;
			} catch (error) {
				if (!isTransientDatabaseStartupError(error) || attempt === DB_INIT_MAX_ATTEMPTS) {
					throw error;
				}
				// ponytail: startup DB can be briefly unavailable, retry instead of crash-looping
				await wait(DB_INIT_RETRY_MS);
			}
		}
	}

	async load(): Promise<PersistedSession[]> {
		const result = await this.pool.query<RowShape>(
			"SELECT payload FROM session_state WHERE id = 1",
		);
		if (result.rowCount === 0) return [];
		return result.rows[0].payload ?? [];
	}

	async save(sessions: PersistedSession[]): Promise<void> {
		await this.pool.query(
			`
			INSERT INTO session_state (id, payload, updated_at)
			VALUES (1, $1::jsonb, NOW())
			ON CONFLICT (id)
			DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
		`,
			[JSON.stringify(sessions)],
		);
	}

	async close(): Promise<void> {
		await this.pool.end();
	}
}
