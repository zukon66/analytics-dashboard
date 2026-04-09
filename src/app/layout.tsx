import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KÖK-OS Analytics Dashboard",
  description: "Real-time restaurant analytics powered by Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.className} min-h-full bg-[#f8f9fa]`}>
        <Sidebar />
        <TopNav />
        {children}
      </body>
    </html>
  );
}
