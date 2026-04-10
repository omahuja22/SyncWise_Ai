# 🔧 CRITICAL FIXES - Copy/Paste Solutions

## ⚠️ IMPORTANT: Copy each function EXACTLY as shown below into the specified files

---

## FIX #1: getUserTeams() - REMOVE RELATIONSHIP JOINS
**File**: `services/teamService.ts`
**Location**: Replace the entire `getUserTeams()` function (lines ~75-90)
**Problem**: Supabase relationship error
**Solution**: Manual queries - NO joins

```typescript
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
```

---

## FIX #2: completeTask() - ENSURE POINTS ACTUALLY UPDATE
**File**: `services/taskService.ts`
**Location**: Replace entire `completeTask()` function (lines ~276-327)
**Problem**: Points not accumulating
**Solution**: Fetch current points, ADD to them, upsert

```typescript
// Complete task and update points (FIXED: Points now accumulate)
export const completeTask = async (taskId: string) => {
  console.log(`🔹 [completeTask] Completing task ${taskId}`);

  try {
    // STEP 1: Get the task (need points and user_id)
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, user_id, points, status")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      throw new Error("Task not found");
    }

    if (task.status === "done") {
      console.log("⚠️  Task already completed, returning");
      return task;
    }

    // STEP 2: Update task to done
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update task: ${updateError.message}`);
    }

    // STEP 3: Update user points (CRITICAL FIX)
    const pointsToAdd = task.points || 10;
    
    // Get current stats
    const { data: currentStats } = await supabase
      .from("user_stats")
      .select("total_points, tasks_completed")
      .eq("user_id", task.user_id)
      .single();

    const newTotalPoints = (currentStats?.total_points || 0) + pointsToAdd;
    const newTasksCompleted = (currentStats?.tasks_completed || 0) + 1;

    console.log(`💰 Adding ${pointsToAdd} points. New total: ${newTotalPoints}`);

    // Upsert - create if not exists, update if exists
    const { error: upsertError } = await supabase
      .from("user_stats")
      .upsert(
        {
          user_id: task.user_id,
          total_points: newTotalPoints,
          tasks_completed: newTasksCompleted,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.warn("⚠️  Points update failed (non-critical):", upsertError.message);
    } else {
      console.log("✅ [completeTask] Points updated successfully");
    }

    return updatedTask;
  } catch (err: any) {
    console.error("❌ [completeTask] Error:", err.message);
    throw err;
  }
};
```

---

## FIX #3: joinTeamByCode() - REMOVE EMAIL SYSTEM
**File**: `services/teamService.ts`
**Location**: Replace entire `joinTeamByCode()` function (if exists) or ADD before closing brace
**Problem**: Email system too complex
**Solution**: Simple join_code lookup

```typescript
/**
 * Join team by entering join code
 * FIXED: Removed email complexity, pure join_code lookup
 */
