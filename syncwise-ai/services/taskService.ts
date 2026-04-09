import { supabase } from "@/lib/supabase";
import { Task, TaskStatus } from "@/app/data/tasks";

// Helper: Ensure assigned_to is valid UUID string or null (never an object)
const sanitizeAssignedTo = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value) ? value : null;
  }
  // Reject objects or any other type
  return null;
};

// Get all tasks for a specific user
export const getTasks = async (userId?: string) => {
  let query = supabase
    .from("tasks")
    .select("*");
  
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

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
  teamId?: string,
  assignedTo?: string | null
) => {
  const sanitized_assigned_to = sanitizeAssignedTo(assignedTo);
  const payload = {
    title,
    status: "pending" as TaskStatus,
    deadline: deadline || null,
    points,
    assigned_to: sanitized_assigned_to,
    team_id: teamId || null,
    created_at: new Date().toISOString(),
  };

  console.log("🔹 [createTask] Insert payload:", payload);
  console.log("   assigned_to sanitized to:", sanitized_assigned_to, "(type:", typeof sanitized_assigned_to, ")");

  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("❌ [createTask] Supabase error:", error.message);
    throw new Error(`Failed to create task: ${error.message}`);
  }

  console.log("✅ [createTask] Inserted row ID:", data?.id);
  return data;
};

// Update task status
export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .select();

  if (error) throw new Error(error.message);
  
  // Handle array response safely
  if (!data || data.length === 0) {
    throw new Error(`Task ${taskId} not found`);
  }

  return data[0];
};

// Update task (generic)
export const updateTask = async (
  taskId: string,
  updates: Record<string, any>
) => {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select();

  if (error) throw new Error(error.message);
  
  // Handle array response safely
  if (!data || data.length === 0) {
    throw new Error(`Task ${taskId} not found`);
  }

  return data[0];
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