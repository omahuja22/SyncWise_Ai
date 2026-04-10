# Team Members Schema Migrations

## Overview
These migrations set up the proper schema and relationships for the team members system in SyncWise AI.

## Migration Files

### 1. `001_init_team_members_schema.sql` (RECOMMENDED - Run This First)
**Purpose**: Creates/updates the `team_members` table with proper schema and relationships
**Includes**:
- Table creation with proper columns (id, team_id, user_id, role, created_at, updated_at)
- Foreign key constraints (with existence checks)
- Indexes for performance
- Role validation (leader or member)

**How to apply**:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of this file
3. Click "Run"
4. Ignore any "already exists" warnings

### 2. `add_team_members_fk.sql` (Optional - Already Covered by 001)
**Purpose**: Alternative migration if you only need to add foreign keys
**Note**: The constraints in this file are already included in `001_init_team_members_schema.sql`

## Verification

After running the migration, verify in Supabase:

1. **Check table structure**:
   ```sql
   -- View table columns
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'team_members';
   ```

2. **Check foreign keys**:
   ```sql
   -- View constraints
   SELECT constraint_name, constraint_type FROM information_schema.table_constraints 
   WHERE table_name = 'team_members';
   ```

3. **Check indexes**:
   ```sql
   -- List indexes
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'team_members';
   ```

## Required Columns

For the application to work correctly, `team_members` must have:
- `id` (UUID, PRIMARY KEY)
- `team_id` (UUID, FOREIGN KEY → teams.id)
- `user_id` (UUID, FOREIGN KEY → user_profiles.id)
- `role` (TEXT, 'leader' or 'member')

Optional but recommended:
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Fallback Logic

The application includes intelligent fallback logic:
- **If relational query works**: Uses efficient joined query
- **If relational query fails**: Falls back to 2-step query (fetch members, then profiles separately)
- **No data loss**: Works even if migration hasn't been run yet

## Troubleshooting

### Error: "Could not find relationship between team_members and user_profiles"
**Solution**: Run migration `001_init_team_members_schema.sql` to create foreign keys

### Error: "Column 'created_at' does not exist"
**Solution**: This is handled - the application now treats created_at as optional

### Error: "UNIQUE violation on team_id, user_id"
**Solution**: A user is already a member of that team. The application prevents duplicate invites.

### Error: "Role must be 'leader' or 'member'"
**Solution**: The role column has a CHECK constraint. Only these two values are allowed.
