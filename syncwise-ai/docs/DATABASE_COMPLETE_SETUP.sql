-- COMPLETE DATABASE PRODUCTION SETUP
-- Copy and paste entire script into Supabase SQL Editor and run

-- ============================================================================
-- SECTION 1: VERIFY/CREATE TABLE STRUCTURE
-- ============================================================================

-- Ensure tasks table exists with required columns
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deadline DATE,
  points INTEGER DEFAULT 10,
  team_id UUID,
  assigned_to UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns (safe - won't error if they exist)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 10;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS team_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID;

COMMIT;

-- ============================================================================
-- SECTION 2: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
COMMIT;

-- ============================================================================
-- SECTION 3: CLEAN SLATE - DROP ALL EXISTING POLICIES
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
-- SECTION 4: CREATE STRICT RLS POLICIES (4 POLICIES = COMPLETE CRUD ISOLATION)
-- ============================================================================

-- POLICY 1: INSERT - Users can ONLY insert tasks with their own user_id
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

COMMIT;

-- POLICY 2: SELECT - Users can ONLY view their own tasks
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

COMMIT;

-- POLICY 3: UPDATE - Users can ONLY update their own tasks
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMIT;

-- POLICY 4: DELETE - Users can ONLY delete their own tasks
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- SECTION 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS tasks_user_created_idx ON tasks(user_id, created_at DESC);

COMMIT;

-- ============================================================================
-- SECTION 6: VERIFICATION QUERIES (Run these to verify setup)
-- ============================================================================

-- Verify RLS is enabled
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'tasks';

-- Verify policies exist
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'tasks' ORDER BY policyname;

-- Count tasks for current user (should work if logged in)
-- SELECT COUNT(*) FROM tasks WHERE user_id = auth.uid();

-- ============================================================================
-- IF YOU SEE ERRORS:
-- ============================================================================
/*
ERROR: relation "tasks" does not exist
→ You need to create the tasks table first in Supabase UI or run:
  CREATE TABLE tasks (id UUID PRIMARY KEY, title TEXT, user_id UUID);

ERROR: row-level security violation
→ RLS policy is blocking the operation. Check:
  1. Are you authenticated?
  2. Does policy allow your user_id?
  3. Is user_id column populated?

ERROR: column "user_id" does not exist
→ Run the ALTER TABLE statements to add missing columns

ERROR: permission denied for schema public
→ Check Supabase project permissions/authentication
*/

-- ============================================================================
-- PRODUCTION CHECKLIST
-- ============================================================================
/*
After running this entire script:

☐ No SQL errors in output
☐ 4 policies created successfully
☐ Indexes created successfully
☐ Able to create new tasks in UI
☐ Tasks appear in list after creation
☐ Can only see your own tasks
☐ Success message shows "✓ Task created (X total)"

If any step fails, check browser console (F12) for error messages.
*/
