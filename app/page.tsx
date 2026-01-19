"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import React from "react";
import { useState } from "react";
import { MobileLayout, MobileCard, MobileSectionHeader } from "@/components/mobile-layout";
import { MobileHPPCalculator } from "@/components/mobile-hpp-calculator";
import { cn } from "@/lib/utils";
import {
  Truck,
  ShoppingBag,
  ChefHat,
  Factory,
  Recycle,
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Package,
  Target,
} from "lucide-react";
import type { BusinessMode } from "@/lib/types";

const businessModes: {
  value: BusinessMode;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  { value: "iklan-cod", label: "Iklan & COD", icon: Truck, description: "Produk dengan pengiriman" },
  { value: "marketplace", label: "Marketplace", icon: ShoppingBag, description: "Jualan di e-commerce" },
  { value: "ritel-fnb", label: "Ritel/F&B", icon: ChefHat, description: "Makanan & Minuman" },
  { value: "manufaktur", label: "Manufaktur", icon: Factory, description: "Produksi pabrik" },
  { value: "turunan", label: "Produk Turunan", icon: Recycle, description: "Multi-produk" },
  { value: "jasa", label: "Produk Jasa", icon: Briefcase, description: "Layanan & jasa" },
];

const features = [
  {
    icon: Target,
    title: "Mode Fleksibel",
    description: "Batch atau satuan",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Sparkles,
    title: "Saran AI",
    description: "Harga optimal",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Package,
    title: "Bundling",
    description: "Paket cerdas",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: TrendingUp,
    title: "Proyeksi",
    description: "Estimasi profit",
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<BusinessMode>("ritel-fnb");
  const [showCalculator, setShowCalculator] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <MobileLayout title="Kalkulator HPP">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (showCalculator) {
    return (
      <MobileHPPCalculator
        businessMode={selectedMode}
        onBack={() => setShowCalculator(false)}
      />
    );
  }

  return (
    <MobileLayout title="Kalkulator HPP">
      {/* Hero Section */}
      <div className="px-4 pt-4 pb-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">Asisten Bisnis Cerdas</h2>
              <p className="text-sm text-primary-foreground/80 leading-relaxed">
                Hitung HPP akurat dan dapatkan strategi harga jual dari AI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Features */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-3 text-center border"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2",
                  feature.color
                )}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-foreground truncate">
                {feature.title}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Business Mode Selection */}
      <MobileSectionHeader title="Pilih Mode Bisnis" />
      <div className="px-4 space-y-3 pb-6">
        {businessModes.map((mode) => {
          const isSelected = selectedMode === mode.value;
          return (
            <button
              key={mode.value}
              onClick={() => setSelectedMode(mode.value)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card active:scale-[0.98]"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <mode.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-semibold",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {mode.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {mode.description}
                </p>
              </div>
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                )}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Start Button */}
      <div className="px-4 pb-8">
        <button
          onClick={() => setShowCalculator(true)}
          className="w-full bg-primary text-primary-foreground rounded-2xl p-4 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-primary/25"
        >
          Mulai Hitung HPP
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </MobileLayout>
  );
}
