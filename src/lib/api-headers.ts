export function getAIHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const claudeKey = sessionStorage.getItem("claude_api_key");
    if (claudeKey) {
      headers["x-claude-api-key"] = claudeKey;
    }
  }
  return headers;
}
