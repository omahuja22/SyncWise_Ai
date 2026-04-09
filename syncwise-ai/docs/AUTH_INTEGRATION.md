# Authentication System Integration Guide

This guide explains the complete authentication system that has been integrated into the SyncWise AI application.

## 📋 Overview

The app now includes a complete Supabase authentication system with:
- ✅ User signup/login with email and password
- ✅ Session persistence across refreshes
- ✅ Protected dashboard routes (redirect to login if not authenticated)
- ✅ User-scoped tasks (each user sees only their own tasks)
- ✅ Logout functionality
- ✅ RLS policies for database security

## 🏗️ Architecture

### Core Components

1. **Auth Service** (`services/authService.ts`)
   - `signUp(email, password, fullName)` - Create new user account
   - `signIn(email, password)` - Login to existing account
   - `signOut()` - Logout
   - `getCurrentUser()` - Get current authenticated user
   - `getSession()` - Get auth session
   - `onAuthStateChange(callback)` - Listen to auth state changes

2. **Auth Context** (`app/contexts/AuthContext.tsx`)
   - `AuthProvider` - Wraps app with auth state
   - `useAuth()` hook - Access user, loading, isAuthenticated state
   - Automatically syncs with Supabase auth on mount

3. **LoginPage** (`app/auth/login/page.tsx`)
   - Combined signup/login form with mode toggle
   - Email/password input validation
   - Error message display
   - Redirects to dashboard after successful auth

4. **Middleware** (`middleware.ts`)
   - Protects `/dashboard/*` routes
   - Redirects unauthenticated users to `/auth/login`
   - Redirects authenticated users away from `/auth/login`

5. **Task Integration** (`services/taskService.ts`, `hooks/useTasks.ts`)
   - Tasks now include `user_id` field
   - `getTasks(userId)` - Get only user's tasks
   - `createTask(..., userId, ...)` - Create task for current user
   - Updates/deletes scoped to task owner

## 📁 File Structure

```
syncwise-ai/
├── services/
│   ├── authService.ts          ← Auth operations (signin, signup, logout)
│   └── taskService.ts          ← Updated with user_id support
├── app/
│   ├── contexts/
│   │   └── AuthContext.tsx      ← Auth provider and useAuth hook
│   ├── auth/
│   │   └── login/
│   │       └── page.tsx         ← Login/signup page
│   ├── components/
│   │   ├── Providers.tsx        ← Updated: wraps with AuthProvider
│   │   └── Sidebar.tsx          ← Updated: shows user email, logout button
│   └── dashboard/
│       └── layout.tsx           ← Updated: auth protection check
├── hooks/
│   └── useTasks.ts             ← Updated: integrates user_id
├── middleware.ts                ← Route protection (NEW)
└── docs/
    ├── RLS_POLICIES.md          ← RLS setup instructions (NEW)
    └── AUTH_INTEGRATION.md      ← This file
```

## 🔄 User Flow

### 1. First Visit
```
User visits app
    ↓
Middleware checks auth
    ↓
No session found
    ↓
Redirected to /auth/login
```

### 2. New User (Signup)
```
User enters email, password, name on /auth/login (signup mode)
    ↓
Click "Create Account"
    ↓
signUp(email, password, fullName) called
    ↓
Supabase creates new user
    ↓
Auth session created
    ↓
Redirected to /dashboard/tasks
    ↓
AuthContext detects user via onAuthStateChange
    ↓
Dashboard loads with user's tasks (empty initially)
```

### 3. Existing User (Login)
```
User enters email, password on /auth/login (login mode)
    ↓
Click "Sign In"
    ↓
signIn(email, password) called
    ↓
Supabase validates credentials
    ↓
Auth session created
    ↓
Redirected to /dashboard/tasks
    ↓
AuthContext detects user
    ↓
useTasks fetches getTasks(user.id)
    ↓
Tasks display (filtered to user)
```

### 4. Create Task
```
User types task title, deadline, points
    ↓
Click "Add Task"
    ↓
CreateTaskModal.handleSubmit() called
    ↓
useTasks.addTask(title, deadline, points) called
    ↓
createTask(title, deadline, points, user.id, undefined, null) called
    ↓
payload.user_id = user.id
    ↓
Supabase inserts with user_id
    ↓
RLS policy validates: auth.uid() == user_id
    ↓
Task inserted successfully
    ↓
fetchTasks(user.id) refreshes list
    ↓
UI shows new task (only this user can see it)
```

### 5. Logout
```
User clicks "Log out" in Sidebar
    ↓
handleLogout() called
    ↓
signOut() called
    ↓
Supabase clears session
    ↓
AuthContext detects null user via onAuthStateChange
    ↓
Middleware redirects to /auth/login
```

## 🔐 Security Features

### Row-Level Security (RLS)

Tasks table policies ensure:
- ✅ Users can only view their own tasks
- ✅ Users can only create tasks for themselves
- ✅ Users can only update their own tasks
- ✅ Users can only delete their own tasks
- ✅ System tasks (user_id = NULL) visible to all

