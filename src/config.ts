import type { BotConfig, LogLevel } from "./types/index.js";

export const POLL_INTERVAL_INITIAL = 5_000;
export const POLL_INTERVAL_NORMAL = 15_000;
export const POLL_FAST_PERIOD = 120_000;
export const DEVIN_API_BASE_URL = "https://api.devin.ai/v1";
export const TELEGRAM_MESSAGE_MAX_LENGTH = 4096;

const VALID_LOG_LEVELS = new Set<string>(["debug", "info", "warn", "error"]);
const BOT_NAME_MAX_LENGTH = 32;

export function loadConfig(): BotConfig {
	const missing: string[] = [];

	const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
	const databaseUrl = process.env.DATABASE_URL;
	const devinApiKey = process.env.DEVIN_API_KEY;
	const devinOrgId = process.env.DEVIN_ORG_ID?.trim();
	const rawLogLevel = process.env.LOG_LEVEL ?? "info";
	const rawBotName = process.env.BOT_NAME ?? "Devin";

	if (!telegramBotToken) missing.push("TELEGRAM_BOT_TOKEN");
	if (!databaseUrl) missing.push("DATABASE_URL");
	if (!devinApiKey) missing.push("DEVIN_API_KEY");
	if (devinApiKey?.startsWith("cog_") && !devinOrgId) missing.push("DEVIN_ORG_ID");

	if (missing.length > 0) {
		console.error(`Missing required environment variables: ${missing.join(", ")}`);
		process.exit(1);
	}

	const logLevel: LogLevel = VALID_LOG_LEVELS.has(rawLogLevel) ? (rawLogLevel as LogLevel) : "info";
	const botName = rawBotName.trim().slice(0, BOT_NAME_MAX_LENGTH) || "Devin";

	return {
		telegramBotToken: telegramBotToken as string,
		databaseUrl: databaseUrl as string,
		devinApiKey: devinApiKey as string,
		devinOrgId: devinOrgId || undefined,
		logLevel,
		botName,
	};
}
