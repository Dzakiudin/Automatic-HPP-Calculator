"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { VariableCost, FixedCost } from "@/lib/types";
import { formatRupiah } from "@/lib/store";

interface VariableCostInputProps {
  costs: VariableCost[];
  onChange: (costs: VariableCost[]) => void;
}

export function VariableCostInput({ costs, onChange }: VariableCostInputProps) {
  const addCost = () => {
    onChange([
      ...costs,
      { id: crypto.randomUUID(), name: "", amount: 0 },
    ]);
  };

  const updateCost = (id: string, field: keyof VariableCost, value: string | number) => {
    onChange(
      costs.map((cost) =>
        cost.id === id ? { ...cost, [field]: value } : cost
      )
    );
  };

  const removeCost = (id: string) => {
    onChange(costs.filter((cost) => cost.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Biaya Variabel (Variable Cost)</h3>
          <p className="text-xs text-muted-foreground">Biaya yang dikeluarkan untuk membuat satu buah produk jadi.</p>
        </div>
      </div>
      <div className="space-y-2">
        {costs.map((cost) => (
          <div key={cost.id} className="flex items-center gap-2">
            <Input
              placeholder="Nama Biaya"
              value={cost.name}
              onChange={(e) => updateCost(cost.id, "name", e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Harga"
              value={cost.amount || ""}
              onChange={(e) => updateCost(cost.id, "amount", Number(e.target.value))}
              className="w-24 sm:w-32"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeCost(cost.id)}
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
        onClick={addCost}
        className="text-primary hover:text-primary hover:bg-primary/10"
      >
        <Plus className="h-4 w-4 mr-1" />
        Tambah Biaya
      </Button>
    </div>
  );
}

interface FixedCostInputProps {
  costs: FixedCost[];
  targetSales: number;
  onChange: (costs: FixedCost[]) => void;
}

export function FixedCostInput({ costs, targetSales, onChange }: FixedCostInputProps) {
  const addCost = () => {
    onChange([
      ...costs,
      { id: crypto.randomUUID(), name: "", monthlyAmount: 0, allocationPerProduct: 0 },
    ]);
  };

  const updateCost = (id: string, field: keyof FixedCost, value: string | number) => {
    onChange(
      costs.map((cost) =>
        cost.id === id ? { ...cost, [field]: value } : cost
      )
    );
  };

  const removeCost = (id: string) => {
    onChange(costs.filter((cost) => cost.id !== id));
  };

  const getSuggestedAllocation = (monthlyAmount: number) => {
    if (targetSales <= 0) return 0;
    return Math.ceil(monthlyAmount / targetSales);
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Alokasi Biaya Tetap per Produk</h3>
        <p className="text-xs text-muted-foreground">Alokasikan sebagian dari total biaya bulanan ke setiap produk yang terjual.</p>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr,1fr,1fr,32px] gap-2 text-xs font-medium text-muted-foreground px-1">
          <span>Nama Biaya</span>
          <span>Total Biaya (per bulan)</span>
          <span>Alokasi per Produk (Rp)</span>
          <span className="w-8"></span>
        </div>
        {costs.map((cost) => {
          const suggested = getSuggestedAllocation(cost.monthlyAmount);
          return (
            <div key={cost.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Sewa Tempat (per bulan)"
                  value={cost.name}
                  onChange={(e) => updateCost(cost.id, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="3.000.000"
                  value={cost.monthlyAmount || ""}
                  onChange={(e) => updateCost(cost.id, "monthlyAmount", Number(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Alokasi Rp"
                  value={cost.allocationPerProduct || ""}
                  onChange={(e) => updateCost(cost.id, "allocationPerProduct", Number(e.target.value))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCost(cost.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {suggested > 0 && (
                <p className="text-xs text-muted-foreground text-right pr-12">
                  Saran: {formatRupiah(suggested)}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addCost}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4 mr-1" />
          Tambah Biaya
        </Button>
      </div>
    </div>
  );
}
