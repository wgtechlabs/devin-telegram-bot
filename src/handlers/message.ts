import type { Telegraf } from "telegraf";
import { sendMessage, toUserFacingDevinError } from "../services/devin-api.js";
import type { SessionManager } from "../services/session-manager.js";
import type { BotConfig } from "../types/index.js";

export function registerMessageHandler(
	bot: Telegraf,
	config: BotConfig,
	sessions: SessionManager,
): void {
	bot.on("text", async (ctx) => {
		const chatId = ctx.chat.id;
		const text = ctx.message.text.trim();
		if (text.startsWith("/")) return;

		const session = sessions.getByChat(chatId);
		if (!session) return;

		try {
			await sendMessage(config.devinApiKey, session.sessionId, text, config.devinOrgId);
			await ctx.reply(`Forwarded to ${config.botName}.`);
		} catch (error) {
			await ctx.reply(toUserFacingDevinError(error, "forward your message"));
			throw error;
		}
	});
}
