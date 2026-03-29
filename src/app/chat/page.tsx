"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InputArea } from "@/components/InputArea";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "question" | "insight";
  insight?: {
    text: string;
    tags: string[];
    connectedEssence?: string;
  };
}

function ChatContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || crypto.randomUUID();
  const firstTurn = searchParams.get("firstTurn") === "true";
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    if (firstTurn) {
      const essence = localStorage.getItem("droppi_essence");
      if (essence) {
        const parsed = JSON.parse(essence);
        const aiMsg: Message = {
          role: "assistant",
          content: `"${parsed.headline}"\n\n${parsed.firstQuestion}\n\n어디가 다르다고 느꼈어요?`,
          type: "question",
        };
        setMessages([aiMsg]);
      }
    }
  }, [firstTurn, initialized]);

  const saveMessages = (msgs: Message[]) => {
    localStorage.setItem(`droppi_messages_${sessionId}`, JSON.stringify(msgs));
  };

  const sendMessage = async (content: string, type: string = "text") => {
    const userMsg: Message = { role: "user", content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveMessages(updated);
    setIsLoading(true);

    try {
      const essence = localStorage.getItem("droppi_essence");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { type, content },
          essence: essence ? JSON.parse(essence) : null,
          history: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        role: "assistant",
        content: data.message,
        type: data.type,
        insight: data.insight,
      };
      const withAi = [...updated, aiMsg];
      setMessages(withAi);
      saveMessages(withAi);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInsight = (insight: Message["insight"]) => {
    if (!insight) return;
    const saved = JSON.parse(localStorage.getItem("droppi_insights") || "[]");
    saved.push({ ...insight, createdAt: new Date().toISOString() });
    localStorage.setItem("droppi_insights", JSON.stringify(saved));
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="flex-1 px-5 pt-4 pb-4 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div className="bg-block-bg rounded-lg px-4 py-3 max-w-[280px]">
                <p className="text-sm font-sans whitespace-pre-wrap">{msg.content}</p>
              </div>
            ) : (
              <div className="max-w-[320px]">
                <p className="text-sm font-sans font-light whitespace-pre-wrap">
                  {msg.content}
                </p>
                {msg.type === "insight" && msg.insight && (
                  <div className="mt-3 bg-block-bg rounded-lg p-4">
                    <p className="text-base font-sans mb-2">
                      &ldquo;{msg.insight.text}&rdquo;
                    </p>
                    <div className="flex gap-2 mb-3">
                      {msg.insight.tags.map((tag) => (
                        <span key={tag} className="text-xs text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSaveInsight(msg.insight)}
                      className="text-xs text-ink underline underline-offset-2"
                    >
                      저장할까요?
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <p className="text-sm text-muted animate-pulse">· · ·</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-structure-line px-5 py-3">
        <InputArea
          onDrop={(content, type) => sendMessage(content, type)}
          compact
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh">
          <p className="text-muted">로딩 중...</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
