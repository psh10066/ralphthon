import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Droppi",
  description: "drop + I. 뭐든 떨어뜨리면 쌓이고, 쌓이면 내가 보인다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <main className="pb-16">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
