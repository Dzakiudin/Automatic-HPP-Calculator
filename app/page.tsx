import Link from "next/link";
import { Calculator, Recycle, Sparkles, Target, Package, Layers, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-12 pb-8 px-4 rounded-b-3xl mb-6 shadow-sm border-b">
        <div className="container mx-auto text-center max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered Calculator
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-4 leading-tight tracking-tight">
            Hitung HPP & <br/> Strategi Harga Jangkauan AI
          </h2>
          <p className="text-muted-foreground text-sm max-w-[280px] sm:max-w-md mx-auto text-balance leading-relaxed">
            Asisten bisnis cerdas yang membantu menentukan komponen biaya, menghitung HPP, dan memberikan rekomendasi strategi harga.
          </p>
        </div>
      </section>

      {/* Main Action Cards */}
      <main className="container mx-auto px-4 flex-1 flex flex-col gap-4 max-w-lg mb-8">
        <Link href="/standard" className="block group">
          <div className="bg-card rounded-2xl border-2 border-transparent shadow-sm hover:border-primary/50 hover:shadow-md transition-all p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Calculator className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-lg mb-1">HPP Standar</h3>
              <p className="text-xs text-muted-foreground leading-snug">Hitung biaya produksi reguler dan dapatkan saran harga AI.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
        </Link>

        <Link href="/derived" className="block group">
          <div className="bg-card rounded-2xl border-2 border-transparent shadow-sm hover:border-primary/50 hover:shadow-md transition-all p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Recycle className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-lg mb-1">Produk Turunan</h3>
              <p className="text-xs text-muted-foreground leading-snug">Hitung alokasi biaya untuk 1 bahan jadi banyak produk (Joint Cost).</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
        </Link>
        
        <Link href="/history" className="block group mt-2">
          <div className="bg-secondary/50 rounded-2xl border border-transparent hover:border-muted transition-all p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center shrink-0">
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Riwayat Tersimpan</h3>
                <p className="text-[10px] text-muted-foreground">Lihat perhitungan sebelumnya</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold group-hover:bg-background">
              Buka
            </Button>
          </div>
        </Link>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-card rounded-xl border p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <h4 className="text-[11px] font-semibold mb-1">Mode Fleksibel</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">Produksi massal/satuan</p>
          </div>
          <div className="bg-card rounded-xl border p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <h4 className="text-[11px] font-semibold mb-1">Bundling Cerdas</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">Saran harga paket</p>
          </div>
        </div>
      </main>
    </div>
  );
}
