import type { Context } from "telegraf";
import { createSession, toUserFacingDevinError } from "../services/devin-api.js";
import type { SessionManager } from "../services/session-manager.js";
import type { BotConfig } from "../types/index.js";

export async function handleDevinStart(
	ctx: Context,
	config: BotConfig,
	sessions: SessionManager,
): Promise<void> {
	const chatId = ctx.chat?.id;
	const userId = ctx.from?.id;
	const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
	const task = text.replace(/^\/devin(@\w+)?\s*/i, "").trim();

	if (!chatId || !userId) return;
	if (!task) {
		await ctx.reply("Usage: /devin <task>");
		return;
	}

	try {
		const created = await createSession(config.devinApiKey, task, config.devinOrgId);
		await sessions.track(chatId, userId, created.session_id, created.url);
		await ctx.reply(`Started session: ${created.url}`);
	} catch (error) {
		await ctx.reply(toUserFacingDevinError(error, "start a session"));
		throw error;
	}
}
