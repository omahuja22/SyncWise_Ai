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

// Get all tasks for a team
export const getTeamTasks = async (teamId: string): Promise<Task[]> => {
  console.log("🔹 [getTeamTasks] Fetching tasks for team:", teamId);

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ [getTeamTasks] Error:", error.message);
    return [];
  }

  console.log("✅ [getTeamTasks] Retrieved", data?.length || 0, "tasks");
  return data || [];
};

// Get all tasks for a specific user
export const getTasks = async (userId?: string, teamId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.id) {
    console.log("ℹ️  [getTasks] No authenticated user");
    return [];
  }

  const finalUserId = userId || user.id;
  console.log("🔹 [getTasks] Fetching tasks for user:", finalUserId, teamId ? `in team: ${teamId}` : '');

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", finalUserId);

  // If teamId is provided, filter by team_id
  if (teamId) {
    query = query.eq("team_id", teamId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("❌ [getTasks] Error fetching tasks:", error);
    return [];
  }

  console.log("✅ [getTasks] Retrieved", (data?.length || 0), 'tasks');
  return data || [];
};

// Get single task by ID
export const getTaskById = async (taskId: string) => {
  console.log(`🔹 [getTaskById] Fetching task ${taskId}`);

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) {
    console.error("❌ [getTaskById] Error fetching task:", {
      message: error.message,
      code: error.code,
      hint: error.hint,
      details: error.details,
    });
    
    if (error.code === "PGRST116") {
      console.error("💡 [getTaskById] Task not found or belongs to another user");
    }
    
    throw new Error(error.message);
  }

  console.log("✅ [getTaskById] Task fetched successfully");
  return data;
};

// Create new task for a team
export const createTask = async (
  title: string,
  deadline?: string,
  points: number = 10,
  userId?: string,
  teamId?: string,
  assignedTo?: string | null,
  description?: string,
  priority?: 'low' | 'medium' | 'high'
) => {
  const sanitized_assigned_to = sanitizeAssignedTo(assignedTo);
  
  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.id) {
    console.error("❌ [createTask] No authenticated user found");
    throw new Error("User not logged in");
  }

  const finalUserId = userId || user.id;

  // Team ID is required for team-based system
  if (!teamId) {
    console.warn("⚠️  [createTask] No team ID provided, using personal task");
  }

  const payload = {
    title,
    description: description || null,
    status: "pending" as TaskStatus,
    priority: priority || 'medium',
    deadline: deadline || null,
    points,
    assigned_to: sanitized_assigned_to,
    user_id: finalUserId,
    team_id: teamId || null,
    created_at: new Date().toISOString(),
  };

  console.log("🔹 [createTask] Creating task:", { title, teamId, assignedTo: sanitized_assigned_to });

  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("❌ [createTask] Error:", error.message);
    throw error;
  }

  console.log("✅ [createTask] Task created:", data.id);
  return data;
};

// Update task status
export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
) => {
  console.log(`🔹 [updateTaskStatus] Updating task ${taskId} to status:`, status);

  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .select();

  if (error) {
    console.error("❌ [updateTaskStatus] Supabase error:", {
      message: error.message,
      code: error.code,
      hint: error.hint,
      details: error.details,
    });
    
    if (error.message?.includes("row-level security")) {
      console.error("💡 [updateTaskStatus] RLS Error: You can only update your own tasks");
    }
    
    throw new Error(`Failed to update task status: ${error.message}`);
  }
  
  // Handle array response safely
  if (!data || data.length === 0) {
    console.warn(`⚠️  [updateTaskStatus] No rows updated - task ${taskId} may not exist or belong to another user`);
    throw new Error(`Task ${taskId} not found`);
  }

  console.log("✅ [updateTaskStatus] Task updated successfully");
  return data[0];
};

// Update task (generic)
export const updateTask = async (
  taskId: string,
  updates: Record<string, any>
) => {
  console.log(`🔹 [updateTask] Updating task ${taskId} with:`, updates);

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select();

  if (error) {
    console.error("❌ [updateTask] Supabase error:", {
      message: error.message,
      code: error.code,
      hint: error.hint,
      details: error.details,
    });
    
    if (error.message?.includes("row-level security")) {
      console.error("💡 [updateTask] RLS Error: You can only update your own tasks");
    }
    
    throw new Error(`Failed to update task: ${error.message}`);
  }
  
  // Handle array response safely
  if (!data || data.length === 0) {
    console.warn(`⚠️  [updateTask] No rows updated - task ${taskId} may not exist or belong to another user`);
    throw new Error(`Task ${taskId} not found`);
  }

  console.log("✅ [updateTask] Task updated successfully");
  return data[0];
};

// Delete task
export const deleteTask = async (taskId: string) => {
  console.log(`🔹 [deleteTask] Attempting to delete task ${taskId}`);

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    console.error("❌ [deleteTask] Supabase error:", {
      message: error.message,
      code: error.code,
      hint: error.hint,
      details: error.details,
    });
    
    if (error.message?.includes("row-level security")) {
      console.error("💡 [deleteTask] RLS Error: You can only delete your own tasks");
    }
    
    throw new Error(`Failed to delete task: ${error.message}`);
  }

  console.log("✅ [deleteTask] Task deleted successfully");
  return true;
};

// Cycle task status: pending → in-progress → done → pending
export const cycleTaskStatus = async (taskId: string) => {
  const task = await getTaskById(taskId);

  const statusCycle: Record<TaskStatus, TaskStatus> = {
    pending: "in-progress",
    "in-progress": "done",
    done: "pending",
    overdue: "in-progress",
  };

  const newStatus = statusCycle[task.status as TaskStatus];
  return updateTaskStatus(taskId, newStatus);
};

// Complete task (mark as done + set completed_at + update user points)
export const completeTask = async (taskId: string) => {
  console.log(`🔹 [completeTask] Completing task ${taskId}`);

  // STEP 1: Fetch task to get creator_id and points
  const { data: taskData, error: fetchError } = await supabase
    .from("tasks")
    .select("id, user_id, points, status")
    .eq("id", taskId)
    .single();

  if (fetchError || !taskData) {
    console.error("❌ [completeTask] Error fetching task:", fetchError?.message);
    throw fetchError;
  }

  // If already done, just return
  if (taskData.status === "done") {
    console.log("⚠️  [completeTask] Task already completed");
    return taskData;
  }

  // STEP 2: Update task status to done
  const { data: updatedData, error: updateError } = await supabase
    .from("tasks")
    .update({
      status: "done" as TaskStatus,
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select();

  if (updateError || !updatedData || updatedData.length === 0) {
    console.error("❌ [completeTask] Error:", updateError?.message);
    throw updateError || new Error("Failed to update task");
  }

  const updatedTask = updatedData[0];
  const points = taskData.points || 10;

  console.log(`✅ [completeTask] Task completed - Points registered: +${points}pts`);
  return updatedTask;
};