"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calculator,
  LayoutDashboard,
  Recycle,
  History,
  Settings,
  ChevronLeft,
  Bell,
  User,
} from "lucide-react";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: ReactNode;
  hideNavBar?: boolean;
}

const navItems = [
  { href: "/", icon: Calculator, label: "HPP" },
  { href: "/derived", icon: Recycle, label: "Turunan" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Keuangan" },
  { href: "/history", icon: History, label: "Riwayat" },
  { href: "/settings", icon: Settings, label: "Pengaturan" },
];

export function MobileLayout({
  children,
  title = "Kalkulator HPP",
  showBack = false,
  backHref = "/",
  rightAction,
  hideNavBar = false,
}: MobileLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Status Bar Spacer - for mobile feel */}
      <div className="h-safe-top bg-card" />

      {/* App Header */}
      <header className="sticky top-0 z-50 bg-card border-b safe-padding-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            {showBack ? (
              <Link
                href={backHref}
                className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full active:bg-muted transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </Link>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <h1 className="text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {rightAction || (
              <>
                <button className="w-10 h-10 flex items-center justify-center rounded-full active:bg-muted transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full active:bg-muted transition-colors">
                  <User className="h-5 w-5 text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">{children}</main>

      {/* Bottom Navigation */}
      {!hideNavBar && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t safe-padding-bottom z-50">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground active:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-7 rounded-full flex items-center justify-center transition-colors",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5")} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

// Mobile Card Component for consistent styling
export function MobileCard({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl mx-4 p-4 shadow-sm border transition-all",
        onClick && "active:scale-[0.98] cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile Section Header
export function MobileSectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      {action}
    </div>
  );
}

// Mobile List Item
export function MobileListItem({
  icon,
  title,
  subtitle,
  value,
  valueColor = "text-foreground",
  onClick,
  trailing,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  valueColor?: string;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 py-3 px-4",
        onClick && "active:bg-muted/50 cursor-pointer transition-colors"
      )}
    >
      {icon && (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      {value && (
        <span className={cn("font-semibold text-sm", valueColor)}>{value}</span>
      )}
      {trailing}
    </div>
  );
}

// Floating Action Button
export function FloatingActionButton({
  icon,
  onClick,
  label,
}: {
  icon: ReactNode;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center gap-2 px-5 active:scale-95 transition-transform"
    >
      {icon}
      {label && <span className="font-medium text-sm">{label}</span>}
    </button>
  );
}
