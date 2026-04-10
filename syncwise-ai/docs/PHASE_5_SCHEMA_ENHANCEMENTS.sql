-- PHASE 5: Schema Enhancements for Full Demo Readiness
-- Run these in Supabase SQL Editor

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO TASKS TABLE
-- ============================================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- ============================================================================
-- 2. ADD join_code TO TEAMS TABLE
-- ============================================================================

ALTER TABLE teams ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;

-- ============================================================================
-- 3. CREATE FUNCTION TO GENERATE UNIQUE JOIN CODE
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
BEGIN
  -- Generate a random 6-character alphanumeric code
  RETURN upper(substring(md5(random()::text), 1, 6));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. SET join_code FOR EXISTING TEAMS (if any)
-- ============================================================================

UPDATE teams SET join_code = generate_join_code() WHERE join_code IS NULL;

-- ============================================================================
-- 5. CREATE TRIGGER TO GENERATE join_code ON NEW TEAMS
-- ============================================================================

CREATE OR REPLACE FUNCTION set_join_code_on_team_create()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.join_code IS NULL THEN
    NEW.join_code := generate_join_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_join_code_on_insert ON teams;
CREATE TRIGGER set_join_code_on_insert
BEFORE INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION set_join_code_on_team_create();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check tasks table columns
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' ORDER BY column_name;

-- Check teams table for join_code
-- SELECT id, name, join_code FROM teams LIMIT 5;