See [RLS_POLICIES.md](./RLS_POLICIES.md) for SQL setup.

### Session Management

- ✅ Session persists across page refreshes (Supabase handles via cookies)
- ✅ Session automatically checked in middleware
- ✅ Expired sessions redirect to login
- ✅ No plain text passwords stored in app (Supabase handles encryption)

### Type Safety

All auth operations are TypeScript-typed:
```typescript
interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

interface AuthError {
  message: string;
  code?: string;
}
```

## 🚀 Implementation Checklist

- ✅ Auth service created with signin/signup/logout
- ✅ Auth context with useAuth hook for app-wide access
- ✅ Login page with signup/login toggle
- ✅ Middleware for route protection
- ✅ Task service updated with user_id support
- ✅ useTasks hook integrated with auth
- ✅ Sidebar shows user email and logout button
- ✅ Dashboard layout checks auth before rendering
- ✅ Providers wrapped with AuthProvider
- ⚠️ RLS policies need manual setup in Supabase (see RLS_POLICIES.md)

## ⚠️ TODO: Setup RLS Policies

To complete the authentication system:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy the SQL from [RLS_POLICIES.md](./RLS_POLICIES.md)
5. Execute all policies

Without RLS, any authenticated user can see/edit others' tasks via direct Supabase calls (though the UI won't show them).

## 🧪 Testing

### Test Signup
1. Visit http://localhost:3000/
2. Should redirect to /auth/login
3. Click "Sign Up" tab
4. Enter email, password, name
5. Click "Create Account"
6. Should redirect to /dashboard/tasks
7. Tasks list should be empty (first user)

### Test Login
1. Logout (click "Log out" in Sidebar)
2. Should redirect to /auth/login
3. Enter email and password used in signup
4. Click "Sign In"
5. Should redirect to /dashboard/tasks
6. Should see the tasks you created earlier

### Test Task Isolation
1. Open in Incognito window (new user session)
2. Signup with different email
3. Create a task
4. In original window, refresh (different user)
5. Should NOT see the incognito user's task
6. Each user only sees their own tasks

### Test RLS Policies (after setup)
1. Open browser DevTools → Console
2. Open Network tab
3. Try to access other user's task via Supabase directly:
   ```typescript
   const { data, error } = await supabase
     .from('tasks')
     .select('*')
     .eq('id', 'other-users-task-id')
     .single();
   // Should return error: "new row violates row-level security policy"
   ```

## 🔧 Configuration

### Environment Variables

Ensure your `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

These are used by:
- `lib/supabase.ts` - Initialize Supabase client
- `middleware.ts` - Check auth in middleware

### Supabase Project Setup

Required in Supabase Dashboard:

1. **Auth Providers** → Enable Email provider
   - Settings → Auth → Email → Confirm email (optional for testing)

2. **Database** → Tables
   - `tasks` table should have `user_id` column (uuid, nullable)
   - `user_stats` table for tracking user progress

3. **Security** → RLS Policies
   - Apply policies from [RLS_POLICIES.md](./RLS_POLICIES.md)

## 📚 Key Functions Reference

### authService.ts
```typescript
// Signup
const { user, error } = await signUp(email, password, fullName);

// Login
const { user, error } = await signIn(email, password);

// Logout
const { error } = await signOut();

// Get current user (without UI dependency)
const user = await getCurrentUser();

// Listen to auth changes
const { data: { subscription } } = onAuthStateChange((user) => {
  // Called whenever auth state changes
});
```

### useAuth Hook
```typescript
const { user, loading, isAuthenticated } = useAuth();

if (loading) return <LoadingSpinner />;
if (!isAuthenticated) return <RedirectToLogin />;

return <Dashboard user={user} />;
```

### useTasks Hook
```typescript
const { tasks, addTask, removeTask, updateStatus, isCreating, error } = useTasks();

// addTask automatically includes user_id
await addTask(title, deadline, points);

// Tasks already filtered by user_id
// Display only current user's tasks
```

## 🐛 Debugging

### Check auth state in console
```typescript
const { useAuth } = require('@/app/contexts/AuthContext');
const { user, loading } = useAuth();
console.log('Current user:', user);
console.log('Loading:', loading);
```

### Check session
```typescript
const { getCurrentUser } = require('@/services/authService');
const user = await getCurrentUser();
console.log('Session user:', user);
```

### Check middleware logs
Look in browser DevTools → Network tab for redirects:
- If going to /auth/login → auth check failed
- If going to /dashboard/tasks → auth successful

### Check RLS logs
In Supabase Dashboard → Auth → Logs
- Shows failed login attempts
- Shows auth exceptions

## 📞 Support

For issues:

1. **Auth not working**: Check environment variables in `.env.local`
2. **Tasks not showing**: Check RLS policies are enabled
3. **User can see others' tasks**: RLS policies not applied
4. **Session lost on refresh**: Check middleware.ts is in root directory
5. **Can't login with valid credentials**: Check Email provider enabled in Supabase Auth settings

## 📖 Further Reading

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
