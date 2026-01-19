"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  phone: string | null;
  business_name: string | null;
  business_type: string | null;
}

interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: {
    calculation_reminders: boolean;
    tips_and_updates: boolean;
    weekly_reports: boolean;
  };
  default_calculation: {
    business_mode: string;
    default_margin: number;
    auto_round_prices: boolean;
    currency_format: string;
  };
  ai_settings: {
    auto_suggestions: boolean;
    price_analysis_depth: "basic" | "detailed" | "comprehensive";
    language: string;
  };
  privacy: {
    share_anonymous_data: boolean;
    save_calculation_history: boolean;
  };
}

const defaultSettings: UserSettings = {
  theme: "system",
  notifications: {
    calculation_reminders: true,
    tips_and_updates: true,
    weekly_reports: false,
  },
  default_calculation: {
    business_mode: "retail",
    default_margin: 30,
    auto_round_prices: true,
    currency_format: "id-ID",
  },
  ai_settings: {
    auto_suggestions: true,
    price_analysis_depth: "detailed",
    language: "id",
  },
  privacy: {
    share_anonymous_data: false,
    save_calculation_history: true,
  },
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  settings: UserSettings;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(); // Updated to use the imported createBrowserClient

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const loadSettings = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_settings");
      if (saved) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(saved) });
        } catch {
          setSettings(defaultSettings);
        }
      }
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      loadSettings();
      setIsLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_settings", JSON.stringify(newSettings));
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        settings,
        isLoading,
        signOut,
        updateProfile,
        updateSettings,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
