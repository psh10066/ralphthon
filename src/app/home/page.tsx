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
  result?: {
    insight: string;
    observation: string;
    topics: string[];
    styles: string[];
  };
}

export default function Home() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [themes, setThemes] = useState<{ label: string; count: number; color: string }[]>([]);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("droppi_session_"));
    const loaded = keys.map((key) => {
      const id = key.replace("droppi_session_", "");
      const data = JSON.parse(localStorage.getItem(key) || "{}");
      return { id, type: data.type || "text", createdAt: data.createdAt || "", result: data.result };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSessions(loaded);

    const topicMap: Record<string, number> = {};
    loaded.forEach((s) => {
      (s.result?.topics || []).forEach((t: string) => { topicMap[t] = (topicMap[t] || 0) + 1; });
    });
    const colors: Record<string, string> = { 공간: "#7A9CB1", 일: "#45525A", 사람: "#CFE2CF", 취미: "#C2C9A6", 여행: "#C2C9A6", 음식: "#A5B7C5" };
    setThemes(Object.entries(topicMap).map(([label, count]) => ({ label, count, color: colors[label] || "#707980" })));
  }, []);

  const handleDrop = () => {
    router.push("/");
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getMonth() + 1}.${d.getDate()}`;
  };

  const typeLabel: Record<string, string> = { image: "사진", text: "텍스트", link: "링크", memo: "메모" };

  return (
    <>
      <Header />
      <div className="max-w-[960px] mx-auto px-5 pt-2 pb-20">
        <div className="mb-8">
          <p className="text-[15px] text-[#707980] mb-4">오늘은 뭘 가져왔어?</p>
          <button onClick={handleDrop} className="w-full border border-[#040000]/12 rounded-lg bg-white px-4 py-3.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#707980]/50">사진, 글, 링크, 메모...</span>
              <span className="text-[13px] text-[#040000] underline underline-offset-4">drop</span>
            </div>
          </button>
        </div>

        <h2 className="text-[13px] text-[#707980] mb-5">최근 읽기</h2>

        {sessions.length === 0 ? (
          <p className="text-[13px] text-[#707980]/50 mb-12">아직 발견이 없어요. 뭐든 가져와볼래요?</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {sessions.map((item) => (
              <button key={item.id} onClick={() => router.push(`/sessions/${item.id}`)} className="block text-left group">
                <div className="border border-[#040000]/8 rounded-lg overflow-hidden hover:border-[#040000]/15 transition-colors h-[160px]">
                  <div className="flex h-full">
                    <div className="w-[100px] flex-shrink-0 bg-[#7A9CB1]/20 flex items-end p-3">
                      <span className="text-[13px] text-[#45525A] font-medium">{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] text-[#707980]/60 mb-1 block">{typeLabel[item.type] || item.type}</span>
                        <p className="text-[15px] leading-[1.6] line-clamp-2" style={{ fontFamily: "var(--font-serif), serif" }}>
                          {item.result?.insight || "읽기 결과"}
                        </p>
                        {item.result?.observation && (
                          <p className="text-[12px] text-[#707980]/50 mt-1 line-clamp-1">{item.result.observation}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {(item.result?.topics || []).map((t) => <Tag key={t} label={t} type="topic" />)}
                        {(item.result?.styles || []).map((t) => <Tag key={t} label={t} type="style" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {themes.length > 0 && (
          <>
            <h2 className="text-[13px] text-[#707980] mb-4">주제 모음</h2>
            <div className="flex gap-2 flex-wrap mb-8">
              {themes.map((theme) => (
                <button key={theme.label} onClick={() => router.push(`/themes/${encodeURIComponent(theme.label)}`)}>
                  <div className="border border-[#040000]/10 rounded-lg px-4 py-3 hover:border-[#040000]/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }} />
                      <span className="text-[14px]">{theme.label}</span>
                      <span className="text-[11px] text-[#707980]">{theme.count}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </>
  );
}
