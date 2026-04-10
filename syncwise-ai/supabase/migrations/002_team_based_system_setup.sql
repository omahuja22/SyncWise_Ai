-- ============================================
-- SYNCWISE AI DATABASE MIGRATIONS
-- Run these in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ACTIVITY LOGS TABLE (for engagement tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'complete', 'create', 'update')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- 2. ADD MISSING COLUMNS TO TASKS TABLE
-- ============================================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- Index for team filtering
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ============================================
-- 3. ADD MISSING COLUMNS TO TEAMS TABLE
-- ============================================
ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================
-- 4. ENABLE RLS ON ACTIVITY LOGS
-- ============================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see activity logs for their tasks
CREATE POLICY "activity_logs_visibility" ON activity_logs
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    task_id IN (
      SELECT t.id FROM tasks t
      INNER JOIN team_members tm ON t.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "activity_logs_insert" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. UPDATE TASKS RLS TO FILTER BY TEAM
-- ============================================
-- Drop old policies if they exist (optional - only if you have issues)
-- DROP POLICY IF EXISTS "tasks_visibility" ON tasks;
-- DROP POLICY IF EXISTS "tasks_insert" ON tasks;
-- DROP POLICY IF EXISTS "tasks_update" ON tasks;

-- RLS Policy: Users can see tasks in their teams
CREATE POLICY IF NOT EXISTS "tasks_team_visibility" ON tasks
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 6. TEAM STATISTICS VIEW (for efficient analytics)
-- ============================================
CREATE OR REPLACE VIEW team_stats_view AS
SELECT 
  t.id,
  t.name,
  COUNT(DISTINCT tm.user_id) as member_count,
  COUNT(DISTINCT CASE WHEN tsk.status = 'done' THEN tsk.id END) as completed_tasks,
  COUNT(DISTINCT CASE WHEN tsk.status = 'pending' THEN tsk.id END) as pending_tasks,
  COUNT(DISTINCT CASE WHEN tsk.status = 'in-progress' THEN tsk.id END) as in_progress_tasks,
  COUNT(DISTINCT CASE WHEN tsk.deadline < NOW() AND tsk.status != 'done' THEN tsk.id END) as overdue_tasks,
  COUNT(DISTINCT tsk.id) as total_tasks,
  COALESCE(SUM(CASE WHEN tsk.status = 'done' THEN tsk.points ELSE 0 END), 0) as total_completed_points
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
LEFT JOIN tasks tsk ON t.id = tsk.team_id
GROUP BY t.id, t.name;

-- ============================================
-- 7. ENABLE RLS ON TEAMS TABLE UPDATES
-- ============================================
-- Make sure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only access teams they're members of
CREATE POLICY IF NOT EXISTS "teams_accessibility" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 8. ENABLE RLS ON TEAM_MEMBERS TABLE
-- ============================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see team members in their teams
CREATE POLICY IF NOT EXISTS "team_members_visibility" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- RLS: Only leaders can add/remove members
CREATE POLICY IF NOT EXISTS "team_members_manage" ON team_members
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify setup:
-- ============================================
-- SELECT * FROM activity_logs LIMIT 5;
-- SELECT * FROM team_stats_view;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks';
