-- SUPABASE SQL - Run in your SQL Editor

-- 1. Update tasks table (add points column if not exists)
ALTER TABLE tasks ADD COLUMN points INTEGER DEFAULT 10;

-- 2. Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_points INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Create tasks_completed trigger (auto-update points)
CREATE OR REPLACE FUNCTION update_user_stats_on_task_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    UPDATE user_stats
    SET total_points = total_points + COALESCE(NEW.points, 10),
        tasks_completed = tasks_completed + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_completion_trigger
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_task_complete();

-- 4. Enable RLS on user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
