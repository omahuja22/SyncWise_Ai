import { supabase } from "@/lib/supabase";

// Get user stats
export const getUserStats = async (userId?: string) => {
  if (!userId) {
    // Return default stats if no user
    return {
      id: "",
      user_id: "",
      total_points: 0,
      tasks_completed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned (user not found)
    console.error("Error fetching user stats:", error);
  }

  // If user not found, create default stats
  if (!data) {
    return {
      id: "",
      user_id: userId,
      total_points: 0,
      tasks_completed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data;
};

// Initialize user stats (call on first login/signup)
export const initializeUserStats = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_stats")
    .insert([
      {
        user_id: userId,
        total_points: 0,
        tasks_completed: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    // User stats might already exist, that's fine
    console.log("Initializing user stats:", error.message);
  }

  return data;
};

// Add points to user
export const addPointsToUser = async (userId: string, points: number) => {
  const { data, error } = await supabase
    .from("user_stats")
    .update({
      total_points: supabase.rpc("add_points", { user_id: userId, points }),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Alternative: Update total points directly
export const updateUserTotalPoints = async (
  userId: string,
  totalPoints: number
) => {
  const { data, error } = await supabase
    .from("user_stats")
    .update({
      total_points: totalPoints,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Upsert user stats (create if not exist, update if exists)
export const upsertUserStats = async (
  userId: string,
  updates: { total_points?: number; tasks_completed?: number }
) => {
  const { data, error } = await supabase
    .from("user_stats")
    .upsert(
      {
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("❌ [upsertUserStats] Error:", error.message);
    throw error;
  }

  console.log("✅ [upsertUserStats] User stats updated:", { userId, ...updates });
  return data;
};

// Increment tasks completed
export const incrementTasksCompleted = async (userId: string) => {
  const stats = await getUserStats(userId);

  const { data, error } = await supabase
    .from("user_stats")
    .update({
      tasks_completed: (stats.tasks_completed || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};
