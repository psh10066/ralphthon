"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Tag from "@/components/Tag";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: string;
  insight?: { text: string; tags: string[] };
}

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`droppi_session_${sessionId}`);
    if (stored) setSession(JSON.parse(stored));
    const msgs = localStorage.getItem(`droppi_messages_${sessionId}`);
    if (msgs) setMessages(JSON.parse(msgs));
  }, [sessionId]);

  const insights = messages.filter((m) => m.type === "insight" && m.insight);

  return (
    <>
      <header className="sticky top-0 bg-[#EFEEE9]/90 backdrop-blur-sm z-40 border-b border-[#040000]/8">
        <div className="max-w-[640px] mx-auto px-5 py-3">
          <button onClick={() => router.back()} className="text-[14px] text-[#707980]">← 뒤로</button>
        </div>
      </header>
      <div className="max-w-[640px] mx-auto px-5 pt-4 pb-12">
        {session?.result?.insight && (
          <h1 className="text-[20px] leading-[1.7] mb-4" style={{ fontFamily: "var(--font-serif), serif" }}>
            &ldquo;{session.result.insight}&rdquo;
          </h1>
        )}
        {session?.result?.observation && (
          <p className="text-[13px] text-[#707980] mb-4">{session.result.observation}</p>
        )}
        <div className="flex gap-1.5 flex-wrap mb-6">
          {(session?.result?.topics || []).map((t: string) => <Tag key={t} label={t} type="topic" />)}
          {(session?.result?.styles || []).map((t: string) => <Tag key={t} label={t} type="style" />)}
        </div>

        {messages.length > 0 && (
          <>
            <div className="border-t border-[#040000]/8 pt-6 mb-4">
              <h2 className="text-[13px] text-[#707980] mb-4">대화</h2>
            </div>
            <div className="space-y-4 mb-8">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[280px] ${msg.role === "user" ? "bg-[#040000]/5 rounded-lg px-4 py-3" : ""}`}>
                    <p className="text-[14px] leading-[1.8] whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {insights.length > 0 && (
          <div className="border-t border-[#040000]/8 pt-6">
            <h2 className="text-[13px] text-[#707980] mb-4">이 세션에서 나온 발견</h2>
            <div className="space-y-3">
              {insights.map((m, i) => (
                <div key={i} className="border border-[#040000]/10 rounded-lg p-4">
                  <p className="text-[14px]" style={{ fontFamily: "var(--font-serif), serif" }}>
                    &ldquo;{m.insight!.text}&rdquo;
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    {m.insight!.tags.map((t) => <Tag key={t} label={t} type="style" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
