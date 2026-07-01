import type { PromptTemplate } from "../types/index.js";

export const TEMPLATES: PromptTemplate[] = [
	{
		id: "open-pr",
		name: "Open a PR",
		description: "Write code and open a pull request",
		buildPrompt: (details) => `Open a pull request with this task: ${details}`,
	},
	{
		id: "code-review",
		name: "Code Review",
		description: "Review an existing pull request",
		buildPrompt: (details) => `Review this pull request and provide feedback: ${details}`,
	},
	{
		id: "write-tests",
		name: "Write Tests",
		description: "Add test coverage",
		buildPrompt: (details) => `Write tests for this target: ${details}`,
	},
	{
		id: "fix-bug",
		name: "Fix a Bug",
		description: "Investigate and fix a bug",
		buildPrompt: (details) => `Investigate and fix this bug: ${details}`,
	},
];

export function getTemplate(id: string): PromptTemplate | undefined {
	return TEMPLATES.find((template) => template.id === id);
}
