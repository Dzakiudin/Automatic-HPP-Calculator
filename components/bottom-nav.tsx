"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calculator, Recycle, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Beranda",
    href: "/",
    icon: Home,
  },
  {
    title: "Standar",
    href: "/standard",
    icon: Calculator,
  },
  {
    title: "Turunan",
    href: "/derived",
    icon: Recycle,
  },
  {
    title: "Riwayat",
    href: "/history",
    icon: History,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t pb-safe">
      <div className="flex items-center justify-around h-16 container mx-auto px-2 max-w-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "fill-primary/20")}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
