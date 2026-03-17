"use client";

import { DerivedProductCalculator } from "@/components/derived-product-calculator";
import { useState } from "react";
import type { ProcessingCost, DerivedProduct } from "@/lib/types";
import { SettingsModal } from "@/components/settings-modal";

export default function DerivedCalculatorPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleDerivedAIAssist = async (
    rawMaterial: string
  ): Promise<{ processingCosts: ProcessingCost[]; products: DerivedProduct[] } | null> => {
    try {
      const { getDerivedProductSuggestionsClient } = await import("@/lib/ai-client");
      return await getDerivedProductSuggestionsClient(rawMaterial);
    } catch (error: any) {
      console.error("AI assist error:", error);
      if (error?.message === "MISSING_API_KEY") {
        setSettingsOpen(true);
      }
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">HPP Produk Turunan</h2>
        <p className="text-muted-foreground text-sm">Hitung joint costs untuk satu bahan baku yang menghasilkan banyak produk.</p>
      </div>
      
      <DerivedProductCalculator onAIAssist={handleDerivedAIAssist} />
      
      {/* Settings Modal fallback if AI requires API key on this page */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
