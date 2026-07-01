export type LogLevel = "debug" | "info" | "warn" | "error";

export interface BotConfig {
	telegramBotToken: string;
	databaseUrl: string;
	devinApiKey: string;
	devinOrgId?: string;
	logLevel: LogLevel;
	botName: string;
}

export type DevinSessionStatus =
	| "running"
	| "blocked"
	| "finished"
	| "stopped"
	| "expired"
	| "failed";

export interface DevinCreateSessionResponse {
	session_id: string;
	url: string;
}

export interface DevinMessage {
	message_id: string;
	role: "user" | "devin";
	content: string;
	created_at: string;
}

export interface DevinPullRequest {
	url: string;
	title: string;
	repository: string;
}

export interface DevinSessionState {
	status: DevinSessionStatus;
	messages: DevinMessage[];
	pull_requests?: DevinPullRequest[];
}

export interface TrackedSession {
	sessionId: string;
	chatId: number;
	url: string;
	userId: number;
	lastStatus: DevinSessionStatus;
	lastMessageCount: number;
	pollTimer: ReturnType<typeof setTimeout> | null;
	createdAt: number;
	postedPullRequests: Set<string>;
}

export interface PersistedSession {
	sessionId: string;
	chatId: number;
	url: string;
	userId: number;
	lastStatus: DevinSessionStatus;
	lastMessageCount: number;
	createdAt: number;
	postedPullRequests: string[];
}

export interface PromptTemplate {
	id: string;
	name: string;
	description: string;
	buildPrompt: (details: string) => string;
}

export const TERMINAL_STATUSES = new Set<DevinSessionStatus>([
	"finished",
	"stopped",
	"expired",
	"failed",
]);
