"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InputArea } from "@/components/InputArea";

export default function HomePage() {
  const router = useRouter();
  const [essenceHeadline, setEssenceHeadline] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("droppi_essence");
    if (stored) {
      const essence = JSON.parse(stored);
      setEssenceHeadline(essence.headline);
    }
  }, []);

  const handleDrop = (content: string, type: string) => {
    const sessionId = crypto.randomUUID();
    localStorage.setItem(
      `droppi_session_${sessionId}`,
      JSON.stringify({ type, content, createdAt: new Date().toISOString() })
    );
    router.push(`/chat?sessionId=${sessionId}&type=${type}`);
  };

  return (
    <div className="px-5 pt-8 pb-20 min-h-dvh">
      {essenceHeadline ? (
        <p className="font-serif text-essence-sm text-ink mb-6 leading-relaxed">
          &ldquo;{essenceHeadline}&rdquo;
        </p>
      ) : (
        <div className="bg-block-bg rounded-lg p-5 mb-6">
          <p className="text-sm text-muted">
            먼저 사진을 올려볼까요? 에센스를 읽어드릴게요.
          </p>
          <button
            onClick={() => router.push("/upload")}
            className="mt-3 text-sm text-ink underline underline-offset-4"
          >
            drop
          </button>
        </div>
      )}

      <div className="border-t border-structure-line pt-6 mb-8">
        <InputArea onDrop={handleDrop} />
      </div>

      <div className="border-t border-structure-line pt-6">
        <h2 className="text-sm text-muted mb-4">최근 발견</h2>
        <p className="text-sm text-muted-light">아직 발견이 없어요. drop해 보세요.</p>
      </div>
    </div>
  );
}
