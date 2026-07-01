import type { Telegraf } from "telegraf";
import type { SessionManager } from "../services/session-manager.js";
import type { BotConfig } from "../types/index.js";
import { handleDevinReply } from "./devin-reply.js";
import { handleDevinSessions } from "./devin-sessions.js";
import { handleDevinStop } from "./devin-stop.js";
import { handleDevinTemplate } from "./devin-template.js";
import { handleDevinStart } from "./devin.js";

export function registerCommands(bot: Telegraf, config: BotConfig, sessions: SessionManager): void {
	bot.command("start", async (ctx) => {
		await ctx.reply(`Use /devin <task> to start a ${config.botName} session.`);
	});

	bot.command("help", async (ctx) => {
		await ctx.reply(
			[
				"/devin <task> - start a new session",
				"/reply <message> - send follow-up message",
				"/stop - terminate active session",
				"/sessions - list active sessions",
				"/template <id> <details> - start from template",
			].join("\n"),
		);
	});

	bot.command("devin", async (ctx) => {
		await handleDevinStart(ctx, config, sessions);
	});
	bot.command("reply", async (ctx) => {
		await handleDevinReply(ctx, config, sessions);
	});
	bot.command("stop", async (ctx) => {
		await handleDevinStop(ctx, config, sessions);
	});
	bot.command("sessions", async (ctx) => {
		await handleDevinSessions(ctx, sessions);
	});
	bot.command("template", async (ctx) => {
		await handleDevinTemplate(ctx, config, sessions);
	});

	void bot.telegram.setMyCommands([
		{ command: "devin", description: `start a new ${config.botName} session` },
		{ command: "reply", description: `reply to active ${config.botName} session` },
		{ command: "stop", description: `stop active ${config.botName} session` },
		{ command: "sessions", description: "list active sessions" },
		{ command: "template", description: "start from a task template" },
	]);
}
