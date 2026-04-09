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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      console.log('🔹 [fetchTasks] Querying Supabase...');
      setLoading(true);
      setError(null);
      const data = await getTasks();
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
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (title: string, deadline?: string, points: number = 10) => {
      console.log('🔹 [addTask] START');
      if (!title.trim()) {
        console.warn('⚠️  [addTask] Title empty');
        return;
      }

      try {
        setIsCreating(true);
        setError(null);
        console.log('🔹 [addTask] Inserting via createTask...');
        const newTask = await createTask(title, deadline, points, undefined, null);
        console.log('✅ [addTask] Insert OK, ID:', newTask?.id);
        console.log('🔹 [addTask] Fetching latest tasks from DB...');
        await fetchTasks();
        console.log('✅ [addTask] UI refreshed - tasks reloaded');
      } catch (err: any) {
        const errorMsg = err.message || "Failed to create task";
        console.error('❌ [addTask] FAILED:', errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [fetchTasks]
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