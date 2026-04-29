import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "普拉提新手计划 | BetterMe",
  description: "1分钟测评 · 获取您的专属普拉提计划",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
