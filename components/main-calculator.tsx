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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessModeSelector } from "./business-mode-selector";
import { VariableCostInput, FixedCostInput } from "./cost-input";
import { ResultsPanel } from "./results-panel";
import { BundlingModal } from "./bundling-modal";
import { saveCalculation, formatRupiah } from "@/lib/store";
import { useRouter } from "next/navigation";
import type {
  BusinessMode,
  CalculationMode,
  VariableCost,
  FixedCost,
  HPPCalculation,
  PriceRecommendation,
  BundleProduct,
  BundleRecommendation,
} from "@/lib/types";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  { id: crypto.randomUUID(), name: "Biji Kopi/Bubuk Kopi", amount: 2250 },
  { id: crypto.randomUUID(), name: "Susu UHT/Susu Segar", amount: 2400 },
  { id: crypto.randomUUID(), name: "Gula Aren Cair", amount: 750 },
  { id: crypto.randomUUID(), name: "Gelas Plastik & Tutup", amount: 700 },
  { id: crypto.randomUUID(), name: "Sedotan", amount: 75 },
];

const defaultFixedCosts: FixedCost[] = [
  { id: crypto.randomUUID(), name: "Sewa Tempat (per bulan)", monthlyAmount: 3000000, allocationPerProduct: 0 },
  { id: crypto.randomUUID(), name: "Gaji Karyawan (per bulan)", monthlyAmount: 3000000, allocationPerProduct: 0 },
  { id: crypto.randomUUID(), name: "Listrik & Air (per bulan)", monthlyAmount: 800000, allocationPerProduct: 0 },
  { id: crypto.randomUUID(), name: "Biaya Pemasaran (per bulan)", monthlyAmount: 500000, allocationPerProduct: 0 },
  { id: crypto.randomUUID(), name: "Biaya Administrasi & Umum (per bulan)", monthlyAmount: 300000, allocationPerProduct: 0 },
];

