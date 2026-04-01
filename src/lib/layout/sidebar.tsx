"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  LayoutDashboard,
  MSquare,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

type SidebarBtnProps = {
  label: string;
  icon: React.ReactNode;
  href: string;
  active: boolean;
};

const items = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Box },
  { label: "Darts score", href: "/darts-score", icon: MSquare },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Users", href: "/users", icon: Users },
  { label: "Other", href: "/other", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex-2 bg-white border-r-2 p-10">
      <Link href="/" className="flex items-center mb-10">
        <Image src="/log.jpg" alt="Logo" width={80} height={80} />
        <div className="text-2xl text-black font-black">
          <h4>Urjin</h4>
          <h4>Zangi</h4>
        </div>
      </Link>

      <ul className="space-y-2">
        {items.map((item) => (
          <SidebarBtn
            key={item.href}
            label={item.label}
            icon={<item.icon />}
            href={item.href}
            active={isActive(pathname, item.href)}
          />
        ))}
      </ul>
    </div>
  );
}

export function SidebarBtn({ label, icon, href, active }: SidebarBtnProps) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"}`}
      >
        {icon}
        {label}
      </Link>
    </li>
  );
}
