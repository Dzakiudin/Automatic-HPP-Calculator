"use client";

import { MainCalculator } from "@/components/main-calculator";

export default function StandardCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">HPP Standar</h2>
        <p className="text-muted-foreground text-sm">Hitung Harga Pokok Produksi untuk produk ritel atau FnB Anda.</p>
      </div>
      <MainCalculator />
    </div>
  );
}
