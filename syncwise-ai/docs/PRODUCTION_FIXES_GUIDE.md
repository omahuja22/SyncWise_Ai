# SyncWise Production Fixes - Implementation Guide

**Status**: All code changes complete ✅  
**Date**: April 9, 2026

---

## What Was Fixed

### 1. ✅ Task Creation with Real User_ID
- **Issue**: Tasks showed "created successfully" but didn't appear
- **Fix**:
  - `useTasks.addTask()` now fetches authenticated user ID from `useAuth()`
  - Passes `user.id` to `createTask()` which includes it in the database insert
  - Error logging enhanced to show exact insert failures
  - Success only shows when task is actually in database

**Files Changed**:
- `hooks/useTasks.ts` - Already using `user?.id` ✅
- `services/taskService.ts` - Enhanced error logging ✅
- `app/components/CreateTaskModal.tsx` - Shows real success/error ✅
- `app/components/TaskList.tsx` - Displays task count on success ✅

---

### 2. ✅ User Profile System Created
- **New Table**: `user_profiles` - stores user name, DOB, avatar
- **New Services**: `userProfileService.ts` - CRUD operations
- **New Hook**: `useUserProfile()` - fetch profile in components
- **RLS Enabled**: Users can only access their own profile

**Files Created**:
- `services/userProfileService.ts` (140 lines)
- `hooks/useUserProfile.ts` (50 lines)
- `docs/USER_PROFILES_MIGRATION.sql` (SQL for setup)

---

### 3. ✅ Profile Setup Flow Added
- **Route**: `/auth/setup-profile` - form to collect name + DOB
- **Flow**: After signup/login → check if profile exists → redirect to setup if missing
- **UX**: Beautiful form with email display, name input, optional DOB
- **Auto-redirect**: If profile already exists, redirects to dashboard

**Files Created**:
- `app/auth/setup-profile/page.tsx` (250 lines)

**Key Features**:
```
User Signup/Login
  ↓
Check if profile exists
  ↓
NO → Redirect to /auth/setup-profile
  ↓ (form)
Submit name + DOB
  ↓
Create user_profiles record
  ↓
Redirect to /dashboard/tasks
```

---

### 4. ✅ Sidebar Shows User Name
- **Before**: Only showed email prefix
- **Now**: Shows profile name if available, falls back to email
- **Loading**: Shows "Loading..." while fetching profile
- **Avatar**: First letter of profile name

**Files Changed**:
- `app/components/Sidebar.tsx` - Now uses `useUserProfile` hook

---

### 5. ✅ Auth Flow Updated
- **Login/Signup**: Now redirects to `/auth/setup-profile` instead of dashboard
- **Profile Check**: Verifies profile exists before allowing access
- **Google OAuth**: Redirects to `/auth/setup-profile` after Google signin
- **Dashboard Protection**: Only authenticated users can access (already working)

**Files Changed**:
- `app/auth/login/page.tsx` - Added `profileExists()` check
- `services/authService.ts` - Updated Google OAuth redirect URL

---

## 🚀 SETUP STEPS (REQUIRED)

### Step 1: Apply User Profiles Table to Supabase

1. Go to: **Supabase Dashboard** → **Your Project** → **SQL Editor**

2. Create new query and paste the entire SQL from:
   ```
   docs/USER_PROFILES_MIGRATION.sql
   ```

3. Run the query (green "Run" button)

4. Verify: Go to **Tables** in sidebar → should see `user_profiles` table

**What it does**:
- Creates `user_profiles` table with columns: id, name, dob, avatar_url, created_at, updated_at
- Enables Row Level Security (RLS)
- Sets up RLS policies so users can only see/modify their own profile

---

### Step 2: Verify Tasks Table Has RLS

1. In Supabase SQL Editor, run:
   ```sql
   -- Enable RLS on tasks table
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies for tasks
   CREATE POLICY "Users can view own tasks" ON tasks
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own tasks" ON tasks
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own tasks" ON tasks
     FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can delete own tasks" ON tasks
     FOR DELETE USING (auth.uid() = user_id);
   ```

