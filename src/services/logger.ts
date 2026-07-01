import { LogEngine, LogMode } from "@wgtechlabs/log-engine";
import type { LogLevel } from "../types/index.js";

const rawLogLevel = process.env.LOG_LEVEL ?? "info";
const runtimeLevel: LogLevel =
	rawLogLevel === "debug" ||
	rawLogLevel === "info" ||
	rawLogLevel === "warn" ||
	rawLogLevel === "error"
		? rawLogLevel
		: "info";

const logMode =
	runtimeLevel === "debug"
		? LogMode.DEBUG
		: runtimeLevel === "warn"
			? LogMode.WARN
			: runtimeLevel === "error"
				? LogMode.ERROR
				: LogMode.INFO;

// Configure LogEngine with the required format settings
LogEngine.configure({
	mode: logMode,
	format: {
		includeIsoTimestamp: false,
		includeLocalTime: true,
	},
});

export function createLogger(scope: string) {
	function emit(level: LogLevel, ...args: unknown[]): void {
		let message = `[${scope}]`;
		let data: unknown;

		if (typeof args[0] === "string") {
			message = `${message} ${args[0]}`;
			if (args.length === 2) data = args[1];
			if (args.length > 2) data = args.slice(1);
		} else if (args.length === 1) {
			data = args[0];
		} else if (args.length > 1) {
			data = args;
		}

		if (level === "debug") return void LogEngine.debug(message, data);
		if (level === "info") return void LogEngine.info(message, data);
		if (level === "warn") return void LogEngine.warn(message, data);
		return void LogEngine.error(message, data);
	}

	return {
		debug: (...args: unknown[]) => emit("debug", ...args),
		info: (...args: unknown[]) => emit("info", ...args),
		warn: (...args: unknown[]) => emit("warn", ...args),
		error: (...args: unknown[]) => emit("error", ...args),
	};
}
