"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bookmark, User } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Sembunyikan navigasi bawah saat berada di halaman nonton video
  if (pathname?.startsWith("/watch")) {
    return null;
  }

  const navItems = [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Untukmu", href: "/for-you", icon: Compass },
    { label: "Daftar Saya", href: "/my-list", icon: Bookmark },
    { label: "Akun", href: "/account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                isActive
                  ? "text-primary font-semibold scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
