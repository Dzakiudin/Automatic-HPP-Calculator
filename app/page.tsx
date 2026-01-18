"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainCalculator } from "@/components/main-calculator";
import { DerivedProductCalculator } from "@/components/derived-product-calculator";
import type { ProcessingCost, DerivedProduct } from "@/lib/types";
import { Calculator, Recycle, Sparkles, Target, Package, Layers } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("standard");

  const handleDerivedAIAssist = async (
    rawMaterial: string
  ): Promise<{ processingCosts: ProcessingCost[]; products: DerivedProduct[] } | null> => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "derived-product-suggestions",
          data: { rawMaterial },
        }),
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("AI assist error:", error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Kalkulator HPP Otomatis</h1>
                <p className="text-xs text-muted-foreground">Asisten Bisnis Cerdas</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Didukung oleh AI
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-balance">
            Hitung HPP, Dapatkan Strategi Harga Jual dari AI
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
            Ini bukan sekadar kalkulator biasa. Ini adalah asisten bisnis cerdas yang membantu Anda
            menentukan komponen biaya, menghitung HPP akurat, dan mendapatkan rekomendasi harga jual
            dari AI.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Mode Bisnis Fleksibel</h3>
              <p className="text-xs text-muted-foreground">
                Produksi massal atau per satuan
              </p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Rekomendasi AI</h3>
              <p className="text-xs text-muted-foreground">
                3 tingkat saran harga jual
              </p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Bundling Cerdas</h3>
              <p className="text-xs text-muted-foreground">
                Saran harga paket bundling
              </p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Produk Turunan</h3>
              <p className="text-xs text-muted-foreground">
                Hitung HPP multi-produk
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="standard" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              HPP Standar
            </TabsTrigger>
            <TabsTrigger value="derived" className="flex items-center gap-2">
              <Recycle className="h-4 w-4" />
              Produk Turunan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standard">
            <MainCalculator />
          </TabsContent>

          <TabsContent value="derived">
            <DerivedProductCalculator onAIAssist={handleDerivedAIAssist} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Kalkulator HPP Otomatis - Asisten Bisnis Cerdas dengan AI
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Hitung HPP akurat dan dapatkan strategi harga jual yang optimal
          </p>
        </div>
      </footer>
    </div>
  );
}
