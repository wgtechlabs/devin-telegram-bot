import { Pool } from "pg";
import type { PersistedSession } from "../types/index.js";

interface RowShape {
	payload: PersistedSession[];
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
		await this.pool.query(`
			CREATE TABLE IF NOT EXISTS session_state (
				id SMALLINT PRIMARY KEY CHECK (id = 1),
				payload JSONB NOT NULL,
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)
		`);
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
