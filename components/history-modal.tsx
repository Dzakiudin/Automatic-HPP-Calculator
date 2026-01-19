"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCalculations, getDerivedCalculations, deleteCalculation, deleteDerivedCalculation, formatRupiah } from "@/lib/store";
import type { HPPCalculation, DerivedProductCalculation } from "@/lib/types";
import { History, FileText, Recycle, Trash2, Package, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabValue = "standard" | "derived";

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const [calculations, setCalculations] = useState<HPPCalculation[]>([]);
  const [derivedCalculations, setDerivedCalculations] = useState<DerivedProductCalculation[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>("standard");

  useEffect(() => {
    if (open) {
      setCalculations(getCalculations());
      setDerivedCalculations(getDerivedCalculations());
    }
  }, [open]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteStandard = (id: string) => {
    deleteCalculation(id);
    setCalculations(getCalculations());
  };

  const handleDeleteDerived = (id: string) => {
    deleteDerivedCalculation(id);
    setDerivedCalculations(getDerivedCalculations());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-4 pt-4 pb-3 border-b">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-3" />
            <SheetTitle className="flex items-center gap-2 text-left">
              <History className="h-5 w-5 text-muted-foreground" />
              Riwayat Perhitungan
            </SheetTitle>
          </SheetHeader>

          {/* Tab Switcher */}
          <div className="px-4 py-3 border-b bg-muted/30">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("standard")}
                className={cn(
                  "flex-1 h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all",
                  activeTab === "standard"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border text-muted-foreground active:bg-muted"
                )}
              >
                <FileText className="h-4 w-4" />
                HPP Standar
              </button>
              <button
                onClick={() => setActiveTab("derived")}
                className={cn(
                  "flex-1 h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all",
                  activeTab === "derived"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border text-muted-foreground active:bg-muted"
                )}
              >
                <Recycle className="h-4 w-4" />
                Produk Turunan
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto pb-safe">
            {activeTab === "standard" ? (
              calculations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-center">
                    Belum ada riwayat perhitungan HPP standar.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {calculations.map((calc) => (
                    <div
                      key={calc.id}
                      className="bg-card rounded-2xl border overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{calc.productName}</h4>
                              <p className="text-xs text-muted-foreground truncate">{calc.category}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteStandard(calc.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-destructive active:bg-destructive/10 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center">
                          <div>
                            <span className="text-xs text-muted-foreground block">Variabel</span>
                            <p className="text-sm font-medium">{formatRupiah(calc.totalVariableCost)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">Tetap</span>
                            <p className="text-sm font-medium">{formatRupiah(calc.totalFixedCostAllocation)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">HPP</span>
                            <p className="text-sm font-bold text-primary">
                              {formatRupiah(calc.hppPerProduct)}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3 text-right">
                          {formatDate(calc.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : derivedCalculations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Recycle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  Belum ada riwayat perhitungan produk turunan.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {derivedCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="bg-card rounded-2xl border overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center flex-shrink-0">
                            <Recycle className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{calc.businessName}</h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {calc.rawMaterial.name} - {calc.rawMaterial.quantity} {calc.rawMaterial.unit}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDerived(calc.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-destructive active:bg-destructive/10 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-xs text-muted-foreground block">Biaya Prod.</span>
                          <p className="text-sm font-medium">{formatRupiah(calc.totalProductionCost)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Penjualan</span>
                          <p className="text-sm font-medium">{formatRupiah(calc.totalPotentialSales)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Proyeksi Laba</span>
                          <p className={cn(
                            "text-sm font-bold",
                            calc.projectedProfit >= 0 ? "text-primary" : "text-destructive"
                          )}>
                            {formatRupiah(calc.projectedProfit)}
                          </p>
                        </div>
                      </div>

                      {/* Product List */}
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Produk Turunan:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {calc.productHPPs.map((product, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-muted px-2 py-1 rounded-lg"
                            >
                              {product.productName}: {formatRupiah(product.hppPerUnit)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3 text-right">
                        {formatDate(calc.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
