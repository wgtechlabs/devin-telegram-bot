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

function normalizeLogData(value: unknown): unknown {
	if (value instanceof Error) {
		const valueWithCode = value as Error & { code?: unknown };
		const normalized: Record<string, unknown> = {
			name: value.name,
			message: value.message,
		};

		if (typeof valueWithCode.code === "string" || typeof valueWithCode.code === "number") {
			normalized.code = valueWithCode.code;
		}
		if (value.stack) normalized.stack = value.stack;
		if (value.cause !== undefined) normalized.cause = normalizeLogData(value.cause);

		return normalized;
	}

	if (Array.isArray(value)) return value.map(normalizeLogData);
	return value;
}

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

		const payload = normalizeLogData(data);

		if (level === "debug") return void LogEngine.debug(message, payload);
		if (level === "info") return void LogEngine.info(message, payload);
		if (level === "warn") return void LogEngine.warn(message, payload);
		return void LogEngine.error(message, payload);
	}

	return {
		debug: (...args: unknown[]) => emit("debug", ...args),
		info: (...args: unknown[]) => emit("info", ...args),
		warn: (...args: unknown[]) => emit("warn", ...args),
		error: (...args: unknown[]) => emit("error", ...args),
	};
}
