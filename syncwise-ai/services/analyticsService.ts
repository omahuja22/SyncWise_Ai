import { supabase } from "@/lib/supabase";
import { Task } from "@/app/data/tasks";

/**
 * Analytics and statistics for team performance
 */

export interface TeamStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  onTimePercentage: number;
  completionRate: number;
  efficiencyScore: number;
  averageTaskPoints: number;
}

export interface UserStats {
  userId: string;
  userName: string;
  totalPoints: number;
  tasksCompleted: number;
  onTimePercentage: number;
  rank?: number;
  activity: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  task_id: string;
  action: 'view' | 'complete' | 'create' | 'update';
  created_at: string;
}

/**
 * Compute team statistics
 * @param teamId - Team ID
 * @param tasks - List of team tasks
 * @returns Statistics object
 */
export const computeTeamStats = (tasks: Task[]): TeamStats => {
  const now = new Date().toISOString();

  const completed = tasks.filter((t) => t.status === 'done').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const overdue = tasks.filter((t) => {
    if (!t.deadline) return false;
    return t.deadline < now && t.status !== 'done';
  }).length;

  const completedOnTime = tasks.filter((t) => {
    if (t.status !== 'done' || !t.deadline) return false;
    return t.deadline >= t.updated_at!;
  }).length;

  const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
  const onTimePercentage = completed > 0 ? (completedOnTime / completed) * 100 : 0;
  const avgPoints = tasks.length > 0 ? tasks.reduce((sum, t) => sum + (t.points || 10), 0) / tasks.length : 0;

  // Efficiency formula: (0.5 × On-time rate) + (0.3 × completion rate) + (0.2 × activity)
  const activityScore = Math.min(100, tasks.length * 10); // Normalize activity
  const efficiencyScore =
    (onTimePercentage / 100) * 0.5 +
    (completionRate / 100) * 0.3 +
    (activityScore / 100) * 0.2;

  return {
    totalTasks: tasks.length,
    completedTasks: completed,
    pendingTasks: pending,
    overdueTasks: overdue,
    inProgressTasks: inProgress,
    onTimePercentage: Math.round(onTimePercentage),
    completionRate: Math.round(completionRate),
    efficiencyScore: Math.round(efficiencyScore * 100),
    averageTaskPoints: Math.round(avgPoints),
  };
};

/**
 * Detect if user is at risk
 * @param tasks - User's tasks
 * @returns Risk assessment
 */
export const assessRisk = (tasks: Task[]): { atRisk: boolean; reason?: string } => {
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const overdue = tasks.filter((t) => {
    if (!t.deadline) return false;
    return t.deadline < new Date().toISOString() && t.status !== 'done';
  }).length;

  if (pending > 3 || overdue > 1) {
    return {
      atRisk: true,
      reason:
        overdue > 1
          ? `⚠️ You have ${overdue} overdue tasks. Act now!`
          : `⚠️ You have ${pending} pending tasks. Stay focused!`,
    };
  }

  return { atRisk: false };
};

/**
 * Get user statistics for team (for leaderboard)
 * @param teamId - Team ID
 * @returns Array of user stats sorted by points
 */
