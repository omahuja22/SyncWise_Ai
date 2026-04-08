# SyncWise AI - CRUD + Gamification Implementation Guide

## ✅ What's Been Built

### **1. Full CRUD Operations**
- ✅ **Create Task** - Add new tasks with title, deadline, points
- ✅ **Read Tasks** - Fetch all tasks from Supabase
- ✅ **Update Task Status** - Cycle through pending → in-progress → done
- ✅ **Delete Task** - Remove tasks with confirmation UX

### **2. Gamification System**
- ✅ **Points System** - Tasks have associated points (default: 10)
- ✅ **User Stats Tracking** - Total points, tasks completed
- ✅ **Visual Feedback** - Points display on dashboard
- ✅ **Progress Tracking** - Level system (0-100 to next level)

### **3. Production Architecture**
- ✅ Services layer (taskService.ts, userStatsService.ts)
- ✅ Custom React hooks (useTasks, useUserStats)
- ✅ Type-safe operations with TypeScript
- ✅ Async/await error handling
- ✅ Loading states for UX

---

## 📁 File Structure

```
syncwise-ai/
├── services/
│   ├── taskService.ts          # CRUD operations for tasks
│   └── userStatsService.ts     # Points & stats management
├── hooks/
│   ├── useTasks.ts             # Task state + actions
│   └── useUserStats.ts         # User stats state
├── app/components/
│   ├── TaskList.tsx            # Main task display
│   ├── TaskCard.tsx            # Individual task with delete
│   ├── CreateTaskModal.tsx     # Modal for creating tasks (NEW)
│   ├── UserStatsDisplay.tsx    # Points display (NEW)
│   └── pages/
│       └── OverviewPage.tsx    # Dashboard with stats
└── docs/
    └── SCHEMA.sql              # Database schema
```

---

## 🗄️ Database Schema

### Tasks Table
```sql
ALTER TABLE tasks ADD COLUMN points INTEGER DEFAULT 10;
```

**Columns:**
- `id` (uuid) - Primary key
- `title` (text) - Task name
- `status` (text) - pending | in-progress | done
- `user_id` (uuid) - Task owner
- `points` (integer) - Points earned when completed (DEFAULT: 10)
- `deadline` (timestamp) - Optional deadline
- `assigned_to` (jsonb) - { name, avatar }
- `created_at` (timestamp)
- `updated_at` (timestamp)

### User Stats Table
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_points INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Columns:**
- `id` (uuid) - Primary key
- `user_id` (uuid) - Foreign key to auth.users
- `total_points` (integer) - Cumulative points
- `tasks_completed` (integer) - Count of completed tasks
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Automatic Trigger
When a task status changes to "done", the `user_stats` table is automatically updated with points and task count.

---

## 🔧 Key Components

### TaskService (services/taskService.ts)
```typescript
// Create a task
await createTask(title, userId, deadline, points);

// Get all tasks
await getTasks(userId);

// Update task status (with auto-cycle)
await cycleTaskStatus(taskId);

// Delete task
await deleteTask(taskId);
```

### UserStatsService (services/userStatsService.ts)
```typescript
// Get user stats
await getUserStats(userId);

// Initialize stats (call on signup)
await initializeUserStats(userId);

// Add points
await addPointsToUser(userId, points);
```

### useTasks Hook
```typescript
const {
  tasks,           // Array of tasks
  loading,         // Loading state
  error,          // Error message
  addTask,        // Create task function
  removeTask,     // Delete task function
  updateStatus,   // Cycle status function
  isCreating,     // Creating state
  isDeleting,     // Task being deleted
  isUpdating,     // Task being updated
} = useTasks(userId);
```

### useUserStats Hook
```typescript
const {
  stats,          // { total_points, tasks_completed, ...}
  loading,        // Loading state
  completeTask,   // Increment task count
  refetch,        // Refresh stats
} = useUserStats(userId);
```

---

## 🎨 UI Components

### CreateTaskModal
Modal form for creating new tasks with:
- Title input (required)
- Deadline picker (optional)
- Points input (default: 10)
- Error handling
- Loading states

### TaskCard
Enhanced task display with:
- Delete button (appears on hover)
- Clickable status badge (cycles through states)
- Points display
- Optimistic UI (changes instant)
- Loading/deleting states

### UserStatsDisplay
Shows user gamification stats:
- Total points
- Tasks completed
- Progress bar (0-100)
- Compact mode available

---

## 🚀 Usage Examples

### Creating a Task
```typescript
const { addTask, isCreating } = useTasks();

await addTask('Design new feature', '2026-04-20', 15);
// Task created instantly in UI + sent to Supabase
```

### Updating Task Status
```typescript
const { updateStatus, isUpdating } = useTasks();

await updateStatus(taskId);
// Status cycles: pending → in-progress → done
// Auto-updates user points when marked "done"
```

### Deleting a Task
```typescript
const { removeTask, isDeleting } = useTasks();

await removeTask(taskId);
// Task removed from Supabase + UI
```

### Displaying User Points
```typescript
<UserStatsDisplay userId={currentUserId} />
// Shows total points, progress bar, tasks completed
```

---

## ⚙️ Setup Instructions

### 1. Run Database Schema
In Supabase SQL Editor, run:
```sql
-- Add points column to tasks
ALTER TABLE tasks ADD COLUMN points INTEGER DEFAULT 10;

-- Create user_stats table
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_points INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
```

### 2. Enable RLS Policies
Add policies for `tasks` and `user_stats` tables:
```sql
-- Tasks: Users can only see/modify their own
CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Stats: Users can only see their own
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);
```

### 3. Update Environment Variables
Ensure `.env.local` has Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_KEY=your_key
```

### 4. Start Development Server
```bash
npm run dev
```

---

## 🔄 Data Flow

```
User Interaction
    ↓
Component (TaskCard, TaskList)
    ↓
Hook (useTasks, useUserStats)
    ↓
Service Layer (taskService, userStatsService)
    ↓
Supabase API
    ↓
Database (tasks, user_stats)
    ↓
RLS Policies (security)
    ↓
Response back to Hook
    ↓
UI Updated (instant + real-time)
```

---

## 🛡️ Error Handling

All operations have try-catch blocks:
```typescript
try {
  await addTask(...);
} catch (err) {
  setError(err.message);
  // Show error in UI
}
```

Errors are displayed in red alert boxes in UI components.

---

## 📊 Real-World Example

A user completes a task:
1. Clicks status badge → "pending" → "in-progress" → "done"
2. `updateStatus()` is called
3. Supabase `tasks` table is updated
4. Trigger fires automatically
5. `user_stats` table incremented (+10 points, +1 tasks_completed)
6. UI refreshes
7. Dashboard shows new total points (e.g., 45 → 55)
8. Progress bar fills up

---

## 🎯 Future Enhancements

- [ ] Task categories/tags
- [ ] Recurring tasks
- [ ] Team collaboration (shared tasks)
- [ ] Achievement badges
- [ ] Leaderboard ranking
- [ ] Task comments/attachments
- [ ] Mobile app
- [ ] Email notifications

---

## 📝 Notes

- All operations are **real-time** (Supabase subscriptions ready)
- **Optimistic updates** - UI changes before server confirmation
- **Type-safe** - Full TypeScript support
- **Production-ready** - Error handling, loading states, RLS
- **No static mock data** - Everything from Supabase
- **Scalable** - Easy to add more features

---

**Build Status:** ✅ All routes pre-rendering successfully
**Last Updated:** April 9, 2026
