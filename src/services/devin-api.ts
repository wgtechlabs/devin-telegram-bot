import { DEVIN_API_BASE_URL } from "../config.js";
import type { DevinCreateSessionResponse, DevinSessionState } from "../types/index.js";

const DEVIN_API_V3_BASE_URL = "https://api.devin.ai/v3";

type DevinApiVersion = "v1" | "v3";

interface V3SessionResponse {
	session_id: string;
	url: string;
	status: "new" | "claimed" | "running" | "exit" | "error" | "suspended" | "resuming";
	status_detail?: string | null;
	pull_requests?: Array<{ pr_url: string; pr_state?: string | null }>;
}

interface V3MessagesResponse {
	items: Array<{
		event_id: string;
		source: "devin" | "user";
		message: string;
		created_at: number;
	}>;
	has_next_page?: boolean;
	end_cursor?: string | null;
}

function getApiVersion(apiKey: string): DevinApiVersion {
	return apiKey.startsWith("cog_") ? "v3" : "v1";
}

function resolveBaseUrl(apiKey: string, orgId?: string): string {
	const version = getApiVersion(apiKey);
	if (version === "v1") return DEVIN_API_BASE_URL;
	if (!orgId) {
		throw new Error("DEVIN_ORG_ID is required when using a cog_ Devin API key.");
	}
	return `${DEVIN_API_V3_BASE_URL}/organizations/${encodeURIComponent(orgId)}`;
}

function toDevinId(sessionId: string): string {
	return sessionId.startsWith("devin-") ? sessionId : `devin-${sessionId}`;
}

function mapV3Status(status: V3SessionResponse["status"], statusDetail?: string | null) {
	if (status === "error") return "failed";
	if (statusDetail === "finished" || status === "exit") return "finished";
	if (status === "suspended") {
		if (statusDetail === "inactivity") return "expired";
		if (statusDetail === "user_request") return "stopped";
		return "blocked";
	}
	if (statusDetail === "waiting_for_user" || statusDetail === "waiting_for_approval") {
		return "blocked";
	}
	return "running";
}

function extractRepository(prUrl: string): string {
	try {
		const url = new URL(prUrl);
		const parts = url.pathname.split("/").filter(Boolean);
		if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
	} catch {
		// ponytail: invalid URL means no repository extraction.
	}
	return "Unknown repository";
}

export async function createSession(
	apiKey: string,
	prompt: string,
	orgId?: string,
): Promise<DevinCreateSessionResponse> {
	const baseUrl = resolveBaseUrl(apiKey, orgId);
	const response = await fetch(`${baseUrl}/sessions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ prompt }),
	});

	if (!response.ok) {
		throw new Error(`Devin API error ${response.status}: ${await response.text()}`);
	}

	const data = (await response.json()) as DevinCreateSessionResponse | V3SessionResponse;
	return { session_id: data.session_id, url: data.url };
}

export async function sendMessage(
	apiKey: string,
	sessionId: string,
	message: string,
	orgId?: string,
): Promise<void> {
	const version = getApiVersion(apiKey);
	const baseUrl = resolveBaseUrl(apiKey, orgId);
	const targetSessionId = version === "v3" ? toDevinId(sessionId) : sessionId;
	const messagePath = version === "v3" ? "messages" : "message";

	const response = await fetch(`${baseUrl}/sessions/${targetSessionId}/${messagePath}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message }),
	});

	if (!response.ok) {
		throw new Error(`Failed to send message: ${response.status} ${await response.text()}`);
	}
}

export async function getSessionState(
	apiKey: string,
	sessionId: string,
	orgId?: string,
): Promise<DevinSessionState> {
	const version = getApiVersion(apiKey);
	const baseUrl = resolveBaseUrl(apiKey, orgId);
	const targetSessionId = version === "v3" ? toDevinId(sessionId) : sessionId;
	const response = await fetch(`${baseUrl}/sessions/${targetSessionId}`, {
		headers: { Authorization: `Bearer ${apiKey}` },
	});

	if (!response.ok) {
		throw new Error(`Failed to get session: ${response.status} ${await response.text()}`);
	}

	if (version === "v1") return (await response.json()) as DevinSessionState;

	const sessionData = (await response.json()) as V3SessionResponse;
	const messages: DevinSessionState["messages"] = [];
	let hasNextPage = true;
	let afterCursor: string | undefined;

	while (hasNextPage) {
		const params = new URLSearchParams({ first: "200" });
		if (afterCursor) params.set("after", afterCursor);

		const messagesResponse = await fetch(
			`${baseUrl}/sessions/${targetSessionId}/messages?${params.toString()}`,
			{ headers: { Authorization: `Bearer ${apiKey}` } },
		);

		if (!messagesResponse.ok) {
			throw new Error(
				`Failed to list session messages: ${messagesResponse.status} ${await messagesResponse.text()}`,
			);
		}

		const page = (await messagesResponse.json()) as V3MessagesResponse;
		for (const item of page.items) {
			const createdAtMs =
				item.created_at > 10_000_000_000 ? item.created_at : item.created_at * 1000;
			messages.push({
				message_id: item.event_id,
				role: item.source === "devin" ? "devin" : "user",
				content: item.message,
				created_at: new Date(createdAtMs).toISOString(),
			});
		}

		hasNextPage = Boolean(page.has_next_page);
		afterCursor = page.end_cursor ?? undefined;
		if (hasNextPage && !afterCursor) {
			throw new Error("Failed to paginate session messages: missing end_cursor.");
		}
	}

	return {
		status: mapV3Status(sessionData.status, sessionData.status_detail),
		messages,
		pull_requests: (sessionData.pull_requests ?? []).map((pr) => ({
			url: pr.pr_url,
			title: pr.pr_state ? `Pull Request (${pr.pr_state})` : "Pull Request",
			repository: extractRepository(pr.pr_url),
		})),
	};
}

export async function terminateSession(
	apiKey: string,
	sessionId: string,
	orgId?: string,
): Promise<void> {
	const version = getApiVersion(apiKey);
	const baseUrl = resolveBaseUrl(apiKey, orgId);
	const targetSessionId = version === "v3" ? toDevinId(sessionId) : sessionId;

	const response = await fetch(`${baseUrl}/sessions/${targetSessionId}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${apiKey}` },
	});

	if (!response.ok) {
		throw new Error(`Failed to terminate session: ${response.status} ${await response.text()}`);
	}
}
