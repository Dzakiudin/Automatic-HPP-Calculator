"use client";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/store";
import type { PriceRecommendation } from "@/lib/types";
import { Sparkles, Check } from "lucide-react";

interface PriceRecommendationsProps {
  productName: string;
  recommendations: PriceRecommendation;
  onSelectPrice: (price: number) => void;
  selectedPrice?: number;
}

export function PriceRecommendations({
  productName,
  recommendations,
  onSelectPrice,
  selectedPrice,
}: PriceRecommendationsProps) {
  const tiers = [
    { key: "competitive", label: "Kompetitif", data: recommendations.competitive, color: "text-blue-600", bgColor: "bg-blue-50" },
    { key: "standard", label: "Standar", data: recommendations.standard, color: "text-primary", bgColor: "bg-primary/5" },
    { key: "premium", label: "Premium", data: recommendations.premium, color: "text-amber-600", bgColor: "bg-amber-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Saran untuk: <span className="font-medium text-foreground">{productName}</span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tiers.map(({ key, label, data, color, bgColor }) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelectPrice(data.price)}
              className={cn(
                "relative bg-card rounded-xl p-4 text-left border-2 transition-all hover:shadow-lg group",
                selectedPrice === data.price
                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
            >
              {selectedPrice === data.price && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
              
              <div className="text-center mb-4">
                <span className={cn(
                  "inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2",
                  bgColor, color
                )}>
                  {label}
                </span>
                <p className={cn("text-2xl font-bold", color)}>
                  {formatRupiah(data.price)}
                </p>
              </div>
              
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Profit:</span>
                  <span className="font-semibold text-primary">{formatRupiah(data.profit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Margin:</span>
                  <span className="font-semibold">{data.margin.toFixed(1)}%</span>
                </div>
              </div>
              
              <p className="mt-4 text-xs text-muted-foreground italic leading-relaxed">
                &quot;{data.description}&quot;
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
