import {
	POLL_FAST_PERIOD,
	POLL_INTERVAL_INITIAL,
	POLL_INTERVAL_NORMAL,
	TELEGRAM_MESSAGE_MAX_LENGTH,
} from "../config.js";
import type {
	BotConfig,
	DevinSessionState,
	DevinSessionStatus,
	PersistedSession,
	TrackedSession,
} from "../types/index.js";
import { TERMINAL_STATUSES } from "../types/index.js";
import { getSessionState } from "./devin-api.js";
import { createLogger } from "./logger.js";
import type { SessionStateStore } from "./state-store.js";

const log = createLogger("SessionManager");

const STATUS_TEXT: Record<DevinSessionStatus, string> = {
	running: "Working",
	blocked: "Blocked",
	finished: "Finished",
	stopped: "Stopped",
	expired: "Expired",
	failed: "Failed",
};

export function splitMessage(content: string, maxLength = TELEGRAM_MESSAGE_MAX_LENGTH): string[] {
	if (content.length <= maxLength) return [content];
	const chunks: string[] = [];
	let remaining = content;

	while (remaining.length > 0) {
		if (remaining.length <= maxLength) {
			chunks.push(remaining);
			break;
		}

		let splitIndex = remaining.lastIndexOf("\n", maxLength);
		if (splitIndex <= 0) splitIndex = remaining.lastIndexOf(" ", maxLength);
		if (splitIndex <= 0) splitIndex = maxLength;

		const chunk = remaining.slice(0, splitIndex);
		const skip = splitIndex === maxLength ? splitIndex : splitIndex + 1;
		chunks.push(chunk);
		remaining = remaining.slice(skip);
	}

	return chunks;
}

export class SessionManager {
	private readonly sessions = new Map<string, TrackedSession>();
	private readonly chatToSession = new Map<number, string>();

	constructor(
		private readonly config: BotConfig,
		private readonly sendText: (chatId: number, text: string) => Promise<void>,
		private readonly stateStore: SessionStateStore,
	) {}

	async restoreFromState(): Promise<void> {
		const persisted = await this.stateStore.load();
		for (const entry of persisted) {
			if (TERMINAL_STATUSES.has(entry.lastStatus)) continue;
			this.sessions.set(entry.sessionId, {
				sessionId: entry.sessionId,
				chatId: entry.chatId,
				url: entry.url,
				userId: entry.userId,
				lastStatus: entry.lastStatus,
				lastMessageCount: entry.lastMessageCount,
				pollTimer: null,
				createdAt: entry.createdAt,
				postedPullRequests: new Set(entry.postedPullRequests),
			});
			this.chatToSession.set(entry.chatId, entry.sessionId);
			this.startPolling(entry.sessionId);
		}
	}

	getByChat(chatId: number): TrackedSession | undefined {
		const sessionId = this.chatToSession.get(chatId);
		if (!sessionId) return undefined;
		return this.sessions.get(sessionId);
	}

	getAllSessions(): TrackedSession[] {
		return [...this.sessions.values()];
	}

	async track(chatId: number, userId: number, sessionId: string, url: string): Promise<void> {
		const existing = this.getByChat(chatId);
		if (existing) this.stopLocal(existing.sessionId);

		const session: TrackedSession = {
			sessionId,
			chatId,
			userId,
			url,
			lastStatus: "running",
			lastMessageCount: 0,
			pollTimer: null,
			createdAt: Date.now(),
			postedPullRequests: new Set(),
		};

		this.sessions.set(sessionId, session);
		this.chatToSession.set(chatId, sessionId);
		this.startPolling(sessionId);
		await this.persistState();
	}

	async userStop(chatId: number): Promise<TrackedSession | undefined> {
		const session = this.getByChat(chatId);
		if (!session) return undefined;
		this.stopLocal(session.sessionId);
		await this.sendText(chatId, "Session stopped.");
		await this.persistState();
		return session;
	}

	private startPolling(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		const poll = async () => {
			try {
				const state = await getSessionState(
					this.config.devinApiKey,
					sessionId,
					this.config.devinOrgId,
				);
				await this.processUpdate(sessionId, state);
			} catch (error) {
				log.error(`Poll error for ${sessionId}:`, error);
			}
		};

		const getInterval = () => {
			const elapsed = Date.now() - session.createdAt;
			return elapsed < POLL_FAST_PERIOD ? POLL_INTERVAL_INITIAL : POLL_INTERVAL_NORMAL;
		};

		const scheduleNext = () => {
			if (TERMINAL_STATUSES.has(session.lastStatus)) return;
			session.pollTimer = setTimeout(async () => {
				await poll();
				scheduleNext();
			}, getInterval());
		};

		scheduleNext();
	}

	private async processUpdate(sessionId: string, state: DevinSessionState): Promise<void> {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		const newMessages = state.messages.slice(session.lastMessageCount);
		for (const message of newMessages) {
			if (message.role !== "devin") continue;
			const chunks = splitMessage(message.content);
			for (const chunk of chunks) {
				await this.sendText(session.chatId, chunk);
			}
		}
		session.lastMessageCount = state.messages.length;

		for (const pr of state.pull_requests ?? []) {
			if (session.postedPullRequests.has(pr.url)) continue;
			session.postedPullRequests.add(pr.url);
			await this.sendText(session.chatId, `PR created: ${pr.url}`);
		}

		if (state.status !== session.lastStatus) {
			session.lastStatus = state.status;
			await this.sendText(session.chatId, `Session ${STATUS_TEXT[state.status]}`);
			if (TERMINAL_STATUSES.has(state.status)) this.stopLocal(sessionId);
		}
		await this.persistState();
	}

	private stopLocal(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		if (session.pollTimer) {
			clearTimeout(session.pollTimer);
			session.pollTimer = null;
		}

		this.chatToSession.delete(session.chatId);
		this.sessions.delete(sessionId);
		void this.persistState();
	}

	private async persistState(): Promise<void> {
		const payload: PersistedSession[] = [...this.sessions.values()].map((session) => ({
			sessionId: session.sessionId,
			chatId: session.chatId,
			url: session.url,
			userId: session.userId,
			lastStatus: session.lastStatus,
			lastMessageCount: session.lastMessageCount,
			createdAt: session.createdAt,
			postedPullRequests: [...session.postedPullRequests],
		}));

		try {
			await this.stateStore.save(payload);
		} catch (error) {
			log.error("Failed to persist session snapshot:", error);
		}
	}
}
