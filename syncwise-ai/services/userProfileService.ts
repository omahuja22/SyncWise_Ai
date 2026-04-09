import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types";

// Get user profile by user_id
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  console.log(`🔹 [getUserProfile] Fetching profile for user:`, userId);

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      console.log(`⚠️  [getUserProfile] No profile found for user ${userId}`);
      return null;
    }
    console.error("❌ [getUserProfile] Error:", {
      message: error.message,
      code: error.code,
      hint: error.hint,
    });
    return null;
  }

  console.log("✅ [getUserProfile] Profile found:", data?.full_name);
  return data;
};

// Create user profile
export const createUserProfile = async (
  userId: string,
  fullName: string,
  profileData?: Partial<UserProfile>
): Promise<UserProfile | null> => {
  console.log(`🔹 [createUserProfile] Creating profile for user:`, userId);

  // Validate required field
  if (!fullName?.trim()) {
    throw new Error("Full name is required");
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .insert([
      {
        id: userId,
        full_name: fullName.trim(),
        onboarding_completed: false,
        ...profileData,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ [createUserProfile] Insert failed:", {
      message: error.message,
      code: error.code,
      hint: error.hint,
      details: error.details,
    });

    if (error.code === "23505") {
      throw new Error("Profile already exists for this user");
    }

    if (error.message?.includes("row-level security")) {
      throw new Error("Permission denied: Cannot create profile for other users");
    }

    if (error.message?.includes("user_profiles")) {
      throw new Error("Profile table not found. Please contact support.");
    }

    throw new Error(`Failed to create profile: ${error.message}`);
  }

  console.log("✅ [createUserProfile] Profile created successfully");
  return data;
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "created_at">>
): Promise<UserProfile | null> => {
  console.log(`🔹 [updateUserProfile] Updating profile for user:`, userId);

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("❌ [updateUserProfile] Error:", {
      message: error.message,
      code: error.code,
      hint: error.hint,
    });

    if (error.message?.includes("row-level security")) {
      throw new Error("Permission denied: Cannot update other user's profile");
    }

    return null;
  }

  console.log("✅ [updateUserProfile] Profile updated successfully");
  return data;
};

// Check if profile exists
export const profileExists = async (userId: string): Promise<boolean> => {
  console.log(`🔹 [profileExists] Checking if profile exists for user:`, userId);

  const profile = await getUserProfile(userId);
  return profile !== null;
};

// Mark onboarding as completed
export const completeOnboarding = async (
  userId: string
): Promise<UserProfile | null> => {
  return updateUserProfile(userId, {
    onboarding_completed: true,
  } as Partial<UserProfile>);
};

// Get user profile with fallback default
export const getUserProfileOrDefault = async (
  userId: string
): Promise<UserProfile> => {
  const profile = await getUserProfile(userId);

  if (profile) {
    return profile;
  }

  // Return default profile structure
  return {
    id: userId,
    full_name: "User",
    email: "",
    avatar_url: "",
    bio: "",
    role: "Developer",
    phone: "",
    country: "",
    city: "",
    dob: "",
    gender: "",
    onboarding_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
