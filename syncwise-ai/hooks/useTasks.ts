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

export const useTasks = (userId?: string): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks(userId);
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (title: string, deadline?: string, points: number = 10) => {
      if (!title.trim()) return;

      try {
        setIsCreating(true);
        setError(null);
        const newTask = await createTask(title, userId, deadline, points);
        setTasks((prev) => [newTask, ...prev]);
      } catch (err: any) {
        setError(err.message);
        console.error("Error creating task:", err);
      } finally {
        setIsCreating(false);
      }
    },
    [userId]
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