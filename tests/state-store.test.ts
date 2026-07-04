import { describe, expect, it } from "bun:test";
import { isTransientDatabaseStartupError } from "../src/services/state-store.js";

describe("isTransientDatabaseStartupError", () => {
	it("matches known transient startup codes", () => {
		expect(isTransientDatabaseStartupError({ code: "57P03" })).toBe(true);
		expect(isTransientDatabaseStartupError({ code: "ETIMEDOUT" })).toBe(true);
		expect(isTransientDatabaseStartupError({ code: "ECONNREFUSED" })).toBe(true);
		expect(isTransientDatabaseStartupError({ code: "EINVAL" })).toBe(false);
		expect(isTransientDatabaseStartupError(new Error("x"))).toBe(false);
	});
});
