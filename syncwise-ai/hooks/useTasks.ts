"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  cycleTaskStatus,
  completeTask,
} from "@/services/taskService";
import { Task } from "@/app/data/tasks";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTeams } from "@/app/contexts/TeamContext";

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTask: (title: string, deadline?: string, points?: number) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  updateStatus: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  isCreating: boolean;
  isDeleting: string | null;
  isUpdating: string | null;
}

export const useTasks = (): UseTasksReturn => {
  const { user } = useAuth();
  const { selectedTeamId } = useTeams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      console.log('🔹 [fetchTasks] Querying Supabase for user:', user?.id, 'team:', selectedTeamId || 'all');
      setLoading(true);
      setError(null);
      const data = await getTasks(user?.id, selectedTeamId || undefined);
      console.log('✅ [fetchTasks] Got', (data?.length || 0), 'tasks');
      setTasks(data || []);
      console.log('✅ [fetchTasks] State.tasks updated');
    } catch (err: any) {
      const message = err.message || 'Unknown error';
      console.error('❌ [fetchTasks] Failed:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedTeamId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (title: string, deadline?: string, points: number = 10) => {
      if (!title.trim()) {
        throw new Error("Task title is required");
      }

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        setIsCreating(true);
        setError(null);

        const newTask = await createTask(title, deadline, points, user.id, selectedTeamId || undefined, null);

        if (!newTask) {
          throw new Error("Task creation returned no data");
        }

        await fetchTasks();
        return newTask;
      } catch (err: any) {
        const errorMsg = err.message || "Failed to create task";
        setError(errorMsg);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [user?.id, selectedTeamId, fetchTasks]
  );

  const removeTask = useCallback(async (taskId: string) => {
    try {
      setIsDeleting(taskId);
      setError(null);
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting task:", err);
    } finally {
      setIsDeleting(null);
    }
  }, []);

  const updateStatus = useCallback(async (taskId: string) => {
    try {
      setIsUpdating(taskId);
      setError(null);
      const updatedTask = await cycleTaskStatus(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating task status:", err);
    } finally {
      setIsUpdating(null);
    }
  }, []);

  const completeTaskHandler = useCallback(async (taskId: string) => {
    try {
      setIsUpdating(taskId);
      setError(null);
      const completedTask = await completeTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? completedTask : t))
      );
    } catch (err: any) {
      setError(err.message);
      console.error("Error completing task:", err);
    } finally {
      setIsUpdating(null);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    addTask,
    removeTask,
    updateStatus,
    completeTask: completeTaskHandler,
    isCreating,
    isDeleting,
    isUpdating,
  };
};