"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Tag from "@/components/Tag";

interface SessionEntry {
  id: string;
  type: string;
  createdAt: string;
  result?: { insight: string; observation: string; topics: string[]; styles: string[] };
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("droppi_session_"));
    const loaded = keys.map((key) => {
      const id = key.replace("droppi_session_", "");
      const data = JSON.parse(localStorage.getItem(key) || "{}");
      return { id, type: data.type || "text", createdAt: data.createdAt || "", result: data.result };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSessions(loaded);
  }, []);

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getMonth() + 1}.${d.getDate()} (${["일","월","화","수","목","금","토"][d.getDay()]})`;
  };
  const typeLabel: Record<string, string> = { image: "사진", text: "텍스트", link: "링크", memo: "메모" };

  return (
    <>
      <Header />
      <div className="max-w-[960px] mx-auto px-5 pt-4 pb-20">
        <h1 className="text-[18px] font-medium mb-6">세션</h1>
        {sessions.length === 0 ? (
          <p className="text-[13px] text-[#707980]/50">아직 대화가 없어요. 뭐든 drop해 보세요.</p>
        ) : (
          <div className="space-y-1">
            {sessions.map((s) => (
              <button key={s.id} onClick={() => router.push(`/sessions/${s.id}`)} className="w-full text-left border-b border-[#040000]/5 py-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[13px] text-[#040000]">{typeLabel[s.type] || s.type}</span>
                  <span className="text-[12px] text-[#707980]">{formatDate(s.createdAt)}</span>
                </div>
                {s.result?.insight && (
                  <p className="text-[14px] leading-[1.6] line-clamp-2" style={{ fontFamily: "var(--font-serif), serif" }}>
                    {s.result.insight}
                  </p>
                )}
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {(s.result?.topics || []).map((t) => <Tag key={t} label={t} type="topic" />)}
                  {(s.result?.styles || []).map((t) => <Tag key={t} label={t} type="style" />)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
