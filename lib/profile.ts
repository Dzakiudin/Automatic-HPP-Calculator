export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  bio: string | null;
  theme: "light" | "dark" | "system";
  language: "id" | "en";
  notifications_enabled: boolean;
  default_calculation_mode: "per_unit" | "batch" | "hybrid";
  ai_settings: {
    auto_suggest: boolean;
    ai_model: "gemini-2.0-flash" | "gpt-4";
    tone: "professional" | "casual" | "technical";
  };
  created_at: string;
  updated_at: string;
}

export async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch("/api/profile", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { profile } = await res.json();
    return profile;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
}

export async function updateProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    const { profile } = await res.json();
    return profile;
  } catch (error) {
    console.error("Failed to update profile:", error);
    return null;
  }
}

export async function uploadAvatar(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-avatar", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url;
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    return null;
  }
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
