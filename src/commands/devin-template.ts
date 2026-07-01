import type { Context } from "telegraf";
import { createSession } from "../services/devin-api.js";
import type { SessionManager } from "../services/session-manager.js";
import { TEMPLATES, getTemplate } from "../templates/index.js";
import type { BotConfig } from "../types/index.js";

export async function handleDevinTemplate(
	ctx: Context,
	config: BotConfig,
	sessions: SessionManager,
): Promise<void> {
	const chatId = ctx.chat?.id;
	const userId = ctx.from?.id;
	const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
	const payload = text.replace(/^\/template(@\w+)?\s*/i, "").trim();

	if (!chatId || !userId) return;
	if (!payload) {
		const choices = TEMPLATES.map((template) => `- ${template.id}: ${template.description}`).join(
			"\n",
		);
		await ctx.reply(`Usage: /template <id> <details>\nAvailable templates:\n${choices}`);
		return;
	}

	const [templateId, ...detailParts] = payload.split(" ");
	const details = detailParts.join(" ").trim();
	const template = getTemplate(templateId);
	if (!template || !details) {
		await ctx.reply("Usage: /template <id> <details>");
		return;
	}

	const prompt = template.buildPrompt(details);
	const created = await createSession(config.devinApiKey, prompt, config.devinOrgId);
	await sessions.track(chatId, userId, created.session_id, created.url);
	await ctx.reply(`Started template session (${template.name}): ${created.url}`);
}
