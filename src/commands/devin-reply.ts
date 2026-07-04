import type { Context } from "telegraf";
import { sendMessage, toUserFacingDevinError } from "../services/devin-api.js";
import type { SessionManager } from "../services/session-manager.js";
import type { BotConfig } from "../types/index.js";

export async function handleDevinReply(
	ctx: Context,
	config: BotConfig,
	sessions: SessionManager,
): Promise<void> {
	const chatId = ctx.chat?.id;
	const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
	const message = text.replace(/^\/reply(@\w+)?\s*/i, "").trim();

	if (!chatId) return;
	if (!message) {
		await ctx.reply("Usage: /reply <message>");
		return;
	}

	const session = sessions.getByChat(chatId);
	if (!session) {
		await ctx.reply(
			`No active session in this chat. Start one with /devin <task> for ${config.botName}.`,
		);
		return;
	}

	try {
		await sendMessage(config.devinApiKey, session.sessionId, message, config.devinOrgId);
		await ctx.reply("Message sent.");
	} catch (error) {
		await ctx.reply(toUserFacingDevinError(error, "send the message"));
		throw error;
	}
}
