import { describe, expect, it } from "bun:test";
import { toUserFacingDevinError } from "../src/services/devin-api.js";

describe("toUserFacingDevinError", () => {
	it("maps billing/quota errors to actionable user text", () => {
		const error = new Error(
			'Devin API error 403: {"detail":"Your organization has a billing error. Error: out_of_quota"}',
		);
		expect(toUserFacingDevinError(error, "start a session")).toContain("out of quota");
	});

	it("falls back to generic text for unknown errors", () => {
		expect(toUserFacingDevinError(new Error("boom"), "send the message")).toContain(
			"Devin is currently unavailable",
		);
	});
});
