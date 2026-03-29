"use client";

import { useState, useRef } from "react";

interface InputAreaProps {
  onDrop: (content: string, type: string) => void;
  compact?: boolean;
}

export function InputArea({ onDrop, compact }: InputAreaProps) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (imagePreview) {
      onDrop(imagePreview, "image");
      setImagePreview(null);
    } else if (text.trim()) {
      const isLink = /^https?:\/\//.test(text.trim());
      onDrop(text.trim(), isLink ? "link" : "text");
    }
    setText("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleSTT = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("이 브라우저에서는 음성 입력을 지원하지 않아요.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => prev + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    setIsListening(true);
    recognition.start();
  };

  return (
    <div>
      {imagePreview && (
        <div className="relative mb-3">
          <img src={imagePreview} alt="" className="w-full max-h-48 object-cover rounded-lg" />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-ink/60 text-canvas rounded-full flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 bg-[#FAF9F7] rounded-lg px-4 py-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={compact ? "메시지 입력..." : "요즘 저장만 해둔 글 있어요?"}
          rows={1}
          className="flex-1 bg-transparent resize-none text-sm font-sans text-ink placeholder:text-muted-light focus:outline-none"
          style={{ maxHeight: "120px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 120) + "px";
          }}
        />
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => fileRef.current?.click()} className="text-ink opacity-60">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </button>
          <button
            onClick={toggleSTT}
            className={`${isListening ? "text-accent" : "text-ink opacity-60"}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() && !imagePreview}
            className={`text-sm font-medium ${text.trim() || imagePreview ? "text-ink" : "text-muted-light"}`}
          >
            drop
          </button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}
