"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getUserStats,
  incrementTasksCompleted,
} from "@/services/userStatsService";

interface UserStats {
  id: string;
  user_id: string;
  total_points: number;
  tasks_completed: number;
  created_at: string;
  updated_at: string;
}

interface UseUserStatsReturn {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  completeTask: () => Promise<void>;
  isCompleting: boolean;
}

export const useUserStats = (userId?: string): UseUserStatsReturn => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserStats(userId);
      setStats(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching user stats:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const completeTask = useCallback(async () => {
    if (!userId) return;

    try {
      setIsCompleting(true);
      setError(null);
      const updated = await incrementTasksCompleted(userId);
      setStats(updated);
    } catch (err: any) {
      setError(err.message);
      console.error("Error completing task:", err);
    } finally {
      setIsCompleting(false);
    }
  }, [userId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    completeTask,
    isCompleting,
  };
};