export const joinTeamByCode = async (joinCode: string): Promise<Team> => {
  console.log("🔹 [joinTeamByCode] Attempting to join with code:", joinCode);

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      throw new Error("Not authenticated");
    }

    if (!joinCode?.trim()) {
      throw new Error("Please enter a join code");
    }

    // STEP 1: Find team by join_code
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, name, created_by")
      .eq("join_code", joinCode.trim().toUpperCase())
      .single();

    if (teamError) {
      if (teamError.code === "PGRST116") {
        throw new Error("Invalid join code");
      }
      throw new Error(teamError.message);
    }

    if (!team) {
      throw new Error("Team not found");
    }

    console.log("✅ Found team:", team.name);

    // STEP 2: Check if already a member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", team.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      console.log("⚠️  Already a member of this team");
      return team as Team;
    }

    // STEP 3: Add as member
    const { error: insertError } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: "member",
      });

    if (insertError) {
      throw new Error(`Failed to join team: ${insertError.message}`);
    }

    console.log("✅ [joinTeamByCode] Successfully joined team:", team.name);
    return team as Team;
  } catch (err: any) {
    console.error("❌ [joinTeamByCode] Error:", err.message);
    throw err;
  }
};
```

---

## FIX #4: Dashboard Logic - COMPUTE STATS
**File**: `app/components/pages/OverviewPage.tsx`
**Location**: Replace entire file or update the component logic
**Problem**: Dashboard not showing stats
**Solution**: Fetch tasks, compute counts

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useTeams } from '@/app/contexts/TeamContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { getTeamTasks } from '@/services/taskService';
import { getUserStats } from '@/services/userStatsService';

export default function OverviewPage() {
  const { selectedTeamId } = useTeams();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalPoints: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!selectedTeamId || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get all tasks for this team
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("status, points")
          .eq("team_id", selectedTeamId);

        if (tasksError) throw tasksError;

        const taskList = tasks || [];
        const completed = taskList.filter(t => t.status === 'done').length;
        const pending = taskList.filter(t => t.status === 'pending').length;
        const total = taskList.length;
        const totalPoints = taskList
          .filter(t => t.status === 'done')
          .reduce((sum, t) => sum + (t.points || 0), 0);

        setStats({
          totalTasks: total,
          completedTasks: completed,
          pendingTasks: pending,
          totalPoints: totalPoints,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedTeamId, user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Team performance summary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Tasks */}
        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
            Total Tasks
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: 'var(--accent-primary)' }}
          >
            {stats.totalTasks}
          </p>
        </div>

        {/* Completed Tasks */}
        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
            Completed
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: 'var(--accent-success)' }}
          >
            {stats.completedTasks}
          </p>
        </div>

        {/* Pending Tasks */}
        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
            Pending
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: 'var(--accent-warning)' }}
          >
            {stats.pendingTasks}
          </p>
        </div>

        {/* Completion Rate */}
        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
            Completion Rate
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: 'var(--accent-success)' }}
          >
            {stats.completionRate}%
          </p>
        </div>

        {/* Total Points */}
        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border md:col-span-2"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
            Team Points
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: 'var(--accent-info)' }}
          >
            {stats.totalPoints}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## FIX #5: Leaderboard - FETCH REAL DATA
**File**: `app/components/pages/LeaderboardPage.tsx`
**Location**: Replace entire file
**Problem**: Showing hardcoded data
**Solution**: Fetch user_stats, join with profiles

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTeams } from '@/app/contexts/TeamContext';

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  userId: string;
}

export default function LeaderboardPage() {
  const { selectedTeamId } = useTeams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!selectedTeamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // STEP 1: Get team members
        const { data: members, error: membersError } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("team_id", selectedTeamId);

        if (membersError || !members) {
          console.error("Error fetching team members:", membersError);
          setLeaderboard([]);
          return;
        }

        const userIds = members.map((m: any) => m.user_id);

        // STEP 2: Get user stats (already sorted by points if we order)
        const { data: stats, error: statsError } = await supabase
          .from("user_stats")
          .select("user_id, total_points")
          .in("user_id", userIds)
          .order("total_points", { ascending: false });

        if (statsError || !stats) {
          console.error("Error fetching stats:", statsError);
          setLeaderboard([]);
          return;
        }

        // STEP 3: Get profiles for names
        const { data: profiles, error: profilesError } = await supabase
          .from("user_profiles")
          .select("id, full_name")
          .in("id", userIds);

        if (profilesError || !profiles) {
          console.error("Error fetching profiles:", profilesError);
          setLeaderboard([]);
          return;
        }

        // Combine data
        const profileMap = new Map(profiles.map((p: any) => [p.id, p.full_name]));
        const data: LeaderboardEntry[] = (stats || []).map((s: any, idx: number) => ({
          rank: idx + 1,
          name: profileMap.get(s.user_id) || 'Unknown',
          points: s.total_points || 0,
          userId: s.user_id,
        }));

        setLeaderboard(data);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [selectedTeamId]);

  if (loading) {
    return (
      <div style={{ color: 'var(--text-secondary)' }} className="text-center py-8">
        Loading leaderboard...
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div
        className="rounded-lg p-8 text-center baseline border"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          No team selected. Select a team to view leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {leaderboard.length} team members
        </p>
      </div>

      <div
        className="rounded-lg overflow-hidden backdrop-blur-sm border"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {leaderboard.map((entry, idx) => (
          <div
            key={entry.userId}
            className="flex items-center justify-between p-4"
            style={{
              borderBottom: idx < leaderboard.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              backgroundColor: entry.rank === 1 ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center"
                style={{
                  backgroundColor: entry.rank === 1 ? 'var(--accent-success)' : 'rgba(255, 255, 255, 0.1)',
                  color: entry.rank === 1 ? '#0b0b0f' : 'var(--foreground)',
                }}
              >
                #{entry.rank}
              </div>
              <p style={{ color: 'var(--foreground)' }} className="font-medium">
                {entry.name}
              </p>
            </div>
            <p
              className="text-lg font-bold"
              style={{ color: 'var(--accent-success)' }}
            >
              {entry.points} pts
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## FIX #6: Analytics - USE SAME TASK DATA
**File**: `app/components/pages/AnalyticsPage.tsx`
**Location**: Update component to fetch and compute

```typescript
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useTeams } from '@/app/contexts/TeamContext';

