"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const prevKey = useRef(`${pathname}|${searchParams.toString()}`);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const key = `${pathname}|${searchParams.toString()}`;
    if (key !== prevKey.current) {
      prevKey.current = key;
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setShow(false), 350);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto")) return;
      clearTimeout(hideTimer.current);
      setShow(true);
    };
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      clearTimeout(hideTimer.current);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 overflow-hidden">
      <div
        className="absolute top-0 h-full nav-progress-sweep"
        style={{
          background: "linear-gradient(90deg, transparent, #8B7CFB, #C084FC, transparent)",
          boxShadow: "0 0 12px rgba(139,124,251,0.9)",
        }}
      />
    </div>
  );
}

export default function NavigationProgress() {
  return (
    <Suspense>
      <ProgressInner />
    </Suspense>
  );
}
