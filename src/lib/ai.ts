import { NextRequest } from "next/server";
import { groq, VISION_MODEL, TEXT_MODEL } from "./groq";
import { createAnthropicClient, CLAUDE_DEFAULT_MODEL } from "./anthropic";

type Provider = "claude" | "groq";

interface AIConfig {
  provider: Provider;
  claudeApiKey?: string;
}

export function getAIConfig(request: NextRequest): AIConfig {
  const claudeApiKey = request.headers.get("x-claude-api-key");
  if (claudeApiKey) {
    return { provider: "claude", claudeApiKey };
  }
  return { provider: "groq" };
}

interface ChatCompletionParams {
  config: AIConfig;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export async function chatCompletion({ config, system, messages, temperature = 0.7, maxTokens = 1000 }: ChatCompletionParams): Promise<string> {
  if (config.provider === "claude") {
    const client = createAnthropicClient(config.claudeApiKey!);
    const response = await client.messages.create({
      model: CLAUDE_DEFAULT_MODEL,
      max_tokens: maxTokens,
      temperature,
      system,
      messages,
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text.trim() : "";
  }

  const groqMessages = [
    { role: "system" as const, content: system },
    ...messages,
  ];
  const response = await groq.chat.completions.create({
    model: TEXT_MODEL,
    messages: groqMessages,
    temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0]?.message?.content?.trim() || "";
}

interface VisionCompletionParams {
  config: AIConfig;
  system: string;
  userContent: any[];
  temperature?: number;
  maxTokens?: number;
}

export async function visionCompletion({ config, system, userContent, temperature = 0.3, maxTokens = 2000 }: VisionCompletionParams): Promise<string> {
  if (config.provider === "claude") {
    const client = createAnthropicClient(config.claudeApiKey!);
    const claudeContent = userContent.map((item: any) => {
      if (item.type === "image_url") {
        const url = item.image_url.url;
        const base64Data = url.replace(/^data:image\/\w+;base64,/, "");
        const mediaType = (url.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        return {
          type: "image" as const,
          source: { type: "base64" as const, media_type: mediaType, data: base64Data },
        };
      }
      return item;
    });
    const response = await client.messages.create({
      model: CLAUDE_DEFAULT_MODEL,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: "user", content: claudeContent }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text.trim() : "";
  }

  const response = await groq.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0]?.message?.content?.trim() || "";
}

interface TextOnlyCompletionParams {
  config: AIConfig;
  system: string;
  userMessage: string;
  maxTokens?: number;
}

export async function textOnlyCompletion({ config, system, userMessage, maxTokens = 500 }: TextOnlyCompletionParams): Promise<string> {
  if (config.provider === "claude") {
    const client = createAnthropicClient(config.claudeApiKey!);
    const response = await client.messages.create({
      model: CLAUDE_DEFAULT_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: userMessage }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text.trim() : "";
  }

  const response = await groq.chat.completions.create({
    model: TEXT_MODEL,
    messages: [{ role: "user", content: userMessage }],
    max_tokens: maxTokens,
  });
  return response.choices[0]?.message?.content?.trim() || "";
}
