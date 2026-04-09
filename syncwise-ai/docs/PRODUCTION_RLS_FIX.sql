-- PRODUCTION FIX: Complete RLS Setup for Tasks Table
-- Run this entire script in Supabase SQL Editor

-- ============================================================================
-- 1. VERIFY TABLE STRUCTURE
-- ============================================================================
-- The tasks table should have these columns:
-- id (uuid, primary key)
-- title (text, required)
-- status (text, default 'pending')
-- user_id (uuid, required, references auth.users)
-- created_at (timestamp)
-- Other optional: deadline, points, team_id, assigned_to

-- ============================================================================
-- 2. ADD MISSING COLUMNS IF NEEDED
-- ============================================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add NOT NULL constraint if column exists without it
-- Uncomment if needed and column exists without data:
-- ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;

COMMIT;

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================================================
-- 4. DROP ALL EXISTING POLICIES (Clean slate)
-- ============================================================================

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

DROP POLICY IF EXISTS "Allow insert" ON tasks;
DROP POLICY IF EXISTS "Allow select" ON tasks;
DROP POLICY IF EXISTS "Allow update" ON tasks;
DROP POLICY IF EXISTS "Allow delete" ON tasks;

DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

DROP POLICY IF EXISTS "Users view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

COMMIT;

-- ============================================================================
-- 5. CREATE STRICT RLS POLICIES (Production Ready)
-- ============================================================================

-- Policy 1: INSERT - Users can only create tasks with their own user_id
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

COMMIT;

-- Policy 2: SELECT - Users can only view their own tasks
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

COMMIT;

-- Policy 3: UPDATE - Users can only update their own tasks
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMIT;

-- Policy 4: DELETE - Users can only delete their own tasks
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- 6. VERIFICATION QUERIES (Run after applying policies)
-- ============================================================================

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'tasks';

-- Check policies exist:
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'tasks';

-- Count your tasks:
-- SELECT COUNT(*) FROM tasks WHERE user_id = auth.uid();

-- ============================================================================
-- WHAT TO DO IF TASKS STILL DON'T APPEAR
-- ============================================================================
/*
1. Check Supabase dashboard → Tables → tasks table exists
2. Verify user_id column exists (not null required)
3. Run: SELECT * FROM tasks; (should show NO results due to RLS)
4. Check browser console for error messages
5. If you see "row-level security" error, policies need tweaking
6. Verify auth.uid() is returning the correct user ID
*/
