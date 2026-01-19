"use client";

import React from "react"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Upload, X } from "lucide-react";
import { uploadAvatar, updateProfile, calculateAge } from "@/lib/profile";
import type { UserProfile } from "@/lib/profile";

interface ProfileEditProps {
  profile: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (profile: UserProfile) => void;
}

export function ProfileEdit({
  profile,
  open,
  onOpenChange,
  onSave,
}: ProfileEditProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    date_of_birth: profile?.date_of_birth || "",
    bio: profile?.bio || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const url = await uploadAvatar(file);
    if (url) {
      setAvatarUrl(url);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const updated = await updateProfile({
      full_name: formData.full_name,
      date_of_birth: formData.date_of_birth,
      bio: formData.bio,
      avatar_url: avatarUrl,
    });

    if (updated) {
      onSave?.(updated);
      onOpenChange(false);
    }
    setLoading(false);
  };

  const age = formData.date_of_birth ? calculateAge(formData.date_of_birth) : null;
  const initials = formData.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-center">Edit Profil</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={formData.full_name} />
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition"
              >
                <Upload className="h-4 w-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={loading}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
              <Input
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Masukkan nama lengkap"
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Tanggal Lahir</label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
                className="mt-2"
              />
              {age !== null && (
                <p className="text-xs text-muted-foreground mt-1">{age} tahun</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Ceritakan tentang Anda"
                className="mt-2 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
