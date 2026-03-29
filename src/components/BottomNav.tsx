"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/home", label: "홈" },
  { href: "/sessions", label: "세션" },
  { href: "/profile", label: "프로필" },
];

export function BottomNav() {
  const pathname = usePathname();

  const hiddenPaths = ["/", "/upload", "/loading-analyze", "/essence"];
  if (hiddenPaths.includes(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-structure-line bg-canvas z-50">
      <div className="flex justify-around py-3">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-sm font-sans ${
                isActive ? "text-ink font-medium" : "text-muted"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
