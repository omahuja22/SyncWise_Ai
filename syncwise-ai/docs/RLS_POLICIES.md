# Row-Level Security (RLS) Policies for Authentication

This document contains the SQL queries to set up user-scoped RLS policies in Supabase.

## Prerequisites
- Supabase project configured
- Supabase Auth enabled
- Database migrations completed

## Setup Instructions

### 1. Enable RLS on Tasks Table

```sql
-- Enable Row Level Security on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
```

### 2. Create Policy: Users can view their own tasks

```sql
CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
```

### 3. Create Policy: Users can create tasks

```sql
CREATE POLICY "Users can create tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 4. Create Policy: Users can update their own tasks

```sql
CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 5. Create Policy: Users can delete their own tasks

```sql
CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);
```

## How to Apply These Policies

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to: **SQL Editor** in the left sidebar
4. Create a new query
5. Copy and paste each SQL statement above (one at a time or all together)
6. Execute the query

## Policy Details

### SELECT Policy
- `FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL)`
- Allows users to view their own tasks
- Also allows viewing tasks where user_id is NULL (admin/system tasks)
- Scope: Read-only

### INSERT Policy
- `FOR INSERT WITH CHECK (auth.uid() = user_id)`
- Ensures new tasks are always created with the current user's ID
- Prevents users from creating tasks for other users
- Scope: Create-only

### UPDATE Policy
- `FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- Users can only modify their own tasks
- Both conditions ensure they own the task before and after update
- Scope: Modify existing tasks

### DELETE Policy
- `FOR DELETE USING (auth.uid() = user_id)`
- Users can only delete their own tasks
- Scope: Delete-only

## Testing the Policies

### Test INSERT (should allow)
```sql
-- As authenticated user, create task with their user_id
INSERT INTO public.tasks (title, status, points, user_id)
VALUES ('Test Task', 'pending', 10, auth.uid());
```

### Test INSERT (should fail)
```sql
-- Trying to create task for another user (will be rejected)
INSERT INTO public.tasks (title, status, points, user_id)
VALUES ('Test Task', 'pending', 10, 'some-other-user-id');
```

### Test SELECT (should show only user's tasks)
```sql
-- Will only return tasks for authenticated user or tasks with NULL user_id
SELECT * FROM public.tasks;
```

## Disabling RLS (for development/testing)

If you need to disable RLS temporarily:

```sql
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
```

⚠️ **WARNING**: Only disable RLS for development/testing. Always re-enable for production.

## Troubleshooting

### "new row violates row-level security policy"
- Ensure you're creating the task with `user_id: currentUser.id` from the AuthContext
- Check that the current user is authenticated

### "permission denied for schema public"
- Ensure the authenticated user has proper role permissions in Supabase
- Check that Supabase Auth is properly configured

### Tasks disappearing after refresh
- This is expected if user_id wasn't set or user is not authenticated
- Only tasks created with the current user's ID will be visible
- Check browser DevTools → Application → Cookies for auth session

## Code Integration

The app automatically uses `user_id` when creating tasks:

```typescript
// services/taskService.ts
const payload = {
  title,
  status: "pending",
  user_id: userId, // <- Set from current authenticated user
  // ... other fields
};
```

In the hook:
```typescript
// hooks/useTasks.ts
const { user } = useAuth(); // <- Get from AuthContext

await createTask(title, deadline, points, user.id); // <- Pass user.id to service
await getTasks(user?.id); // <- Filter tasks by user_id
```

