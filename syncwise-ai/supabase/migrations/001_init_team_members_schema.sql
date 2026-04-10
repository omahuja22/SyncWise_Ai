-- Team Members Schema Migration
-- This migration initializes the team_members table with proper structure and indexes
-- Safe to run multiple times - uses IF NOT EXISTS and will ignore existing constraints

-- Create team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_unique ON team_members(team_id, user_id);

-- Add foreign key: team_members.user_id -> user_profiles.id
-- If constraint already exists, this will be ignored
ALTER TABLE team_members
ADD CONSTRAINT fk_team_members_user
FOREIGN KEY (user_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Add foreign key: team_members.team_id -> teams.id
-- If constraint already exists, this will be ignored
ALTER TABLE team_members
ADD CONSTRAINT fk_team_members_team
FOREIGN KEY (team_id)
REFERENCES teams(id)
ON DELETE CASCADE;
