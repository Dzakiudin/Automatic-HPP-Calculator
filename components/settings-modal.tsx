"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, Key, Sun, Moon, Monitor, User, Github, Facebook, Instagram } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      const savedKey = localStorage.getItem("GEMINI_API_KEY");
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [open]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "API Key tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem("GEMINI_API_KEY", apiKey.trim());
      toast({
        title: "Pengaturan Disimpan",
        description: "API Key Google Gemini berhasil disimpan dengan aman di perangkat Anda.",
      });
      onOpenChange(false);
    }
  };

  const handleRemove = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("GEMINI_API_KEY");
      setApiKey("");
      toast({
        title: "Pengaturan Dihapus",
        description: "API Key Google Gemini berhasil dihapus.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl mb-2">
            <Settings className="h-6 w-6 text-primary" />
            Pengaturan Aplikasi
          </DialogTitle>
          <DialogDescription className="text-center">
            Aplikasi ini membutuhkan API Key Google Gemini untuk fitur asisten cerdas.
            Key akan disimpan secara aman di dalam penyimpanan HP/Browser Anda dan tidak dikirim ke server manapun.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Google Gemini API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Anda bisa mendapatkan API key gratis di{" "}
              <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="space-y-3 border-t pt-4">
          <Label className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Tema Aplikasi
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="flex items-center gap-1.5"
            >
              <Sun className="h-3.5 w-3.5" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="flex items-center gap-1.5"
            >
              <Moon className="h-3.5 w-3.5" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
              className="flex items-center gap-1.5"
            >
              <Monitor className="h-3.5 w-3.5" />
              System
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Pilih tema tampilan sesuai preferensi Anda.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={handleRemove}
            className="w-1/3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Hapus Key
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            Simpan & Gunakan
          </Button>
        </div>

        {/* Developer Info */}
        <div className="space-y-3 border-t pt-4">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Developer
          </Label>
          <div className="flex flex-col items-center gap-2">
            <p className="font-semibold text-sm">Ahmad Dzakiudin</p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/jakijekijuki"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/jakijekiiii?igsh=MThpaW8ybThid3Zoaw%3D%3D"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/Dzakiudin"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
