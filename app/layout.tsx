import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "天気コンパス｜複数予報を一目で比較",
  description: "気象庁・Apple Weather・OpenWeatherを比較し、各地の天気を総合判断する天気予報サイト。",
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
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
