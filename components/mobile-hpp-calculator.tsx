"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { formatRupiah, saveCalculation } from "@/lib/store";
import type {
  BusinessMode,
  VariableCost,
  FixedCost,
  HPPCalculation,
  PriceRecommendation,
  BundleProduct,
  BundleRecommendation,
} from "@/lib/types";
import {
  ChevronLeft,
  Sparkles,
  Plus,
  X,
  Check,
  Package,
  History,
  Save,
  Calculator,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BundlingModal } from "./bundling-modal";
import { HistoryModal } from "./history-modal";

const categories = [
  "Makanan & Minuman",
  "Fashion & Aksesoris",
  "Elektronik",
  "Kecantikan & Perawatan",
  "Rumah Tangga",
  "Kerajinan & Handmade",
  "Pertanian & Perkebunan",
  "Jasa & Layanan",
  "Lainnya",
];

const defaultVariableCosts: VariableCost[] = [
  { id: crypto.randomUUID(), name: "Bahan Baku Utama", amount: 0 },
];

const defaultFixedCosts: FixedCost[] = [
  { id: crypto.randomUUID(), name: "Sewa Tempat", monthlyAmount: 0, allocationPerProduct: 0 },
  { id: crypto.randomUUID(), name: "Gaji Karyawan", monthlyAmount: 0, allocationPerProduct: 0 },
];

interface MobileHPPCalculatorProps {
  businessMode: BusinessMode;
  onBack: () => void;
}

