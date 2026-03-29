"use client";

import { useEffect, useState } from "react";

interface EssenceData {
  headline: string;
  dimensions: Record<string, { label: string; description: string }>;
  palette: string[];
}

export default function ProfilePage() {
  const [essence, setEssence] = useState<EssenceData | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    const storedEssence = localStorage.getItem("droppi_essence");
    if (storedEssence) {
      setEssence(JSON.parse(storedEssence));
    }

    const storedInsights = JSON.parse(
      localStorage.getItem("droppi_insights") || "[]"
    );
    setInsights(storedInsights);

    const allTags = storedInsights.flatMap((i: any) => i.tags || []);
    const tagCounts = allTags.reduce(
      (acc: Record<string, number>, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {}
    );
    const sorted = Object.entries(tagCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([tag]) => tag);
    setKeywords(sorted);
  }, []);

  const dimensionKeys = [
    "volume",
    "texture",
    "opacity",
    "tactility",
    "weight",
    "temperature",
  ];

  return (
    <div className="px-5 pt-8 pb-20 min-h-dvh">
      <h1 className="text-sm text-muted mb-4">나의 에센스</h1>

      {essence ? (
        <>
          <p className="font-serif text-essence-sm text-ink mb-6 leading-relaxed">
            &ldquo;{essence.headline}&rdquo;
          </p>
          <div className="space-y-3 mb-8">
            {dimensionKeys.map((key) => {
              const dim = essence.dimensions[key];
              if (!dim) return null;
              return (
                <div
                  key={key}
                  className="flex justify-between text-sm border-b border-block-bg pb-2"
                >
                  <span className="text-muted">{dim.label}</span>
                  <span className="text-ink">{dim.description}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mb-8">
            {essence.palette.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-light mb-8">
          아직 에센스가 없어요. 사진을 drop해 보세요.
        </p>
      )}

      <div className="border-t border-structure-line pt-6 mb-8">
        <h2 className="text-sm text-muted mb-4">
          축적된 발견 ({insights.length})
        </h2>
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="bg-block-bg rounded-lg p-4">
                <p className="text-sm text-ink mb-2">
                  &ldquo;{insight.text}&rdquo;
                </p>
                <div className="flex gap-2">
                  {(insight.tags || []).map((tag: string) => (
                    <span key={tag} className="text-xs text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-light">
            아직 패턴이 만들어지는 중이에요.
          </p>
        )}
      </div>

      <div className="border-t border-structure-line pt-6 mb-8">
        <h2 className="text-sm text-muted mb-4">반복 키워드</h2>
        {keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="text-sm text-ink bg-block-bg px-3 py-1 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-light">drop이 쌓이면 보여요.</p>
        )}
      </div>

      <div className="border-t border-structure-line pt-6">
        <button className="text-sm text-ink underline underline-offset-4">
          주간 리포트 생성
        </button>
      </div>
    </div>
  );
}
