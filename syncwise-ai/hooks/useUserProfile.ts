"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { getUserProfile } from "@/services/userProfileService";
import { UserProfile } from "@/types";

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      console.log("⚠️  [useUserProfile] No user authenticated");
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      console.log("🔹 [useUserProfile] Fetching profile");
      setLoading(true);
      setError(null);
      const data = await getUserProfile(user.id);
      setProfile(data);
      console.log("✅ [useUserProfile] Profile loaded:", data?.full_name || "no profile");
    } catch (err: any) {
      const message = err.message || "Failed to fetch profile";
      console.error("❌ [useUserProfile] Error:", message);
      setError(message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};