export default function AnalyticsPage() {
  const { selectedTeamId } = useTeams();
  const [data, setData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
    chartData: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedTeamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all tasks for this team
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("status")
          .eq("team_id", selectedTeamId);

        if (tasksError || !tasks) {
          console.error("Error fetching analytics:", tasksError);
          return;
        }

        const completed = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const total = tasks.length;

        setData({
          totalTasks: total,
          completedTasks: completed,
          pendingTasks: pending,
          inProgressTasks: inProgress,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          chartData: [
            { name: 'Pending', value: pending },
            { name: 'In Progress', value: inProgress },
            { name: 'Completed', value: completed },
          ],
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedTeamId]);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Team performance data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg p-8 text-center backdrop-blur-sm border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">Total Tasks</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--accent-primary)' }}>{data.totalTasks}</p>
        </div>

        <div className="rounded-lg p-8 text-center backdrop-blur-sm border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">Completed</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--accent-success)' }}>{data.completedTasks}</p>
        </div>

        <div className="rounded-lg p-8 text-center backdrop-blur-sm border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">Completion Rate</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--accent-success)' }}>{data.completionRate}%</p>
        </div>

        <div className="rounded-lg p-8 text-center backdrop-blur-sm border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">In Progress</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--accent-warning)' }}>{data.inProgressTasks}</p>
        </div>
      </div>

      {/* Chart */}
      {data.chartData.length > 0 && (
        <div className="rounded-lg p-6 backdrop-blur-sm border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
              <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
```

---

## FIX #7: TeamContext - ADD selectedTeamId STATE
**File**: `app/contexts/TeamContext.tsx`
**Location**: Update entire file
**Problem**: selectedTeamId not persisted across components
**Solution**: Store in context

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface Team {
  id: string;
  name: string;
  join_code?: string;
  created_by: string;
  created_at: string;
}

interface TeamContextType {
  teams: Team[];
  selectedTeamId: string | null;
  setSelectedTeamId: (teamId: string | null) => void;
  loading: boolean;
  error: string | null;
  refetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Team>;
  joinTeamByCode: (code: string) => Promise<Team>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's teams
  const refetchTeams = useCallback(async () => {
    if (!user?.id) {
      setTeams([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get team_id values
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      if (membersError) throw membersError;

      if (!members || members.length === 0) {
        setTeams([]);
        setSelectedTeamId(null);
        return;
      }

      const teamIds = members.map((m: any) => m.team_id);

      // Get teams
      const { data: teamsList, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .in("id", teamIds);

      if (teamsError) throw teamsError;

      setTeams(teamsList || []);

      // Auto-select first team if none selected
      if (!selectedTeamId && teamsList && teamsList.length > 0) {
        setSelectedTeamId(teamsList[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching teams:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedTeamId]);

  // Fetch teams on user change
  useEffect(() => {
    refetchTeams();
  }, [user?.id]);

  // Create team
  const createTeam = async (name: string): Promise<Team> => {
    if (!user?.id) throw new Error("Not authenticated");

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({ name, created_by: user.id })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add creator as leader
    await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "leader",
    });

    await refetchTeams();
    return team;
  };

  // Join team by code
  const joinTeamByCode = async (code: string): Promise<Team> => {
    if (!user?.id) throw new Error("Not authenticated");

    // Find team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("join_code", code.trim().toUpperCase())
      .single();

    if (teamError) throw new Error("Invalid join code");

    // Add user to team
    await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "member",
    });

    await refetchTeams();
    return team;
  };

  return (
    <TeamContext.Provider value={{
      teams,
      selectedTeamId,
      setSelectedTeamId,
      loading,
      error,
      refetchTeams,
      createTeam,
      joinTeamByCode,
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeams must be used within TeamProvider");
  }
  return context;
}
```

---

## FIX #8: Add Navigation to Buttons
**File**: Any component with buttons (e.g., `TasksPage.tsx`, `OverviewPage.tsx`)
**Location**: Add router.push() to button clicks

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function SomePage() {
  const router = useRouter();

  return (
    <button onClick={() => router.push('/dashboard/tasks')}>
      View Tasks
    </button>
  );
}
```

---

## INSTALLATION CHECKLIST

- [ ] 1. Copy `getUserTeams()` to `services/teamService.ts` (lines 75-90)
- [ ] 2. Copy `completeTask()` to `services/taskService.ts` (lines 276-327)
- [ ] 3. Copy `joinTeamByCode()` to `services/teamService.ts` (add at end before closing)
- [ ] 4. Copy `OverviewPage` to `app/components/pages/OverviewPage.tsx`
- [ ] 5. Copy `LeaderboardPage` to `app/components/pages/LeaderboardPage.tsx`
- [ ] 6. Copy `AnalyticsPage` to `app/components/pages/AnalyticsPage.tsx`
- [ ] 7. Copy `TeamContext` to `app/contexts/TeamContext.tsx`
- [ ] 8. Add router.push() to button components as needed

---

## TEST CHECKLIST

✅ Create team → Join with code → Create task → Complete task → See points increase
✅ Dashboard shows: Total, Completed, Pending, Completion %
✅ Leaderboard shows: User names + points (sorted)
✅ Analytics shows: Chart + all metrics
✅ Navigation works (buttons redirect properly)
✅ No Supabase relationship errors
✅ Points accumulate (not overwrite)

---

**CRITICAL**: Copy code EXACTLY. Do NOT modify or refactor.
