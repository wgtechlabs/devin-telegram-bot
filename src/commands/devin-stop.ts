import type { Context } from "telegraf";
import { terminateSession } from "../services/devin-api.js";
import type { SessionManager } from "../services/session-manager.js";
import type { BotConfig } from "../types/index.js";

export async function handleDevinStop(
	ctx: Context,
	config: BotConfig,
	sessions: SessionManager,
): Promise<void> {
	const chatId = ctx.chat?.id;
	if (!chatId) return;

	const session = sessions.getByChat(chatId);
	if (!session) {
		await ctx.reply("No active session in this chat.");
		return;
	}

	await terminateSession(config.devinApiKey, session.sessionId, config.devinOrgId);
	await sessions.userStop(chatId);
}
