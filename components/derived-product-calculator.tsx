"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatRupiah, saveDerivedCalculation } from "@/lib/store";
import type { ProcessingCost, DerivedProduct, DerivedProductCalculation } from "@/lib/types";
import { Plus, X, FileText, Lightbulb, Save, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DerivedProductCalculatorProps {
  onAIAssist: (context: string) => Promise<{ processingCosts: ProcessingCost[]; products: DerivedProduct[] } | null>;
}

export function DerivedProductCalculator({ onAIAssist }: DerivedProductCalculatorProps) {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [batchesPerMonth, setBatchesPerMonth] = useState(1);
  const [rawMaterial, setRawMaterial] = useState({
    name: "",
    totalCost: 0,
    quantity: 0,
    unit: "kg",
  });
  const [processingCosts, setProcessingCosts] = useState<ProcessingCost[]>([
    { id: crypto.randomUUID(), name: "", amount: 0, period: "per-batch" },
  ]);
  const [derivedProducts, setDerivedProducts] = useState<DerivedProduct[]>([
    { id: crypto.randomUUID(), name: "", quantity: 0, unit: "kg", sellingPrice: 0 },
  ]);
  const [result, setResult] = useState<DerivedProductCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const addProcessingCost = () => {
    setProcessingCosts([
      ...processingCosts,
      { id: crypto.randomUUID(), name: "", amount: 0, period: "per-batch" },
    ]);
  };

  const updateProcessingCost = (id: string, field: keyof ProcessingCost, value: string | number) => {
    setProcessingCosts(
      processingCosts.map((cost) =>
        cost.id === id ? { ...cost, [field]: value } : cost
      )
    );
  };

  const removeProcessingCost = (id: string) => {
    if (processingCosts.length > 1) {
      setProcessingCosts(processingCosts.filter((cost) => cost.id !== id));
    }
  };

  const addDerivedProduct = () => {
    setDerivedProducts([
      ...derivedProducts,
      { id: crypto.randomUUID(), name: "", quantity: 0, unit: "kg", sellingPrice: 0 },
    ]);
  };

  const updateDerivedProduct = (id: string, field: keyof DerivedProduct, value: string | number) => {
    setDerivedProducts(
      derivedProducts.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  const removeDerivedProduct = (id: string) => {
    if (derivedProducts.length > 1) {
      setDerivedProducts(derivedProducts.filter((product) => product.id !== id));
    }
  };

  const handleAIAssist = async () => {
    if (!rawMaterial.name) {
      toast({
        title: "Error",
        description: "Masukkan nama bahan baku utama terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsAILoading(true);
    try {
      const suggestions = await onAIAssist(rawMaterial.name);
      if (suggestions) {
        setProcessingCosts(suggestions.processingCosts);
        setDerivedProducts(suggestions.products);
        toast({
          title: "Berhasil",
          description: "AI telah mengisi saran biaya dan produk turunan",
        });
      }
    } finally {
      setIsAILoading(false);
    }
  };

  const calculateHPP = () => {
    setIsLoading(true);

    setTimeout(() => {
      // Calculate total processing costs
      const totalProcessingPerBatch = processingCosts.reduce((sum, cost) => {
        if (cost.period === "per-batch") {
          return sum + cost.amount;
        }
        return sum;
      }, 0);

      // Calculate per-unit processing costs
      const totalDerivedQuantity = derivedProducts.reduce((sum, p) => sum + p.quantity, 0);
      const totalPerUnitCosts = processingCosts.reduce((sum, cost) => {
        if (cost.period === "per-unit") {
          return sum + (cost.amount * totalDerivedQuantity);
        }
        return sum;
      }, 0);

      // Total production cost per batch
      const totalProductionCost = rawMaterial.totalCost + totalProcessingPerBatch + totalPerUnitCosts;

      // Calculate total potential sales
      const totalPotentialSales = derivedProducts.reduce(
        (sum, product) => sum + product.quantity * product.sellingPrice,
        0
      );

      // Calculate HPP allocation based on selling price proportion
      const productHPPs = derivedProducts.map((product) => {
        const productRevenue = product.quantity * product.sellingPrice;
        const revenueShare = totalPotentialSales > 0 ? productRevenue / totalPotentialSales : 0;
        const costAllocation = totalProductionCost * revenueShare;
        const hppPerUnit = product.quantity > 0 ? costAllocation / product.quantity : 0;

        return {
          productName: product.name,
          quantity: product.quantity,
          costAllocation,
          allocationPercentage: revenueShare * 100,
          hppPerUnit,
        };
      });

      const projectedProfit = totalPotentialSales - totalProductionCost;

      const calculation: DerivedProductCalculation = {
        id: crypto.randomUUID(),
        businessName,
        batchesPerMonth,
        rawMaterial,
        processingCosts,
        derivedProducts,
        totalProductionCost,
        totalPotentialSales,
        projectedProfit,
        productHPPs,
        createdAt: new Date(),
      };

      setResult(calculation);
      setIsLoading(false);
    }, 500);
  };

  const handleSave = () => {
    if (result) {
      saveDerivedCalculation(result);
      toast({
        title: "Tersimpan",
        description: "Perhitungan berhasil disimpan ke riwayat",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="bg-card rounded-xl border shadow-sm p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Input Data</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAIAssist}
            disabled={isAILoading || !rawMaterial.name}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            {isAILoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1" />
                Memproses...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Bantu Isi dengan AI
              </>
            )}
          </Button>
        </div>

        {/* Business Name */}
        <div className="space-y-2">
          <Label>Nama Bisnis / Produk Utama</Label>
          <Input
            placeholder="Pengolahan Kelapa"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Ini akan jadi acuan utama untuk saran dari AI.
          </p>
        </div>

        {/* Batches per Month */}
        <div className="space-y-2">
          <Label>Jumlah Batch Produksi per Bulan</Label>
          <Input
            type="number"
            value={batchesPerMonth || ""}
            onChange={(e) => setBatchesPerMonth(Number(e.target.value))}
            min={1}
          />
          <p className="text-xs text-muted-foreground">
            Digunakan untuk mengalokasikan biaya bulanan ke setiap batch produksi.
          </p>
        </div>

        {/* Raw Material */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Bahan Baku Utama</h3>
            <p className="text-xs text-muted-foreground">
              Input bahan baku utama yang akan diolah.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input
              placeholder="Kelapa Utuh"
              value={rawMaterial.name}
              onChange={(e) => setRawMaterial({ ...rawMaterial, name: e.target.value })}
              className="sm:col-span-1"
            />
            <Input
              type="number"
              placeholder="15.000.000"
              value={rawMaterial.totalCost || ""}
              onChange={(e) =>
                setRawMaterial({ ...rawMaterial, totalCost: Number(e.target.value) })
              }
            />
            <Input
              type="number"
              placeholder="1000"
              value={rawMaterial.quantity || ""}
              onChange={(e) =>
                setRawMaterial({ ...rawMaterial, quantity: Number(e.target.value) })
              }
            />
            <Select
              value={rawMaterial.unit}
              onValueChange={(value) => setRawMaterial({ ...rawMaterial, unit: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="liter">liter</SelectItem>
                <SelectItem value="pcs">pcs</SelectItem>
                <SelectItem value="gram">gram</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Processing Costs */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Biaya Pengolahan</h3>
            <p className="text-xs text-muted-foreground">
              Biaya tambahan untuk mengolah bahan baku (listrik, tenaga kerja, dll).
            </p>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr,1fr,1fr,32px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Nama Biaya</span>
              <span>Harga</span>
              <span>Periode</span>
              <span className="w-8"></span>
            </div>
            {processingCosts.map((cost) => (
              <div key={cost.id} className="flex items-center gap-2">
                <Input
                  placeholder="Upah Tenaga Pengupasan"
                  value={cost.name}
                  onChange={(e) => updateProcessingCost(cost.id, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="150.000"
                  value={cost.amount || ""}
                  onChange={(e) => updateProcessingCost(cost.id, "amount", Number(e.target.value))}
                  className="flex-1"
                />
                <Select
                  value={cost.period}
                  onValueChange={(value) =>
                    updateProcessingCost(cost.id, "period", value as "per-batch" | "per-unit")
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-batch">Per Batch</SelectItem>
                    <SelectItem value="per-unit">Per Unit</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProcessingCost(cost.id)}
                  disabled={processingCosts.length === 1}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addProcessingCost}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah Biaya
          </Button>
        </div>

        {/* Derived Products */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Produk Turunan</h3>
            <p className="text-xs text-muted-foreground">
              Input produk jadi dan harga jualnya. Alokasi biaya akan dihitung otomatis.
            </p>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[1.5fr,0.8fr,0.6fr,1fr,32px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Nama Produk Jadi</span>
              <span>Qty</span>
              <span>Satuan</span>
              <span>Harga Jual / Satuan</span>
              <span className="w-8"></span>
            </div>
            {derivedProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-2">
                <Input
                  placeholder="Santan Kelapa"
                  value={product.name}
                  onChange={(e) => updateDerivedProduct(product.id, "name", e.target.value)}
                  className="flex-[1.5]"
                />
                <Input
                  type="number"
                  placeholder="300"
                  value={product.quantity || ""}
                  onChange={(e) =>
                    updateDerivedProduct(product.id, "quantity", Number(e.target.value))
                  }
                  className="flex-[0.8]"
                />
                <Select
                  value={product.unit}
                  onValueChange={(value) => updateDerivedProduct(product.id, "unit", value)}
                >
                  <SelectTrigger className="flex-[0.6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="liter">liter</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                    <SelectItem value="gram">gram</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="20.000"
                  value={product.sellingPrice || ""}
                  onChange={(e) =>
                    updateDerivedProduct(product.id, "sellingPrice", Number(e.target.value))
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDerivedProduct(product.id)}
                  disabled={derivedProducts.length === 1}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addDerivedProduct}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah Produk
          </Button>
        </div>

        {/* Calculate Button */}
        <div className="sticky bottom-16 z-40 bg-card/80 backdrop-blur-sm -mx-6 px-6 pb-6 pt-2 lg:static lg:bg-transparent lg:p-0 lg:m-0">
          <Button
            onClick={calculateHPP}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg lg:shadow-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Menghitung...
              </>
            ) : (
              "Hitung HPP"
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Hasil Perhitungan</h2>

        {!result && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Isi data bahan baku dan produk turunan, lalu klik &quot;Hitung HPP&quot;.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Menghitung HPP...</p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Ringkasan Biaya & Proyeksi Laba per Batch</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Biaya Produksi</span>
                  <span>{formatRupiah(result.totalProductionCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Potensi Penjualan</span>
                  <span>{formatRupiah(result.totalPotentialSales)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span className={result.projectedProfit >= 0 ? "text-primary" : "text-destructive"}>
                    Proyeksi Laba / (Rugi)
                  </span>
                  <span className={result.projectedProfit >= 0 ? "text-primary" : "text-destructive"}>
                    {formatRupiah(result.projectedProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Analysis */}
            <div className={cn(
              "rounded-lg p-4",
              result.projectedProfit >= 0 ? "bg-primary/10" : "bg-destructive/10"
            )}>
              <div className="flex items-start gap-2">
                <Lightbulb className={cn(
                  "h-5 w-5 mt-0.5",
                  result.projectedProfit >= 0 ? "text-primary" : "text-destructive"
                )} />
                <div>
                  <h4 className="text-sm font-semibold">Analisis Cepat</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.projectedProfit >= 0
                      ? "Selamat! Berdasarkan harga jual saat ini, model bisnis Anda berpotensi menghasilkan keuntungan. Lanjutkan dengan strategi harga yang tepat untuk memaksimalkan profit."
                      : "Perhatian! Berdasarkan harga jual saat ini, model bisnis Anda berpotensi merugi. Pertimbangkan untuk menaikkan harga jual atau menekan biaya produksi."}
                  </p>
                </div>
              </div>
            </div>

            {/* Detail Accordions */}
            <Accordion type="single" collapsible>
              <AccordionItem value="cost-detail">
                <AccordionTrigger className="hover:no-underline py-2">
                  <span className="text-sm font-semibold">Detail Rincian Biaya per Batch</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bahan Baku ({result.rawMaterial.name})</span>
                      <span>{formatRupiah(result.rawMaterial.totalCost)}</span>
                    </div>
                    {result.processingCosts.map((cost, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-muted-foreground">{cost.name}</span>
                        <span>{formatRupiah(cost.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-border font-semibold">
                      <span>Total</span>
                      <span>{formatRupiah(result.totalProductionCost)}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="hpp-detail">
                <AccordionTrigger className="hover:no-underline py-2">
                  <span className="text-sm font-semibold">Detail HPP per Produk Turunan</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground border-b">
                          <th className="text-left py-2 font-medium">Nama Produk</th>
                          <th className="text-right py-2 font-medium">Qty</th>
                          <th className="text-right py-2 font-medium">Alokasi Biaya</th>
                          <th className="text-right py-2 font-medium">HPP per Satuan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.productHPPs.map((product, idx) => (
                          <tr key={idx} className="border-b border-border/50">
                            <td className="py-2">{product.productName}</td>
                            <td className="py-2 text-right">
                              {product.quantity} {result.derivedProducts[idx]?.unit}
                            </td>
                            <td className="py-2 text-right">
                              {formatRupiah(product.costAllocation)} ({product.allocationPercentage.toFixed(1)}%)
                            </td>
                            <td className="py-2 text-right font-semibold text-primary">
                              {formatRupiah(product.hppPerUnit)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Save Button */}
            <Button
              onClick={handleSave}
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
