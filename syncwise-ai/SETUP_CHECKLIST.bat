@echo off
REM SYNCWISE PRODUCTION FIXES - QUICK ACTION CHECKLIST (WINDOWS)
REM Date: April 9, 2026
REM Status: CODE COMPLETE - Ready for database setup

color 2F
echo.
echo ============================================
echo SYNCWISE PRODUCTION FIXES - CHECKLIST
echo ============================================
echo.

REM 1. Code verification
echo [STEP 1] Verify code files were created...
echo.

setlocal enabledelayedexpansion
set "files[0]=services\userProfileService.ts"
set "files[1]=hooks\useUserProfile.ts"
set "files[2]=app\auth\setup-profile\page.tsx"
set "files[3]=docs\USER_PROFILES_MIGRATION.sql"
set "files[4]=docs\PRODUCTION_FIXES_GUIDE.md"
set "files[5]=docs\QUICK_SETUP.md"

for /l %%i in (0,1,5) do (
    if exist "syncwise-ai\!files[%%i]!" (
        echo OK !files[%%i]!
    ) else (
        echo MISSING !files[%%i]!
    )
)

echo.
echo ============================================
echo [STEP 2] DATABASE SETUP REQUIRED
echo ============================================
echo.
echo INSTRUCTIONS:
echo.
echo 1. Go to: https://app.supabase.com
echo 2. Select your SyncWise project
echo 3. Click: SQL Editor (left sidebar)
echo.
echo 4. FIRST QUERY - User Profiles Table:
echo    - Open: docs\USER_PROFILES_MIGRATION.sql
echo    - Copy ALL the SQL code
echo    - Paste in Supabase SQL Editor
echo    - Click "Run" button
echo    - Verify: user_profiles table appears in Tables list
echo.
echo 5. SECOND QUERY - Task RLS Policies:
echo    - Open: docs\QUICK_SETUP.md
echo    - Find section: "Copy this code and run in Supabase SQL Editor"
echo    - Copy lines 3-31 (the task RLS policies)
echo    - Paste new query in SQL Editor
echo    - Click "Run"
echo    - Verify: 4 policies created for tasks table
echo.
echo 6. EMAIL SETTINGS:
echo    - Go to: Authentication menu (left sidebar)
echo    - Click: Email Templates
echo    - Toggle OFF: "Confirm email"
echo    - Save
echo.

echo ============================================
echo [STEP 3] START DEVELOPMENT SERVER
echo ============================================
echo.
echo Run this command:
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.

echo ============================================
echo [STEP 4] TEST THE FLOW
echo ============================================
echo.
echo 1. Go to /auth/login
echo 2. Click "Sign Up"
echo 3. Enter:
echo    - Email: test@example.com
echo    - Password: test12345
echo    - Name: Test User
echo 4. Should redirect to /auth/setup-profile
echo 5. Enter:
echo    - Name: Test User
echo    - DOB: (optional, skip)
echo 6. Click "Complete Profile"
echo 7. Should redirect to /dashboard/tasks
echo.
echo VERIFY:
echo    - Sidebar bottom-left shows "Test User" (not email)
echo    - Task list is empty
echo    - Create task button works
echo.

echo ============================================
echo [STEP 5] TEST TASK CREATION
echo ============================================
echo.
echo 1. Click "Create New Task" or "Add Task"
echo 2. Enter title: "Test Task"
echo 3. Leave deadline empty
echo 4. Points: 10
echo 5. Click "Create Task"
echo.
echo VERIFY:
echo    - Success message: "Test Task created (1 total)"
echo    - Modal closes
echo    - Task appears in dashboard list
echo    - Task has title, status (pending), points
echo.

echo ============================================
echo [STEP 6] TEST MULTI-USER ISOLATION
echo ============================================
echo.
echo 1. Open NEW INCOGNITO/PRIVATE WINDOW
echo 2. Go to http://localhost:3000/auth/login
echo 3. Sign up as DIFFERENT user:
echo    - Email: user2@example.com
echo    - Password: test12345
echo    - Name: User Two
echo 4. Complete profile setup
echo 5. Go to /dashboard/tasks
echo.
echo VERIFY:
echo    - Task list is EMPTY (doesn't see first user's task)
echo    - Create a new task
echo    - Task appears for this user only
echo 6. Switch back to first browser/window
echo    - First user's task list unchanged (still 1 task)
echo    - Doesn't see second user's task
echo.

echo ============================================
echo [STEP 7] CHECK BROWSER CONSOLE
echo ============================================
echo.
echo Press F12 to open Developer Tools
echo Go to Console tab
echo Look for logs like:
echo.
echo   GREEN (OK):
echo    ✓ [AuthProvider] Auth state changed
echo    ✓ [SetupProfilePage] Profile created
echo    ✓ [fetchTasks] Retrieved X tasks
echo    ✓ [createTask] Task created successfully
echo.
echo   RED (ERRORS):
echo    X [createTask] violates row-level security
echo       = You need to run task RLS SQL from Step 2
echo.

echo ============================================
echo DOCUMENTATION FILES
echo ============================================
echo.
echo Read these for detailed info:
echo   docs\IMPLEMENTATION_COMPLETE.md
echo   docs\QUICK_SETUP.md
echo   docs\PRODUCTION_FIXES_GUIDE.md
echo   docs\CHANGES_DETAILED.md
echo.

echo ============================================
echo CODE CHANGES SUMMARY
echo ============================================
echo.
echo NEW FILES (4):
echo   services\userProfileService.ts - Profile CRUD
echo   hooks\useUserProfile.ts - Profile hook
echo   app\auth\setup-profile\page.tsx - Setup form
echo   docs\USER_PROFILES_MIGRATION.sql - DB setup
echo.
echo MODIFIED FILES (6):
echo   services\authService.ts - OAuth redirect
echo   app\auth\login\page.tsx - Profile check
echo   app\components\Sidebar.tsx - Show user name
echo   app\components\CreateTaskModal.tsx - Error feedback
echo   app\components\TaskList.tsx - Success message
echo   services\taskService.ts - Error logging
echo.

echo ============================================
echo TROUBLESHOOTING
echo ============================================
echo.
echo PROBLEM: Task created but doesn't appear
echo SOLUTION:
echo   1. Open DevTools (F12)
echo   2. Network tab
echo   3. Find POST request to /rest/v1/tasks
echo   4. Check Preview tab - see your task?
echo   5. Go to Supabase SQL Editor
echo   6. Run: SELECT * FROM tasks;
echo   7. See your task in results?
echo.
echo PROBLEM: User name doesn't show in sidebar
echo SOLUTION:
echo   1. Did /auth/setup-profile complete? (check console)
echo   2. Check Supabase - Users table has profile?
echo   3. Refresh browser page
echo   4. Check console for errors in [useUserProfile]
echo.
echo PROBLEM: "violates row-level security"
echo SOLUTION:
echo   1. Did you run task RLS SQL? (Step 2 - SECOND query)
echo   2. Go to Supabase - Tables - tasks
echo   3. Click RLS Policies tab
echo   4. Should see 4 policies
echo   5. If not, run the SQL from docs\QUICK_SETUP.md
echo.

echo ============================================
echo STATUS: READY FOR DEPLOYMENT
echo ============================================
echo.
echo What's complete: CODE CHANGES
echo What's pending:  DATABASE SETUP (your action)
echo Next step:       Follow Step 2 above
echo.
pause
