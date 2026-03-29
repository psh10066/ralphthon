"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  "보고 있어요",
  "읽고 있어요",
  "찾고 있어요",
  "거의 다 왔어요",
];

export default function LoadingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const images = localStorage.getItem("droppi_images");
    if (!images) {
      router.push("/upload");
      return;
    }

    const timer = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 3000);

    const analyze = async () => {
      const parsed = JSON.parse(images);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: parsed }),
      });
      const data = await res.json();
      if (data.essence) {
        localStorage.setItem("droppi_essence", JSON.stringify(data.essence));
      }
      return data;
    };

    const minWait = new Promise((resolve) => setTimeout(resolve, 12000));

    Promise.all([analyze(), minWait]).then(() => {
      clearInterval(timer);
      router.push("/essence");
    }).catch((err) => {
      console.error("Analyze failed:", err);
      clearInterval(timer);
      router.push("/upload");
    });

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-5">
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm w-4">
              {i < currentStep ? (
                <span className="text-ink">✓</span>
              ) : i === currentStep ? (
                <span className="text-ink animate-pulse">◉</span>
              ) : (
                <span className="text-muted-light">○</span>
              )}
            </span>
            <span
              className={`text-base font-sans ${
                i <= currentStep ? "text-ink" : "text-muted-light"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
