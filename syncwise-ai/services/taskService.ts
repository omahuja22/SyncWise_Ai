import { supabase } from "@/lib/supabase";
import { Task, TaskStatus } from "@/app/data/tasks";

// Get all tasks for user
export const getTasks = async (userId?: string) => {
  let query = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data || [];
};

// Get single task by ID
export const getTaskById = async (taskId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Create new task
export const createTask = async (
  title: string,
  userId?: string,
  deadline?: string,
  points: number = 10
) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        title,
        status: "pending",
        user_id: userId,
        deadline,
        points,
        assigned_to: { name: "Unassigned", avatar: "U" },
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Update task status
export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Update task (generic)
export const updateTask = async (
  taskId: string,
  updates: Record<string, any>
) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Delete task
export const deleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  return true;
};

// Cycle task status: pending → in-progress → done → pending
export const cycleTaskStatus = async (taskId: string) => {
  const task = await getTaskById(taskId);

  const statusCycle: Record<TaskStatus, TaskStatus> = {
    pending: "in-progress",
    "in-progress": "done",
    done: "pending",
  };

  const newStatus = statusCycle[task.status as TaskStatus];
  return updateTaskStatus(taskId, newStatus);
};