2. Verify: Go to **Tables** → **tasks** → **RLS Policies** tab
   - Should see 4 policies listed above

---

### Step 3: Disable Email Confirmation (Development Only)

1. Go to: **Authentication** → **Email Templates**
2. Toggle OFF: "Confirm email"
3. This allows instant account creation without email verification

**⚠️ For production**: Re-enable this setting

---

### Step 4: Enable Google OAuth (Optional)

1. Get Google OAuth credentials:
   - Go to: https://console.cloud.google.com
   - Create new project or select existing
   - Enable "Google+ API"
   - Create OAuth 2.0 credentials (type: OAuth client for web app)
   - Add redirect URI: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret

2. Add to Supabase:
   - Go to: **Authentication** → **Providers** → **Google**
   - Paste Client ID and Client Secret
   - Save

3. Now "Continue with Google" button works

---

## 🧪 Testing the Fixes

### Test 1: Task Creation with User_ID

```
1. Start dev server: npm run dev
2. Signup: → /auth/setup-profile
3. Enter name + DOB → "Complete Profile"
4. Now at /dashboard/tasks
5. Create task: "Test Task" → Set deadline/points → "Create Task"

VERIFY:
- ✓ Success message shows: "✓ Task created (1 total)"
- ✓ Modal closes
- ✓ Task appears in list
- ✓ In browser DevTools → Network → POST /rest/v1/tasks → Preview
  Look for body: "user_id": "[UUID]" ← Should be present
```

### Test 2: User Name in Sidebar

```
1. At dashboard
2. Look at bottom-left sidebar (user section)

VERIFY:
- ✓ Shows full name from profile (e.g., "John Doe")
- ✓ Avatar shows first letter ("J")
- ✓ Email shows below name
```

### Test 3: Profile Enforcement

```
1. Signup with email/password → /auth/setup-profile (auto-redirect)
2. Complete profile setup
3. Logout → /auth/login
4. Login with same email → /dashboard/tasks (direct, no setup needed)

VERIFY:
- ✓ First login redirects to setup
- ✓ Second login skips setup (profile exists)
- ✓ Profile name shows in sidebar on second login
```

### Test 4: Multi-User Task Isolation

```
1. Create Account A (Alice)
   - Signup, create profile as "Alice"
   - Create task: "Alice Task"
   - Note the task ID

2. Open incognito/new browser, Create Account B (Bob)
   - Signup, create profile as "Bob"
   - Go to /dashboard/tasks

VERIFY:
- ✓ Bob's task list is EMPTY (doesn't see Alice's task)
- ✓ Create task "Bob Task"
- ✓ Bob only sees his own task
- ✓ Switch back to Alice's browser → only sees "Alice Task"
```

### Test 5: Error Handling

```
1. Create task with NO title (empty field)

VERIFY:
- ✓ Error message: "Task title is required"
- ✓ Modal stays open
- ✓ "Create Task" button disabled until title entered

2. If database error occurs (network down, RLS policy issue):

VERIFY:
- ✓ Error message displays under form
- ✓ Modal stays open
- ✓ Check browser console for detailed error logs
  Look for: ❌ [createTask] Supabase insert failed: {code, hint, details}
```

---

## 🔍 Debugging

### Problem: Task creation shows success but doesn't appear

**Check**:
1. Browser console → Network tab → POST /rest/v1/tasks
   - Response body should include the task
   - Look for `user_id` in request body
   - If error: see `code`, `hint`, `details` fields

2. Supabase SQL:
   ```sql
   SELECT * FROM tasks WHERE user_id = '[current_user_id]';
   ```
   - Should show the created task

3. Check RLS policy:
   - Go to: https://app.supabase.com → SQL Editor
   - Run: `SELECT * FROM tasks;` 
   - If "permission denied" → RLS policy needs setup

---

### Problem: Profile doesn't show user name, stuck on "Loading..."

