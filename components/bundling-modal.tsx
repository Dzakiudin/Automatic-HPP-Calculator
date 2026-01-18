"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/store";
import type { BundleProduct, BundleRecommendation } from "@/lib/types";
import { Plus, X, ArrowLeft, Package, Sparkles } from "lucide-react";
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
        { key: "economy", label: "Paket Hemat", data: recommendation.economyPack, color: "text-blue-600" },
        { key: "balanced", label: "Paling Seimbang", data: recommendation.balancedPack, color: "text-primary" },
        { key: "profit", label: "Profit Maksimal", data: recommendation.profitMaxPack, color: "text-amber-600" },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Buat Harga Bundling Cerdas
          </DialogTitle>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={product.id} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <Input
                    placeholder="Nama Produk"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Harga Normal"
                    value={product.normalPrice || ""}
                    onChange={(e) => updateProduct(product.id, "normalPrice", Number(e.target.value))}
                    className="w-32"
                  />
                  <Input
                    type="number"
                    placeholder="HPP"
                    value={product.hpp || ""}
                    onChange={(e) => updateProduct(product.id, "hpp", Number(e.target.value))}
                    className="w-28"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProduct(product.id)}
                    disabled={products.length === 1}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
              onClick={addProduct}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Produk
            </Button>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HPP Gabungan:</span>
                <span className="font-semibold text-primary">{formatRupiah(totalHPP)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Harga Jual Normal:</span>
                <span className="font-semibold">{formatRupiah(totalNormalPrice)}</span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || products.some((p) => !p.name || p.normalPrice <= 0 || p.hpp <= 0)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Dapatkan Saran Harga Bundling dari AI
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>

            {/* Bundle Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-center">Rincian Paket Bundling</h4>
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
                <div className="pt-2 border-t border-border space-y-1">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total HPP Gabungan:</span>
                    <span className="text-primary">{formatRupiah(totalHPP)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total Harga Jual Normal:</span>
                    <span>{formatRupiah(totalNormalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <h4 className="font-semibold mb-3 text-center flex items-center justify-center gap-2">
                Saran Harga Bundling dari AI
                <Sparkles className="h-4 w-4 text-primary" />
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {tiers.map(({ key, label, data, color }) => (
                  <div key={key} className="bg-card rounded-lg border p-4">
                    <div className="text-center mb-3">
                      <span className="text-sm font-medium text-muted-foreground">{label}</span>
                      <p className={cn("text-xl font-bold", color)}>{formatRupiah(data.price)}</p>
                      <p className="text-xs text-muted-foreground line-through">
                        {formatRupiah(totalNormalPrice)}
                      </p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Diskon:</span>
                        <span className="text-destructive">{formatRupiah(data.discount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit:</span>
                        <span className="text-primary font-medium">{formatRupiah(data.profit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Margin:</span>
                        <span className="font-medium">{data.margin.toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground italic">
                      &quot;{data.description}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
