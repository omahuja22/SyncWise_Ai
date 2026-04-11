import { supabase } from "@/lib/supabase";

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  team_code?: string;
}

/**
 * Create a new team and add creator as leader
 * @param teamName Team name
 * @param userId User ID of creator
 * @returns Created team object
 */
export const createTeam = async (teamName: string): Promise<Team> => {
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user?.id) {
    throw new Error("Not authenticated");
  }

  console.log(`🔹 [createTeam] Creating team: ${teamName} for user: ${user.id}`);

  if (!teamName?.trim()) {
    throw new Error("Team name is required");
  }

  // Generate unique team code (6 uppercase alphanumeric characters)
  const team_code = Math.random().toString(36).substring(2, 8).toUpperCase();
  console.log(`🔹 [createTeam] Generated team code: ${team_code}`);

  // STEP 1: Insert into teams table
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .insert([
      {
        name: teamName.trim(),
        created_by: user.id,
        team_code: team_code,
      },
    ])
    .select()
    .single();

  if (teamError) {
    console.error("❌ [createTeam] Team insert failed:", teamError.message);
    throw new Error(teamError.message);
  }

  if (!teamData?.id) {
    throw new Error("Failed to create team");
  }

  console.log("✅ [createTeam] Team created:", teamData.id);

  // STEP 2: Add creator as team admin (role=admin)
  const { error: memberError } = await supabase
    .from("team_members")
    .insert([
      {
        team_id: teamData.id,
        user_id: user.id,
        role: "admin",
      },
    ]);

  if (memberError) {
    console.error("❌ [createTeam] Member insert failed:", memberError.message);
    throw new Error(memberError.message);
  }

  console.log("✅ [createTeam] User added as team admin");
  console.log(`🎯 [createTeam] TEAM CODE: ${teamData.team_code}`);
  
  return teamData;
};

/**
 * Get all teams for a user
 * FIXED: Use manual queries instead of relationships
 */
export const getUserTeams = async (userId: string): Promise<Team[]> => {
  console.log("🔹 [getUserTeams] Fetching teams for user:", userId);

  try {
    // STEP 1: Get all team_members records for this user
    const { data: memberRecords, error: memberError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId);

    if (memberError) {
      console.error("❌ [getUserTeams] Failed to fetch team_members:", memberError.message);
      return [];
    }

    if (!memberRecords || memberRecords.length === 0) {
      console.log("✅ [getUserTeams] User has no teams");
      return [];
    }

    const teamIds = memberRecords.map((m: any) => m.team_id);
    console.log("🔹 [getUserTeams] Found team IDs:", teamIds);

    // STEP 2: Fetch teams using team_id values (manual join)
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .in("id", teamIds);

    if (teamsError) {
      console.error("❌ [getUserTeams] Failed to fetch teams:", teamsError.message);
      return [];
    }

    console.log("✅ [getUserTeams] Retrieved", teams?.length || 0, "teams");
    return teams || [];
  } catch (error: any) {
    console.error("❌ [getUserTeams] Unexpected error:", error);
    return [];
  }
};

/**
 * Delete a team (only team leader can delete)
 * @param teamId Team ID to delete
 * @param userId User ID (must be team leader)
 * @returns Success message
 */
export const deleteTeam = async (teamId: string, userId: string): Promise<void> => {
  console.log(`🔹 [deleteTeam] Attempting to delete team: ${teamId} by user: ${userId}`);

  // STEP 1: Check if user is team admin
  const { data: memberData, error: memberCheckError } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single();

  if (memberCheckError || !memberData) {
    console.error("❌ [deleteTeam] User is not a team member");
    throw new Error("User is not a team member");
  }

  // Check if user has admin role (not just member or leader)
  if (memberData.role !== "admin") {
    console.error("❌ [deleteTeam] User does not have admin role:", memberData.role);
    throw new Error("Only team admins can delete this team");
  }

  console.log("✅ [deleteTeam] User is team admin, proceeding with deletion");

  // STEP 2: Delete all team_members records
  const { error: deleteMembersError } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId);

  if (deleteMembersError) {
    console.error("❌ [deleteTeam] Failed to delete team members:", deleteMembersError.message);
    throw new Error(`Failed to remove team members: ${deleteMembersError.message}`);
  }

  console.log("✅ [deleteTeam] Team members deleted");

  // STEP 3: Delete the team
  const { error: deleteTeamError } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (deleteTeamError) {
    console.error("❌ [deleteTeam] Failed to delete team:", deleteTeamError.message);
    throw new Error(`Failed to delete team: ${deleteTeamError.message}`);
  }

  console.log("✅ [deleteTeam] Team deleted successfully");
};

// ============================================
// MEMBER MANAGEMENT
// ============================================

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "admin" | "member";
  created_at?: string;
  user_profiles?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

