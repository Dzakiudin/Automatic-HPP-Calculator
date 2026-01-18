"use client";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/store";
import type { PriceRecommendation } from "@/lib/types";
import { Sparkles } from "lucide-react";

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
    { key: "competitive", label: "Kompetitif", data: recommendations.competitive, color: "text-blue-600" },
    { key: "standard", label: "Standar", data: recommendations.standard, color: "text-primary" },
    { key: "premium", label: "Premium", data: recommendations.premium, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Saran Harga Jual</h3>
        <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          <Sparkles className="h-3 w-3" />
          Didukung oleh AI
        </span>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Saran untuk: <span className="font-medium text-foreground">{productName}</span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map(({ key, label, data, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelectPrice(data.price)}
              className={cn(
                "bg-card rounded-lg p-4 text-left border-2 transition-all hover:shadow-md",
                selectedPrice === data.price
                  ? "border-primary shadow-md"
                  : "border-transparent"
              )}
            >
              <div className="text-center mb-3">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <p className={cn("text-2xl font-bold", color)}>
                  {formatRupiah(data.price)}
                </p>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profit:</span>
                  <span className="font-medium text-primary">{formatRupiah(data.profit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin:</span>
                  <span className="font-medium">{data.margin.toFixed(1)}%</span>
                </div>
              </div>
              
              <p className="mt-3 text-xs text-muted-foreground italic">
                &quot;{data.description}&quot;
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
