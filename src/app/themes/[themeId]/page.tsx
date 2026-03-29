"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Tag from "@/components/Tag";

export default function ThemeDetailPage() {
  const { themeId } = useParams();
  const router = useRouter();
  const theme = decodeURIComponent(themeId as string);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("droppi_session_"));
    const matched = keys
      .map((key) => {
        const id = key.replace("droppi_session_", "");
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        return { id, ...data };
      })
      .filter((s) => (s.result?.topics || []).includes(theme))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setSessions(matched);
  }, [theme]);

  return (
    <>
      <header className="sticky top-0 bg-[#EFEEE9]/90 backdrop-blur-sm z-40 border-b border-[#040000]/8">
        <div className="max-w-[640px] mx-auto px-5 py-3">
          <button onClick={() => router.back()} className="text-[14px] text-[#707980]">← 뒤로</button>
        </div>
      </header>
      <div className="max-w-[640px] mx-auto px-5 pt-4 pb-12">
        <h1 className="text-[20px] font-medium mb-6">{theme}</h1>
        {sessions.length === 0 ? (
          <p className="text-[13px] text-[#707980]/50">이 주제의 읽기가 아직 없어요.</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/sessions/${s.id}`)}
                className="w-full text-left border border-[#040000]/8 rounded-lg p-4 hover:border-[#040000]/15 transition-colors"
              >
                <p className="text-[15px] leading-[1.6] mb-2" style={{ fontFamily: "var(--font-serif), serif" }}>
                  {s.result?.insight || "읽기 결과"}
                </p>
                <p className="text-[12px] text-[#707980]/50">{s.result?.observation || ""}</p>
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {(s.result?.topics || []).map((t: string) => <Tag key={t} label={t} type="topic" />)}
                  {(s.result?.styles || []).map((t: string) => <Tag key={t} label={t} type="style" />)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
