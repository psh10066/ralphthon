"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-5">
      <div className="text-center" style={{ marginTop: "-10vh" }}>
        <h1 className="font-serif text-4xl font-medium text-ink mb-8">
          Droppi
        </h1>
        <p className="text-base font-sans text-muted mb-12">
          사진을 드롭해 보세요.
        </p>
        <Link
          href="/upload"
          className="text-base font-sans text-ink underline underline-offset-4"
        >
          drop
        </Link>
      </div>
    </div>
  );
}
