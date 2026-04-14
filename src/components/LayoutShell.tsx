"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

// Bu sayfalar sidebar/topnav olmadan render edilir
const AUTH_PATHS = ["/login"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Login sayfası: sidebar/topnav yok, doğrudan render
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Mobil overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} />

      <div className="md:ml-64 transition-[margin] duration-300">
        {children}
      </div>
    </>
  );
}
