"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { MobileLayout } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient, createBrowserClient } from "@/lib/supabase/client";
import {
  User,
  Bell,
  Palette,
  Calculator,
  Sparkles,
  Shield,
  HelpCircle,
  MessageCircle,
  Info,
  ChevronRight,
  LogOut,
  Camera,
  Moon,
  Sun,
  Monitor,
  Instagram,
  Facebook,
  Loader2,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SheetType = "profile" | "notifications" | "appearance" | "calculation" | "ai" | "privacy" | "help" | "contact" | "about" | null;

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, settings, isLoading, signOut, updateProfile, updateSettings } = useAuth();
  const { toast } = useToast();
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    date_of_birth: "",
    phone: "",
    business_name: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        date_of_birth: profile.date_of_birth || "",
        phone: profile.phone || "",
        business_name: profile.business_name || "",
      });
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsSaving(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      toast({ title: "Foto profil berhasil diperbarui" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Gagal mengupload foto", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileForm);
      toast({ title: "Profil berhasil disimpan" });
      setActiveSheet(null);
    } catch {
      toast({ title: "Gagal menyimpan profil", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    {
      section: "Akun",
      items: [
        { id: "profile" as SheetType, icon: User, label: "Profil", desc: "Nama, foto, tanggal lahir" },
      ],
    },
    {
      section: "Preferensi",
      items: [
        { id: "notifications" as SheetType, icon: Bell, label: "Notifikasi", desc: "Pengingat & pemberitahuan" },
        { id: "appearance" as SheetType, icon: Palette, label: "Tampilan", desc: "Tema & tampilan aplikasi" },
        { id: "calculation" as SheetType, icon: Calculator, label: "Default Kalkulasi", desc: "Pengaturan perhitungan" },
        { id: "ai" as SheetType, icon: Sparkles, label: "Pengaturan AI", desc: "Konfigurasi asisten AI" },
      ],
    },
    {
      section: "Lainnya",
      items: [
        { id: "privacy" as SheetType, icon: Shield, label: "Privasi Data", desc: "Kelola data & privasi" },
        { id: "help" as SheetType, icon: HelpCircle, label: "Bantuan", desc: "Pusat Bantuan" },
        { id: "contact" as SheetType, icon: MessageCircle, label: "Hubungi Kami", desc: "Dukungan & feedback" },
        { id: "about" as SheetType, icon: Info, label: "Tentang Aplikasi", desc: "Versi & informasi" },
      ],
    },
  ];

  const themeOptions = [
    { value: "light", label: "Terang", icon: Sun },
    { value: "dark", label: "Gelap", icon: Moon },
    { value: "system", label: "Sistem", icon: Monitor },
  ];

  if (isLoading) {
    return (
      <MobileLayout title="Pengaturan">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout title="Pengaturan">
        <div className="p-4 space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Masuk untuk Melanjutkan</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Masuk untuk menyimpan pengaturan dan sinkronkan data Anda
              </p>
              <Button onClick={() => router.push("/login")} className="w-full rounded-xl h-12">
                Masuk dengan Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Pengaturan">
      <div className="p-4 space-y-4 pb-24">
        {/* User Card */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {(profile?.full_name || user?.email)?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {profile?.full_name || user?.user_metadata?.full_name || "Pengguna"}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                {profile?.business_name && (
                  <p className="text-xs text-primary mt-1 truncate">{profile.business_name}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Sections */}
        {menuItems.map((section) => (
          <div key={section.section} className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {section.section}
            </h4>
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0 divide-y divide-border">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSheet(item.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 active:bg-muted transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Keluar dari Akun
        </Button>
      </div>

      {/* Profile Sheet */}
      <Sheet open={activeSheet === "profile"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Edit Profil
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto h-[calc(100%-8rem)] pb-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                placeholder="Masukkan nama lengkap"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                value={profileForm.date_of_birth}
                onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor Telepon</Label>
              <Input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Nama Bisnis</Label>
              <Input
                value={profileForm.business_name}
                onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
                placeholder="Nama usaha Anda"
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full h-12 rounded-xl">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
            Simpan Perubahan
          </Button>
        </SheetContent>
      </Sheet>

      {/* Notifications Sheet */}
      <Sheet open={activeSheet === "notifications"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifikasi
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">Pengingat Kalkulasi</p>
                <p className="text-sm text-muted-foreground">Ingatkan untuk menghitung HPP secara berkala</p>
              </div>
              <Switch
                checked={settings.notifications.calculation_reminders}
                onCheckedChange={(checked) =>
                  updateSettings({
                    notifications: { ...settings.notifications, calculation_reminders: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">Tips & Update</p>
                <p className="text-sm text-muted-foreground">Dapatkan tips bisnis dan fitur baru</p>
              </div>
              <Switch
                checked={settings.notifications.tips_and_updates}
                onCheckedChange={(checked) =>
                  updateSettings({
                    notifications: { ...settings.notifications, tips_and_updates: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">Laporan Mingguan</p>
                <p className="text-sm text-muted-foreground">Ringkasan perhitungan setiap minggu</p>
              </div>
              <Switch
                checked={settings.notifications.weekly_reports}
                onCheckedChange={(checked) =>
                  updateSettings({
                    notifications: { ...settings.notifications, weekly_reports: checked },
                  })
                }
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Appearance Sheet */}
      <Sheet open={activeSheet === "appearance"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Tampilan
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <Label>Pilih Tema</Label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ theme: theme.value as "light" | "dark" | "system" })}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    settings.theme === theme.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <theme.icon className={`w-8 h-8 mx-auto mb-2 ${settings.theme === theme.value ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`text-sm font-medium ${settings.theme === theme.value ? "text-primary" : ""}`}>{theme.label}</p>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Calculation Settings Sheet */}
      <Sheet open={activeSheet === "calculation"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Default Kalkulasi
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6 overflow-y-auto h-[calc(100%-6rem)] pb-4">
            <div className="space-y-2">
              <Label>Mode Bisnis Default</Label>
              <Select
                value={settings.default_calculation.business_mode}
                onValueChange={(value) =>
                  updateSettings({
                    default_calculation: { ...settings.default_calculation, business_mode: value },
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Bisnis Ritel/F&B</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="manufacture">Manufaktur/Pabrik</SelectItem>
                  <SelectItem value="service">Produk Jasa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Default Margin Profit</Label>
                <span className="text-primary font-semibold">{settings.default_calculation.default_margin}%</span>
              </div>
              <Slider
                value={[settings.default_calculation.default_margin]}
                onValueChange={([value]) =>
                  updateSettings({
                    default_calculation: { ...settings.default_calculation, default_margin: value },
                  })
                }
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Margin yang akan digunakan untuk saran harga jual</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">Pembulatan Otomatis</p>
                <p className="text-sm text-muted-foreground">Bulatkan harga ke angka yang mudah</p>
              </div>
              <Switch
                checked={settings.default_calculation.auto_round_prices}
                onCheckedChange={(checked) =>
                  updateSettings({
                    default_calculation: { ...settings.default_calculation, auto_round_prices: checked },
                  })
                }
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* AI Settings Sheet */}
      <Sheet open={activeSheet === "ai"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Pengaturan AI
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">Saran Otomatis</p>
                <p className="text-sm text-muted-foreground">AI akan memberikan saran saat input data</p>
              </div>
              <Switch
                checked={settings.ai_settings.auto_suggestions}
                onCheckedChange={(checked) =>
                  updateSettings({
                    ai_settings: { ...settings.ai_settings, auto_suggestions: checked },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Kedalaman Analisis Harga</Label>
              <Select
                value={settings.ai_settings.price_analysis_depth}
                onValueChange={(value: "basic" | "detailed" | "comprehensive") =>
                  updateSettings({
                    ai_settings: { ...settings.ai_settings, price_analysis_depth: value },
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Dasar - Perhitungan cepat</SelectItem>
                  <SelectItem value="detailed">Detail - Analisis standar</SelectItem>
                  <SelectItem value="comprehensive">Komprehensif - Analisis mendalam</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Semakin detail, semakin lama proses analisis</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Privacy Sheet */}
      <Sheet open={activeSheet === "privacy"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="bottom" className="h-[65vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privasi Data
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">Simpan Riwayat</p>
                <p className="text-sm text-muted-foreground">Simpan riwayat perhitungan Anda</p>
              </div>
              <Switch
                checked={settings.privacy.save_calculation_history}
                onCheckedChange={(checked) =>
                  updateSettings({
                    privacy: { ...settings.privacy, save_calculation_history: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">Data Anonim</p>
                <p className="text-sm text-muted-foreground">Bantu tingkatkan aplikasi dengan data anonim</p>
              </div>
              <Switch
                checked={settings.privacy.share_anonymous_data}
                onCheckedChange={(checked) =>
                  updateSettings({
                    privacy: { ...settings.privacy, share_anonymous_data: checked },
                  })
                }
              />
            </div>
            <Button variant="outline" className="w-full h-12 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent">
              Hapus Semua Data
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Help Sheet */}
      <Sheet open={activeSheet === "help"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Pusat Bantuan
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-3 overflow-y-auto h-[calc(100%-4rem)]">
            {[
              { q: "Bagaimana cara menghitung HPP?", a: "Masukkan biaya variabel dan tetap, lalu klik Hitung HPP" },
              { q: "Apa itu biaya variabel?", a: "Biaya yang berubah sesuai jumlah produksi (bahan baku, kemasan)" },
              { q: "Apa itu biaya tetap?", a: "Biaya yang tidak berubah (sewa, gaji bulanan)" },
              { q: "Bagaimana AI menentukan harga?", a: "AI menganalisis HPP dan memberikan 3 tier harga berdasarkan strategi pasar" },
              { q: "Bagaimana cara bundling?", a: "Simpan beberapa produk, lalu gunakan fitur Bundling Cerdas" },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-xl">
                <p className="font-medium text-sm">{item.q}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Contact Sheet */}
      <Sheet open={activeSheet === "contact"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Hubungi Kami
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Punya pertanyaan atau masukan? Hubungi kami melalui media sosial:
            </p>
            <a
              href="https://www.instagram.com/jakijekiiii?igsh=MThpaW8ybThid3Zoaw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl hover:from-purple-500/20 hover:to-pink-500/20 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium">Instagram</p>
                <p className="text-sm text-muted-foreground">@jakijekiiii</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </a>
            <a
              href="https://www.facebook.com/jakijekijuki"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Facebook className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium">Facebook</p>
                <p className="text-sm text-muted-foreground">Jackie</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </a>
          </div>
        </SheetContent>
      </Sheet>

      {/* About Sheet */}
      <Sheet open={activeSheet === "about"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Tentang Aplikasi
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6 text-center overflow-y-auto h-[calc(100%-4rem)]">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
              <Calculator className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Kalkulator HPP</h3>
              <p className="text-muted-foreground">Versi 1.0.0</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              Kalkulator HPP Otomatis adalah asisten bisnis cerdas yang membantu Anda menghitung Harga Pokok Produksi, 
              mendapatkan rekomendasi harga jual dari AI, dan memproyeksikan keuntungan bisnis Anda.
            </p>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Dibuat dengan oleh</p>
              <p className="text-lg font-semibold text-primary">Jackie</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <a
                  href="https://www.facebook.com/jakijekijuki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://www.instagram.com/jakijekiiii?igsh=MThpaW8ybThid3Zoaw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              2024 Kalkulator HPP. All rights reserved.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
