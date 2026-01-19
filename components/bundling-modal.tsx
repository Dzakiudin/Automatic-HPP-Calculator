"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/store";
import type { BundleProduct, BundleRecommendation } from "@/lib/types";
import { Plus, X, ArrowLeft, Package, Sparkles, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BundlingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateRecommendation: (products: BundleProduct[]) => Promise<BundleRecommendation | null>;
}

export function BundlingModal({ open, onOpenChange, onGenerateRecommendation }: BundlingModalProps) {
  const [products, setProducts] = useState<BundleProduct[]>([
    { id: crypto.randomUUID(), name: "", normalPrice: 0, hpp: 0 },
  ]);
  const [recommendation, setRecommendation] = useState<BundleRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const addProduct = () => {
    setProducts([...products, { id: crypto.randomUUID(), name: "", normalPrice: 0, hpp: 0 }]);
  };

  const updateProduct = (id: string, field: keyof BundleProduct, value: string | number) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await onGenerateRecommendation(products);
      if (result) {
        setRecommendation(result);
        setShowResults(true);
        setSelectedTier("balanced");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const totalHPP = products.reduce((sum, p) => sum + p.hpp, 0);
  const totalNormalPrice = products.reduce((sum, p) => sum + p.normalPrice, 0);

  const handleBack = () => {
    setShowResults(false);
    setRecommendation(null);
  };

  const tiers = recommendation
    ? [
        { key: "economy", label: "Paket Hemat", data: recommendation.economyPack, color: "text-blue-600", bgColor: "bg-blue-50" },
        { key: "balanced", label: "Seimbang", data: recommendation.balancedPack, color: "text-primary", bgColor: "bg-primary/5" },
        { key: "profit", label: "Profit Max", data: recommendation.profitMaxPack, color: "text-amber-600", bgColor: "bg-amber-50" },
      ]
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-4 pt-4 pb-3 border-b">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-3" />
            <SheetTitle className="text-left flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Bundling Cerdas
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-auto">
            {!showResults ? (
              <div className="p-4 space-y-4">
                {/* Products List */}
                <div className="bg-card rounded-2xl border overflow-hidden">
                  <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-semibold">Produk dalam Bundling</h3>
                  </div>
                  <div className="divide-y">
                    {products.map((product, index) => (
                      <div key={product.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Nama produk"
                              value={product.name}
                              onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                              className="h-10 rounded-lg"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                  Harga
                                </span>
                                <Input
                                  type="number"
                                  placeholder="Harga normal"
                                  value={product.normalPrice || ""}
                                  onChange={(e) => updateProduct(product.id, "normalPrice", Number(e.target.value))}
                                  className="h-10 rounded-lg pl-12"
                                />
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                  HPP
                                </span>
                                <Input
                                  type="number"
                                  placeholder="HPP"
                                  value={product.hpp || ""}
                                  onChange={(e) => updateProduct(product.id, "hpp", Number(e.target.value))}
                                  className="h-10 rounded-lg pl-10"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeProduct(product.id)}
                            disabled={products.length === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-destructive active:bg-destructive/10 disabled:opacity-30"
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

                {/* Summary */}
                <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total HPP:</span>
                    <span className="font-semibold text-primary">{formatRupiah(totalHPP)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Harga Normal:</span>
                    <span className="font-semibold">{formatRupiah(totalNormalPrice)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground active:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </button>

                {/* Bundle Summary */}
                <div className="bg-muted/50 rounded-2xl p-4">
                  <h4 className="font-semibold mb-3">Rincian Paket</h4>
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <div>
                          <span>{product.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            HPP: {formatRupiah(product.hpp)}
                          </span>
                        </div>
                        <span>{formatRupiah(product.normalPrice)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t space-y-1">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total HPP:</span>
                        <span className="text-primary">{formatRupiah(totalHPP)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Normal:</span>
                        <span>{formatRupiah(totalNormalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Saran Harga Bundling</h4>
                  </div>
                  <div className="space-y-3">
                    {tiers.map(({ key, label, data, color, bgColor }) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTier(key)}
                        className={cn(
                          "w-full bg-card rounded-2xl border-2 p-4 text-left transition-all",
                          selectedTier === key
                            ? "border-primary shadow-sm"
                            : "border-border active:scale-[0.99]"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1", bgColor, color)}>
                              {label}
                            </span>
                            <p className={cn("text-2xl font-bold", color)}>
                              {formatRupiah(data.price)}
                            </p>
                            <p className="text-xs text-muted-foreground line-through">
                              {formatRupiah(totalNormalPrice)}
                            </p>
                          </div>
                          {selectedTier === key && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Diskon</p>
                            <p className="text-sm font-medium text-destructive">{formatRupiah(data.discount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Profit</p>
                            <p className="text-sm font-medium text-primary">{formatRupiah(data.profit)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Margin</p>
                            <p className="text-sm font-medium">{data.margin.toFixed(1)}%</p>
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
            )}
          </div>

          {/* Bottom Action */}
          {!showResults && (
            <div className="p-4 border-t safe-padding-bottom">
              <button
                onClick={handleGenerate}
                disabled={isLoading || products.some((p) => !p.name || p.normalPrice <= 0 || p.hpp <= 0)}
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Dapatkan Saran AI
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
