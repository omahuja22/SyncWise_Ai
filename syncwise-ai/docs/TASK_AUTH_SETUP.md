# Task Creation with Auth - Setup Complete ✅

## What Was Fixed

✅ **Task creation now includes user_id:**
- Passes current user ID from AuthContext
- Falls back to session user if needed
- Tasks belong to logged-in user only

✅ **Task fetching filters by user_id:**
- Only user's own tasks are displayed
- Query filters with `eq("user_id", userId)`

✅ **Google OAuth button added:**
- `signInWithGoogle()` function available
- Button in login page with style matching email/password form
- Redirects to dashboard after successful auth

---

## Next Steps in Supabase Console

### 1. Enable Google OAuth Provider

1. Go to: https://app.supabase.com
2. Select your project
3. **Authentication → Providers**
4. Click **Google**
5. Toggle **Enable**
6. Add your Google OAuth credentials (from Google Cloud Console)
   - Client ID
   - Client Secret
7. Click **Save**

### 2. Disable Email Confirmation (Development Only)

1. **Authentication → Email Templates**
2. Or go to **Authentication → Policies**
3. Find "Confirm email" setting
4. Toggle OFF (for development)
5. Users can now login without confirming email

**Note:** Re-enable this in production!

### 3. Apply RLS Policies

Tasks table must be secured with RLS:

```sql
-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users see only their tasks
CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create tasks
CREATE POLICY "Users can create tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their tasks
CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their tasks
CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);
```

**How to apply:**
1. Go to **SQL Editor** in Supabase
2. New Query
3. Paste all SQL above
4. Execute

---

## Testing Task Creation

### After Supabase setup:

1. Start dev server: `npm run dev`
2. Go to `/auth/login`
3. Sign up with email/password OR click "Continue with Google"
4. After login, go to `/dashboard/tasks`
5. Create a task
6. Open browser DevTools → Network tab
7. Look for POST to `/rest/v1/tasks`
8. Verify request includes `user_id`

### Verify task isolation:

1. Open in Incognito (new user session)
2. Create different email account
3. Create a task
4. In first window, refresh
5. Should NOT see Incognito user's task ✓

---

## Code Changes Summary

### `services/authService.ts`
- Added `signInWithGoogle()` function
- Uses Supabase OAuth with Google provider
- Redirects to dashboard on success

### `services/taskService.ts`
- Updated `createTask()` to always include `user_id`
- Fallback: fetches current user from session if not provided
- Ensures RLS policies work correctly

### `app/auth/login/page.tsx`
- Added "Continue with Google" button
- Styled to match other form elements
- Calls `signInWithGoogle()` handler

### `hooks/useTasks.ts`
- Already had `useAuth()` integration
- Already passes `user.id` to task operations
- No changes needed - already working!

---

## Debug Commands

### Check if user is authenticated:
```typescript
// In browser console:
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
```

### Check task payload:
```
DevTools → Network
Filter for: /rest/v1/tasks
Click POST request
Request payload → should show "user_id": "..."
```

### Check RLS policy errors:
```
DevTools → Console
Look for error: "new row violates row-level security policy"
```

---

## Key Functions

### Sign in with Google
```typescript
import { signInWithGoogle } from "@/services/authService";

const { error } = await signInWithGoogle();
// Supabase handles redirect to Google login
```

### Get current user for task creation
```typescript
// Automatic in useTasks hook:
const { user } = useAuth();
await addTask(title, deadline, points);
// Passes user.id to createTask()
```

### Filter tasks by user
```typescript
// Automatic in fetchTasks:
const data = await getTasks(user?.id);
// Only returns current user's tasks
```

---

## Status

| Feature | Status |
|---------|--------|
| Email/password login | ✅ Working |
| Google OAuth button | ✅ Added |
| Task creation with user_id | ✅ Fixed |
| Task fetching filters | ✅ Fixed |
| Error handling | ✅ In place |
| UI unchanged | ✅ Preserved |

**To go live, complete the Supabase setup steps above.**
