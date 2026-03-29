"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Dimension {
  label: string;
  description: string;
}

interface EssenceProfile {
  headline: string;
  dimensions: Record<string, Dimension>;
  palette: string[];
  observation: string;
  firstQuestion: string;
}

export default function EssencePage() {
  const router = useRouter();
  const [essence, setEssence] = useState<EssenceProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("droppi_essence");
    if (stored) {
      setEssence(JSON.parse(stored));
    }
  }, []);

  const handleReaction = (reaction: string) => {
    if (reaction === "different") {
      router.push("/chat?firstTurn=true");
    } else {
      router.push("/home");
    }
  };

  if (!essence) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-muted">에센스를 불러오는 중...</p>
      </div>
    );
  }

  const dimensionKeys = ["volume", "texture", "opacity", "tactility", "weight", "temperature"];
  const barWidths: Record<string, number> = {
    volume: 70, texture: 55, opacity: 80, tactility: 85, weight: 55, temperature: 75,
  };

  return (
    <div className="px-5 pt-12 pb-20 min-h-dvh">
      <div className="border-t border-b border-structure-line py-10 mb-8">
        <p className="font-serif text-essence text-center text-ink leading-relaxed">
          &ldquo;{essence.headline}&rdquo;
        </p>
      </div>

      <div className="space-y-5 mb-8">
        {dimensionKeys.map((key) => {
          const dim = essence.dimensions[key];
          if (!dim) return null;
          return (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted">{dim.label}</span>
                <span className="text-sm text-ink">{dim.description}</span>
              </div>
              <div className="h-1 bg-block-bg rounded-full">
                <div
                  className="h-1 bg-ink rounded-full"
                  style={{ width: `${barWidths[key] || 50}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-structure-line pt-6 mb-8">
        <div className="flex justify-center gap-3 mb-8">
          {essence.palette.map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-structure-line pt-6 mb-8">
        <p className="text-base font-sans text-muted-light italic leading-relaxed text-center">
          &ldquo;{essence.firstQuestion}&rdquo;
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={() => handleReaction("agree")}
          className="py-3 px-5 text-sm font-sans text-ink border border-muted-light rounded-full"
        >
          맞아요
        </button>
        <button
          onClick={() => handleReaction("different")}
          className="py-3 px-5 text-sm font-sans text-ink border border-muted-light rounded-full"
        >
          좀 다른데
        </button>
        <button
          onClick={() => handleReaction("unsure")}
          className="py-3 px-5 text-sm font-sans text-ink border border-muted-light rounded-full"
        >
          잘 모르겠어요
        </button>
      </div>
    </div>
  );
}
