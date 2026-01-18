"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCalculations, getDerivedCalculations, formatRupiah } from "@/lib/store";
import type { HPPCalculation, DerivedProductCalculation } from "@/lib/types";
import { History, FileText, Recycle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const [calculations, setCalculations] = useState<HPPCalculation[]>([]);
  const [derivedCalculations, setDerivedCalculations] = useState<DerivedProductCalculation[]>([]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Riwayat Perhitungan
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="standard">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              HPP Standar
            </TabsTrigger>
            <TabsTrigger value="derived" className="flex items-center gap-1">
              <Recycle className="h-4 w-4" />
              Produk Turunan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="mt-4">
            {calculations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada riwayat perhitungan HPP standar.
              </div>
            ) : (
              <div className="space-y-3">
                {calculations.map((calc) => (
                  <div key={calc.id} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{calc.productName}</h4>
                        <p className="text-xs text-muted-foreground">{calc.category}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(calc.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Biaya Variabel</span>
                        <p className="font-medium">{formatRupiah(calc.totalVariableCost)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Biaya Tetap</span>
                        <p className="font-medium">{formatRupiah(calc.totalFixedCostAllocation)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">HPP</span>
                        <p className="font-semibold text-primary">
                          {formatRupiah(calc.hppPerProduct)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="derived" className="mt-4">
            {derivedCalculations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada riwayat perhitungan produk turunan.
              </div>
            ) : (
              <div className="space-y-3">
                {derivedCalculations.map((calc) => (
                  <div key={calc.id} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{calc.businessName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {calc.rawMaterial.name} - {calc.rawMaterial.quantity} {calc.rawMaterial.unit}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(calc.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Biaya Produksi</span>
                        <p className="font-medium">{formatRupiah(calc.totalProductionCost)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Potensi Penjualan</span>
                        <p className="font-medium">{formatRupiah(calc.totalPotentialSales)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Proyeksi Laba</span>
                        <p className={`font-semibold ${calc.projectedProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                          {formatRupiah(calc.projectedProfit)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Produk Turunan:</p>
                      <div className="flex flex-wrap gap-2">
                        {calc.productHPPs.map((product, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-card px-2 py-1 rounded border"
                          >
                            {product.productName}: {formatRupiah(product.hppPerUnit)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
