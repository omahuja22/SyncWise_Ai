"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  cycleTaskStatus,
} from "@/services/taskService";
import { Task } from "@/app/data/tasks";
import { useAuth } from "@/app/contexts/AuthContext";

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTask: (title: string, deadline?: string, points?: number) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  updateStatus: (taskId: string) => Promise<void>;
  isCreating: boolean;
  isDeleting: string | null;
  isUpdating: string | null;
}

export const useTasks = (): UseTasksReturn => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      console.log('🔹 [fetchTasks] Querying Supabase for user:', user?.id);
      setLoading(true);
      setError(null);
      const data = await getTasks(user?.id);
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
  }, [user?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-load sample tasks for demo mode if list is empty
  useEffect(() => {
    const loadSampleTasks = async () => {
      if (
        !loading && 
        tasks.length === 0 && 
        !error && 
        user?.id &&
        !isCreating
      ) {
        const sampleTasks = [
          { title: 'Design dashboard mockups', deadline: '2026-04-15', points: 8 },
          { title: 'Setup database schema', deadline: '2026-04-18', points: 13 },
          { title: 'Implement API endpoints', deadline: '2026-04-20', points: 21 },
        ];

        try {
          for (const task of sampleTasks) {
            await createTask(task.title, task.deadline, task.points, user.id, undefined, null);
          }
          await fetchTasks();
        } catch (err: any) {
          // Silent fail - don't break demo if samples can't load
        }
      }
    };

    loadSampleTasks();
  }, [loading, tasks.length, error, user?.id, isCreating, fetchTasks]);

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

        const newTask = await createTask(title, deadline, points, user.id, undefined, null);

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
    [user?.id, fetchTasks]
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

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    addTask,
    removeTask,
    updateStatus,
    isCreating,
    isDeleting,
    isUpdating,
  };
};