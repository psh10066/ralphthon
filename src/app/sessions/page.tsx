"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SessionEntry {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  insights: { text: string; tags: string[] }[];
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  useEffect(() => {
    const allKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith("droppi_session_")
    );
    const loaded = allKeys
      .map((key) => {
        const id = key.replace("droppi_session_", "");
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        const messagesKey = `droppi_messages_${id}`;
        const messages = JSON.parse(localStorage.getItem(messagesKey) || "[]");
        const insights = messages
          .filter((m: any) => m.type === "insight" && m.insight)
          .map((m: any) => m.insight);
        return {
          id,
          type: data.type || "text",
          content: data.content?.slice(0, 30) || "",
          createdAt: data.createdAt || new Date().toISOString(),
          insights,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    setSessions(loaded);
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}.${d.getDate()} (${["일", "월", "화", "수", "목", "금", "토"][d.getDay()]})`;
  };

  const typeLabel: Record<string, string> = {
    image: "사진",
    text: "텍스트",
    link: "링크",
    memo: "메모",
  };

  return (
    <div className="px-5 pt-8 pb-20 min-h-dvh">
      <h1 className="text-lg font-sans text-ink mb-6">세션 로그</h1>

      {sessions.length === 0 ? (
        <p className="text-sm text-muted-light">
          아직 세션이 없어요. drop해 보세요.
        </p>
      ) : (
        <div className="space-y-1">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/chat/${session.id}`}
              className="block border-b border-structure-line py-4"
            >
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-ink">
                  {typeLabel[session.type] || session.type}
                </span>
                <span className="text-xs text-muted">
                  {formatDate(session.createdAt)}
                </span>
              </div>
              {session.insights.length > 0 && (
                <p className="text-sm text-muted mt-1">
                  &ldquo;{session.insights[0].text}&rdquo;
                </p>
              )}
              <span className="text-xs text-muted-light">
                {session.insights.length}개 발견
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
