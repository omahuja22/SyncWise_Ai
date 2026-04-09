-- CRITICAL: Row-Level Security (RLS) Policies for Tasks Table
-- Run this in Supabase SQL Editor to fix task visibility and creation issues

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON TASKS TABLE
-- ============================================================================

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
COMMIT;

-- ============================================================================
-- 2. DROP EXISTING POLICIES (if they exist) TO AVOID CONFLICTS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
COMMIT;

-- ============================================================================
-- 3. CREATE RLS POLICY: SELECT (View own tasks)
-- ============================================================================

CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- 4. CREATE RLS POLICY: INSERT (Create own tasks)
-- ============================================================================
-- CRITICAL: This ensures users can ONLY create tasks with their own user_id
-- The app calls createTask with user.id, so WITH CHECK enforces this

CREATE POLICY "Users can create tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- 5. CREATE RLS POLICY: UPDATE (Modify own tasks)
-- ============================================================================
-- USING: Check the task they're updating belongs to them
-- WITH CHECK: Ensure they can't reassign the task to another user

CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- 6. CREATE RLS POLICY: DELETE (Remove own tasks)
-- ============================================================================

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run after setup to verify policies)
-- ============================================================================

-- Check if RLS is enabled on tasks
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'tasks';

-- Check all policies on tasks table
-- SELECT * FROM pg_policies WHERE tablename = 'tasks';

-- ============================================================================
-- HOW TO APPLY THIS MIGRATION
-- ============================================================================
/*
1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste THIS ENTIRE FILE (or run sections)
6. Click "Run" button
7. Verify all queries execute successfully (no red errors)
8. Refresh your Next.js app and test task creation

EXPECTED BEHAVIOR AFTER SETUP:
- ✅ Users can create tasks with their user_id
- ✅ Users can only see their own tasks
- ✅ Users can only update their own tasks
- ✅ Users can only delete their own tasks
- ✅ Tasks are persisted in the database
- ✅ Dashboard shows newly created tasks immediately after refresh

DEBUGGING IF STILL NOT WORKING:
- Check browser console for errors
- Check Supabase dashboard → SQL Editor → check table schema
- Verify 'tasks' table has 'user_id' column
- Verify user is authenticated (check auth.users table)
- Run SELECT * FROM tasks; to see if rows exist
- Check Supabase logs for RLS violations
*/

-- ============================================================================
-- ADDITIONAL: Check tasks table structure (optional)
-- ============================================================================
-- Uncomment below to verify the tasks table has all required columns:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks';
