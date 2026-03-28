"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getCalculations,
  getDerivedCalculations,
  deleteCalculation,
  deleteAllCalculations,
  deleteDerivedCalculation,
  deleteAllDerivedCalculations,
  formatRupiah,
} from "@/lib/store";
import type { HPPCalculation, DerivedProductCalculation } from "@/lib/types";
import { FileText, Recycle, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HistoryPage() {
  const [calculations, setCalculations] = useState<HPPCalculation[]>([]);
  const [derivedCalculations, setDerivedCalculations] = useState<DerivedProductCalculation[]>([]);

  const loadData = () => {
    setCalculations(getCalculations());
    setDerivedCalculations(getDerivedCalculations());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string) => {
    deleteCalculation(id);
    loadData();
  };

  const handleDeleteAll = () => {
    deleteAllCalculations();
    loadData();
  };

  const handleDeleteDerived = (id: string) => {
    deleteDerivedCalculation(id);
    loadData();
  };

  const handleDeleteAllDerived = () => {
    deleteAllDerivedCalculations();
    loadData();
  };

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Riwayat Perhitungan</h2>
        <p className="text-muted-foreground text-sm">Lihat kembali data HPP dan proyeksi profit Anda yang tersimpan.</p>
      </div>

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

        <TabsContent value="standard" className="mt-6 border-t pt-4">
          {calculations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
              Belum ada riwayat perhitungan HPP standar.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Semua
                </Button>
              </div>
              {calculations.map((calc, idx) => (
                <div key={`${calc.id}-${idx}`} className="bg-card rounded-xl border p-5 shadow-sm">
                  <div className="flex items-start justify-between border-b pb-3 mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{calc.productName}</h4>
                      <p className="text-xs text-muted-foreground bg-secondary/50 inline-block px-2 py-1 rounded mt-1">{calc.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(calc.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(calc.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Hapus
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mt-4 text-center">
                    <div className="bg-muted/30 p-2 rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">Total Variabel</span>
                      <p className="font-medium">{formatRupiah(calc.totalVariableCost)}</p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">Total Tetap</span>
                      <p className="font-medium">{formatRupiah(calc.totalFixedCostAllocation)}</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 p-2 rounded-lg">
                      <span className="text-xs text-primary/80 font-medium block mb-1">HPP per Produk</span>
                      <p className="font-bold text-primary text-base">
                        {formatRupiah(calc.hppPerProduct)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="derived" className="mt-6 border-t pt-4">
          {derivedCalculations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
              Belum ada riwayat perhitungan produk turunan.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAllDerived}
                  className="text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Semua
                </Button>
              </div>
              {derivedCalculations.map((calc, idx) => (
                <div key={`${calc.id}-${idx}`} className="bg-card rounded-xl border p-5 shadow-sm">
                  <div className="flex items-start justify-between border-b pb-3 mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{calc.businessName}</h4>
                      <p className="text-xs text-muted-foreground bg-secondary/50 inline-block px-2 py-1 rounded mt-1">
                        Bahan: {calc.rawMaterial.name} ({calc.rawMaterial.quantity} {calc.rawMaterial.unit})
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(calc.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDerived(calc.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Hapus
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-4 text-center">
                    <div className="bg-muted/30 p-2 rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">Biaya Produksi</span>
                      <p className="font-medium">{formatRupiah(calc.totalProductionCost)}</p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">Potensi Penjualan</span>
                      <p className="font-medium">{formatRupiah(calc.totalPotentialSales)}</p>
                    </div>
                    <div className={`p-2 rounded-lg border ${calc.projectedProfit >= 0 ? "bg-primary/5 border-primary/20 text-primary" : "bg-destructive/5 border-destructive/20 text-destructive"}`}>
                      <span className="text-xs font-medium block mb-1">Proyeksi Laba</span>
                      <p className="font-bold text-base">
                        {calc.projectedProfit >= 0 ? "+" : ""}{formatRupiah(calc.projectedProfit)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-dashed">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">Rincian HPP Produk Turunan:</p>
                    <div className="flex flex-col gap-2">
                      {calc.productHPPs.map((product, pIdx) => (
                        <div key={pIdx} className="flex justify-between items-center text-sm bg-muted/20 p-2 rounded border">
                          <span className="font-medium">{product.productName} <span className="text-muted-foreground font-normal">({product.quantity})</span></span>
                          <span className="font-bold">{formatRupiah(product.hppPerUnit)}/unit</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