/**
 * Get all members of a team with their profile info
 * @param teamId Team ID
 * @returns List of team members with profiles
 */
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  console.log("🔹 [getTeamMembers] Fetching members for team:", teamId);

  try {
    // Step 1: Fetch team members
    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select("id, team_id, user_id, role")
      .eq("team_id", teamId);

    if (membersError) {
      console.error("❌ [getTeamMembers] Failed to fetch members:", membersError.message);
      throw new Error(membersError.message);
    }

    if (!members || members.length === 0) {
      console.log("✅ [getTeamMembers] No members found (team is empty)");
      return [];
    }

    // Step 2: Fetch user profiles for these members
    const userIds = members.map((m) => m.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("❌ [getTeamMembers] Failed to fetch profiles:", profilesError.message);
      throw new Error(profilesError.message);
    }

    // Step 3: Combine members with their profiles
    const profilesMap = new Map(
      (profiles || []).map((p: any) => [p.id, p])
    );

    const membersWithProfiles: TeamMember[] = members.map((m: any) => ({
      id: m.id,
      team_id: m.team_id,
      user_id: m.user_id,
      role: m.role,
      created_at: new Date().toISOString(),
      user_profiles: profilesMap.get(m.user_id) || {
        full_name: "Unknown User",
        email: "unknown@example.com",
        avatar_url: undefined,
      },
    }));

    console.log("✅ [getTeamMembers] Retrieved", membersWithProfiles.length, "members");
    return membersWithProfiles;
  } catch (err: any) {
    console.error("❌ [getTeamMembers] Error:", err.message);
    throw err;
  }
};

/**
 * Get member count for a team
 * @param teamId Team ID
 * @returns Number of members
 */
export const getTeamMemberCount = async (teamId: string): Promise<number> => {
  const { count, error } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  if (error) {
    console.error("❌ [getTeamMemberCount] Error:", error.message);
    return 0;
  }

  return count || 0;
};

/**
 * Check if user is admin of a team
 * @param teamId Team ID
 * @param userId User ID
 * @returns true if user is admin, false otherwise
 */
export const isTeamAdmin = async (teamId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.log("🔹 [isTeamAdmin] User is not a team member");
      return false;
    }

    const isAdmin = data.role === "admin";
    console.log("🔹 [isTeamAdmin] User role:", data.role, "- is admin:", isAdmin);
    return isAdmin;
  } catch (err: any) {
    console.error("❌ [isTeamAdmin] Error:", err.message);
    return false;
  }
};

/**
 * Invite a user to a team by email
 * @param teamId Team ID
 * @param inviteeEmail Email of user to invite
 * @param inviterId User ID of person sending invite (must be leader)
 * @returns Created team member
 */
export const inviteTeamMember = async (
  teamId: string,
  inviteeEmail: string
): Promise<{ success: boolean }> => {
  console.log("🔹 [inviteTeamMember] Invite requested:", inviteeEmail);

  if (!inviteeEmail?.trim()) {
    throw new Error("Please enter an email address");
  }

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user?.id) {
    throw new Error("Not authenticated");
  }

  // Check if user is team leader
  const { data: inviterData, error: inviterError } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (inviterError || !inviterData) {
    throw new Error("You are not a member of this team");
  }

  if (inviterData.role !== "admin") {
    throw new Error("Only team admins can invite members");
  }

  // DEMO MODE: Return success
  console.log("✅ [inviteTeamMember] Invite sent (demo mode):", inviteeEmail);
  return { success: true };
};

/**
 * Update a member's role
 * @param teamId Team ID
 * @param memberId Member ID to update
 * @param newRole New role ("admin" or "member")
 * @param requesterId User ID of person making the request (must be leader)
 */
export const updateMemberRole = async (
  teamId: string,
  memberId: string,
  newRole: "admin" | "member",
  requesterId: string
): Promise<void> => {
  console.log("🔹 [updateMemberRole] Updating member:", memberId, "to role:", newRole);

  // STEP 1: Check if requester is team leader
  const { data: requesterData, error: requesterError } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", requesterId)
    .single();

  if (requesterError || !requesterData || requesterData.role !== "admin") {
    console.error("❌ [updateMemberRole] Requester is not a team admin");
    throw new Error("Only team admins can change member roles");
  }

  // STEP 2: Update member role
  const { error: updateError } = await supabase
    .from("team_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("team_id", teamId);

  if (updateError) {
    console.error("❌ [updateMemberRole] Failed to update role:", updateError.message);
    throw new Error(updateError.message);
  }

  console.log("✅ [updateMemberRole] Member role updated successfully");
};

/**
 * Remove a member from a team
 * @param teamId Team ID
 * @param memberId Member ID to remove
 * @param requesterId User ID of person making the request (must be leader)
 */
export const removeMember = async (
  teamId: string,
  memberId: string
): Promise<void> => {
  console.log("🔹 [removeMember] Removing member:", memberId, "from team:", teamId);

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user?.id) {
    throw new Error("Not authenticated");
  }

  // STEP 1: Check if requester is team leader
  const { data: requesterData, error: requesterError } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (requesterError || !requesterData || requesterData.role !== "admin") {
    console.error("❌ [removeMember] Requester is not a team admin");
    throw new Error("Only team admins can remove members");
  }

  // STEP 2: Check member exists and belongs to team
  const { data: memberData, error: memberError } = await supabase
    .from("team_members")
    .select("role, user_id")
    .eq("id", memberId)
    .eq("team_id", teamId)
    .single();

  if (memberError || !memberData) {
    console.error("❌ [removeMember] Member not found");
    throw new Error("Member not found in this team");
  }

  // STEP 3: Prevent removing the last admin
  if (memberData.role === "admin") {
    const { count: adminCount } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_id", teamId)
      .eq("role", "admin");

    if (adminCount === 1) {
      console.error("❌ [removeMember] Cannot remove last admin");
      throw new Error("Cannot remove the last admin from the team");
    }
  }

  // STEP 4: Remove member
  const { error: deleteError } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId)
    .eq("team_id", teamId);

  if (deleteError) {
    console.error("❌ [removeMember] Failed to remove member:", deleteError.message);
    throw new Error(deleteError.message);
  }

  console.log("✅ [removeMember] Member removed successfully");
};

