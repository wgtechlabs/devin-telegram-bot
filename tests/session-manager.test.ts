import { describe, expect, it } from "bun:test";
import { splitMessage } from "../src/services/session-manager.js";

describe("splitMessage", () => {
	it("splits long messages without losing content", () => {
		const text = `${"a".repeat(3000)} ${"b".repeat(3000)}`;
		const chunks = splitMessage(text, 4096);
		expect(chunks.length).toBe(2);
		expect(chunks[0].length).toBeLessThanOrEqual(4096);
		expect(chunks[1].length).toBeLessThanOrEqual(4096);
		expect(chunks.join(" ")).toBe(text);
	});
});