**Check**:
1. Browser console → Look for errors in `[useUserProfile]`
2. Verify `user_profiles` table exists in Supabase
3. Check Supabase SQL:
   ```sql
   SELECT * FROM user_profiles WHERE id = '[user_id]';
   ```
   - Should show the profile record

---

### Problem: Can't login after signup, stuck on /auth/setup-profile

**Check**:
1. Browser console → Look for error logs
2. Verify:
   - Profile was created successfully ✓
   - User was redirected to dashboard ✓
3. Try manual redirect: Click dashboard link or navigate to `/dashboard/tasks`

---

## 📊 Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  dob DATE,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### tasks Table (Updated)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT ('pending'|'in-progress'|'done'),
  deadline DATE,
  points INTEGER,
  user_id UUID REFERENCES auth.users(id),  ← KEY: Links to authenticated user
  assigned_to UUID,
  team_id UUID,
  created_at TIMESTAMP
);
```

---

## 📝 Code Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `services/userProfileService.ts` | NEW | Profile CRUD operations |
| `hooks/useUserProfile.ts` | NEW | Hook to fetch profile |
| `app/auth/setup-profile/page.tsx` | NEW | Profile setup form |
| `docs/USER_PROFILES_MIGRATION.sql` | NEW | Database setup script |
| `services/authService.ts` | Updated | Google OAuth redirect to setup |
| `app/auth/login/page.tsx` | Updated | Check profile existence |
| `app/components/Sidebar.tsx` | Updated | Display profile name |
| `app/components/CreateTaskModal.tsx` | Updated | Better error feedback |
| `app/components/TaskList.tsx` | Updated | Show task count on success |
| `services/taskService.ts` | Updated | Enhanced error logging |

**Total files changed**: 9 files + 3 new files

---

## ✅ Verification Checklist

- [ ] SQL migration applied (user_profiles table created)
- [ ] RLS policies applied on user_profiles
- [ ] RLS policies applied on tasks table
- [ ] Email confirmation disabled (dev only)
- [ ] Google OAuth enabled (optional)
- [ ] Can signup → setup profile → dashboard (flow works)
- [ ] Task creation shows in database
- [ ] Sidebar shows user name
- [ ] Task isolation: User A can't see User B's tasks
- [ ] Error messages display properly
- [ ] No console errors

---

## 🎯 Key Features Implemented

✅ **Real user_id tracking** - Tasks linked to authenticated user  
✅ **Profile system** - Store user name, DOB, avatar  
✅ **Profile enforcement** - Redirect to setup if missing  
✅ **User display** - Show name in UI (sidebar)  
✅ **Task isolation** - RLS policies ensure privacy  
✅ **Real feedback** - Success/error messages actually reflect database state  
✅ **Error logging** - Detailed logs for debugging RLS/insert issues  
✅ **Google OAuth** - Support for OAuth login (with setup)  

---

## 📞 Common Issues & Solutions

### "New row violates row-level security policy"
- **Cause**: RLS policy not applied, or user_id null
- **Fix**: 
  1. Run USER_PROFILES_MIGRATION.sql
  2. Run RLS policies for tasks table
  3. Check that user_id is in INSERT payload

### "No profile found"
- **Cause**: Profile check is failing for new users
- **Fix**:
  1. Ensure setup-profile page is complete
  2. Check that createUserProfile completed
  3. Refresh browser

### "Google signin not working"
- **Cause**: Google OAuth not enabled in Supabase
- **Fix**:
  1. Go to Supabase → Authentication → Providers → Google
  2. Add Client ID and Client Secret
  3. Set redirect URI correctly

---

## 🚀 Next Steps

1. **Immediate**:
   - ✓ Apply SQL migrations
   - ✓ Test signup → profile → dashboard flow
   - ✓ Verify task creation with user_id

2. **Soon**:
   - Add email verification for production
   - Setup auto-refreshing task list (websockets)
   - Add task notifications

3. **Future**:
   - User profile editing page
   - Task collaborators/teams
   - Advanced analytics

---

**Questions?** Check browser console for detailed logs starting with 🔹, ✅, ❌
