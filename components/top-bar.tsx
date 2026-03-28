"use client";

import { useState } from "react";
import { SettingsModal } from "@/components/settings-modal";
import { Calculator, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md pt-safe">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                  Kalkulator HPP
                </h1>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Didukung AI
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="text-muted-foreground hover:text-foreground"
              title="Pengaturan API Key"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
