import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_DEFAULT_MODEL = "claude-opus-4-6";

export function createAnthropicClient(apiKey: string) {
  return new Anthropic({ apiKey });
}
