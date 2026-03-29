"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (images.length >= 5) return;
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setLoading(true);
    localStorage.setItem("droppi_images", JSON.stringify(images));
    router.push("/loading-analyze");
  };

  return (
    <div className="px-5 pt-12 pb-20 min-h-dvh">
      <p className="text-lg font-sans text-ink mb-1">끌리는 사진을 골라주세요.</p>
      <p className="text-sm font-sans text-muted mb-8">예쁠 필요 없어요.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`relative aspect-square rounded-lg border border-structure-line overflow-hidden ${i === 4 ? "col-span-1" : ""}`}>
            {images[i] ? (
              <>
                <img src={images[i]} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 w-6 h-6 bg-ink/60 text-canvas rounded-full flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </>
            ) : (
              <label className="w-full h-full flex items-center justify-center cursor-pointer">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#C4C0BC" strokeWidth="1.5">
                  <line x1="20" y1="12" x2="20" y2="28" />
                  <line x1="12" y1="20" x2="28" y2="20" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={images.length >= 5}
                />
              </label>
            )}
          </div>
        ))}
        <div className="flex items-center justify-center text-sm text-muted">
          {images.length}/5
        </div>
      </div>

      {images.length > 0 && (
        <p className="text-sm text-muted mb-4 text-center">
          {images.length === 5
            ? "다 골랐으면, 읽어볼게요."
            : "사진 더 보내면 더 깊게 읽을 수 있어요."}
        </p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={images.length === 0 || loading}
        className={`w-full py-3 text-base font-sans rounded-lg border border-structure-line transition-colors ${
          images.length > 0
            ? "text-ink bg-canvas"
            : "text-muted-light bg-canvas cursor-not-allowed"
        }`}
      >
        {loading ? "..." : "읽기 시작"}
      </button>
    </div>
  );
}
