import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types";

// Get user profile by user_id
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  console.log(`🔹 [getUserProfile] Fetching profile for user:`, userId);

  try {
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
      console.error("❌ [getUserProfile] Error:", error.message);
      return null;
    }

    console.log("✅ [getUserProfile] Profile found:", data?.full_name);
    return data;
  } catch (err: any) {
    console.error("❌ [getUserProfile] Exception:", err.message);
    return null;
  }
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

  // Build payload with only existing columns (schema-safe)
  const payload: any = {
    id: userId,
    full_name: fullName.trim(),
  };

  // Add optional fields only if they're defined
  if (profileData?.username) payload.username = profileData.username;
  if (profileData?.email) payload.email = profileData.email;
  if (profileData?.dob) payload.dob = profileData.dob;
  if (profileData?.gender) payload.gender = profileData.gender;
  if (profileData?.phone) payload.phone = profileData.phone;
  if (profileData?.country) payload.country = profileData.country;
  if (profileData?.city) payload.city = profileData.city;
  if (profileData?.avatar_url) payload.avatar_url = profileData.avatar_url;
  if (profileData?.bio) payload.bio = profileData.bio;

  console.log("📝 [createUserProfile] Payload:", payload);

  const { data, error } = await supabase
    .from("user_profiles")
    .insert([payload])
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

    // Return the actual error message (not generic "table not found")
    throw new Error(error.message || "Failed to create profile");
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
  console.log("📝 [updateUserProfile] Updates:", updates);

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("❌ [updateUserProfile] Error:", error.message);

      if (error.message?.includes("row-level security")) {
        throw new Error("Permission denied: Cannot update other user's profile");
      }

      throw new Error(error.message || "Failed to update profile");
    }

    console.log("✅ [updateUserProfile] Profile updated successfully");
    return data;
  } catch (err: any) {
    console.error("❌ [updateUserProfile] Exception:", err.message);
    throw err;
  }
};

// Check if profile exists
export const profileExists = async (userId: string): Promise<boolean> => {
  console.log(`🔹 [profileExists] Checking if profile exists for user:`, userId);

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.log(`ℹ️  [profileExists] Profile does not exist for user ${userId}`);
        return false;
      }
      console.error("❌ [profileExists] Error checking profile:", error.message);
      return false;
    }

    console.log("✅ [profileExists] Profile exists for user:", userId);
    return data !== null;
  } catch (err: any) {
    console.error("❌ [profileExists] Exception:", err.message);
    return false;
  }
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
    gender: undefined,
    onboarding_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
