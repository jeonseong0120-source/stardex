import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STARDEX — YouTuber Pack Vol. 1",
  description: "좋아하는 크리에이터의 장면을 수집하는 디지털 카드 컬렉션.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