export function MainCalculator() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Form state
  const [businessMode, setBusinessMode] = useState<BusinessMode>("ritel-fnb");
  const [calculationMode, setCalculationMode] = useState<CalculationMode>("biaya-satuan");
  const [productName, setProductName] = useState("Kopi Susu Gula Aren");
  const [category, setCategory] = useState("Makanan & Minuman");
  const [variableCosts, setVariableCosts] = useState<VariableCost[]>(defaultVariableCosts);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(defaultFixedCosts);
  const [targetSalesPerMonth, setTargetSalesPerMonth] = useState(1000);

  // Result state
  const [calculation, setCalculation] = useState<HPPCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<PriceRecommendation | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [targetProfit, setTargetProfit] = useState("");

  // Modal state
  const [bundlingOpen, setBundlingOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // AI assist loading
  const [isAIAssistLoading, setIsAIAssistLoading] = useState(false);

  const handleAIAssistInput = async () => {
    if (!productName) {
      toast({
        title: "Error",
        description: "Masukkan nama produk terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsAIAssistLoading(true);
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
          setTargetSalesPerMonth(suggestions.suggestedTargetSales);
        }
        toast({
          title: "Berhasil",
          description: "AI telah mengisi komponen biaya yang disarankan",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal mendapatkan saran dari AI",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("AI assist error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghubungi AI",
        variant: "destructive",
      });
    } finally {
      setIsAIAssistLoading(false);
    }
  };

  const calculateHPP = async () => {
    setIsLoading(true);
    setAiRecommendations(null);

    // Simulate calculation
    setTimeout(async () => {
      const totalVariableCost = variableCosts.reduce((sum, cost) => sum + cost.amount, 0);
      const totalFixedCostAllocation = fixedCosts.reduce(
        (sum, cost) => {
          const allocation = cost.allocationPerProduct > 0
            ? cost.allocationPerProduct
            : (targetSalesPerMonth > 0 ? Math.ceil(cost.monthlyAmount / targetSalesPerMonth) : 0);
          return sum + allocation;
        },
        0
      );
      const hppPerProduct = totalVariableCost + totalFixedCostAllocation;

      const calc: HPPCalculation = {
        id: crypto.randomUUID(),
        productName,
        category,
        businessMode,
        calculationMode,
        variableCosts,
        fixedCosts,
        targetSalesPerMonth,
        totalVariableCost,
        totalFixedCostAllocation,
        hppPerProduct,
        createdAt: new Date(),
      };

      setCalculation(calc);
      setIsLoading(false);

      // Get AI recommendations
      setIsLoadingAI(true);
      try {
        const { getPriceRecommendationsClient } = await import("@/lib/ai-client");
        const recommendationsArr = await getPriceRecommendationsClient(
          productName,
          category || "Lainnya",
          hppPerProduct,
          targetSalesPerMonth
        );

        if (recommendationsArr && recommendationsArr.length >= 3) {
          const formattedRecs = {
            competitive: recommendationsArr[0],
            standard: recommendationsArr[1],
            premium: recommendationsArr[2],
          } as unknown as PriceRecommendation;

          setAiRecommendations(formattedRecs);
          setSelectedPrice(formattedRecs.standard.price);
        }
      } catch (error: any) {
        console.error("AI recommendations error:", error);
        if (error?.message === "MISSING_API_KEY") {
          toast({
            title: "API Key Diperlukan",
            description: "Silakan atur API Key Google Gemini Anda di menu Pengaturan.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoadingAI(false);
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
        description: "Perhitungan berhasil disimpan ke riwayat",
      });
    }
  };

  const handleBundleRecommendation = async (products: BundleProduct[]): Promise<BundleRecommendation | null> => {
    try {
      const { getBundleRecommendationsClient } = await import("@/lib/ai-client");
      const productName = products.length > 0 ? products[0].name : "Bundle";
      const totalHPP = products.reduce((sum, p) => sum + p.hpp, 0);

      const recommendation = await getBundleRecommendationsClient(productName, category || "Lainnya", totalHPP);
      // Since ai-client returns BundleRecommendation[] (max 3), let's map it back to the expected BundleRecommendation single obj shape.
      // Wait, let's check what BundleRecommendation actually expects. 
      // It expects { economyPack, balancedPack, profitMaxPack }. The client prompt returns array.
      // We will adjust the AI-client prompt or map it here. Let's map it.
      
      if (recommendation && recommendation.length >= 3) {
        return {
          economyPack: recommendation[0],
          balancedPack: recommendation[1],
          profitMaxPack: recommendation[2],
        } as unknown as BundleRecommendation;
      }
      return null;

    } catch (error: any) {
      console.error("Bundle recommendation error:", error);
      if (error?.message === "MISSING_API_KEY") {
        toast({
          title: "API Key Diperlukan",
          description: "Silakan atur API Key Google Gemini Anda di menu Pengaturan (ikon gear di pojok kanan atas).",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Gagal",
          description: error?.message || "Gagal mendapatkan saran bundling.",
          variant: "destructive",
        });
      }
      return null;
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
            onClick={handleAIAssistInput}
            disabled={isAIAssistLoading}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            {isAIAssistLoading ? (
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

        {/* Calculation Mode Tabs */}
        <Tabs value={calculationMode} onValueChange={(v) => setCalculationMode(v as CalculationMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="target-produksi">Target Produksi</TabsTrigger>
            <TabsTrigger value="biaya-satuan">Biaya per Satuan</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Product Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nama Produk</Label>
            <Input
              placeholder="Kopi Susu Gula Aren"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Kategori Produk</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
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

        {/* Business Mode */}
        <BusinessModeSelector value={businessMode} onChange={setBusinessMode} />

        {/* Variable Costs */}
        <VariableCostInput costs={variableCosts} onChange={setVariableCosts} />

        {/* Target Sales */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <Label>Jumlah Target Penjualan per Bulan</Label>
          <Input
            type="number"
            value={targetSalesPerMonth || ""}
            onChange={(e) => setTargetSalesPerMonth(Number(e.target.value))}
            min={1}
          />
          <p className="text-xs text-muted-foreground">
            Digunakan untuk memberi saran alokasi biaya yang ideal.
          </p>
        </div>

        {/* Fixed Costs */}
        <FixedCostInput
          costs={fixedCosts}
          targetSales={targetSalesPerMonth}
          onChange={setFixedCosts}
        />

        {/* Calculate Button */}
        <div className="sticky bottom-16 z-40 bg-card/80 backdrop-blur-sm -mx-6 px-6 pb-6 pt-2 lg:static lg:bg-transparent lg:p-0 lg:m-0">
          <Button
            onClick={calculateHPP}
            disabled={isLoading || !productName}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg lg:shadow-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Menghitung...
              </>
            ) : (
              "Hitung HPP & Saran Harga"
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <ResultsPanel
        calculation={calculation}
        isLoading={isLoading}
        aiRecommendations={aiRecommendations}
        isLoadingAI={isLoadingAI}
        selectedPrice={selectedPrice}
        targetProfit={targetProfit}
        onSelectPrice={setSelectedPrice}
        onTargetProfitChange={setTargetProfit}
        onSave={handleSave}
        onOpenBundling={() => setBundlingOpen(true)}
        onOpenHistory={() => router.push("/history")}
      />

      {/* Modals */}
      <BundlingModal
        open={bundlingOpen}
        onOpenChange={setBundlingOpen}
        onGenerateRecommendation={handleBundleRecommendation}
      />
    </div>
  );
}