export function MobileHPPCalculator({
  businessMode,
  onBack,
}: MobileHPPCalculatorProps) {
  const { toast } = useToast();

  // Form state
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Makanan & Minuman");
  const [variableCosts, setVariableCosts] = useState<VariableCost[]>(defaultVariableCosts);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(defaultFixedCosts);
  const [targetSales, setTargetSales] = useState(100);

  // UI state
  const [showFixedCosts, setShowFixedCosts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Result state
  const [calculation, setCalculation] = useState<HPPCalculation | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<PriceRecommendation | null>(null);
  const [selectedPrice, setSelectedPrice] = useState(0);

  // Modal state
  const [bundlingOpen, setBundlingOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleAIAssist = async () => {
    if (!productName) {
      toast({
        title: "Masukkan nama produk",
        description: "Nama produk diperlukan untuk saran AI",
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
          action: "ai-assist-input",
          data: { productName, category, businessMode },
        }),
      });

      if (response.ok) {
        const suggestions = await response.json();
        setVariableCosts(suggestions.variableCosts);
        setFixedCosts(suggestions.fixedCosts);
        if (suggestions.suggestedTargetSales) {
          setTargetSales(suggestions.suggestedTargetSales);
        }
        toast({
          title: "Berhasil",
          description: "AI telah mengisi komponen biaya",
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

  const calculateHPP = async () => {
    if (!productName) {
      toast({
        title: "Masukkan nama produk",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const totalVariableCost = variableCosts.reduce(
        (sum, cost) => sum + (cost.amount || 0),
        0
      );
      const totalFixedCostAllocation = fixedCosts.reduce(
        (sum, cost) =>
          sum + (cost.allocationPerProduct || Math.ceil((cost.monthlyAmount || 0) / targetSales)),
        0
      );
      const hppPerProduct = totalVariableCost + totalFixedCostAllocation;

      const calc: HPPCalculation = {
        id: crypto.randomUUID(),
        productName,
        category,
        businessMode,
        calculationMode: "biaya-satuan",
        variableCosts,
        fixedCosts,
        targetSalesPerMonth: targetSales,
        totalVariableCost,
        totalFixedCostAllocation,
        hppPerProduct,
        createdAt: new Date(),
      };

      setCalculation(calc);
      setShowResults(true);
      setIsLoading(false);

      // Get AI recommendations
      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "price-recommendations",
            data: {
              productName,
              category,
              hpp: hppPerProduct,
              businessMode,
            },
          }),
        });

        if (response.ok) {
          const recommendations = await response.json();
          setAiRecommendations(recommendations);
          setSelectedPrice(recommendations.standard.price);
        }
      } catch (error) {
        console.error("AI recommendations error:", error);
      }
    }, 500);
  };

  const handleSave = () => {
    if (calculation) {
      saveCalculation({
        ...calculation,
        aiRecommendations: aiRecommendations || undefined,
      });
      toast({
        title: "Tersimpan",
        description: "Perhitungan disimpan ke riwayat",
      });
    }
  };

  const addVariableCost = () => {
    setVariableCosts([
      ...variableCosts,
      { id: crypto.randomUUID(), name: "", amount: 0 },
    ]);
  };

  const removeVariableCost = (id: string) => {
    if (variableCosts.length > 1) {
      setVariableCosts(variableCosts.filter((c) => c.id !== id));
    }
  };

  const addFixedCost = () => {
    setFixedCosts([
      ...fixedCosts,
      { id: crypto.randomUUID(), name: "", monthlyAmount: 0, allocationPerProduct: 0 },
    ]);
  };

  const removeFixedCost = (id: string) => {
    if (fixedCosts.length > 1) {
      setFixedCosts(fixedCosts.filter((c) => c.id !== id));
    }
  };

  const handleBundleRecommendation = async (
    products: BundleProduct[]
  ): Promise<BundleRecommendation | null> => {
    try {
      const totalHPP = products.reduce((sum, p) => sum + p.hpp, 0);
      const totalNormalPrice = products.reduce((sum, p) => sum + p.normalPrice, 0);

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bundle-recommendations",
          data: { products, totalHPP, totalNormalPrice },
        }),
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Bundle recommendation error:", error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full active:bg-muted"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold">Hitung HPP</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHistoryOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full active:bg-muted"
            >
              <History className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={handleAIAssist}
              disabled={isAILoading}
              className="h-9 px-3 bg-primary/10 text-primary rounded-full flex items-center gap-1.5 text-sm font-medium active:bg-primary/20 disabled:opacity-50"
            >
              {isAILoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Assist
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24">
        {/* Product Info */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nama Produk
            </label>
            <Input
              placeholder="Contoh: Kopi Susu Gula Aren"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="h-12 rounded-xl text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Kategori
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Variable Costs */}
        <div className="px-4 pb-4">
          <div className="bg-card rounded-2xl border overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-foreground">Biaya Variabel</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Biaya untuk membuat 1 produk
              </p>
            </div>
            <div className="divide-y">
              {variableCosts.map((cost, index) => (
                <div key={cost.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Nama biaya"
                      value={cost.name}
                      onChange={(e) => {
                        const updated = [...variableCosts];
                        updated[index].name = e.target.value;
                        setVariableCosts(updated);
                      }}
                      className="h-10 rounded-lg text-sm"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        Rp
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={cost.amount || ""}
                        onChange={(e) => {
                          const updated = [...variableCosts];
                          updated[index].amount = Number(e.target.value);
                          setVariableCosts(updated);
                        }}
                        className="h-10 rounded-lg text-sm pl-10"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeVariableCost(cost.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-destructive active:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addVariableCost}
              className="w-full p-4 flex items-center justify-center gap-2 text-primary font-medium active:bg-primary/5"
            >
              <Plus className="h-4 w-4" />
              Tambah Biaya
            </button>
          </div>
        </div>

        {/* Target Sales */}
        <div className="px-4 pb-4">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">
                  Target Penjualan / Bulan
                </label>
                <Input
                  type="number"
                  value={targetSales}
                  onChange={(e) => setTargetSales(Number(e.target.value))}
                  className="h-10 rounded-lg mt-2 bg-card"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Untuk menghitung alokasi biaya tetap per produk
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Costs (Collapsible) */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowFixedCosts(!showFixedCosts)}
            className="w-full bg-card rounded-2xl border p-4 flex items-center justify-between active:bg-muted/50"
          >
            <div className="text-left">
              <h3 className="font-semibold text-foreground">Biaya Tetap</h3>
              <p className="text-xs text-muted-foreground">
                Sewa, gaji, listrik, dll
              </p>
            </div>
            {showFixedCosts ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showFixedCosts && (
            <div className="mt-3 bg-card rounded-2xl border overflow-hidden">
              <div className="divide-y">
                {fixedCosts.map((cost, index) => (
                  <div key={cost.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Nama biaya"
                          value={cost.name}
                          onChange={(e) => {
                            const updated = [...fixedCosts];
                            updated[index].name = e.target.value;
                            setFixedCosts(updated);
                          }}
                          className="h-10 rounded-lg text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              /bln
                            </span>
                            <Input
                              type="number"
                              placeholder="Biaya bulanan"
                              value={cost.monthlyAmount || ""}
                              onChange={(e) => {
                                const updated = [...fixedCosts];
                                updated[index].monthlyAmount = Number(e.target.value);
                                setFixedCosts(updated);
                              }}
                              className="h-10 rounded-lg text-sm pl-10"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Alokasi"
                              value={cost.allocationPerProduct || ""}
                              onChange={(e) => {
                                const updated = [...fixedCosts];
                                updated[index].allocationPerProduct = Number(e.target.value);
                                setFixedCosts(updated);
                              }}
                              className="h-10 rounded-lg text-sm"
                            />
                            {cost.monthlyAmount > 0 && targetSales > 0 && (
                              <p className="text-xs text-primary mt-1">
                                Saran: Rp {Math.ceil(cost.monthlyAmount / targetSales).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFixedCost(cost.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-destructive active:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addFixedCost}
                className="w-full p-4 flex items-center justify-center gap-2 text-primary font-medium active:bg-primary/5 border-t"
              >
                <Plus className="h-4 w-4" />
                Tambah Biaya Tetap
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 safe-padding-bottom">
        <button
          onClick={calculateHPP}
          disabled={isLoading || !productName}
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
              Hitung HPP & Saran Harga
            </>
          )}
        </button>
      </div>

      {/* Results Sheet */}
      <Sheet open={showResults} onOpenChange={setShowResults}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pt-4 pb-3 border-b">
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-3" />
              <SheetTitle className="text-left">Hasil Perhitungan</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {calculation && (
                <>
                  {/* HPP Summary */}
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {calculation.productName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Biaya Variabel
                        </span>
                        <span className="font-medium">
                          {formatRupiah(calculation.totalVariableCost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Alokasi Biaya Tetap
                        </span>
                        <span className="font-medium">
                          {formatRupiah(calculation.totalFixedCostAllocation)}
                        </span>
                      </div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-primary">
                          Total HPP per Produk
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {formatRupiah(calculation.hppPerProduct)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  {aiRecommendations && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">Saran Harga Jual AI</h3>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: "competitive", label: "Kompetitif", data: aiRecommendations.competitive, color: "text-blue-600" },
                          { key: "standard", label: "Standar", data: aiRecommendations.standard, color: "text-primary" },
                          { key: "premium", label: "Premium", data: aiRecommendations.premium, color: "text-amber-600" },
                        ].map(({ key, label, data, color }) => (
                          <button
                            key={key}
                            onClick={() => setSelectedPrice(data.price)}
                            className={cn(
                              "p-3 rounded-xl border-2 text-center transition-all",
                              selectedPrice === data.price
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card active:scale-[0.98]"
                            )}
                          >
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              {label}
                            </p>
                            <p className={cn("text-lg font-bold", color)}>
                              {formatRupiah(data.price)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Margin {data.margin.toFixed(0)}%
                            </p>
                            {selectedPrice === data.price && (
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center mx-auto mt-2">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {selectedPrice > 0 && (
                        <div className="bg-muted/50 rounded-xl p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Profit per produk</span>
                            <span className="font-semibold text-primary">
                              {formatRupiah(selectedPrice - calculation.hppPerProduct)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setBundlingOpen(true)}
                      className="h-12 bg-muted rounded-xl flex items-center justify-center gap-2 font-medium active:scale-[0.98]"
                    >
                      <Package className="h-4 w-4" />
                      Bundling
                    </button>
                    <button
                      onClick={handleSave}
                      className="h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 font-medium active:scale-[0.98]"
                    >
                      <Save className="h-4 w-4" />
                      Simpan
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modals */}
      <BundlingModal
        open={bundlingOpen}
        onOpenChange={setBundlingOpen}
        onGenerateRecommendation={handleBundleRecommendation}
      />
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}
