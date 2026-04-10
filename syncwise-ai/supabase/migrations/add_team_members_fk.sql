-- Add Foreign Key Constraints for team_members table
-- This establishes proper relationships between team_members and related tables
-- Run this migration in Supabase to enable relational queries
-- (Note: Also included in 001_init_team_members_schema.sql)

-- Foreign key: team_members.user_id references user_profiles.id
ALTER TABLE team_members
ADD CONSTRAINT fk_team_members_user
FOREIGN KEY (user_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Foreign key: team_members.team_id references teams.id
ALTER TABLE team_members
ADD CONSTRAINT fk_team_members_team
FOREIGN KEY (team_id)
REFERENCES teams(id)
ON DELETE CASCADE;