/**
 * Join a team using a join code
 * @param joinCode 6-character join code
 * @returns The team joined
 */
export const joinTeamByCode = async (joinCode: string): Promise<Team> => {
  console.log("🔹 [joinTeamByCode] Attempting to join team with code:", joinCode);

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user?.id) {
    throw new Error("Not authenticated");
  }

  if (!joinCode?.trim()) {
    throw new Error("Please enter a valid join code");
  }

  // STEP 1: Find team by team code
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("team_code", joinCode.trim().toUpperCase())
    .single();

  if (teamError) {
    if (teamError.code === "PGRST116") {
      throw new Error("Invalid join code. Team not found.");
    }
    console.error("❌ [joinTeamByCode] Error finding team:", teamError.message);
    throw new Error(teamError.message);
  }

  if (!teamData) {
    throw new Error("Team not found with this join code");
  }

  console.log("✅ [joinTeamByCode] Team found:", teamData.id);

  // STEP 2: Check if user is already a member
  const { data: existingMember, error: memberCheckError } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamData.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    console.log("⚠️  [joinTeamByCode] User is already a member of this team");
    return teamData;
  }

  // STEP 3: Add user as team member
  const { error: memberError } = await supabase
    .from("team_members")
    .insert([
      {
        team_id: teamData.id,
        user_id: user.id,
        role: "member",
      },
    ]);

  if (memberError) {
    console.error("❌ [joinTeamByCode] Failed to add member:", memberError.message);
    throw new Error(memberError.message);
  }

  console.log("✅ [joinTeamByCode] Successfully joined team:", teamData.name);
  return teamData;
};

/**
 * Get team leaderboard (members ranked by points)
 * @param teamId Team ID
 * @returns Sorted leaderboard entries
 */
export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  userId: string;
}

export const getLeaderboard = async (teamId: string): Promise<LeaderboardEntry[]> => {
  console.log("🔹 [getLeaderboard] Fetching leaderboard for team:", teamId);

  if (!teamId) {
    console.log("⚠️  [getLeaderboard] No team ID provided");
    return [];
  }

  try {
    // STEP 1: Get all completed tasks for the team
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("assigned_to, points")
      .eq("team_id", teamId)
      .eq("status", "done");

    if (tasksError || !tasks || tasks.length === 0) {
      console.log("⚠️  [getLeaderboard] No completed tasks found for team");
      return [];
    }

    // STEP 2: Group points by assigned_to (user_id)
    const pointsMap = new Map<string, number>();
    tasks.forEach((task: any) => {
      if (task.assigned_to) {
        const current = pointsMap.get(task.assigned_to) || 0;
        pointsMap.set(task.assigned_to, current + (task.points || 0));
      }
    });

    const userIds = Array.from(pointsMap.keys());
    console.log("🔹 [getLeaderboard] Found", userIds.length, "users with points");

    // STEP 3: Fetch user profiles for names
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, full_name")
      .in("id", userIds);

    if (profilesError) {
      console.error("❌ [getLeaderboard] Error fetching profiles:", profilesError.message);
      return [];
    }

    // STEP 4: Combine data and sort by points DESC
    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
    const leaderboardData: LeaderboardEntry[] = userIds
      .map((userId: string) => ({
        userId,
        points: pointsMap.get(userId) || 0,
        name: profilesMap.get(userId) || "Unknown User",
      }))
      .sort((a, b) => b.points - a.points)
      .map((entry, idx) => ({
        rank: idx + 1,
        ...entry,
      }));

    console.log("✅ [getLeaderboard] Built leaderboard with", leaderboardData.length, "entries");
    return leaderboardData;
  } catch (error: any) {
    console.error("❌ [getLeaderboard] Unexpected error:", error);
    return [];
  }
};;