export const getTeamLeaderboard = async (teamId: string): Promise<UserStats[]> => {
  console.log("🔹 [getTeamLeaderboard] Fetching leaderboard for team:", teamId);

  try {
    // Fetch team members
    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select("user_id, user_profiles(full_name, email)")
      .eq("team_id", teamId);

    if (membersError) {
      console.error("❌ [getTeamLeaderboard] Error fetching members:", membersError.message);
      return [];
    }

    if (!members || members.length === 0) {
      console.log("✅ [getTeamLeaderboard] No members found");
      return [];
    }

    // Fetch all tasks for this team
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("team_id", teamId);

    if (tasksError) {
      console.error("❌ [getTeamLeaderboard] Error fetching tasks:", tasksError.message);
      return [];
    }

    // Compute stats per user
    const leaderboard: UserStats[] = members
      .map((member: any) => {
        const userName = member.user_profiles?.full_name || "Unknown User";
        const userTasks = (tasks || []).filter((t: any) => t.user_id === member.user_id);
        const completed = userTasks.filter((t: any) => t.status === 'done').length;
        const totalPoints = userTasks.reduce((sum: number, t: any) => sum + (t.points || 10), 0);

        const completedOnTime = userTasks.filter((t: any) => {
          if (t.status !== 'done' || !t.deadline) return false;
          return t.deadline >= (t.updated_at || new Date().toISOString());
        }).length;

        const onTimePercentage = completed > 0 ? (completedOnTime / completed) * 100 : 0;

        return {
          userId: member.user_id,
          userName,
          totalPoints,
          tasksCompleted: completed,
          onTimePercentage: Math.round(onTimePercentage),
          activity: userTasks.length,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    console.log("✅ [getTeamLeaderboard] Retrieved leaderboard for", leaderboard.length, "users");
    return leaderboard;
  } catch (err: any) {
    console.error("❌ [getTeamLeaderboard] Error:", err.message);
    return [];
  }
};

/**
 * Get team analytics
 * * @param teamId Team ID
 * @returns Team analytics summary
 */
export const getTeamAnalytics = async (teamId: string) => {
  console.log("🔹 [getTeamAnalytics] Computing analytics for team:", teamId);

  try {
    // Get all tasks for team
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("team_id", teamId);

    if (tasksError) {
      console.error("❌ [getTeamAnalytics] Error fetching tasks:", tasksError.message);
      return {
        total_tasks: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        in_progress_tasks: 0,
        total_team_points: 0,
        completion_rate: 0,
      };
    }

    if (!tasks) {
      return {
        total_tasks: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        in_progress_tasks: 0,
        total_team_points: 0,
        completion_rate: 0,
      };
    }

    const total_tasks = tasks.length;
    const completed_tasks = tasks.filter((t) => t.status === "done").length;
    const pending_tasks = tasks.filter((t) => t.status === "pending").length;
    const in_progress_tasks = tasks.filter((t) => t.status === "in-progress").length;
    const total_team_points = tasks.reduce((sum, t) => sum + (t.points || 0), 0);
    const completion_rate = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

    const analytics = {
      total_tasks,
      completed_tasks,
      pending_tasks,
      in_progress_tasks,
      total_team_points,
      completion_rate,
    };

    console.log("✅ [getTeamAnalytics] Analytics computed:", analytics);
    return analytics;
  } catch (error: any) {
    console.error("❌ [getTeamAnalytics] Exception:", error.message);
    return {
      total_tasks: 0,
      completed_tasks: 0,
      pending_tasks: 0,
      in_progress_tasks: 0,
      total_team_points: 0,
      completion_rate: 0,
    };
  }
};

/**
 * Log user activity
 * @param userId - User ID
 * @param taskId - Task ID
 * @param action - Action type
 */
export const logActivity = async (
  userId: string,
  taskId: string,
  action: 'view' | 'complete' | 'create' | 'update'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("activity_logs")
      .insert([
        {
          user_id: userId,
          task_id: taskId,
          action,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.warn("⚠️  [logActivity] Failed to log:", error.message);
    }
  } catch (err: any) {
    console.warn("⚠️  [logActivity] Error:", err.message);
  }
};

/**
 * Get engagement metric for a user
 * @param userId - User ID
 * @param teamId - Team ID
 * @returns Activity count in last 7 days
 */
export const getUserEngagement = async (userId: string, teamId: string): Promise<number> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("activity_logs")
      .select("id", { count: 'exact' })
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString());

    if (error) {
      console.warn("⚠️  [getUserEngagement] Error:", error.message);
      return 0;
    }

    return data?.length || 0;
  } catch (err: any) {
    console.warn("⚠️  [getUserEngagement] Error:", err.message);
    return 0;
  }
};
