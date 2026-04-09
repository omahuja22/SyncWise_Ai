# ⚡ Quick Setup Checklist

## 🔧 Database Setup (5 minutes)

### Copy this code and run in Supabase SQL Editor:

```sql
-- 1. CREATE user_profiles TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dob DATE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. ENABLE RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES for user_profiles
CREATE POLICY "Users view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 4. ENABLE RLS on tasks TABLE (if not already)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES for tasks
CREATE POLICY "Users view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

**Then Verify**:
- [ ] Go to Tables → `user_profiles` exists ✓
- [ ] Go to Tables → `tasks` → RLS Policies → all 4 policies listed ✓

---

## 📧 Email Settings (1 minute)

**Disable Email Confirmation** (DEV ONLY):
1. Authentication → Email Templates
2. Toggle OFF "Confirm email"
3. Users now activate instantly

⚠️ **For production**: Re-enable this

---

## 🎯 Optional: Google OAuth (2 minutes)

1. Get credentials from: https://console.cloud.google.com
2. Go to Supabase → Authentication → Providers → Google
3. Paste Client ID and Client Secret
4. Done

---

## ✅ Test It

### Scenario 1: Signup flow
```
1. npm run dev
2. Go to /auth/login
3. Click "Sign Up"
4. Enter email, password, name
5. Should redirect to /auth/setup-profile
6. Enter name, DOB (optional)
7. Should redirect to /dashboard/tasks
8. Check sidebar → shows your name ✓
```

### Scenario 2: Create task
```
1. At /dashboard/tasks
2. Click "Add Task" or "Create New Task"
3. Enter title, deadline (opt), points
4. Click "Create Task"
5. Should show: "✓ Task created (1 total)"
6. Modal closes, task appears in list ✓
```

### Scenario 3: Multi-user isolation
```
1. Signup as Alice, create task "Alice Task"
2. Open new incognito window
3. Signup as Bob
4. At /dashboard → should be EMPTY (no Alice task) ✓
5. Create "Bob Task"
6. Switch to Alice → only sees "Alice Task" ✓
```

---

## 🐛 Quick Debug

| Issue | Check |
|-------|-------|
| "New row violates..." | Did you run the RLS code above? |
| Task doesn't appear | Network tab: POST /tasks shows user_id? |
| Name doesn't show in sidebar | Check profile page created? |
| Stuck on setup page | Check browser console for errors |

---

## 📁 Files Created/Changed

**New Files**:
- `services/userProfileService.ts` - Profile operations
- `hooks/useUserProfile.ts` - Profile hook
- `app/auth/setup-profile/page.tsx` - Setup form
- `docs/USER_PROFILES_MIGRATION.sql` - SQL migration
- `docs/PRODUCTION_FIXES_GUIDE.md` - Full guide

**Modified Files**:
- `services/authService.ts` - OAuth redirect
- `app/auth/login/page.tsx` - Profile check
- `app/components/Sidebar.tsx` - Show user name
- `app/components/CreateTaskModal.tsx` - Better feedback
- `app/components/TaskList.tsx` - Success count
- `services/taskService.ts` - Error logging

---

## 📞 Need help?

1. Check browser Console (`F12` → Console tab)
2. Look for logs: 🔹 (info), ✅ (success), ❌ (error)
3. Network tab: Check POST requests to Supabase
4. Read: `docs/PRODUCTION_FIXES_GUIDE.md` for full details

---

**Status**: ✅ ALL CODE COMPLETE - Ready for database setup
