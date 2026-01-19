"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Sparkles, TrendingUp, Package, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Calculator, label: "Hitung HPP Akurat", color: "text-primary" },
    { icon: Sparkles, label: "Rekomendasi AI", color: "text-amber-500" },
    { icon: TrendingUp, label: "Analisis Profit", color: "text-blue-500" },
    { icon: Package, label: "Bundling Cerdas", color: "text-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <Calculator className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kalkulator HPP</h1>
          <p className="text-muted-foreground mt-1">Asisten Bisnis Cerdas</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-10">
          {features.map((feature) => (
            <Card key={feature.label} className="border-0 shadow-sm bg-card/80 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-muted ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-foreground">{feature.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-foreground">Masuk ke Akun</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Simpan perhitungan dan sinkronkan data Anda
              </p>
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isLoading ? "Memproses..." : "Masuk dengan Google"}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-6">
              Dengan masuk, Anda menyetujui{" "}
              <span className="text-primary">Ketentuan Layanan</span> dan{" "}
              <span className="text-primary">Kebijakan Privasi</span> kami
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 px-6">
        <p className="text-xs text-muted-foreground">
          Dibuat dengan oleh <span className="font-medium">Jackie</span>
        </p>
      </div>
    </div>
  );
}
