"use client";

import { useParams } from "next/navigation";

export default function SessionDetailPage() {
  const { sessionId } = useParams();

  return (
    <div className="px-5 pt-8 pb-20 min-h-dvh">
      <h1 className="text-sm text-muted mb-6">세션 상세</h1>
      <p className="text-sm text-muted-light">
        세션 {sessionId}의 대화 내용이 여기에 표시됩니다.
      </p>
    </div>
  );
}
