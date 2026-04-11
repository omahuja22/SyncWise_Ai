import { supabase } from "@/lib/supabase";

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "admin" | "member";
  created_at: string;
}

/**
 * Create a new team and add the creator as a team admin
 * @param teamName - Name of the team to create
 * @returns Created team object with ID
 * @throws Error if team creation or member insertion fails
 */
export const createTeam = async (teamName: string): Promise<Team> => {
  console.log(`🔹 [createTeam] Starting team creation for: ${teamName}`);

  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    console.error("❌ [createTeam] User not authenticated");
    throw new Error("User not authenticated");
  }

  console.log("👤 [createTeam] Creating team for user:", user.id);

  // STEP 1: Insert team
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .insert([
      {
        name: teamName.trim(),
        created_by: user.id,
      },
    ])
    .select()
    .single();

  if (teamError) {
    console.error("❌ [createTeam] Failed to create team:", teamError.message);
    throw new Error(`Failed to create team: ${teamError.message}`);
  }

  if (!teamData?.id) {
    throw new Error("Team creation failed: No team ID returned");
  }

  console.log("✅ [createTeam] Team created with ID:", teamData.id);

  // STEP 2: Add creator as team admin
  const { error: memberError } = await supabase
    .from("team_members")
    .insert([
      {
        team_id: teamData.id,
        user_id: user.id,
        role: "admin",
      },
    ])
    .select()
    .single();

  if (memberError) {
    console.error("❌ [createTeam] Failed to add user as team admin:", memberError.message);
    // TODO: Consider deleting the team if member insertion fails
    throw new Error(`Failed to add team member: ${memberError.message}`);
  }

  console.log("✅ [createTeam] User added as team admin");
  console.log("📋 [createTeam] Team created successfully:", teamData);

  return teamData;
};

/**
 * Get all teams where the user is a member
 * @returns Array of teams
 */
export const getUserTeams = async (): Promise<Team[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return [];
  }

  const { data, error } = await supabase
    .from("team_members")
    .select("teams(*)")
    .eq("user_id", user.id);

  if (error) {
    console.error("❌ [getUserTeams] Error fetching teams:", error.message);
    return [];
  }

  return data?.map((member: any) => member.teams).filter(Boolean) || [];
};

/**
 * Get a single team by ID
 * @param teamId - Team ID to fetch
 * @returns Team object or null if not found
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("❌ [getTeamById] Error fetching team:", error.message);
    return null;
  }

  return data;
};

/**
 * Get team members
 * @param teamId - Team ID
 * @returns Array of team members
 */
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId);

  if (error) {
    console.error("❌ [getTeamMembers] Error fetching members:", error.message);
    return [];
  }

  return data || [];
};
