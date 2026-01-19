"use client";

import React from "react"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { MobileLayout, MobileSectionHeader } from "@/components/mobile-layout";
import { formatRupiah, getCalculations, deleteCalculation } from "@/lib/store";
import type { HPPCalculation } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Calculator,
  Trash2,
  ChevronRight,
  Package,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [calculations, setCalculations] = useState<HPPCalculation[]>([]);
  const [selectedCalc, setSelectedCalc] = useState<HPPCalculation | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setCalculations(getCalculations());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCalculation(id);
    setCalculations(getCalculations());
    toast({ title: "Perhitungan dihapus" });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const groupByDate = (items: HPPCalculation[]) => {
    const groups: Map<string, HPPCalculation[]> = new Map();
    items.forEach((item) => {
      const dateKey = formatDate(item.createdAt);
      const existing = groups.get(dateKey) || [];
      existing.push(item);
      groups.set(dateKey, existing);
    });
    return Array.from(groups.entries());
  };

  const grouped = groupByDate(calculations);

  if (loading) {
    return (
      <MobileLayout title="Riwayat Perhitungan">
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

  return (
    <MobileLayout title="Riwayat Perhitungan">
      {calculations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calculator className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Belum Ada Riwayat</h3>
          <p className="text-sm text-muted-foreground">
            Perhitungan HPP yang disimpan akan muncul di sini
          </p>
        </div>
      ) : (
        <div className="pb-20 space-y-4">
          {grouped.map(([dateGroup, items]) => (
            <div key={dateGroup}>
              <MobileSectionHeader title={dateGroup} />
              <div className="px-4">
                <div className="bg-card rounded-2xl border overflow-hidden divide-y">
                  {items.map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => setSelectedCalc(calc)}
                      className="w-full flex items-center gap-3 p-4 text-left active:bg-muted/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{calc.productName}</p>
                        <p className="text-xs text-muted-foreground">{calc.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatRupiah(calc.hppPerProduct)}
                        </p>
                        {calc.aiRecommendations && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            <Sparkles className="h-2.5 w-2.5" />
                            AI
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedCalc} onOpenChange={(open) => !open && setSelectedCalc(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pt-4 pb-3 border-b">
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-3" />
              <SheetTitle className="text-left">Detail Perhitungan</SheetTitle>
            </SheetHeader>

            {selectedCalc && (
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Product Info */}
                <div className="bg-muted/50 rounded-2xl p-4">
                  <h3 className="font-semibold text-lg">{selectedCalc.productName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCalc.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(selectedCalc.createdAt)}
                  </p>
                </div>

                {/* HPP Summary */}
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Biaya Variabel</span>
                    <span className="font-medium">
                      {formatRupiah(selectedCalc.totalVariableCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Biaya Tetap (Alokasi)</span>
                    <span className="font-medium">
                      {formatRupiah(selectedCalc.totalFixedCostAllocation)}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-primary">HPP per Produk</span>
                    <span className="text-xl font-bold text-primary">
                      {formatRupiah(selectedCalc.hppPerProduct)}
                    </span>
                  </div>
                </div>

                {/* Variable Costs Detail */}
                <div className="bg-card rounded-2xl border overflow-hidden">
                  <div className="p-3 border-b bg-muted/30">
                    <h4 className="text-sm font-semibold">Rincian Biaya Variabel</h4>
                  </div>
                  <div className="divide-y">
                    {selectedCalc.variableCosts.map((cost) => (
                      <div key={cost.id} className="flex justify-between p-3">
                        <span className="text-sm">{cost.name}</span>
                        <span className="text-sm font-medium">{formatRupiah(cost.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Costs Detail */}
                <div className="bg-card rounded-2xl border overflow-hidden">
                  <div className="p-3 border-b bg-muted/30">
                    <h4 className="text-sm font-semibold">Rincian Biaya Tetap</h4>
                  </div>
                  <div className="divide-y">
                    {selectedCalc.fixedCosts.map((cost) => (
                      <div key={cost.id} className="p-3">
                        <div className="flex justify-between">
                          <span className="text-sm">{cost.name}</span>
                          <span className="text-sm font-medium">
                            {formatRupiah(cost.allocationPerProduct || Math.ceil(cost.monthlyAmount / selectedCalc.targetSalesPerMonth))}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatRupiah(cost.monthlyAmount)} / bulan
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                {selectedCalc.aiRecommendations && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Saran Harga AI</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "competitive", label: "Kompetitif", data: selectedCalc.aiRecommendations.competitive, color: "text-blue-600" },
                        { key: "standard", label: "Standar", data: selectedCalc.aiRecommendations.standard, color: "text-primary" },
                        { key: "premium", label: "Premium", data: selectedCalc.aiRecommendations.premium, color: "text-amber-600" },
                      ].map(({ key, label, data, color }) => (
                        <div key={key} className="bg-card rounded-xl p-3 border text-center">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className={cn("font-bold", color)}>{formatRupiah(data.price)}</p>
                          <p className="text-xs text-muted-foreground">
                            {data.margin.toFixed(0)}% margin
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    handleDelete(selectedCalc.id, e);
                    setSelectedCalc(null);
                  }}
                  className="w-full h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center gap-2 font-medium active:bg-destructive/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Perhitungan
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
