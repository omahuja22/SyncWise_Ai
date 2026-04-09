import { supabase } from "@/lib/supabase";
import { Task, TaskStatus } from "@/app/data/tasks";

// Get all tasks
export const getTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

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
  deadline?: string,
  points: number = 10,
  teamId?: string
) => {
  const payload = {
    title,
    status: "pending" as TaskStatus,
    deadline: deadline || null,
    points,
    assigned_to: null,
    team_id: teamId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log("Creating task with payload:", payload);

  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Task creation error:", error);
    throw new Error(`Failed to create task: ${error.message}`);
  }

  console.log("Task created successfully:", data);
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