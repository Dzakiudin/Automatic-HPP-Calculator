"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/store";
import type { HPPCalculation, PriceRecommendation } from "@/lib/types";
import { PriceRecommendations } from "./price-recommendations";
import { FileText, Package, History, Save, ChefHat } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ResultsPanelProps {
  calculation: HPPCalculation | null;
  isLoading: boolean;
  aiRecommendations: PriceRecommendation | null;
  isLoadingAI: boolean;
  selectedPrice: number;
  targetProfit: string;
  onSelectPrice: (price: number) => void;
  onTargetProfitChange: (value: string) => void;
  onSave: () => void;
  onOpenBundling: () => void;
  onOpenHistory: () => void;
}

export function ResultsPanel({
  calculation,
  isLoading,
  aiRecommendations,
  isLoadingAI,
  selectedPrice,
  targetProfit,
  onSelectPrice,
  onTargetProfitChange,
  onSave,
  onOpenBundling,
  onOpenHistory,
}: ResultsPanelProps) {
  const calculateUnitsNeeded = () => {
    if (!selectedPrice || !targetProfit) return 0;
    const profit = Number(targetProfit);
    const hpp = calculation?.hppPerProduct || 0;
    const profitPerUnit = selectedPrice - hpp;
    if (profitPerUnit <= 0) return 0;
    return Math.ceil(profit / profitPerUnit);
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Hasil Perhitungan</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenBundling}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Package className="h-4 w-4 mr-1" />
            Bundling Cerdas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="text-muted-foreground hover:text-foreground"
          >
            <History className="h-4 w-4 mr-1" />
            Riwayat
          </Button>
        </div>
      </div>

      <div className="p-4">
        {!calculation && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ChefHat className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Isi detail produk dan komponen biaya, lalu klik &quot;Hitung HPP&quot;.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Menghitung HPP...</p>
          </div>
        ) : calculation ? (
          <div className="space-y-6">
            {/* HPP Breakdown */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Rincian HPP per Produk</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Biaya Variabel</span>
                  <span>{formatRupiah(calculation.totalVariableCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alokasi Biaya Tetap</span>
                  <span>{formatRupiah(calculation.totalFixedCostAllocation)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span className="text-primary">Total HPP per Produk</span>
                  <span className="text-primary">{formatRupiah(calculation.hppPerProduct)}</span>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {isLoadingAI ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground">AI sedang menganalisis harga...</p>
              </div>
            ) : aiRecommendations ? (
              <Accordion type="single" collapsible defaultValue="price-rec">
                <AccordionItem value="price-rec" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      Saran Harga Jual
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <PriceRecommendations
                      productName={calculation.productName}
                      recommendations={aiRecommendations}
                      onSelectPrice={onSelectPrice}
                      selectedPrice={selectedPrice}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : null}

            {/* Target & Projection */}
            <Accordion type="single" collapsible defaultValue="target">
              <AccordionItem value="target" className="border-none">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Target & Proyeksi Penjualan
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Target Laba Bersih / Bulan</Label>
                      <Input
                        type="number"
                        placeholder="Contoh: 10.000.000"
                        value={targetProfit}
                        onChange={(e) => onTargetProfitChange(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Harga Jual Pilihan (Rp)</Label>
                      <Input
                        type="number"
                        value={selectedPrice || ""}
                        onChange={(e) => onSelectPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  {targetProfit && selectedPrice > 0 && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-foreground">
                        Untuk mencapai target laba{" "}
                        <span className="font-semibold">{formatRupiah(Number(targetProfit))}</span>{" "}
                        per bulan, Anda perlu menjual sekitar{" "}
                        <span className="font-semibold text-primary">{calculateUnitsNeeded()} unit</span>{" "}
                        produk.
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Save Button */}
            <Button
              onClick={onSave}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan Perhitungan
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
