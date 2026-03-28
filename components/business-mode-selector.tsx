"use client";

import React from "react"

import { cn } from "@/lib/utils";
import type { BusinessMode } from "@/lib/types";
import { Truck, ShoppingCart, ChefHat, Factory, Recycle, Briefcase } from "lucide-react";

interface BusinessModeSelectorProps {
  value: BusinessMode;
  onChange: (mode: BusinessMode) => void;
}

const modes: { id: BusinessMode; label: string; icon: React.ElementType }[] = [
  { id: "iklan-cod", label: "Iklan & COD", icon: Truck },
  { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
  { id: "ritel-fnb", label: "Bisnis Ritel/F&B", icon: ChefHat },
  { id: "manufaktur", label: "Manufaktur / Pabrik", icon: Factory },
  { id: "produksi-turunan", label: "Produksi Turunan", icon: Recycle },
  { id: "jasa", label: "Produk Jasa", icon: Briefcase },
];

export function BusinessModeSelector({ value, onChange }: BusinessModeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Pilih Mode Bisnis</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = value === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isSelected && "text-primary")} />
              <span className={cn("text-xs font-medium text-center", isSelected && "text-primary")}>
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
