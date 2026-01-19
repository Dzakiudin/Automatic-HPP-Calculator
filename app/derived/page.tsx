"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { MobileLayout } from "@/components/mobile-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/store";
import type { ProcessingCost, DerivedProduct } from "@/lib/types";
import {
  Sparkles,
  Plus,
  X,
  Loader2,
  Calculator,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const defaultProcessingCosts: ProcessingCost[] = [
  { id: crypto.randomUUID(), name: "Biaya Pengolahan", amount: 0, period: "per-batch" },
];

const defaultProducts: DerivedProduct[] = [
  { id: crypto.randomUUID(), name: "", quantity: 0, unit: "kg", sellingPrice: 0 },
];

export default function DerivedProductPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [batchesPerMonth, setBatchesPerMonth] = useState(1);
  const [rawMaterialName, setRawMaterialName] = useState("");
  const [rawMaterialCost, setRawMaterialCost] = useState(0);
  const [rawMaterialQty, setRawMaterialQty] = useState(0);
  const [rawMaterialUnit, setRawMaterialUnit] = useState("kg");
  const [processingCosts, setProcessingCosts] = useState<ProcessingCost[]>(defaultProcessingCosts);
  const [products, setProducts] = useState<DerivedProduct[]>(defaultProducts);

  // UI state
  const [showProcessing, setShowProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Results
  const [results, setResults] = useState<{
    totalProductionCost: number;
    totalPotentialSales: number;
    projectedProfit: number;
    productHPPs: {
      productName: string;
      quantity: number;
      costAllocation: number;
      allocationPercentage: number;
      hppPerUnit: number;
    }[];
  } | null>(null);

  const handleAIAssist = async () => {
    if (!rawMaterialName) {
      toast({
        title: "Masukkan bahan baku",
        description: "Nama bahan baku diperlukan untuk saran AI",
        variant: "destructive",
      });
      return;
    }

    setIsAILoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "derived-product-suggestions",
          data: { rawMaterial: rawMaterialName },
        }),
      });

      if (response.ok) {
        const suggestions = await response.json();
        if (suggestions.processingCosts) {
          setProcessingCosts(suggestions.processingCosts);
        }
        if (suggestions.products) {
          setProducts(suggestions.products);
        }
        toast({
          title: "Berhasil",
          description: "AI telah mengisi saran produk turunan",
        });
      }
    } catch (error) {
      console.error("AI assist error:", error);
      toast({
        title: "Error",
        description: "Gagal mendapatkan saran AI",
        variant: "destructive",
      });
    } finally {
      setIsAILoading(false);
    }
  };

  const calculateHPP = () => {
    if (!rawMaterialName || products.length === 0) {
      toast({
        title: "Data tidak lengkap",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Calculate total production cost
      const totalProcessingCost = processingCosts.reduce((sum, cost) => {
        return sum + (cost.period === "per-batch" ? cost.amount : cost.amount * batchesPerMonth);
      }, 0);
      const totalProductionCost = rawMaterialCost + totalProcessingCost;

      // Calculate total potential sales
      const totalPotentialSales = products.reduce(
        (sum, p) => sum + p.quantity * p.sellingPrice,
        0
      );

      // Calculate HPP for each product using value-based allocation
      const totalSellingValue = products.reduce(
        (sum, p) => sum + p.quantity * p.sellingPrice,
        0
      );

      const productHPPs = products.map((product) => {
        const productValue = product.quantity * product.sellingPrice;
        const allocationPercentage = totalSellingValue > 0 
          ? (productValue / totalSellingValue) * 100 
          : 0;
        const costAllocation = (allocationPercentage / 100) * totalProductionCost;
        const hppPerUnit = product.quantity > 0 ? costAllocation / product.quantity : 0;

        return {
          productName: product.name,
          quantity: product.quantity,
          costAllocation,
          allocationPercentage,
          hppPerUnit,
        };
      });

      const projectedProfit = totalPotentialSales - totalProductionCost;

      setResults({
        totalProductionCost,
        totalPotentialSales,
        projectedProfit,
        productHPPs,
      });

      setShowResults(true);
      setIsLoading(false);
    }, 500);
  };

  const addProcessingCost = () => {
    setProcessingCosts([
      ...processingCosts,
      { id: crypto.randomUUID(), name: "", amount: 0, period: "per-batch" },
    ]);
  };

  const removeProcessingCost = (id: string) => {
    if (processingCosts.length > 1) {
      setProcessingCosts(processingCosts.filter((c) => c.id !== id));
    }
  };

  const addProduct = () => {
    setProducts([
      ...products,
      { id: crypto.randomUUID(), name: "", quantity: 0, unit: "kg", sellingPrice: 0 },
    ]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Produk Turunan">
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
    <MobileLayout title="Produk Turunan">
      <div className="p-4 space-y-4 pb-24">
        {/* Info Card */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Kalkulator Produk Turunan
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Untuk bahan baku yang diolah menjadi beberapa produk berbeda. 
                Contoh: Kelapa menjadi santan, daging parut, minyak VCO.
              </p>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-card rounded-2xl border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Info Bisnis</h3>
            <button
              onClick={handleAIAssist}
              disabled={isAILoading}
              className="h-8 px-3 bg-primary/10 text-primary rounded-full flex items-center gap-1.5 text-sm font-medium active:bg-primary/20 disabled:opacity-50"
            >
              {isAILoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              AI Assist
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Bisnis</label>
              <Input
                placeholder="Contoh: Pengolahan Kelapa"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch Produksi / Bulan</label>
              <Input
                type="number"
                value={batchesPerMonth}
                onChange={(e) => setBatchesPerMonth(Number(e.target.value))}
                className="h-11 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Raw Material */}
        <div className="bg-card rounded-2xl border p-4 space-y-4">
          <h3 className="font-semibold">Bahan Baku Utama</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Nama Bahan</label>
              <Input
                placeholder="Contoh: Kelapa Utuh"
                value={rawMaterialName}
                onChange={(e) => setRawMaterialName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Harga Total</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  value={rawMaterialCost || ""}
                  onChange={(e) => setRawMaterialCost(Number(e.target.value))}
                  className="h-11 rounded-xl pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jumlah</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={rawMaterialQty || ""}
                  onChange={(e) => setRawMaterialQty(Number(e.target.value))}
                  className="h-11 rounded-xl flex-1"
                />
                <Select value={rawMaterialUnit} onValueChange={setRawMaterialUnit}>
                  <SelectTrigger className="w-20 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Costs (Collapsible) */}
        <div className="bg-card rounded-2xl border overflow-hidden">
          <button
            onClick={() => setShowProcessing(!showProcessing)}
            className="w-full p-4 flex items-center justify-between active:bg-muted/50"
          >
            <div className="text-left">
              <h3 className="font-semibold">Biaya Pengolahan</h3>
              <p className="text-xs text-muted-foreground">Tenaga kerja, mesin, dll</p>
            </div>
            {showProcessing ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showProcessing && (
            <>
              <div className="divide-y border-t">
                {processingCosts.map((cost, index) => (
                  <div key={cost.id} className="p-4 flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Nama biaya"
                        value={cost.name}
                        onChange={(e) => {
                          const updated = [...processingCosts];
                          updated[index].name = e.target.value;
                          setProcessingCosts(updated);
                        }}
                        className="h-10 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            type="number"
                            value={cost.amount || ""}
                            onChange={(e) => {
                              const updated = [...processingCosts];
                              updated[index].amount = Number(e.target.value);
                              setProcessingCosts(updated);
                            }}
                            className="h-10 rounded-lg pl-9"
                          />
                        </div>
                        <Select
                          value={cost.period}
                          onValueChange={(v) => {
                            const updated = [...processingCosts];
                            updated[index].period = v as "per-batch" | "per-bulan";
                            setProcessingCosts(updated);
                          }}
                        >
                          <SelectTrigger className="w-28 h-10 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="per-batch">Per Batch</SelectItem>
                            <SelectItem value="per-bulan">Per Bulan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <button
                      onClick={() => removeProcessingCost(cost.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-destructive active:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addProcessingCost}
                className="w-full p-4 flex items-center justify-center gap-2 text-primary font-medium active:bg-primary/5 border-t"
              >
                <Plus className="h-4 w-4" />
                Tambah Biaya
              </button>
            </>
          )}
        </div>

        {/* Derived Products */}
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold">Produk Turunan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Produk jadi hasil pengolahan
            </p>
          </div>
          <div className="divide-y">
            {products.map((product, index) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Nama produk"
                      value={product.name}
                      onChange={(e) => {
                        const updated = [...products];
                        updated[index].name = e.target.value;
                        setProducts(updated);
                      }}
                      className="h-10 rounded-lg"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={product.quantity || ""}
                        onChange={(e) => {
                          const updated = [...products];
                          updated[index].quantity = Number(e.target.value);
                          setProducts(updated);
                        }}
                        className="h-10 rounded-lg"
                      />
                      <Select
                        value={product.unit}
                        onValueChange={(v) => {
                          const updated = [...products];
                          updated[index].unit = v;
                          setProducts(updated);
                        }}
                      >
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="pcs">pcs</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          Rp
                        </span>
                        <Input
                          type="number"
                          placeholder="Harga"
                          value={product.sellingPrice || ""}
                          onChange={(e) => {
                            const updated = [...products];
                            updated[index].sellingPrice = Number(e.target.value);
                            setProducts(updated);
                          }}
                          className="h-10 rounded-lg pl-7"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-destructive active:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addProduct}
            className="w-full p-4 flex items-center justify-center gap-2 text-primary font-medium active:bg-primary/5 border-t"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t p-4 safe-padding-bottom">
        <button
          onClick={calculateHPP}
          disabled={isLoading || !rawMaterialName}
          className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Menghitung...
            </>
          ) : (
            <>
              <Calculator className="h-5 w-5" />
              Hitung HPP
            </>
          )}
        </button>
      </div>

      {/* Results Sheet */}
      <Sheet open={showResults} onOpenChange={setShowResults}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pt-4 pb-3 border-b">
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-3" />
              <SheetTitle className="text-left">Hasil Perhitungan</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {results && (
                <>
                  {/* Summary */}
                  <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Biaya Produksi</span>
                      <span className="font-semibold">{formatRupiah(results.totalProductionCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Potensi Penjualan</span>
                      <span className="font-semibold">{formatRupiah(results.totalPotentialSales)}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-primary">Proyeksi Laba</span>
                      <span className={cn(
                        "text-xl font-bold",
                        results.projectedProfit >= 0 ? "text-primary" : "text-destructive"
                      )}>
                        {formatRupiah(results.projectedProfit)}
                      </span>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className={cn(
                    "rounded-2xl p-4",
                    results.projectedProfit >= 0 
                      ? "bg-primary/5 border border-primary/20" 
                      : "bg-destructive/5 border border-destructive/20"
                  )}>
                    <div className="flex items-start gap-3">
                      <Lightbulb className={cn(
                        "h-5 w-5 flex-shrink-0",
                        results.projectedProfit >= 0 ? "text-primary" : "text-destructive"
                      )} />
                      <div>
                        <p className="font-semibold text-sm">Analisis Cepat</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {results.projectedProfit >= 0
                            ? "Model bisnis Anda berpotensi menghasilkan keuntungan. Lanjutkan dengan strategi harga yang tepat."
                            : "Perlu penyesuaian harga atau efisiensi biaya untuk mencapai profitabilitas."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product HPPs */}
                  <div className="bg-card rounded-2xl border overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-semibold">HPP per Produk Turunan</h3>
                    </div>
                    <div className="divide-y">
                      {results.productHPPs.map((item) => (
                        <div key={item.productName} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} unit | Alokasi {item.allocationPercentage.toFixed(1)}%
                              </p>
                            </div>
                            <span className="text-primary font-bold">
                              {formatRupiah(item.hppPerUnit)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Total alokasi: {formatRupiah(item.costAllocation)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
