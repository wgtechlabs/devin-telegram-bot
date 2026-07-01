import type { Context } from "telegraf";
import type { SessionManager } from "../services/session-manager.js";

export async function handleDevinSessions(ctx: Context, sessions: SessionManager): Promise<void> {
	const activeSessions = sessions.getAllSessions();
	if (activeSessions.length === 0) {
		await ctx.reply("No active sessions.");
		return;
	}

	const lines = activeSessions.map(
		(session) => `- ${session.sessionId} (chat: ${session.chatId}, status: ${session.lastStatus})`,
	);
	await ctx.reply(`Active sessions:\n${lines.join("\n")}`);
}
