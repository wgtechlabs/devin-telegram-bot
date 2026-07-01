import { Telegraf } from "telegraf";
import { registerCommands } from "./commands/index.js";
import { loadConfig } from "./config.js";
import { registerMessageHandler } from "./handlers/message.js";
import { createLogger } from "./services/logger.js";
import { SessionManager } from "./services/session-manager.js";
import { SessionStateStore } from "./services/state-store.js";

const config = loadConfig();
const log = createLogger("Main");
const bot = new Telegraf(config.telegramBotToken);
const stateStore = new SessionStateStore(config.databaseUrl);

const sessionManager = new SessionManager(
	config,
	async (chatId, text) => {
		await bot.telegram.sendMessage(chatId, text);
	},
	stateStore,
);

registerCommands(bot, config, sessionManager);
registerMessageHandler(bot, config, sessionManager);

bot.catch((error) => {
	log.error("Unhandled bot error:", error);
});

const start = async () => {
	await stateStore.init();
	await sessionManager.restoreFromState();
	await bot.launch();
	log.info(`${config.botName} Telegram Bot is running.`);
};

start().catch((error) => {
	log.error("Failed to launch bot:", error);
	process.exit(1);
});

const shutdown = async () => {
	await bot.stop();
	await stateStore.close();
	process.exit(0);
};

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
