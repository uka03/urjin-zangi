"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/lib/layout/sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = pathname === "/files/upload";

  if (isFullScreen) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen gap-10">
      <Sidebar />
      <div className="flex-10 p-8">{children}</div>
    </div>
  );
}
